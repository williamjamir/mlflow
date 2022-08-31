/// <reference types="react" />
export interface UseOnboardingChecks {
    isChecking: boolean;
    checksTodo: number | undefined;
    checks: {
        [key: string]: OnboardingCheck;
    };
    reset(): void;
}
export interface OnboardingCheck {
    button: React.ReactElement;
    isCompleted: boolean | undefined;
    isChecking: boolean;
    markAsDone(): void;
}
export interface OnboardingCheckData {
    title: string;
    icon: React.ReactElement;
    renderPage: () => React.ReactElement;
    eventName: string;
    href: string;
    checkName: string;
    variant?: 'admin' | 'user';
}
export interface AckToCompleteOnboardingCheck extends OnboardingCheck {
    ack(): void;
    isCompleting: boolean;
}
export interface OnboardingPageProps {
    nextButton?: React.ReactElement;
}
export interface TutorialTaskStatus {
    isCompleted: boolean;
}
//# sourceMappingURL=types.d.ts.map