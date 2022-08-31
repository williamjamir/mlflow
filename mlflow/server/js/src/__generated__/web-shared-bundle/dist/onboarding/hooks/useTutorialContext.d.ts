import React from 'react';
import type { TutorialTaskStatus } from '../types';
declare type EnumKey = string | number | symbol;
export interface TutorialTask<E extends EnumKey> {
    key: E;
    button: React.ReactElement;
    useTutorialTaskStatus: () => TutorialTaskStatus;
}
export declare class TutorialTasks<E extends EnumKey = string> {
    tasksMap: Record<E, TutorialTask<E>>;
    tasks: TutorialTask<E>[];
    constructor(tasksList: TutorialTask<E>[]);
}
export interface TutorialContextValue<E extends EnumKey> {
    showTutorial: () => void;
    hideTutorial: () => void;
    tutorialTasks: TutorialTasks<E>;
    cachedTaskStatusMap: Record<string, TutorialTaskStatus>;
}
export declare function TutorialProvider({ enabled, tutorialTasks, storageId, children, }: React.PropsWithChildren<{
    enabled: boolean;
    tutorialTasks: TutorialTasks;
    storageId: string;
}>): import("@emotion/react/jsx-runtime").JSX.Element | null;
export declare function useTutorialContext<E extends EnumKey>(): TutorialContextValue<E>;
export {};
//# sourceMappingURL=useTutorialContext.d.ts.map