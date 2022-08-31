/**
 * Mapping between RPC handler identifier (a string) and the function signature of the
 * handler.
 *
 * Intended to be extended individually by each handler in their respective files:
 * ```
 * declare module './rpc-handlers-registry' {
 *   export interface RpcHandlers {
 *     NewHandlerKey: (args: NewHandlerArgs) => Promise<NewRpcHandlerResponse>;
 *   }
 * }
 * ```
 */
export interface RpcHandlers {
}
/**
 * To be replaced with `Awaited` utility type when possible.
 */
declare type PromiseResultType<T> = T extends Promise<infer R> ? R : T;
export declare type RpcHandlerId = keyof RpcHandlers;
export declare type RpcRequestParams<Id extends RpcHandlerId> = Parameters<RpcHandlers[Id]>[0];
export declare type RpcResponse<Id extends RpcHandlerId> = PromiseResultType<ReturnType<RpcHandlers[Id]>>;
export {};
//# sourceMappingURL=rpc-handlers-registry.d.ts.map