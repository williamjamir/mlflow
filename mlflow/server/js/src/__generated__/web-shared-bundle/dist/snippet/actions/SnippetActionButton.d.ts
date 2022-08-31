import type { ReactNode } from 'react';
import type { ButtonProps } from '@databricks/design-system';
declare type SnippetActionButtonProps = Pick<ButtonProps, 'icon' | 'onClick'> & {
    tooltipMessage: NonNullable<ReactNode>;
};
export default function SnippetActionButton({ tooltipMessage, ...buttonProps }: SnippetActionButtonProps): import("@emotion/react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=SnippetActionButton.d.ts.map