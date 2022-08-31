export declare class TutorialStorage {
    private _activeStorageId;
    constructor(_activeStorageId: string);
    /**
     * Get final key string of the specific task in local storage
     *
     * @example tutorial-user_12345-account-56789-task-createUnityCatalog
     */
    private _getTaskStorageKey;
    private _getVisibilityStorageKey;
    getTask(taskKey: string): any;
    updateTask(taskKey: string, taskProps: any): any;
    getVisibility(): any;
    updateVisibility(isVisible: boolean): void;
}
//# sourceMappingURL=tutorialStorage.d.ts.map