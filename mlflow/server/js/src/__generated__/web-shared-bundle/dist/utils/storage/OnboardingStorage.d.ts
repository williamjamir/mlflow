export declare class OnboardingStorage {
    private orgId;
    private userId;
    constructor(orgId: string | number, userId: string | number);
    private readonly storageMap;
    get isVisible(): boolean | undefined;
    set isVisible(value: boolean | undefined);
    get hasSkipped(): boolean;
    set hasSkipped(value: boolean);
    getOnboardingCheck(check: string): boolean | undefined;
    setOnboardingCheck(check: string, value: boolean): void;
}
//# sourceMappingURL=OnboardingStorage.d.ts.map