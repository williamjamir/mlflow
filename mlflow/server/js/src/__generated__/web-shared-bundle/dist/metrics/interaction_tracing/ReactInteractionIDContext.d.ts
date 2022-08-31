import React from 'react';
import type { InteractionName } from './DatabricksInteractionNames';
import type { Interaction } from './ReactInteractionTracing';
/**
 * Track the current interaction ID under a different context. This is important because
 * 1) Interaction ID may not be consistent between a parent and child component during the render phase.
 * 2) We want to limit the number of components that re-render when the interaction ID changes because
 *    this happens during performance sensitive periods such as quick tab switches.
 */
export declare const ReactInteractionIDContext: React.Context<Interaction<InteractionName> | null>;
//# sourceMappingURL=ReactInteractionIDContext.d.ts.map