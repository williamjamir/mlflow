import React from 'react';
import ReactDOM from 'react-dom';
import { I18nUtils } from './i18n/I18nUtils';
import { MLFlowRoot } from './app';
// BEGIN-EDGE
import { HeapUtils } from './common/utils/heap/HeapUtils';
import { WebVitals, firePageLoadMessage } from './shared/databricks_edge/PerformanceUtils';
import Utils from './common/utils/Utils';

window.addEventListener('load', () => {
  firePageLoadMessage(new WebVitals());
});

if (process.env.SHOULD_REDIRECT_IFRAME === 'true') {
  if (window.top === window.self) {
    const { origin, search, hash } = window.location;
    const edgeHash = hash.replace(/^#\//, '#mlflow/');
    window.location.replace(`${origin}/${search}${edgeHash}`);
  }
}
// END-EDGE

I18nUtils.initI18n().then(() => {
  ReactDOM.render(<MLFlowRoot />, document.getElementById('root'));
});
// BEGIN-EDGE
HeapUtils.initialize();
// END-EDGE

const windowOnError = (message, source, lineno, colno, error) => {
  // BEGIN-EDGE
  if (window.top !== window) {
    Utils.propagateErrorToParentFrame({
      errorMessage: message,
      error: error,
      source: source,
      lineno: lineno,
      colno: colno,
    });
  }
  // END-EDGE
  console.error(error, message);
  // returning false allows the default handler to fire as well
  return false;
};

window.onerror = windowOnError;
