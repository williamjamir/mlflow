import type { ImmutableType } from '../comms/ImmutableType';
declare const GetConfigSessionRpcHandlerId = "Session::GetSessionConfig";
export interface WorkspaceInfo {
    name: string;
    azureLocation: string;
    orgId: number;
    needsConfirmation: boolean;
    deploymentName: string;
    useRegionalUrl: boolean;
    owner: string;
}
/**
 * Defines the minimal set of properties, which should be
 * shared between all MFEs and provides the rest of the properties
 * untyped.
 */
export declare type CoreSessionConfig = {
    csrfToken: string;
    availableWorkspaces: WorkspaceInfo[];
    currentWorkspaceId: string;
    currentWorkspace?: WorkspaceInfo;
};
export declare type SessionConfig = ImmutableType<CoreSessionConfig> & Record<string, unknown>;
export declare type GetSessionConfigRpcCachePolicy = 'cache-only' | 'network-only';
export declare type GetSessionConfigRpcRequest = ImmutableType<{
    cachePolicy: GetSessionConfigRpcCachePolicy;
}>;
export declare type GetSessionConfigRpcCallSignature = (req: GetSessionConfigRpcRequest) => Promise<SessionConfig>;
declare module '../comms/rpc-handlers-registry' {
    interface RpcHandlers {
        [GetConfigSessionRpcHandlerId]: GetSessionConfigRpcCallSignature;
    }
}
export declare const GetSessionConfigRpc: {
    isAvailable: () => boolean;
    call: (req: import("../comms/ImmutableType").ImmutableObject<{
        cachePolicy: GetSessionConfigRpcCachePolicy;
    }>) => Promise<SessionConfig>;
    register: (handler: GetSessionConfigRpcCallSignature) => import("../comms/rpc-api").UnregisterRpcHandler;
    useRegister: (handler: GetSessionConfigRpcCallSignature) => void;
};
export {};
//# sourceMappingURL=GetSessionConfigRpc.d.ts.map