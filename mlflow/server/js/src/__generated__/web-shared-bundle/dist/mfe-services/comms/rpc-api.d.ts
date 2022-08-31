import type { RpcHandlerId, RpcRequestParams, RpcResponse, RpcHandlers } from './rpc-handlers-registry';
export declare type UnregisterRpcHandler = () => void;
/**
 * Used only internally, do not use directly. Use `defineRpc()` function instead.
 */
export interface GlobalRpcApi {
    makeCall<Id extends RpcHandlerId>(id: Id, request: RpcRequestParams<Id>): Promise<RpcResponse<Id>>;
    registerHandler<Id extends RpcHandlerId>(id: Id, handler: RpcHandlers[Id]): UnregisterRpcHandler;
    hasHandlerFor<Id extends RpcHandlerId>(id: Id): boolean;
}
declare global {
    interface Window {
        __databricks_mfe_rpc: GlobalRpcApi;
    }
}
export declare function isRpcSupported(): boolean;
export declare function defineRpc<Id extends RpcHandlerId>(id: Id): {
    isAvailable: () => boolean;
    call: (req: RpcRequestParams<Id>) => Promise<RpcResponse<Id>>;
    register: (handler: RpcHandlers[Id]) => UnregisterRpcHandler;
    useRegister: (handler: RpcHandlers[Id]) => void;
};
//# sourceMappingURL=rpc-api.d.ts.map