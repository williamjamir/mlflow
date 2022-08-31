export declare enum OnboardingAction {
    TutorialAbandon = "abandon",
    GuidedNavigationForCheck = "navigate",
    CheckCompleted = "completeCheck",
    MarkAsDone = "markAsDone"
}
export declare function useOnboardingRecorders(): {
    recordOnboardingAction: <O extends string>(action: OnboardingAction, objectId?: O | undefined) => void;
    recordCompletedOnboardingCheck: (checkName: string) => void;
    recordMarkAsDoneOnboardingCheck: (checkName: string) => void;
    withOnboardingEventRecorder: <T extends (...args: any[]) => any>(callback: T, action: OnboardingAction, checkName: string) => T;
};
export declare function useCallbackWithOnboardingEventRecorder<T extends (...args: any[]) => any>(callback: T, action: OnboardingAction, objectId?: string): T;
export declare function useRecordOnboardingCheckCompletedEvent(checkName: string, isCompleted: boolean | undefined): void;
export declare type TutorialVisibilityChangedEventData = {
    visible: boolean;
};
export declare const tutorialVisibilityChanged: import("../mfe-services/comms/events").MfeEventDefinition<TutorialVisibilityChangedEventData>;
export declare type TutorialTaskStatusChangedEventData = {
    tutorialTaskKey: string;
    isCompleted: boolean;
};
export declare const tutorialTaskStatusChanged: import("../mfe-services/comms/events").MfeEventDefinition<TutorialTaskStatusChangedEventData>;
//# sourceMappingURL=events.d.ts.map