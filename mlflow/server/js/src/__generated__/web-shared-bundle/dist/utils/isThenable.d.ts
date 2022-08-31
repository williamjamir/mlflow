export declare type Thenable = {
    then: (resolve: () => unknown, reject?: () => unknown) => unknown;
};
export declare function isThenable(val: unknown): Thenable | null;
//# sourceMappingURL=isThenable.d.ts.map