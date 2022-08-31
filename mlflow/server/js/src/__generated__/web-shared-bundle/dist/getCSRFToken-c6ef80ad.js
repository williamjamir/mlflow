function getCSRFToken() {
  var _ref, _window$settings, _window$top, _window$top$settings;

  /**
   * This has to use window.settings instead of conf() because this token gets automatically
   * refreshed when an HTTP call gets rejected because the token has expired.
   * Jobs' MFE had its own copy of conf(), which prevented this token from getting updated.
   */
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error Redash only: Property 'settings' does not exist on type 'Window & typeof globalThis'.
  // eslint-disable-next-line no-restricted-syntax -- TODO(FEINF-451)
  return (_ref = ((_window$settings = window.settings) === null || _window$settings === void 0 ? void 0 : _window$settings.csrfToken) || ((_window$top = window.top) === null || _window$top === void 0 ? void 0 : (_window$top$settings = _window$top.settings) === null || _window$top$settings === void 0 ? void 0 : _window$top$settings.csrfToken)) !== null && _ref !== void 0 ? _ref : '';
}

export { getCSRFToken as g };
//# sourceMappingURL=getCSRFToken-c6ef80ad.js.map
