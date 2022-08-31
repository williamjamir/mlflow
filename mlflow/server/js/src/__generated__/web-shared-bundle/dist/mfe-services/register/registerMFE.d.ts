import type React from 'react';
declare type MFEDeclarationType = {
    name: string;
    init: () => void;
    reactRoot: (shadowRoot: ShadowRoot) => React.FunctionComponentElement<any>;
    injectStyleURLs?: string[];
};
export declare function registerMFE(mfe: MFEDeclarationType): void;
export {};
//# sourceMappingURL=registerMFE.d.ts.map