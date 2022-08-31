declare const NavigateToRpcHandlerId = "Router::NavigateTo";
export declare type NavigateToOptions = {
    href: string;
    replace?: boolean;
};
export declare type NavigateToRpcCallSignature = (req: NavigateToOptions) => Promise<void>;
declare module '../comms/rpc-handlers-registry' {
    interface RpcHandlers {
        [NavigateToRpcHandlerId]: NavigateToRpcCallSignature;
    }
}
export declare const navigateToRpc: {
    isAvailable: () => boolean;
    call: (req: NavigateToOptions) => Promise<void>;
    register: (handler: NavigateToRpcCallSignature) => import("../comms/rpc-api").UnregisterRpcHandler;
    useRegister: (handler: NavigateToRpcCallSignature) => void;
};
export declare const urlChangedEvent: import("../comms/events").MfeEventDefinition<void>;
export {};
//# sourceMappingURL=HostRouter.d.ts.map