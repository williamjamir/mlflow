export declare type SafePrimitiveValue = string | number | boolean | bigint | Date | null | undefined;
export declare type SafeArray = Array<SafeValue>;
export declare type SafeObject = {
    [k: string]: SafeValue;
};
export declare type SafeFunction = (...args: SafeValue[]) => SafeValue;
export declare type SafeValue = SafePrimitiveValue | SafeArray | SafeObject | SafeFunction;
export declare type IsSafe<T> = T extends SafeValue ? T : never;
/**
 * Sanitizes an object according to the following rules:
 * - undefined, null, string, number, boolean, bigint and Date are returned as-is
 * - arrays are cloned and each element is sanitized
 * - plain objects (object literals or objects without prototype) are cloned and
 *   each enumerable string-named property is sanitized
 * - functions are wrapped with another function. Upon invocation, arguments are sanitized
 *   before the original function is called and the result is also sanitized before returning it
 *   to the caller
 *
 * - any other type of value will throw an error including:
 *   - symbols
 *   - promises
 *   - HTML elements
 * - circular structures cannot be sanitized and it will throw an error
 */
export declare function sanitizeValue<T extends SafeValue>(obj: T, visited?: Set<any>): T;
//# sourceMappingURL=sanitize.d.ts.map