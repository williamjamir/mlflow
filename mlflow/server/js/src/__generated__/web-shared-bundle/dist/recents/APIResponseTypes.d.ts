export interface NodeResponse {
    info: {
        id: number;
        full_path: string;
        is_deleted: boolean;
    };
}
export interface ModelResponse {
    name: string;
    id: string;
}
export interface ModelBulkResponse {
    registered_models_databricks: ModelResponse[];
}
//# sourceMappingURL=APIResponseTypes.d.ts.map