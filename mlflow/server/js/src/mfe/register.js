// BEGIN-EDGE
import React from 'react';
import { CacheProvider } from '@emotion/react';
import { MLFlowMFERoot } from './MLFlowMFERoot';
import { prefixer } from 'stylis';
import { registerMFE } from '@databricks/web-shared-bundle/mfe-services';
import { setMLFlowHashRouting } from '../experiment-tracking/components/App';
import createCache from '@emotion/cache';
import { stylisExtraScopePlugin } from './stylisExtraScopePlugin';

export { commitHash } from '@databricks/web-shared-bundle/mfe-services';

function mfeInit() {
  setMLFlowHashRouting();
}

registerMFE({
  name: 'mlflow',
  init: mfeInit,
  reactRoot: (shadowRoot) => {
    const isSafariVersion15 = Boolean(
      navigator.vendor.match(/apple/i) && navigator.userAgent.match(/version\/15\.0/i),
    );

    const emotionCache = createCache({
      key: 'mlflow-css',
      container: shadowRoot,
      stylisPlugins: [prefixer, stylisExtraScopePlugin('.mfe-root')],
      // Fixes a bug with emotion and shadow dom in Safari
      // https://github.com/databricks/universe/pull/130715
      speedy: !isSafariVersion15,
    });
    return (
      <CacheProvider value={emotionCache}>
        <MLFlowMFERoot />
      </CacheProvider>
    );
  },
  injectStyleURLs: [],
});
// END-EDGE
