export interface StorageMap<T> {
    [Symbol.iterator]: () => IterableIterator<[string, T]>;
    /**
     * Number of entries in the map
     */
    readonly size: number;
    /**
     * Retrieves the item from storage.
     *
     * @param key The key associated with the item
     * @returns The item, or undefined if the item is not stored.
     */
    get(key: string): T | undefined;
    /**
     * Returns whether or not the key is contained in the map.
     *
     * @param key The key associated with the item.
     */
    has(key: string): boolean;
    /**
     * Assigns the specified item to the key in storage.
     *
     * @param key The key associated with the item.
     * @param value The item to be persisted
     */
    set(key: string, value: T): void;
    /**
     * Removes the specified item from storage. Has no effect if the item is not
     * in storage.
     *
     * @param key The key associated with the item.
     */
    delete(key: string): void;
    /**
     * Iterate through keys in storage.
     *
     * @returns An array containing the keys.
     */
    keys(): string[];
    /**
     * Iterate through values in storage.
     *
     * @returns An array containing the values.
     */
    values(): T[];
    /**
     * Iterate through key/value pairs in storage.
     *
     * @returns An array containing the keys.
     */
    entries(): [string, T][];
    /**
     * Removes all items in storage.
     */
    clear(): void;
    /**
     * Callback executed once for each key/value contained in storage.
     * @param callback The function to execute.
     * @param thisArg An optional argument for 'this' in the callback.
     */
    forEach(callback: (value: T, key: string, storage: StorageMap<T>) => void, thisArg: any): void;
}
export interface Deserializer<T> {
    (args: {
        item: string;
        version: number;
    }): T;
}
export interface Serializer<T> {
    (args: {
        item: T;
        version: number;
    }): string;
}
//# sourceMappingURL=types.d.ts.map