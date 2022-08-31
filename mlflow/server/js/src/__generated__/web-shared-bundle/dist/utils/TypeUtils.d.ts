export declare type DeepPartial<T> = T extends object ? {
    [K in keyof T]?: DeepPartial<T[K]>;
} : T;
/**
 * Converts a constant snake_case string type to a camelCase one
 * Example Input: `a_string_type`
 * Output: `aStringType`
 */
export declare type SnakeToCamelCase<S extends string> = S extends `${infer T}_${infer U}` ? `${T}${Capitalize<SnakeToCamelCase<U>>}` : S;
/**
 * Coverts all keys of given `ObjectType` from snake_case to camelCase
 * Example Input: `{ foo_bar: string, xyz_abc_baz: number }`
 * Output: `{ fooBar: string, xyzAbcBaz: number }`
 */
export declare type SnakeToCamelCaseProperties<ObjectType extends object> = {
    [Key in keyof ObjectType as SnakeToCamelCase<Key & string>]: ObjectType[Key];
};
/**
 * Makes some of the properties of an object, required
 * Example Input: `{ foo?: string; bar?: string; baz?: string; id: string }`
 * Output: `{ foo: string; bar: string; baz?: string; id: string }`
 */
export declare type RequireProperties<T extends object, K extends keyof T> = Omit<T, K> & {
    [MK in K]-?: NonNullable<T[MK]>;
};
/**
 * "Type safer" `Object.entries`
 */
export declare function objectEntries<T>(object: T): [keyof T, T[keyof T]][];
//# sourceMappingURL=TypeUtils.d.ts.map