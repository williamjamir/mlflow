import type { PropsWithChildren } from 'react';
import React from 'react';
import type { ButtonProps } from '@databricks/design-system';
import type { RequireProperties } from '../../utils';
declare type TutorialButtonProps = RequireProperties<ButtonProps, 'onClick' | 'href' | 'children'> & {
    variant: 'admin' | 'user';
    completed: boolean | undefined;
    eventName: string;
};
declare type AutoTutorialButtonProps = Omit<TutorialButtonProps, 'onClick' | 'completed' | 'children'> & {
    title: string;
    targetPage: () => React.ReactElement;
    checkName: string;
};
/**
 * @deprecated
 */
export declare function AutoTutorialButton(props: AutoTutorialButtonProps): import("@emotion/react/jsx-runtime").JSX.Element;
/**
 * @deprecated
 */
export declare function LegacyTutorialButton(props: TutorialButtonProps): import("@emotion/react/jsx-runtime").JSX.Element;
export declare function TutorialButton({ icon, variant, targetTutorialPage, tutorialTaskKey, onClick, children, }: PropsWithChildren<{
    icon: React.ReactNode;
    variant: 'admin' | 'user';
    targetTutorialPage: React.ReactElement;
    tutorialTaskKey: string;
    onClick: React.MouseEventHandler<HTMLButtonElement>;
}>): import("@emotion/react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=TutorialButton.d.ts.map