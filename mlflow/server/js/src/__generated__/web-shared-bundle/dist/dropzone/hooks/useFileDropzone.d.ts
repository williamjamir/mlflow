export interface UseDropzoneProps {
    noClick?: boolean;
    noDrag?: boolean;
    noKeyboard?: boolean;
    onDrop: (files: File[]) => void;
}
export declare const useFileDropzone: ({ noClick, noDrag, noKeyboard, onDrop }: UseDropzoneProps) => {
    getRootProps: (props?: import("react-dropzone").DropzoneRootProps | undefined) => import("react-dropzone").DropzoneRootProps;
    getInputProps: (props?: import("react-dropzone").DropzoneInputProps | undefined) => import("react-dropzone").DropzoneInputProps;
    isDragActive: boolean;
};
//# sourceMappingURL=useFileDropzone.d.ts.map