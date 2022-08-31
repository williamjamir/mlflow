import type { PropsWithChildren } from 'react';
import React from 'react';
import type { OnboardingCheck } from '../types';
export interface TutorialBasePageProps {
    title: React.ReactNode;
    description: React.ReactNode;
    hasBack?: boolean;
    nextStepButton?: React.ReactNode;
}
export interface LegacyTutorialPageProps extends TutorialBasePageProps {
    isCompleted?: boolean;
    skipButton?: React.ReactNode;
}
export interface TutorialCheckPageProps extends TutorialBasePageProps {
    check: OnboardingCheck | undefined;
    checkName?: string;
    showDismiss?: boolean;
}
/**
 * @deprecated
 */
export declare function LegacyTutorialPage({ children, isCompleted, title, description, hasBack, skipButton, nextStepButton, }: PropsWithChildren<LegacyTutorialPageProps>): import("@emotion/react/jsx-runtime").JSX.Element;
/**
 * @deprecated
 */
export declare function TutorialCheckPage(props: PropsWithChildren<TutorialCheckPageProps>): import("@emotion/react/jsx-runtime").JSX.Element;
export interface TutorialPageProps {
    tutorialTaskKey?: string;
    title: React.ReactNode;
    description: React.ReactNode;
    canGoBack?: boolean;
    completedText?: string;
    nextTask?: {
        title: string;
        taskButton?: React.ReactNode;
    };
}
export declare function TutorialPage({ tutorialTaskKey, title, description, canGoBack, completedText, nextTask, children, }: PropsWithChildren<TutorialPageProps>): import("@emotion/react/jsx-runtime").JSX.Element;
//# sourceMappingURL=TutorialPage.d.ts.map