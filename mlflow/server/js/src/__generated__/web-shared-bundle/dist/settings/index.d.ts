export declare type CloudProviderId = 'AWS' | 'Azure' | 'GCP';
export declare const WORKSPACE_APP_KEY = "workspace";
export declare const SQLA_APP_KEY = "redash";
export declare const ML_APP_KEY = "machine-learning";
export declare type AppKey = typeof WORKSPACE_APP_KEY | typeof SQLA_APP_KEY | typeof ML_APP_KEY;
export interface AppAccessConfig {
    cloud: CloudProviderId;
    currentWorkspaceId?: string;
    enableSqlService?: boolean;
    userCanUseSqlService?: boolean;
    userCanUseDatabricksWorkspace?: boolean;
    isAdmin?: boolean;
    centralizedLoginEnabled?: boolean;
    enableExperimentObservatory?: boolean;
    enableDbsqlInternalRedirect?: boolean;
}
export * from './getCSRFToken';
export * from './getOrgID';
export * from './getUser';
//# sourceMappingURL=index.d.ts.map