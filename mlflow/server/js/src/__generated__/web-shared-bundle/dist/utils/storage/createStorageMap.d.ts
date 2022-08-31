import type { Serializer, Deserializer, StorageMap } from './types';
export interface StorageMapArgs<T> {
    version: number;
    prefix: string;
    serializer?: Serializer<T>;
    deserializer?: Deserializer<T>;
    storage?: Storage;
}
export declare function createStorageMap<T>({ version, prefix, serializer, deserializer, storage, }: StorageMapArgs<T>): StorageMap<T>;
//# sourceMappingURL=createStorageMap.d.ts.map