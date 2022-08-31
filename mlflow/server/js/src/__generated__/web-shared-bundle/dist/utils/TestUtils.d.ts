/**
 * This is required because jsdom does not populate the `origin`
 * field of the `MessageEvent`, when `postMessage` is called. However,
 * this `origin` plays an important role in ensuring the application is
 * secure and therefore we need to fix the `origin` in our testing.
 *
 * @param origin The desired origin for all posted messages
 * @returns
 */
export declare function patchMessageEventOrigin(origin: string): () => void;
//# sourceMappingURL=TestUtils.d.ts.map