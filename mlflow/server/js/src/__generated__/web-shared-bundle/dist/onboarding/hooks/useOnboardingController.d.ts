import React from 'react';
import { OnboardingStorage } from '../../utils';
import type { OnboardingCheck, UseOnboardingChecks } from '../types';
export interface OnboardingConfigValue {
    recordEvent?: <O extends string>(action: string, objectType: string, objectId?: O) => void;
    conf: {
        isAdmin: boolean;
        cloud: string;
        enableOnboarding: boolean;
        orgId: string;
        userId: string;
    };
}
export interface OnboardingContextValue {
    isVisible: boolean;
    isEnabled: boolean;
    hasSkipped: boolean;
    onboardingChecks: {
        [key: string]: OnboardingCheck;
    };
    hide: () => void;
    show: () => void;
    skip: () => void;
    reset: () => void;
}
export interface OnboardingContextProps {
    onboardingChecks: UseOnboardingChecks;
}
export declare function OnboardingContextProvider(props: React.PropsWithChildren<OnboardingContextProps>): import("@emotion/react/jsx-runtime").JSX.Element;
export declare function useOnboardingController(): OnboardingContextValue;
export declare function useOnboardingCheck(name: string): OnboardingCheck;
export declare function OnboardingConfigProvider(props: React.PropsWithChildren<{
    config: OnboardingConfigValue;
}>): import("@emotion/react/jsx-runtime").JSX.Element;
export declare function useOnboardingConfig(): OnboardingConfigValue;
export declare function useOnboardingEnabled(): boolean;
export declare function useOnboardingStorage(): OnboardingStorage;
export declare function useOnboardingSkip(): {
    skip: () => void;
    hasSkipped: boolean;
    reset: () => void;
};
//# sourceMappingURL=useOnboardingController.d.ts.map