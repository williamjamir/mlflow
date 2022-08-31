import type { CSSObject } from '@emotion/react';
export interface ErrorMessageProps {
    message: string;
    compact?: boolean;
    copyTooltip?: string;
    copyTextFunc?: () => void;
    clearTooltip?: string;
    clearFunc?: () => void;
    'data-testid'?: string;
    styles?: CSSObject;
}
export declare const ErrorMessage: ({ message, compact, copyTooltip, copyTextFunc, clearTooltip, clearFunc, "data-testid": dataTestId, styles, }: ErrorMessageProps) => import("@emotion/react/jsx-runtime").JSX.Element;
//# sourceMappingURL=ErrorMessage.d.ts.map