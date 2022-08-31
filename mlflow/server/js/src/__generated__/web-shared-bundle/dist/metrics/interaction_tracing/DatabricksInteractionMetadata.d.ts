import type { InteractionName } from './DatabricksInteractionNames';
export declare type InteractionMetadata<T extends InteractionName> = T extends InteractionName.WEBAPP_NOTEBOOK_PASTE_COMMAND ? PasteCommandMetadata : T extends InteractionName.WEBAPP_NOTEBOOK_ADD_COMMAND ? AddCommandMetadata : T extends InteractionName.WEBAPP_NOTEBOOK_CANCEL_COMMAND ? CancelCommandMetadata : T extends InteractionName.WEBAPP_NOTEBOOK_RUN_COMMAND ? RunCommandMetadata : T extends InteractionName.WEBAPP_NOTEBOOK_RUN_ALL_COMMAND ? RunAllCommandMetadata : T extends InteractionName.WEBAPP_NOTEBOOK_CLICK_INTO_CELL ? ClickedIntoCellMetadata : T extends InteractionName.WEBAPP_NOTEBOOK_DELETE_COMMAND ? DeleteCommandMetadata : T extends InteractionName.REDASH_EDITOR_ADD_NEW_QUERY_TAB ? RedashEditorAddNewQueryTabCommandMetadata : T extends InteractionName.REDASH_EDITOR_REMOVE_TAB ? RedashEditorRemoveQueryTabCommandMetadata : T extends InteractionName.WEBAPP_NOTEBOOK_FULLY_LOADED ? NotebookFullyLoadedMetadata : never;
export declare type PasteCommandMetadata = {
    commandIndex: number;
    numCommandsToPaste: number;
    numCells: number;
};
export declare type AddCommandMetadata = {
    commandIndex?: number;
    numCells: number;
};
export declare type CancelCommandMetadata = {
    commandIndex: number;
    numCells: number;
};
export declare type RunCommandMetadata = {
    commandIndex: number;
    numCells: number;
};
export declare type RunAllCommandMetadata = {
    numCells: number;
    isCanceled?: boolean;
};
export declare type ClickedIntoCellMetadata = {
    commandSize: number;
};
export declare type DeleteCommandMetadata = {
    numberOfCommandsRemoved: number;
};
export declare type RedashEditorAddNewQueryTabCommandMetadata = {
    numCells: number;
};
export declare type RedashEditorRemoveQueryTabCommandMetadata = {
    numCells: number;
};
export declare type NotebookFullyLoadedMetadata = {
    routeName: InteractionName;
};
//# sourceMappingURL=DatabricksInteractionMetadata.d.ts.map