/**
 * A cache storing recently viewed assets across all personas.
 * Provides a unified view, as opposed to the legacy persona-specific recents.
 */
import { AssetType } from './types';
export interface Recent {
    id: string;
    type: AssetType;
    lastAccessedTimestamp: number;
}
interface RegisterRecentArgs {
    id: Recent['id'];
    type: Recent['type'];
}
/**
 * Adds a recently opened asset to local storage cache.
 */
export declare function registerRecent({ id, type }: RegisterRecentArgs): Recent;
/**
 * Reads local storage to see if the recents cache key is present. If it is,
 * returns the resulting array; otherwise returns an empty array.
 * @returns an array of Recent objects
 */
export declare function getRecents(): Recent[];
export interface DetailedRecent extends Recent {
    name: string;
}
/**
 * Performs the necessary api calls based on asset type.
 * Calls the corresponding helper function for each type, which gets the most recent name for each entry,
 * and removes all assets not found in the API response.
 * @returns The aggregated output of the n most recent valid assets, sorted by lastAccessedTimestamp
 */
export declare function retrieveAndValidate(numRecents?: number): Promise<DetailedRecent[]>;
export {};
//# sourceMappingURL=recents.d.ts.map