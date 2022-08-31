class RandomUtils {
  static getRandomIdentifier() {
    // TODO: move this to a shared file and reuse for CSFR token.
    const idLength = 10; // eslint-disable-next-line no-restricted-properties

    return Math.floor(Math.random() * Math.pow(10, idLength)).toString();
  }
  /** @return A UUID consisting of the current timestamp and a small number of random characters. */


  static generateUUID() {
    const randomPart = Math.random().toString(36).substring(2, 10);
    const timePart = new Date().getTime().toString();
    return "".concat(timePart).concat(randomPart);
  }
  /** @return A cryptographically strong random hexadecimal string of the given length */


  static getRandomHexString(length) {
    return Array.from(window.crypto.getRandomValues(new Uint32Array(Math.ceil(length / 8)))).map(x => x.toString(16)).join('').substring(0, length);
  }

}

export { RandomUtils as R };
//# sourceMappingURL=RandomUtils-95541717.js.map
