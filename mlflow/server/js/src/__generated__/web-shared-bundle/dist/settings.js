export { g as getCSRFToken } from './getCSRFToken-c6ef80ad.js';

function getOrgID() {
  var _window$settings, _window$top, _window$top$settings;

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error Redash only: Property 'settings' does not exist on type 'Window & typeof globalThis'.
  // eslint-disable-next-line no-restricted-syntax -- TODO(FEINF-451)
  return ((_window$settings = window.settings) === null || _window$settings === void 0 ? void 0 : _window$settings.orgId) || ((_window$top = window.top) === null || _window$top === void 0 ? void 0 : (_window$top$settings = _window$top.settings) === null || _window$top$settings === void 0 ? void 0 : _window$top$settings.orgId);
}

function getUser() {
  var _window$settings, _window$top, _window$top$settings;

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error Redash only: Property 'settings' does not exist on type 'Window & typeof globalThis'.
  // eslint-disable-next-line no-restricted-syntax -- TODO(FEINF-451)
  return ((_window$settings = window.settings) === null || _window$settings === void 0 ? void 0 : _window$settings.user) || ((_window$top = window.top) === null || _window$top === void 0 ? void 0 : (_window$top$settings = _window$top.settings) === null || _window$top$settings === void 0 ? void 0 : _window$top$settings.user);
}

const WORKSPACE_APP_KEY = 'workspace';
const SQLA_APP_KEY = 'redash';
const ML_APP_KEY = 'machine-learning';

export { ML_APP_KEY, SQLA_APP_KEY, WORKSPACE_APP_KEY, getOrgID, getUser };
//# sourceMappingURL=settings.js.map
