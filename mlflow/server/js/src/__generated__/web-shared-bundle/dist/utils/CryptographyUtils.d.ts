export declare class CryptographyUtils {
    static byteArrayToBase64String(bytes: ArrayBuffer): string;
    static base64StringToByteArray(base64str: string): ArrayBuffer;
    static importRsaOaepKey(key: string): Promise<CryptoKey>;
    /**
     * Generates an AES-GCM key to be used for encrypting messages
     */
    static generateAesGcmKey(): Promise<CryptoKey>;
    static exportAndWrapKey(keyToBeWrapped: CryptoKey, wrappingKey: CryptoKey): Promise<string>;
    /**
     * Encrypts the provided message with the provided key using AES-GCM encryption
     *
     * Returns the base64 encoded string of the 12-bit IV followed by the encrypted message
     *
     * @param key AES-GCM CryptoKey to be used for encryption
     * @param msg The message to be encrypted
     */
    static encryptMessage(msg: string, key: CryptoKey): Promise<string>;
}
//# sourceMappingURL=CryptographyUtils.d.ts.map