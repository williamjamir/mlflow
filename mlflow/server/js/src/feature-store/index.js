import React from 'react';
import ReactDOM from 'react-dom';
import { IntlProvider } from 'react-intl';
import { DesignSystemProvider } from '@databricks/design-system';
import '../index.css';
import '@databricks/design-system/dist/index.css';
import { Provider } from 'react-redux';
import store from './store';
import { AccessibilityOverridesStyles } from '../common/styles/accessibility-overrides';
import { I18nUtils } from '../i18n/I18nUtils';
import { HeapUtils } from '../common/utils/heap/HeapUtils';
import { WebVitals, firePageLoadMessage } from '../shared/databricks_edge/PerformanceUtils';
import { FeatureStoreApp } from './FeatureStoreApp';
import Utils from '../common/utils/Utils';

window.addEventListener('load', () => {
  firePageLoadMessage(new WebVitals());
});

if (process.env.SHOULD_REDIRECT_IFRAME === 'true') {
  if (window.top === window.self) {
    const { origin, search, hash } = window.location;
    const edgeHash = hash.replace(/^#\//, '#feature-store/');
    window.location.replace(`${origin}/${search}${edgeHash}`);
  }
}

I18nUtils.initI18n().then(() => {
  const { locale, messages } = I18nUtils.getIntlProviderParams();
  const root = (
    <IntlProvider locale={locale} messages={messages}>
      <Provider store={store}>
        <DesignSystemProvider isCompact>
          <FeatureStoreApp />
          <AccessibilityOverridesStyles />
        </DesignSystemProvider>
      </Provider>
    </IntlProvider>
  );
  ReactDOM.render(root, document.getElementById('root'));
});
HeapUtils.initialize();

const windowOnError = (message, source, lineno, colno, error) => {
  if (window.top !== window) {
    Utils.propagateErrorToParentFrame({
      errorMessage: message,
      error: error,
      source: source,
      lineno: lineno,
      colno: colno,
      jsExceptionService: 'feature-store',
    });
  }
  console.error(error, message);
  // returning false allows the default handler to fire as well
  return false;
};

window.onerror = windowOnError;
