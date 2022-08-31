import type { Recent } from './recents';
/**
 * Formats the Recent object as an API response and adds it to mockStore.
 * @param mockStore Maps from id to promised response
 * @param recent
 */
export declare function genIndivMockAPIResponse(mockStore: Map<string, Promise<Response>>, recent: Recent): void;
/**
 * Formats the Recent object as an API response and adds it to mockStore.
 * @param mockStore Maps from id to promised response
 * @param recent
 */
export declare function genBulkMockAPIResponse(mockStore: Map<string, Promise<Response>>, recents: Recent[]): void;
//# sourceMappingURL=testUtils.d.ts.map