/**
 * This module serves as the 'public API' for observability.
 */
import type { MetricTag } from './MetricTag';
import type { MetricDefinitions } from './__generated__/MetricDefinitions';
declare global {
    let DATABRICKS_MFE_ID: string | null | undefined;
}
declare type recordEventFuncType = (metric: string, tags: Record<string, any>, eventData?: string) => void;
declare type jsExceptionMeasurementTagsFuncType = (additionalTags?: MetricTag) => MetricTag;
/**
 * Log the error to our error exception service and the Chrome DevTools console.
 *
 * Usage:
 *   * logError(ex);
 *   * logError("Failed to init MFE", ex);
 *   * logError("Unexpected");
 */
export declare function logError(messageOrError: unknown, error?: Error, additionalTags?: MetricTag): void;
/**
 * Log the error to our error exception service and the Chrome DevTools console.
 *
 * A warning does not raise an ES ticket unlike a logError(...). It should be used as an FYI
 * that certain code paths or recoverable flows are hit. For instance if performance optimizations
 * like preloading aren't working we can use warning observability to track it.
 */
export declare function logWarning(messageOrError: unknown, error?: unknown, additionalTags?: MetricTag): void;
/**
 * Log an event to logfood under usage_logs.
 *
 * Differs from window.recordEvent in that 1) its always define, 2) buffers before init,
 * 3) reduces window.* API usage which will minimize the MFE API surface.
 */
export declare function recordEvent(eventName: MetricDefinitions, additionalTags?: MetricTag, eventData?: string): void;
/**
 * Only use in App init to provide a logger module. recordEvent will buffer until this is called.
 */
export declare function registerRecordEvent(recordEventFuncParam: recordEventFuncType, jsExceptionMeasurementTagsFuncParam: jsExceptionMeasurementTagsFuncType): void;
export declare function unregisterRecordEvent(): void;
export {};
//# sourceMappingURL=Observability.d.ts.map