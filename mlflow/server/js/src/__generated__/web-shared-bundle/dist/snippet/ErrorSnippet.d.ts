import type { ReactNode } from 'react';
export interface ErrorSnippetProps {
    className?: string;
    /**
     * The error message
     */
    children: string;
    /**
     * The actions that are displayed on the right top corner of the component
     *  see `./actions` for built-in supported actions
     */
    actions?: ReactNode | ReactNode[];
}
/**
 * `ErrorSnippet` is used for displaying large error message, stack-trace  as a data.
 *
 * WARN: It is not meant to be used as an error alert, when you need to display message of a error that
 *  happened after user interaction such as form submit, run a query from the UI, network request errors.
 *  For these cases where you need to provide contextual feedback to a user action, use `Alert` from `dubois`.
 */
export declare function ErrorSnippet({ children, className, actions }: ErrorSnippetProps): import("@emotion/react/jsx-runtime").JSX.Element;
//# sourceMappingURL=ErrorSnippet.d.ts.map