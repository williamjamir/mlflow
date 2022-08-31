/**
 * This is a minimal interface to the event, which can be used to prevent default behavior.
 *
 * It is a strict subset of `CustomEvent` type and extension of this interface should be considered
 * carefully.
 */
export declare type MfeEvent<T = unknown> = {
    preventDefault(): void;
    detail: T;
};
export declare type MfeEventListener<EventDataType> = (data: EventDataType, evt: MfeEvent<EventDataType>) => void;
export declare type MfeEventDefinition<EventDataType> = {
    /**
     * React hook to register a listener for the given event definition.
     */
    useListener(listener: MfeEventListener<EventDataType>): void;
    /**
     * Dispatches an event with the given data.
     *
     * Returns `false` if `preventDefault()` has been called on the event, `true` otherwise.
     */
    dispatch(data: EventDataType): boolean;
};
/**
 * Defines an event, which should be safe to be used across MFE boundaries.
 *
 * The reason why such events are considered safe is due to the sanitization of their data. More information can be found
 * in the `./sanitize` module.
 *
 * The implementation relies on CustomEvent, which allows several benefits:
 * - Ability to prevent default behavior (useful as a simple communication channel between the producer and consumers)
 * - Synchronous dispatch (it blocks the caller, which might not be always desirable)
 *
 * Note: Once a mapping between a given event name and its type has been defined, all future changes
 * must be backward compatible considering that producers and consumers are likely to be in different
 * deployables.
 *
 * @example
 * // mfe-router.ts
 * export type UrlChangedEventData = {
 *   pathname: string;
 *   query: Record<string, string>;
 *   hash?: string;
 * }
 *
 * export const urlChanged = defineEvent<UrlChangedEventData>('router:url-changed');
 *
 * // producer
 * import { urlChanged } from '.../mfe-router';
 *
 * browserHistory.listen(location => {
 *   const { pathname, query, hash } = location;
 *   urlChanged.dispatch({ pathname, query, hash });
 * });
 *
 * // consumer
 * import { urlChanged } from '.../mfe-router';
 *
 * function MfeComponent() {
 *   const handleUrlChanged = useCallback(({ pathname }) => {
 *     setCurrentPath(pathname);
 *   }, []);
 *
 *   urlChanged.useListener(handleUrlChanged);
 * }
 */
export declare function defineEvent<EventDataType>(name: string): MfeEventDefinition<EventDataType>;
//# sourceMappingURL=events.d.ts.map