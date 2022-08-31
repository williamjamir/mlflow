const url = require('url');
const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const { ModuleFederationPlugin } = require('webpack').container;
const { execSync } = require('child_process');

const proxyTarget = process.env.MLFLOW_PROXY;

const isDevserverWebsocketRequest = (request) =>
  request.url === '/ws' &&
  (request.headers.upgrade === 'websocket' || request.headers['sec-websocket-version']);

function mayProxy(pathname) {
  const publicPrefixPrefix = '/static-files/';
  if (pathname.startsWith(publicPrefixPrefix)) {
    const maybePublicPath = path.resolve('public', pathname.substring(publicPrefixPrefix.length));
    return !fs.existsSync(maybePublicPath);
  } else {
    const maybePublicPath = path.resolve('public', pathname.slice(1));
    return !fs.existsSync(maybePublicPath);
  }
}

/**
 * For 303's we need to rewrite the location to have host of `localhost`.
 */
function rewriteRedirect(proxyRes, req) {
  if (proxyRes.headers['location'] && proxyRes.statusCode === 303) {
    var u = url.parse(proxyRes.headers['location']);
    u.host = req.headers['host'];
    proxyRes.headers['location'] = u.format();
  }
}

/**
 * In Databricks, we send a cookie with a CSRF token and set the path of the cookie as "/mlflow".
 * We need to rewrite the path to "/" for the dev index.html/bundle.js to use the CSRF token.
 */
function rewriteCookies(proxyRes) {
  if (proxyRes.headers['set-cookie'] !== undefined) {
    const newCookies = [];
    proxyRes.headers['set-cookie'].forEach((c) => {
      newCookies.push(c.replace('Path=/mlflow', 'Path=/'));
    });
    // BEGIN-EDGE
    if (process.env.START_FEATURE_STORE === 'true') {
      proxyRes.headers['set-cookie'].forEach((c) => {
        newCookies.push(c.replace('Path=/feature-store', 'Path=/'));
      });
    }
    // END-EDGE
    proxyRes.headers['set-cookie'] = newCookies;
  }
}

// BEGIN-EDGE
function entryOverrides(config) {
  if (process.env.START_FEATURE_STORE === 'true') {
    config.entry = path.join(__dirname, 'src', 'feature-store', 'index.js');
  }

  return config;
}

function resolveAppPath(relativePath) {
  return path.resolve(process.cwd(), relativePath);
}

function configureMFEStyleLoader(config, env) {
  if (!process.env.MLFLOW_MFE_DEV) {
    return config;
  }
  const getMfeStyleLoaderRule = (loader) => ({
    loader,
    options: {
      insert: (styleTag) => {
        const mfeElement = `databricks-mlflow`;
        // Inject styles whenever mfeElement is defined.
        window.customElements.whenDefined(mfeElement).then(function () {
          const WebComponentClass = window.customElements.get(mfeElement);
          WebComponentClass.webpackInjectStyle(styleTag);
        });
      },
    },
  });

  let replacedStyleLoader = false;

  if (env === 'production') {
    const plugin = config.plugins.find((p) => p.constructor.name === 'MiniCssExtractPlugin');
    if (plugin) {
      plugin.runtimeOptions.insert = (styleTag) => {
        const mfeElement = `databricks-mlflow`;
        // Unfortunately we need to inject style tag to the document.head
        // first, otherwise MiniCssWebpackPlugin won't resolve the promise
        // and the MFE won't finish loading
        document.head.appendChild(styleTag);
        // Inject styles whenever mfeElement is defined.
        window.customElements.whenDefined(mfeElement).then(function () {
          const WebComponentClass = window.customElements.get(mfeElement);
          WebComponentClass.webpackInjectStyle(styleTag);
        });
      };
      replacedStyleLoader = true;
    }
  }

  config.module.rules
    .filter((rule) => rule.oneOf instanceof Array)
    .forEach((rule) => {
      rule.oneOf
        .filter((oneOf) => oneOf.test?.toString() === /\.css$/.toString())
        .forEach((oneOf) => {
          oneOf.use = oneOf.use.map((use) => {
            // Using require.resolve() comparison resulted in inability
            // to find the proper loader since the values differ. Regexp
            // match solves this problem.
            if (typeof use === 'string' && use.match(/\/style-loader\//)) {
              replacedStyleLoader = true;
              return getMfeStyleLoaderRule(use);
            }
            return use;
          });
        });
    });
  if (!replacedStyleLoader) {
    throw new Error('Failed to inject MFE style-loader');
  }
  return config;
}

function configureMLFlowMFE(config) {
  if (!process.env.MLFLOW_MFE_DEV) {
    return config;
  }
  const exposes = {
    './register': resolveAppPath('src/mfe/register.js'),
    './prefetch': resolveAppPath('src/mfe/prefetch.js'),
  };
  config.plugins.push(
    new ModuleFederationPlugin({
      name: '__databricks_mfe_mlflow',
      filename: 'remoteEntry.js',
      exposes,
      shared: {
        react: {
          requiredVersion: false,
          singleton: true,
        },
        'react-dom': {
          requiredVersion: false,
          singleton: true,
        },
      },
    }),
  );
  // During development we need to serve static assets from here to make
  // it easier to proxy back to mlflow.
  config.output.publicPath = '/mfe/mlflow/';
  return config;
}

function getCommitHash() {
  if (typeof process.env.GIT_SHA === 'string' && process.env.GIT_SHA.length > 0) {
    return process.env.GIT_SHA;
  }
  try {
    execSync('command -v git');
  } catch {
    return undefined;
  }
  try {
    const cmdResult = execSync('git rev-parse HEAD').toString().trim().split('\n')[0];
    if (cmdResult.length !== 40 || cmdResult.match(!/^[0-9a-fA-F]{40}$/)) {
      return undefined;
    }
    return cmdResult;
  } catch (e) {
    return undefined;
  }
}

/**
 * This function forces injecting a universe-scoped path to a module
 * filename visible by devtools (for sourcemap matching purposes etc).
 *
 * The reason for this change is distinction from other Databricks apps
 * that helps filtering and enables proper routing of exceptions.
 */
function updateSourceMapPrefix(webpackConfig) {
  const namespace = 'webpack:///';
  const mlflowInUniversePath = 'mlflow/web/js';

  webpackConfig.output.devtoolModuleFilenameTemplate = ({ resourcePath, loaders }) => {
    const moduleFilename = namespace + path.join(mlflowInUniversePath, resourcePath);
    return loaders ? `${moduleFilename}?${loaders}` : moduleFilename;
  };
  return webpackConfig;
}
// END-EDGE

/**
 * Since the base publicPath is configured to a relative path ("static-files/"),
 * the files referenced inside CSS files (e.g. fonts) can be incorrectly resolved
 * (e.g. /path/to/css/file/static-files/static/path/to/font.woff). We need to override
 * the CSS loader to make sure it will resolve to a proper absolute path. This is
 * required for the production (bundled) builds only.
 */
function configureIframeCSSPublicPaths(config, env) {
  // eslint-disable-next-line prefer-const
  let shouldFixCSSPaths = env === 'production';
  // BEGIN-EDGE
  if (process.env.MLFLOW_MFE_DEV) {
    shouldFixCSSPaths = false;
  }
  // END-EDGE

  if (!shouldFixCSSPaths) {
    return config;
  }

  let cssRuleFixed = false;
  config.module.rules
    .filter((rule) => rule.oneOf instanceof Array)
    .forEach((rule) => {
      rule.oneOf
        .filter((oneOf) => oneOf.test?.toString() === /\.css$/.toString())
        .forEach((cssRule) => {
          cssRule.use
            ?.filter((loaderConfig) => loaderConfig?.loader.match(/\/mini-css-extract-plugin\//))
            .forEach((loaderConfig) => {
              let publicPath = '/static-files/';
              // BEGIN-EDGE
              publicPath = process.env.START_FEATURE_STORE
                ? '/_feature-store/static-files/'
                : '/_mlflow/static-files/';
              // END-EDGE
              // eslint-disable-next-line no-param-reassign
              loaderConfig.options = { publicPath };

              cssRuleFixed = true;
            });
        });
    });

  if (!cssRuleFixed) {
    throw new Error('Failed to fix CSS paths!');
  }

  return config;
}

function configureWebShared(config) {
  config.resolve.alias['@databricks/web-shared-bundle'] = false;
  // BEGIN-EDGE
  config.resolve.alias['@databricks/web-shared-bundle'] = path.resolve(
    './src/__generated__/web-shared-bundle',
  );
  // END-EDGE
  return config;
}

function enableOptionalTypescript(config) {
  /**
   * Essential TS config is already inside CRA's config - the only
   * missing thing is resolved extensions.
   */
  config.resolve.extensions.push('.ts', '.tsx');

  /**
   * We're going to exclude typechecking test files from webpack's pipeline
   */

  const ForkTsCheckerPlugin = config.plugins.find(
    (plugin) => plugin.constructor.name === 'ForkTsCheckerWebpackPlugin',
  );

  if (ForkTsCheckerPlugin) {
    ForkTsCheckerPlugin.options.typescript.configOverwrite.exclude = [
      '**/*.test.ts',
      '**/*.test.tsx',
      '**/*.stories.tsx',
    ].map((pattern) => path.join(__dirname, 'src', pattern));
  } else {
    throw new Error('Failed to setup Typescript');
  }

  return config;
}

function i18nOverrides(config) {
  // https://github.com/webpack/webpack/issues/11467#issuecomment-691873586
  config.module.rules.push({
    test: /\.m?js/,
    resolve: {
      fullySpecified: false,
    },
  });
  config.module.rules = config.module.rules.map((rule) => {
    if (rule.oneOf instanceof Array) {
      return {
        ...rule,
        oneOf: [
          {
            test: [new RegExp(path.join('src/i18n/', '.*json'))],
            use: [
              {
                loader: require.resolve('./I18nCompileLoader'),
              },
            ],
          },
          ...rule.oneOf,
        ],
      };
    }

    return rule;
  });

  return config;
}

// BEGIN-EDGE
// Returns the path where the MLFlowStaticService is being mounted relatively
// to the JS application's context. In case of iFrame, it's going to be an empty string.
function getHostedPath() {
  return process.env.MLFLOW_MFE_DEV ? '/mfe/mlflow/' : '';
}
// END-EDGE
module.exports = function ({ env }) {
  const config = {
    babel: {
      env: {
        test: {
          plugins: [
            [
              require.resolve('babel-plugin-formatjs'),
              {
                idInterpolationPattern: '[sha512:contenthash:base64:6]',
                removeDefaultMessage: false,
              },
            ],
          ],
        },
      },
      presets: [
        [
          '@babel/preset-react',
          {
            runtime: 'automatic',
            importSource: '@emotion/react',
          },
        ],
      ],
      plugins: [
        [
          require.resolve('babel-plugin-formatjs'),
          {
            idInterpolationPattern: '[sha512:contenthash:base64:6]',
          },
        ],
        [
          require.resolve('@emotion/babel-plugin'),
          {
            sourceMap: false,
          },
        ],
      ],
    },
    ...(proxyTarget && {
      devServer: {
        hot: true,
        https: true,
        proxy: [
          // Heads up src/setupProxy.js is indirectly referenced by CRA
          // and also defines proxies.
          {
            context: function (pathname, request) {
              // Dev server's WS calls should not be proxied
              if (isDevserverWebsocketRequest(request)) {
                return false;
              }
              return mayProxy(pathname);
            },
            // BEGIN-EDGE
            pathRewrite: { '^/mfe/mlflow': '' },
            // END-EDGE
            target: proxyTarget,
            secure: false,
            changeOrigin: true,
            ws: true,
            xfwd: true,
            onProxyRes: (proxyRes, req) => {
              rewriteRedirect(proxyRes, req);
              rewriteCookies(proxyRes);
            },
          },
          // BEGIN-EDGE
          {
            context: function (pathname) {
              return pathname.startsWith('/mfe/mlflow/static-files');
            },
            pathRewrite: { '^/mfe/mlflow/static-files': '' },
            target: 'https://localhost:3000/',
            secure: false,
            changeOrigin: true,
            ws: true,
            xfwd: true,
            onProxyRes: (proxyRes, req) => {
              rewriteRedirect(proxyRes, req);
              rewriteCookies(proxyRes);
            },
          },
          // END-EDGE
        ],
        host: 'localhost',
        port: 3000,
        open: false,
      },
    }),
    jest: {
      configure: (jestConfig, { env, paths, resolve, rootDir }) => {
        jestConfig.resetMocks = false; // ML-20462 Restore resetMocks
        jestConfig.collectCoverageFrom = [
          'src/**/*.{js,jsx}',
          '!**/*.test.{js,jsx}',
          '!**/__tests__/*.{js,jsx}',
        ];
        jestConfig.coverageReporters = ['lcov'];
        jestConfig.setupFiles = [
          'jest-canvas-mock',
          '<rootDir>/scripts/throw-on-prop-type-warning.js',
        ];
        // Remove when this issue is resolved: https://github.com/gsoft-inc/craco/issues/393
        jestConfig.transform = {
          '\\.[jt]sx?$': ['babel-jest', { configFile: './jest.babel.config.js' }],
          ...jestConfig.transform,
        };
        jestConfig.globalSetup = '<rootDir>/scripts/global-setup.js';
        return jestConfig;
      },
    },
    webpack: {
      resolve: {
        alias: {
          '@databricks/web-shared-bundle': false,
          // BEGIN-EDGE
          '@databricks/web-shared-bundle': path.resolve('web-shared'),
          // END-EDGE
        },
        fallback: {
          buffer: require.resolve('buffer'), // Needed by js-yaml
          defineProperty: require.resolve('define-property'), // Needed by babel
        },
      },
      configure: (webpackConfig, { env, paths }) => {
        webpackConfig.output.publicPath = 'static-files/';
        webpackConfig = i18nOverrides(webpackConfig);
        webpackConfig = configureIframeCSSPublicPaths(webpackConfig, env);
        webpackConfig = enableOptionalTypescript(webpackConfig);
        // BEGIN-EDGE
        webpackConfig = updateSourceMapPrefix(webpackConfig);
        webpackConfig = entryOverrides(webpackConfig);
        webpackConfig = configureMLFlowMFE(webpackConfig);
        webpackConfig = configureMFEStyleLoader(webpackConfig, env);
        // END-EDGE
        webpackConfig = configureWebShared(webpackConfig);
        console.log('Webpack config:', webpackConfig);
        return webpackConfig;
      },
      plugins: [
        new webpack.DefinePlugin({
          'process.env.HOSTED_PATH': JSON.stringify(''),
          // BEGIN-EDGE
          __GIT_COMMIT_HASH__: JSON.stringify(getCommitHash()),
          // eslint-disable-next-line no-dupe-keys
          'process.env.HOSTED_PATH': JSON.stringify(getHostedPath()),
          // END-EDGE
        }),
        new webpack.EnvironmentPlugin({
          HIDE_HEADER: process.env.HIDE_HEADER ? 'true' : 'false',
          HIDE_EXPERIMENT_LIST: process.env.HIDE_EXPERIMENT_LIST ? 'true' : 'false',
          SHOW_GDPR_PURGING_MESSAGES: process.env.SHOW_GDPR_PURGING_MESSAGES ? 'true' : 'false',
          USE_ABSOLUTE_AJAX_URLS: process.env.USE_ABSOLUTE_AJAX_URLS ? 'true' : 'false',
          SHOULD_REDIRECT_IFRAME: process.env.SHOULD_REDIRECT_IFRAME ? 'true' : 'false',
          // BEGIN-EDGE
          START_FEATURE_STORE: process.env.START_FEATURE_STORE ? 'true' : 'false',
          // END-EDGE
        }),
      ],
    },
  };
  return config;
};
