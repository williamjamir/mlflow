export declare enum ByteUnit {
    Bytes = "Bytes",
    KiloBytes = "KiloBytes",
    MegaBytes = "MegaBytes",
    GigaBytes = "GigaBytes",
    TeraBytes = "TeraBytes",
    PetaBytes = "PetaBytes",
    ExaBytes = "ExaBytes",
    ZettaBytes = "ZettaBytes",
    YottaBytes = "YottaBytes"
}
export declare function humanReadableBytes(size: number, unit?: ByteUnit): {
    size: number;
    sizeUnit: ByteUnit;
};
//# sourceMappingURL=ByteUtils.d.ts.map