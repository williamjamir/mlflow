import type { ReactNode } from 'react';
export interface SnippetFullScreenActionProps {
    /**
     * Whether snippet is displayed in full screen mode or not
     *  If this is true, full screen exit icon is displayed instead
     */
    fullScreen: boolean;
    onClick: (isInFullScreen: boolean) => void;
    enterFullScreenTooltip?: NonNullable<ReactNode>;
    exitFullScreenTooltip?: NonNullable<ReactNode>;
}
export declare function SnippetFullScreenAction({ fullScreen, onClick, exitFullScreenTooltip, enterFullScreenTooltip, }: SnippetFullScreenActionProps): import("@emotion/react/jsx-runtime").JSX.Element;
//# sourceMappingURL=SnippetFullScreenAction.d.ts.map