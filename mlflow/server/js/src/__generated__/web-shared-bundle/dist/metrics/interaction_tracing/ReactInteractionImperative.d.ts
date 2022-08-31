import type { InteractionMetadata } from './DatabricksInteractionMetadata';
import type { InteractionName } from './DatabricksInteractionNames';
import type { Interaction, InteractionType } from './ReactInteractionTracing';
export declare function startImperativeInteraction<T extends InteractionName>(type: InteractionType, name: T, metadata?: InteractionMetadata<T>, startTime?: number | null): void;
export declare function stopImperativeInteraction(type: InteractionType, name: InteractionName, endTimeInitial?: number): Interaction<InteractionName> | null;
export declare function testReset(): void;
//# sourceMappingURL=ReactInteractionImperative.d.ts.map