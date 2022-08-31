import type { Recent, DetailedRecent } from './recents';
export declare function getNotebooksURL(id: string): string;
export declare function getListModelsURL(): string;
export declare function retrieveValidNotebooks(recentsGroup: Recent[]): Promise<Array<DetailedRecent | undefined>>;
export declare function retrieveValidExperiments(recentsGroup: Recent[]): Promise<DetailedRecent[]>;
export declare function retrieveValidModels(recentsGroup: Recent[]): Promise<Array<DetailedRecent | undefined>>;
export declare function retrieveValidFeatureTables(recentsGroup: Recent[]): Promise<DetailedRecent[]>;
//# sourceMappingURL=retrieval.d.ts.map