import { UniverseFrontendApis } from '../../common/utils/UniverseFrontendApis';

/*
 * WebVitals class copied from webapp
 */
export class WebVitals {
  constructor() {
    if (!PerformanceObserver || !PerformanceObserver.supportedEntryTypes) {
      return;
    }
    try {
      this.largestContentfulPaintObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          this.largestContentfulPaint = entry.startTime;
        }
      });
      this.largestContentfulPaintObserver.observe({
        type: 'largest-contentful-paint',
        buffered: true,
      });
      this.firstContentfulPaintObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntriesByName('first-contentful-paint')) {
          this.firstContentfulPaint = entry.startTime;
        }
      });
      this.firstContentfulPaintObserver.observe({ type: 'paint', buffered: true });
    } catch (_) {
      // Make sure we don't fatal the page if the browser isn't happy
      // about our usage of PerformanceObserver. This can happen in legacy
      // non-support browsers.
    }
  }

  disconnect() {
    this.largestContentfulPaintObserver && this.largestContentfulPaintObserver.disconnect();
    this.largestContentfulPaintObserver = null;
    this.firstContentfulPaintObserver && this.firstContentfulPaintObserver.disconnect();
    this.firstContentfulPaintObserver = null;
  }

  get() {
    return {
      largestContentfulPaint: this.largestContentfulPaint,
      firstContentfulPaint: this.firstContentfulPaint,
    };
  }
}

export function getPerformanceMetrics() {
  if (window.performance && window.performance.navigation && window.performance.timing) {
    const { navigation, timing } = window.performance;
    return {
      navigationType: navigation.type,
      navigationStartTimestamp: timing.navigationStart,
      requestStartTimestamp: timing.requestStart,
      responseStartTimestamp: timing.responseStart,
      domLoadingTimestamp: timing.domLoading,
      domContentLoadedEventStartTimestamp: timing.domContentLoadedEventStart,
      domContentLoadedEventEndTimestamp: timing.domContentLoadedEventEnd,
      domCompleteTimestamp: timing.domComplete,
      loadEventEndTimestamp: timing.loadEventEnd,
    };
  }

  return null;
}

export function firePageLoadMessage(webVitals) {
  setTimeout(() => {
    const initCompleteTimestamp = Date.now();
    UniverseFrontendApis.trackingEvent({
      eventName: 'pageLoad',
      initCompleteTimestamp,
      ...getPerformanceMetrics(),
      ...webVitals.get(),
    });
    webVitals.disconnect();
  });
}
