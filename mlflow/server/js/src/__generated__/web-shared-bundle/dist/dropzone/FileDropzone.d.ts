import type { FunctionComponent, ReactElement } from 'react';
interface FileDropzoneProps {
    children: ReactElement;
    location: string;
    onDrop: (files: File[]) => void;
    noClick?: boolean;
    noDrag?: boolean;
    noKeyboard?: boolean;
    enabled?: boolean;
}
export declare const FileDropzone: FunctionComponent<FileDropzoneProps>;
export {};
//# sourceMappingURL=FileDropzone.d.ts.map