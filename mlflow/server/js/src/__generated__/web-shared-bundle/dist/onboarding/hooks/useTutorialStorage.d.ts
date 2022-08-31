import type { TutorialTaskStatus } from '../types';
import { TutorialStorage } from '../utils';
import type { TutorialTasks } from './useTutorialContext';
export declare function useTutorialStorage(storageId: string, tutorialTasks: TutorialTasks): {
    cachedTaskStatusMap: Record<string, TutorialTaskStatus>;
    tutorialStorage: TutorialStorage;
};
//# sourceMappingURL=useTutorialStorage.d.ts.map