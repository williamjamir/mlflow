export declare type CoinFlipABExposuresType = {
    [experimentName: string]: boolean;
};
/**
 * Returns a randomly generated boolean value that is sticky throughout the JS runtime for a
 * given experimentName. This is ideal to study short term impact of a study such as performance
 * studies. It is however not suitable to studying longer term effects such as changes to
 * user behavior resulting from being exposed to an experiment or performance
 * improvement over a long period.
 *
 * Since the group is randomized on a per-load basis, it is however less susceptible
 * to where power-users get assigned in a randomized study of a small to medium population.
 */
export declare function getCoinFlipABGroup(experimentName: string): boolean;
/**
 * Returns the set of exposures that were generated for this SPA app session.
 * We're only interested in talking about exposures that the user has seen
 * in this session.
 */
export declare function getCoinFlipExposures(): CoinFlipABExposuresType;
//# sourceMappingURL=CoinFlipAB.d.ts.map