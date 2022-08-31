export declare type ImmutablePrimitiveValue = string | number | boolean | bigint | Date | null | undefined;
export declare type ImmutableArray<T> = ReadonlyArray<ImmutableType<T>>;
export declare type ImmutableMap<K, V> = ReadonlyMap<ImmutableType<K>, ImmutableType<V>>;
export declare type ImmutableSet<T> = ReadonlySet<ImmutableType<T>>;
export declare type ImmutableObject<T> = {
    readonly [K in keyof T]: ImmutableType<T[K]>;
};
/**
 * Recursively mark a type as immutable (readonly). It automatically handles
 * the basic types of objects: primitives, arrays, maps, sets and objects.
 *
 * Functions are passed unaltered.
 */
export declare type ImmutableType<T> = T extends ImmutablePrimitiveValue ? T : T extends Function ? T : T extends Array<infer E> ? ImmutableArray<E> : T extends Map<infer K, infer V> ? ImmutableMap<K, V> : T extends Set<infer E> ? ImmutableSet<E> : ImmutableObject<T>;
//# sourceMappingURL=ImmutableType.d.ts.map