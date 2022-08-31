/**
 * Returns the total number of (decompressed) (includes cached loads) js bytes we have used in our
 * app at this point. This will include prefetching which may interferring with what you're intending
 * to measure. After 30s we currently prefetch the entire app which will cause a large spike.
 */
export declare function getJSSize(): number;
/**
 * Returns the total number of (decompressed) (includes cached loads) css bytes we have used in our
 * app at this point.
 */
export declare function getCSSSize(): number;
//# sourceMappingURL=AppSize.d.ts.map