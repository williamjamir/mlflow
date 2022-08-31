export declare function eventTrackerInit(): void;
/**
 * If we're currently in an event handler, such as a click, return
 * the time at which the event started. In the case of hardware events
 * like a press, we will use the most accurate timestamp for the event
 * dispatch provided by the OS/Browser. This will include time to dispatch
 * the event to us if for example we blocked the main thread.
 */
export declare function getCurrentEventStart(): number | null;
//# sourceMappingURL=EventTracker.d.ts.map