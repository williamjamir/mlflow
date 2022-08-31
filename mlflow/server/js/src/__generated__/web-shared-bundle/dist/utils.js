import { SQLA_APP_KEY, WORKSPACE_APP_KEY, ML_APP_KEY } from './settings.js';
export { R as RandomUtils } from './RandomUtils-95541717.js';
export { B as ByteUnit, O as OnboardingStorage, c as createStorageMap, g as getMeasurementTags, h as humanReadableBytes, s as setBrowserUtilsConfig } from './OnboardingStorage-2f12f38b.js';
import 'lodash/noop';
import 'lodash/isFunction';
import 'react';
import './getCSRFToken-c6ef80ad.js';
import 'lodash/truncate';
import '@babel/runtime/helpers/defineProperty';

class CryptographyUtils {
  static byteArrayToBase64String(bytes) {
    return btoa(String.fromCharCode(...new Uint8Array(bytes)));
  }

  static base64StringToByteArray(base64str) {
    return Uint8Array.from(atob(base64str), c => c.charCodeAt(0));
  }

  static importRsaOaepKey(key) {
    const keyData = CryptographyUtils.base64StringToByteArray(key);
    return window.crypto.subtle.importKey('spki', keyData, {
      name: 'RSA-OAEP',
      hash: 'SHA-256'
    }, true, ['encrypt']);
  }
  /**
   * Generates an AES-GCM key to be used for encrypting messages
   */


  static generateAesGcmKey() {
    return window.crypto.subtle.generateKey({
      name: 'AES-GCM',
      length: 256
    }, true, ['encrypt', 'decrypt']);
  }

  static async exportAndWrapKey(keyToBeWrapped, wrappingKey) {
    const rawData = await window.crypto.subtle.exportKey('raw', keyToBeWrapped);
    const encrypted = await window.crypto.subtle.encrypt('RSA-OAEP', wrappingKey, rawData);
    return CryptographyUtils.byteArrayToBase64String(encrypted);
  }
  /**
   * Encrypts the provided message with the provided key using AES-GCM encryption
   *
   * Returns the base64 encoded string of the 12-bit IV followed by the encrypted message
   *
   * @param key AES-GCM CryptoKey to be used for encryption
   * @param msg The message to be encrypted
   */


  static async encryptMessage(msg, key) {
    const enc = new TextEncoder();
    const encodedMsg = enc.encode(msg);
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encryptedMsg = await window.crypto.subtle.encrypt({
      name: 'AES-GCM',
      iv: iv
    }, key, encodedMsg);
    return CryptographyUtils.byteArrayToBase64String(new Uint8Array([...iv, ...new Uint8Array(encryptedMsg)]));
  }

}

/**
 * Check if persona is available on environment (also visibility) and if the current user is allowed to use the
 * persona / product.
 */
function getAppAccess(config) {
  const {
    userCanUseDatabricksWorkspace,
    userCanUseSqlService,
    enableSqlService,
    centralizedLoginEnabled: isMultiTenant
  } = config;
  const environmentSupportsSqlService = Boolean(enableSqlService && isMultiTenant);
  const canUseSql = Boolean(userCanUseSqlService && environmentSupportsSqlService); // If the userCanUseDatabricksWorkspace is not present in the config (for old webapp envs),
  // assume true.

  const canUseWorkspace = !isMultiTenant || !canUseSql || userCanUseDatabricksWorkspace !== false;
  return {
    [SQLA_APP_KEY]: {
      availableInEnvironment: environmentSupportsSqlService,
      allowed: environmentSupportsSqlService && canUseSql
    },
    [WORKSPACE_APP_KEY]: {
      availableInEnvironment: true,
      allowed: canUseWorkspace
    },
    [ML_APP_KEY]: {
      availableInEnvironment: true,
      allowed: Boolean(canUseWorkspace)
    }
  };
}

const MLFLOW_IFRAME_ID = 'mlflow-iframe-id';
const FEATURE_STORE_IFRAME_ID = 'feature-store-iframe-id';

function isThenable(val) {
  // Proper way to detect if something is a promise (thenable): https://stackoverflow.com/a/27746324
  // See also React: https://github.com/facebook/react/blob/cae635054e17a6f107a39d328649137b83f25972/packages/jest-react/src/internalAct.js#L70-L72
  if (val !== null && typeof val === 'object' && typeof val.then === 'function') {
    return val;
  }

  return null;
}

function getNavigationTimings() {
  const timing = window.performance.timing;
  return {
    navigationType: window.performance.navigation.type,
    navigationStartTimestamp: timing.navigationStart,
    requestStartTimestamp: timing.requestStart,
    responseStartTimestamp: timing.responseStart,
    domLoadingTimestamp: timing.domLoading,
    domContentLoadedEventStartTimestamp: timing.domContentLoadedEventStart,
    domContentLoadedEventEndTimestamp: timing.domContentLoadedEventEnd,
    domCompleteTimestamp: timing.domComplete,
    loadEventEndTimestamp: timing.loadEventEnd
  };
}

const SQL_BASE_ROUTE = '/sql'; // These are routing constants that are applicable to redash but could be potentially used more globally.
// Specifically, the persona nav needs to use the history route for user.

const HISTORY_KEY = 'history';
function getHistoryRouteBase() {
  return HISTORY_KEY;
}
function getHistoryRouteForUser(userId) {
  return "".concat(getHistoryRouteBase(), "?userId=").concat(userId);
}
function getHistoryRouteForLakehouse(lakehouseId) {
  return "".concat(getHistoryRouteBase(), "?endpointId=").concat(lakehouseId);
}
function getHistoryQueryDetailsLink(lookupKey) {
  const params = new URLSearchParams({
    lookupKey: lookupKey
  });
  return "".concat(getHistoryRouteBase(), "?").concat(params.toString());
}

/**
 * This is required because jsdom does not populate the `origin`
 * field of the `MessageEvent`, when `postMessage` is called. However,
 * this `origin` plays an important role in ensuring the application is
 * secure and therefore we need to fix the `origin` in our testing.
 *
 * @param origin The desired origin for all posted messages
 * @returns
 */
function patchMessageEventOrigin(origin) {
  const listener = e => {
    if (e.origin !== '') {
      return;
    }

    e.stopImmediatePropagation();
    const patchedEvent = new MessageEvent('message', {
      data: e.data,
      origin
    });
    window.dispatchEvent(patchedEvent);
  };

  window.addEventListener('message', listener);
  return () => window.removeEventListener('message', listener);
}

function stringifyQueryParams(queryParams) {
  const queryParamKeys = Object.keys(queryParams);
  return queryParamKeys.length > 0 ? "?".concat(Object.keys(queryParams).map(key => "".concat(key, "=").concat(queryParams[key])).join('&')) : '';
}

class WorkspaceUtils {
  static getHostname() {
    return window.location.hostname;
  }
  /**
   * Returns the URL used to select a workspace to switch to
   * If useAbsoluteUrlForWorkspaceSelection is true, returns absolute URL. If returned URL has
   * different hostname than current hostname, path is /aad/auth to avoid user having to click login
   * on per-workspace URL.
   *
   * @param workspace {object} that contains {deploymentName: string, orgId: int,
   *                   azureLocation: string, useRegionalUrl: boolean}
   * @param useAbsoluteUrlForWorkspaceSelection {boolean} whether to return absolute URL or relative
   *        URL
   * @param domainSuffix {string} suffix to be used if constructing absolute URL
   * @param basePath {string} base path to be included in the workspace URL
   *
   * @returns URL to be used in link to workspace
   */


  static getSwitchWorkspaceUrl(workspace, useAbsoluteUrlForWorkspaceSelection, domainSuffix) {
    let basePath = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : '/';
    const queryParams = {
      o: "".concat(workspace.orgId)
    };

    if (useAbsoluteUrlForWorkspaceSelection) {
      const prefix = workspace.useRegionalUrl ? workspace.azureLocation : workspace.deploymentName;

      if (!workspace.useRegionalUrl) {
        delete queryParams.o;
      }

      const targetHostname = prefix + '.' + domainSuffix;
      let path = basePath;

      if (WorkspaceUtils.getHostname() !== targetHostname) {
        path = '/aad/auth';

        if (basePath !== '/') {
          queryParams.next_url = btoa(basePath);
        }
      }

      return "https://".concat(targetHostname).concat(path).concat(stringifyQueryParams(queryParams));
    }

    return "".concat(basePath).concat(stringifyQueryParams(queryParams));
  }

}

// eslint-disable-next-line @typescript-eslint/ban-types

/**
 * Converts a constant snake_case string type to a camelCase one
 * Example Input: `a_string_type`
 * Output: `aStringType`
 */

/**
 * Coverts all keys of given `ObjectType` from snake_case to camelCase
 * Example Input: `{ foo_bar: string, xyz_abc_baz: number }`
 * Output: `{ fooBar: string, xyzAbcBaz: number }`
 */
// eslint-disable-next-line @typescript-eslint/ban-types

/**
 * Makes some of the properties of an object, required
 * Example Input: `{ foo?: string; bar?: string; baz?: string; id: string }`
 * Output: `{ foo: string; bar: string; baz?: string; id: string }`
 */
// eslint-disable-next-line @typescript-eslint/ban-types

/**
 * "Type safer" `Object.entries`
 */
function objectEntries(object) {
  return Object.entries(object);
}

export { CryptographyUtils, FEATURE_STORE_IFRAME_ID, HISTORY_KEY, MLFLOW_IFRAME_ID, SQL_BASE_ROUTE, WorkspaceUtils, getAppAccess, getHistoryQueryDetailsLink, getHistoryRouteBase, getHistoryRouteForLakehouse, getHistoryRouteForUser, getNavigationTimings, isThenable, objectEntries, patchMessageEventOrigin };
//# sourceMappingURL=utils.js.map
