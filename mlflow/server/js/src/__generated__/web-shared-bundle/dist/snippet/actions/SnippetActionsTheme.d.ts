import type { ReactNode } from 'react';
export interface SnippetActionsTheme {
    color?: string;
    hoverColor?: string;
    backgroundColor?: string;
    hoverBackgroundColor?: string;
}
export interface SnippetActionsThemeProviderProps {
    theme?: SnippetActionsTheme;
    children: ReactNode;
}
export declare function SnippetActionsThemeProvider({ children, theme }: SnippetActionsThemeProviderProps): import("@emotion/react/jsx-runtime").JSX.Element;
export declare function useSnippetActionsTheme(): SnippetActionsTheme;
//# sourceMappingURL=SnippetActionsTheme.d.ts.map