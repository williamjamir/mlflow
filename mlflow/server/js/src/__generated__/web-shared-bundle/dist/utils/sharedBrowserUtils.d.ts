export declare type MeasurementTagValue = string | number | boolean | null | undefined;
export interface BrowserUtilsConfigCache {
    branch: string;
}
export declare function setBrowserUtilsConfig(config: BrowserUtilsConfigCache): void;
export declare function getMeasurementTags(additionalTags: {
    [k: string]: MeasurementTagValue;
}): {
    browserTabId: string;
    browserHasFocus: boolean;
    browserIsHidden: boolean;
    browserHash: string;
    browserHostName: string;
    browserUserAgent: string;
    eventWindowTime: number;
    clientBranchName: string | undefined;
};
//# sourceMappingURL=sharedBrowserUtils.d.ts.map