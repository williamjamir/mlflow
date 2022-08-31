import type { Story } from '@storybook/react';
import type { ErrorMessageProps } from './ErrorMessage';
declare const _default: {
    title: string;
    component: ({ message, compact, copyTooltip, copyTextFunc, clearTooltip, clearFunc, "data-testid": dataTestId, styles, }: ErrorMessageProps) => import("@emotion/react/jsx-runtime").JSX.Element;
};
export default _default;
export interface TemplateProps {
    title: string;
    errorMessageProps: ErrorMessageProps;
}
export declare const OnlyErrorMessage: Story<TemplateProps>;
export declare const WithCopyButton: Story<TemplateProps>;
export declare const WithMultipleLineText: Story<TemplateProps>;
export declare const WithMultipleLineTextAndScroll: Story<TemplateProps>;
export declare const WithLongText: Story<TemplateProps>;
export declare const CompactWithSingleLineText: Story<TemplateProps>;
export declare const CompactWithMultipleLineText: Story<TemplateProps>;
export declare const CompactWithMultipleLineTextWithScroll: Story<TemplateProps>;
export declare const CompactWithLongText: Story<TemplateProps>;
//# sourceMappingURL=ErrorMessage.stories.d.ts.map