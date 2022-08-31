import type { LoadingDescription } from './DatabricksLoadingDescriptions';
declare type ReactInteractionHoldProps = {
    loading: boolean;
    description?: LoadingDescription;
    allowlist?: Array<string>;
};
/**
 * Used when your view has a loading state that would for example block page load.
 * Simply put this component in your render tree with loading=true and a description
 * that explains what we are waiting on for debugging and aggregating purposes.
 *
 * When loading is complete either re-render with loading=false OR unmount this component.
 *
 * See `useReactInteractionHold` for more documentation.
 */
export declare function ReactInteractionHold({ loading, description, allowlist }: ReactInteractionHoldProps): null;
export {};
//# sourceMappingURL=ReactInteractionHold.d.ts.map