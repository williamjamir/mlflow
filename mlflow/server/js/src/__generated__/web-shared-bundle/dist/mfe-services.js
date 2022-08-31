import invariant from 'invariant';
import { s as sanitizeValue, d as defineEvent } from './events-2e8c7eb1.js';
import { useEffect } from 'react';
import _defineProperty from '@babel/runtime/helpers/defineProperty';
import ReactDOM from 'react-dom';
import 'lodash/isPlainObject';
import 'lodash/isDate';

function commitHash() {
  const buildStr = '<git-sha-to-be-replaced-by-bazel-in-production>';

  if (buildStr.indexOf('<git-sha') !== 0) {
    return buildStr;
  } // eslint-disable-next-line no-undef


  return __GIT_COMMIT_HASH__;
}

const handlersProp = Symbol('handlers');
const traces = new WeakMap();

function getHandlers() {
  invariant(typeof window.__databricks_mfe_rpc !== 'undefined', "RPC hasn't been initialized or it has been destroyed!"); // The publicly declared type doesn't have the actual handlers property specified
  // ideally the handlers will be a private state of this module, but for debugging purposes
  // it might be beneficial to have an easy access to the list of currently registered handlers

  return window.__databricks_mfe_rpc[handlersProp];
}

function registerHandler(id, handler) {
  const handlers = getHandlers();
  const existingHandler = handlers[id];

  if (existingHandler !== undefined) {
    var _traces$get;

    throw new Error( // eslint-disable-next-line @typescript-eslint/ban-ts-comment -- TODO(FEINF-932)
    // @ts-ignore ts-migrate(2345) FIXME: Argument of type 'Partial<RpcHandlers>[Id]' is not... Remove this comment to see the full error message
    "Handler ".concat(id, " has already been registered by:\n ").concat((_traces$get = traces.get(existingHandler)) !== null && _traces$get !== void 0 ? _traces$get : 'missing stack trace'));
  }

  const wrappedHandler = wrapHandler(handler);
  handlers[id] = wrappedHandler; // capture the current stack trace to be able to report conflicts better

  traces.set(wrappedHandler, new Error().stack);
  return () => {
    if (handlers[id] === wrappedHandler) {
      delete handlers[id];
    }
  };
}

async function makeCall(id, request) {
  const handlers = getHandlers();
  const handler = handlers[id];

  if (handler === undefined) {
    throw new Error("There is no RPC handler for ".concat(id, "."));
  } // @ts-expect-error For some reason, TypeScript doesn't narrow down the types to the particular types
  // associated with the given `Id` type (the handler Id) and instead the type of `handler` is the widest
  // possible type from all handlers, i.e. it represents all handlers at the same time instead of a particular
  // handler


  return handler(request);
}

function hasHandlerFor(id) {
  const handlers = getHandlers();
  return handlers[id] !== undefined;
}

function sanitizeRequest(request) {
  return sanitizeValue(request);
}

function sanitizeResponse(response) {
  return sanitizeValue(response);
}

function wrapHandler(handler) {
  return async request => {
    const safeRequest = sanitizeRequest(request);
    const response = await handler(safeRequest);
    return sanitizeResponse(response);
  };
}

function initRpc() {
  /**
   * Allow the handlers structure to be initialized only once upon loading the RPC module.
   * This aims to minimize the possibility of using a client from one instance and a handler from
   * another instance.
   */
  if (typeof window.__databricks_mfe_rpc !== 'undefined') {
    // using Reflect.get here to make typescript happy, because the "official type" does not have the special symbol
    // property holding the creation stack
    throw new Error("RPC has already been initialized in the current window. To minimize the opportunities for incompatible changes, only one RPC host can be initialized inside a global context");
  }

  const api = Object.freeze({
    registerHandler,
    makeCall,
    hasHandlerFor,
    [handlersProp]: {}
  });
  Object.defineProperty(window, '__databricks_mfe_rpc', {
    configurable: false,
    writable: false,
    value: api
  });
}

/*
 * Detects whether RPC library is supported and active.
 */
function isRpcSupported() {
  return window.__databricks_mfe_rpc !== undefined;
}
function defineRpc(id) {
  function useRegister(handler) {
    useEffect(() => {
      const cleanup = register(handler);
      return cleanup;
    }, [handler]);
  }

  function register(handler) {
    return window.__databricks_mfe_rpc.registerHandler(id, handler);
  }

  function call(req) {
    const result = window.__databricks_mfe_rpc.makeCall(id, req);

    return result;
  }

  function isAvailable() {
    return isRpcSupported() && window.__databricks_mfe_rpc.hasHandlerFor(id);
  }

  return {
    isAvailable,
    call,
    register,
    useRegister
  };
}

const MFERootIdSuffix = '-mfe-root';
const MFEReactRootIdSuffix = '-mfe-react-root'; // We currently only support one instance of the portal container.

const MFEReactPortalsContainerId = 'mfe-react-portals';
const MFENotificationsPortalIdSuffix = '-mfe-notifications-portal-fallback';
function generateMFEHtml(prefix) {
  const mfeRootId = prefix + MFERootIdSuffix;
  const mfeReactRootId = prefix + MFEReactRootIdSuffix;
  const mfeNotificationsPortalId = prefix + MFENotificationsPortalIdSuffix;
  const mfeShadowRootHtml = "\n  <div id=\"".concat(mfeRootId, "\" class=\"mfe-root\">\n    <div id=\"").concat(MFEReactPortalsContainerId, "\"></div>\n    <div id=\"").concat(mfeReactRootId, "\"></div>\n    <div id=\"").concat(mfeNotificationsPortalId, "\"></div>\n  </div>\n  ").trim();
  return {
    mfeRootId,
    mfeReactRootId,
    mfeNotificationsPortalId,
    mfeShadowRootHtml
  };
}

let mfeId;
function setMFE(id) {
  mfeId = id;
}
function isMFE() {
  return !!mfeId;
}

function createWebComponent(mfe) {
  var _class;

  return _class = class MFEWebComponent extends HTMLElement {
    constructor() {
      super();

      _defineProperty(this, "reactMountPoint", null);

      this._shadowRoot = this.attachShadow({
        mode: 'open'
      });
    }

    connectedCallback() {
      const {
        mfeShadowRootHtml,
        mfeReactRootId
      } = generateMFEHtml(mfe.name);
      this._shadowRoot.innerHTML = mfeShadowRootHtml.trim();
      this.reactMountPoint = this._shadowRoot.getElementById(mfeReactRootId);
      MFEWebComponent.connectedInstances.add(this);
      this.attachStyles();
      const reactRoot = mfe.reactRoot(this._shadowRoot);
      ReactDOM.render(reactRoot, this.reactMountPoint);
    }

    disconnectedCallback() {
      MFEWebComponent.connectedInstances.delete(this);

      if (this.reactMountPoint) {
        try {
          ReactDOM.unmountComponentAtNode(this.reactMountPoint);
        } catch (ex) {// TODO enable once we have logError in web-shared
          //logError('An error was thrown while trying to unmount existing React node.', ex as Error);
        }
      }
    }
    /**
     * Called by Webpack CSS Loader when an MFE module import() css. Applies
     * CSS to the correct shadow root component.
     */


    static webpackInjectStyle(elem) {
      // Notify mounted components.
      MFEWebComponent.connectedInstances.forEach(wc => wc.attachStyle(elem)); // Import it for future component.

      if (!MFEWebComponent.previouslyInjectedStyleElements.includes(elem)) {
        MFEWebComponent.previouslyInjectedStyleElements.push(elem);
      }
    }

    attachStyles() {
      var _mfe$injectStyleURLs;

      const stylesFragment = document.createDocumentFragment();
      stylesFragment.append(...MFEWebComponent.previouslyInjectedStyleElements, ...((_mfe$injectStyleURLs = mfe.injectStyleURLs) !== null && _mfe$injectStyleURLs !== void 0 ? _mfe$injectStyleURLs : []).map(injectStyleURL => {
        const link = document.createElement('link');
        link.type = 'text/css';
        link.rel = 'stylesheet';
        link.href = injectStyleURL;
        return link;
      }));

      this._shadowRoot.appendChild(stylesFragment);
    }

    attachStyle(styleTag) {
      this._shadowRoot.appendChild(styleTag);
    }

  }, _defineProperty(_class, "connectedInstances", new Set()), _defineProperty(_class, "previouslyInjectedStyleElements", []), _class;
}

function registerMFE(mfe) {
  setMFE(mfe.name);
  mfe.init();
  customElements.define("databricks-".concat(mfe.name), createWebComponent(mfe));
}

const NavigateToRpcHandlerId = 'Router::NavigateTo';
const navigateToRpc = defineRpc(NavigateToRpcHandlerId);
const urlChangedEvent = defineEvent('Router::urlchanged');

function assertUnreachable(message) {
  throw new Error(message);
}

const SessionPolicyEventType = 'databricks:sessionevent';

/**
 * Note this function returns `false` if `event.preventDefault()` has been called,
 * `true` otherwise.
 */
function firePolicyEvent(data) {
  const event = new CustomEvent(SessionPolicyEventType, {
    detail: data,
    cancelable: true
  });
  return window.dispatchEvent(event);
}
/**
 * Notify the CSRF token has expired and it has to be refreshed.
 *
 * Returns `false` if the event has been handled, `true` if the
 * fallback logic should be executed.
 */


function notifyCsrfHasExpired() {
  return firePolicyEvent({
    type: 'csrfexpired'
  });
}
/**
 * Notify the session has expired and the user will need to login again.
 *
 * Returns `false` if the event has been handled, `true` if the
 * fallback logic should be executed.
 */

function notifySessionHasExpired() {
  return firePolicyEvent({
    type: 'sessionexpired'
  });
}
/**
 * Notify the user has logged in.
 *
 * Returns `false` if the event has been handled, `true` if the
 * fallback logic should be executed.
 */

function notifyUserHasLoggedIn() {
  const runDefaultBehavior = firePolicyEvent({
    type: 'loggedin'
  });

  try {
    // This signals other tabs that a login has occurred, so they should refresh
    // If localStorage isn't available this feature does not work.
    localStorage.setItem('login', new Date().toString());
  } catch (e) {// ignore errors as this is best effort
  }

  return runDefaultBehavior;
}
/**
 * Notify the user has logged out.
 *
 * Returns `false` if the event has been handled, `true` if the
 * fallback logic should be executed.
 */

function notifyUserHasLoggedOut(redirectUrl) {
  const runDefaultBehavior = firePolicyEvent({
    type: 'loggedout',
    redirectUrl
  });

  try {
    // This signals other tabs that a logout has occurred, so they should redirect to login screen
    // If localStorage isn't available this feature does not work.
    localStorage.setItem('logout', new Date().toString());
  } catch (e) {// ignore errors as this is best effort
  }

  return runDefaultBehavior;
}
/**
 * Defines how to respond to various session-related events like
 * the CSRF or session expiring, the user logging in or out, etc.
 *
 * The policy is free to take the necessary steps in response to any of the
 * events.
 */

/**
 * Sets the session policy, which defines the behavior of the application for various
 * session-related events.
 *
 * Ideally, only a single session policy should be active at a time in order to make sure
 * they don't conflict between each other, but in order to allow for a smooth hand-over,
 * the implementation will allow multiple to co-exist temporary.
 */
function useSessionPolicy(policy) {
  useEffect(() => setupSessionPolicy(policy), [policy]);
}
function setupSessionPolicy(policy) {
  const customEventListener = policyListener(policy);
  const storageEventListener = storageListener(policy);
  window.addEventListener(SessionPolicyEventType, customEventListener);
  window.addEventListener('storage', storageEventListener);
  return () => {
    window.removeEventListener(SessionPolicyEventType, customEventListener);
    window.removeEventListener('storage', storageEventListener);
  };
}

function isPolicyEvent(ev) {
  return ev.type === SessionPolicyEventType;
}

function policyListener(policy) {
  return ev => {
    invariant(isPolicyEvent(ev), "Expected session policy event to be received, but got ".concat(ev.type));

    switch (ev.detail.type) {
      case 'csrfexpired':
        ev.preventDefault();
        policy.handleCsrfHasExpired();
        return;

      case 'sessionexpired':
        ev.preventDefault();
        policy.handleSessionHasExpired();
        return;

      case 'loggedin':
        ev.preventDefault();
        policy.handleUserHasLoggedIn({
          currentTab: true
        });
        return;

      case 'loggedout':
        ev.preventDefault();
        policy.handleUserHasLoggedOut({
          currentTab: true,
          redirectUrl: ev.detail.redirectUrl
        });
        return;

      default:
        assertUnreachable("Invalid policy event type: ".concat(ev.detail));
    }
  };
}

function storageListener(policy) {
  return ev => {
    switch (ev.key) {
      case 'login':
        policy.handleUserHasLoggedIn({
          currentTab: false
        });
        return;

      case 'logout':
        policy.handleUserHasLoggedOut({
          currentTab: false
        });
        return;

      default:
        // ignore
        return;
    }
  };
}

const GetConfigSessionRpcHandlerId = 'Session::GetSessionConfig'; // Defined in UserWorkspacesGetter.scala

const GetSessionConfigRpc = defineRpc(GetConfigSessionRpcHandlerId);

/**
 * Simulates a "user-has-logged-in" session policy event, which happened in a different tab.
 */
function triggerUserHasLoggedOutInAnotherTab() {
  window.dispatchEvent(new StorageEvent('storage', {
    key: 'logout'
  }));
}
/**
 * Simulates a "user-has-logged-in" session policy event, which happened in a different tab.
 */

function triggerUserHasLoggedInInAnotherTab() {
  window.dispatchEvent(new StorageEvent('storage', {
    key: 'login'
  }));
}

export { GetSessionConfigRpc, MFEReactPortalsContainerId, commitHash, defineRpc, generateMFEHtml, initRpc, isMFE, isRpcSupported, navigateToRpc, notifyCsrfHasExpired, notifySessionHasExpired, notifyUserHasLoggedIn, notifyUserHasLoggedOut, registerMFE, setMFE, setupSessionPolicy, triggerUserHasLoggedInInAnotherTab, triggerUserHasLoggedOutInAnotherTab, urlChangedEvent, useSessionPolicy };
//# sourceMappingURL=mfe-services.js.map
