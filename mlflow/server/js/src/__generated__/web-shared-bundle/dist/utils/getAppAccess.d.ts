import type { AppAccessConfig, AppKey } from '../settings';
export declare type AppAccess = {
    [m in AppKey]: {
        availableInEnvironment: boolean;
        allowed: boolean;
    };
};
/**
 * Check if persona is available on environment (also visibility) and if the current user is allowed to use the
 * persona / product.
 */
export declare function getAppAccess(config: AppAccessConfig): AppAccess;
//# sourceMappingURL=getAppAccess.d.ts.map