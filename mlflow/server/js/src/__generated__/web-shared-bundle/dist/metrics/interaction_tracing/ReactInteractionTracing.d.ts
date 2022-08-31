import React from 'react';
import type { CoinFlipABExposuresType } from '../CoinFlipAB';
import type { InteractionMetadata } from './DatabricksInteractionMetadata';
import type { InteractionName } from './DatabricksInteractionNames';
import type { LoadingDescription } from './DatabricksLoadingDescriptions';
export declare enum InteractionStatus {
    SUCCESSFUL = "SUCCESSFUL",
    CANCELLED = "CANCELLED",
    FAILED = "FAILED"
}
export declare enum InteractionType {
    INITIAL_LOAD = "INITIAL_LOAD",
    NAVIGATION = "NAVIGATION",
    INTERACTION = "INTERACTION"
}
export declare type CompletedInteraction<T extends InteractionName> = {
    id: string;
    startTime: number;
    endTime: number;
    status: InteractionStatus;
    completedLoadingStates: ReadonlyArray<LoadingState>;
    name: T;
    type: InteractionType;
    isRevisit: boolean;
    backgrounded: boolean;
    exposures: CoinFlipABExposuresType;
    metadata?: InteractionMetadata<T>;
    jsBytesLoaded: number;
    cssBytesLoaded: number;
    stalledRequestsTime: number;
    stalledRequestsCount: number;
    timeToInteractive: number;
};
export declare type Interaction<T extends InteractionName> = {
    id: string;
    startTime: number;
    completedLoadingStates: Array<LoadingState>;
    completionPromise: Promise<CompletedInteraction<T>>;
    resolve: (value: CompletedInteraction<T>) => void;
    status?: InteractionStatus;
    endTime?: number;
    name: InteractionName;
    type: InteractionType;
    isRevisit: boolean;
    backgrounded: boolean;
    metadata?: InteractionMetadata<T>;
    jsBytesStart: number;
    cssBytesStart: number;
};
declare type LoadingState = {
    description: LoadingDescription;
    startTime: number;
    endTime?: number;
};
declare type ReactInteractionTracingProps = {
    interaction: Interaction<InteractionName> | null;
    children: React.ReactElement;
    enabled?: boolean;
};
export declare function stopInteraction(interactionInitial: Interaction<InteractionName> | null, completionStatus: InteractionStatus, endTimeInitial?: number): void;
export declare function ReactInteractionTracing(props: ReactInteractionTracingProps): React.ReactElement;
/**
 * This is the start of the interaction. This typically happen for an
 * imperative event handler or the browser's navigation start event.
 * This should be triggered before the React render starts because
 * this is often late into the interaction.
 *
 * This will internally start an interaction and return the ID. This ID
 * should be passed to a <ReactInteractionTracing> component. When that
 * component renders & commits without any loading state then the
 * interaction will be automatically completed. You may use
 * `waitForInteraction` to await and use the interaction results to log.
 */
export declare function startInteraction<T extends InteractionName>(type: InteractionType, name: T, metadata?: InteractionMetadata<T>, startTime?: number | null): Interaction<InteractionName>;
/**
 * Helper to start the first navigation interaction. This should only be
 * called once.
 */
export declare function startInteractionInitialLoad(name: InteractionName): Interaction<InteractionName>;
/**
 * Use to wait on and get the results of an interaction. If given a valid
 * interaction ID then you'll receive a promise of the interaction results
 * that can be used to log the results.
 *
 * NOTE: It is NOT recommended to make any behavioral changes to the
 * application based on this metrics. For instance it may be tempting to
 * trigger background work only after a page load. After this is a bad idea
 * because 1) performance metrics are not always correct, 2) you may cause
 * the metric not to complete if you accidental form a loading cycle,
 * 3) you may hurt performance.
 */
export declare function waitForInteraction(interaction: Interaction<InteractionName> | null): Promise<CompletedInteraction<any>> | null;
/**
 * Subscribe to all interaction completion event. This is useful to log all
 * results.
 */
export declare function notifyOnInteractionComplete(callback: (interaction: CompletedInteraction<any>) => void): () => void;
export {};
//# sourceMappingURL=ReactInteractionTracing.d.ts.map