import type { CSSProperties, ReactNode } from 'react';
export declare type CodeSnippetLanguage = 'sql';
export declare type CodeSnippetTheme = 'duotoneDark' | 'light';
export interface CodeSnippetProps {
    /**
     * The code string
     */
    children: string;
    /**
     * The actions that are displayed on the right top corner of the component
     *  see `./actions` for built-in actions
     */
    actions?: NonNullable<ReactNode> | NonNullable<ReactNode>[];
    /**
     * The theme, default theme is `light`
     */
    theme?: CodeSnippetTheme;
    /**
     * Language of the code (`children`)
     */
    language: CodeSnippetLanguage;
    /**
     * Custom styles (passed to the internal `<pre>`)
     */
    style?: CSSProperties;
    /**
     * Whether to show line numbers on the left or not
     */
    showLineNumbers?: boolean;
    /**
     * Custom styles for line numbers
     */
    lineNumberStyle?: CSSProperties;
}
/**
 * `CodeSnippet` is used for highlighting code, use this instead of
 */
export declare function CodeSnippet({ theme, language, actions, style, children, showLineNumbers, lineNumberStyle, }: CodeSnippetProps): import("@emotion/react/jsx-runtime").JSX.Element;
//# sourceMappingURL=CodeSnippet.d.ts.map