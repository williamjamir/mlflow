import React from 'react';
import type { InteractionMetadata } from './DatabricksInteractionMetadata';
import type { InteractionName } from './DatabricksInteractionNames';
import type { LoadingDescription } from './DatabricksLoadingDescriptions';
import type { Interaction } from './ReactInteractionTracing';
export declare type ReactInteractionContextType = {
    /**
     * This should called via ReactInteractionHold/useReactInteractionHold. These APIs must be used from within
     * the render phase of React. The first render of the subtree without any holds will be considered as
     * the completed interaction. Note that due to how React cascading updates work, you can use useLayoutEffect
     * to check and set a hold via a re-render but any loading signal done via useEffect will not work reliably.
     *
     * i.e. If you issue a fetch for some data on the network, you should track loading using
     * ReactInteractionHold/useReactInteractionHold or via this API in a useLayoutEffect for the duration that
     * you're fetching data on the network. Note that you should also be showing some UI affordance that you're
     * loading something to the user. Typically this will be co-located.
     *
     * @allowlist Specify a list of interaction for which this loading state only applies to. For example if
     *            a page is loading we don't want to track that a notebook is running a command, but we
     *            want to track it if we're tracing a 'run command'.
     */
    trackLoading: (_interaction: Interaction<InteractionName> | null, _holdUID: number, _loadingDescription: LoadingDescription | null, allowlist?: Array<string>) => void;
    /**
     * Start an interaction from within the component's context. For example this might be a form component
     * within the context of the page, or a chart refreshing within a tooltip. When a component calls
     * startInteraction from it's context it will cancel the parent interaction if it was ongoing and it's
     * saying that the parent (a page, tooltip, dialog etc...) is significantly changing due to an internal
     * interaction.
     */
    startInteraction: <T extends InteractionName>(interactionName: T, metadata?: InteractionMetadata<T>, startTime?: number) => Interaction<InteractionName> | null;
};
export declare const ReactInteractionContext: React.Context<ReactInteractionContextType>;
//# sourceMappingURL=ReactInteractionContext.d.ts.map