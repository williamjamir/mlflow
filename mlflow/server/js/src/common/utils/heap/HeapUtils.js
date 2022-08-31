import { HeapSnippet } from './HeapSnippet';

/**
 * Utilities for tracking user interactions with Heap Analytics, this works only in Databricks.
 */
export class HeapUtils {
  static initialize() {
    // eslint-disable-next-line no-restricted-globals
    const { settings } = top;
    if (settings && settings.enableHeapAnalytics) {
      HeapUtils.initializeHeap({
        projectId: settings.heapAnalyticsProjectId,
        heapUserId: settings.heapAnalyticsUserId,
        isAdmin: settings.isAdmin,
        user: settings.user,
      });
    }
  }

  static initializeHeap(params) {
    const { projectId, heapUserId } = params;

    const heap = HeapSnippet.heapSnippet();
    heap.load(projectId, `/static/js/heap/heap-${projectId}.js`, {
      disableTextCapture: true,
      trackingServer: 'https://e.databricks.com',
    });
    if (heapUserId) {
      heap.identify(heapUserId, 'hashedId');
    } else {
      heap.resetIdentity();
    }
  }
}
