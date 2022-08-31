import invariant from 'invariant';
import { useEffect } from 'react';
import _isPlainObject2 from 'lodash/isPlainObject';
import _isDate from 'lodash/isDate';

// eslint-disable-next-line @typescript-eslint/ban-types
function sanitizeFunction(fn) {
  const safeFunction = function () {
    const safeArgs = [];

    for (let i = 0; i < arguments.length; i++) {
      // eslint-disable-next-line prefer-rest-params
      safeArgs[i] = sanitizeValue(arguments[i]);
    }

    const result = fn(...safeArgs);
    return sanitizeValue(result);
  };

  Object.defineProperty(safeFunction, 'name', {
    value: "".concat(fn.name, "__sanitized"),
    writable: false
  });
  return safeFunction;
}

function isPlainObject(obj) {
  return _isPlainObject2(obj);
}

const allowedPrimitives = ['string', 'number', 'boolean', 'bigint'];

function isSafePrimitive(obj) {
  return allowedPrimitives.includes(typeof obj);
}

function isSafeArray(obj) {
  return Array.isArray(obj);
}
/**
 * Sanitizes an object according to the following rules:
 * - undefined, null, string, number, boolean, bigint and Date are returned as-is
 * - arrays are cloned and each element is sanitized
 * - plain objects (object literals or objects without prototype) are cloned and
 *   each enumerable string-named property is sanitized
 * - functions are wrapped with another function. Upon invocation, arguments are sanitized
 *   before the original function is called and the result is also sanitized before returning it
 *   to the caller
 *
 * - any other type of value will throw an error including:
 *   - symbols
 *   - promises
 *   - HTML elements
 * - circular structures cannot be sanitized and it will throw an error
 */


function sanitizeValue(obj) {
  let visited = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : new Set();

  if (obj === undefined || obj === null) {
    return obj;
  }

  if (isSafePrimitive(obj)) {
    return obj;
  }

  if (_isDate(obj)) {
    return obj;
  }

  if (visited.has(obj)) {
    throw new Error("Cannot sanitize circular structure");
  }

  visited.add(obj);

  try {
    if (isSafeArray(obj)) {
      return obj.map(el => sanitizeValue(el, visited));
    }

    if (typeof obj === 'function') {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment -- TODO(FEINF-932)
      // @ts-ignore ts-migrate(2345) FIXME: Argument of type 'T' is not assignable to paramete... Remove this comment to see the full error message
      return sanitizeFunction(obj);
    }

    if (isPlainObject(obj)) {
      const result = {};
      Object.keys(obj).forEach(key => {
        result[key] = sanitizeValue(obj[key], visited);
      });
      return result;
    }

    throw new Error("Unsupported value type encountered while sanitizing during RPC call");
  } finally {
    visited.delete(obj);
  }
}

/**
 * Do not change the implementation below as it must be the same between the producers and consumers.
 */

function generateEventName(type) {
  return "__databricks:".concat(type);
}
/**
 * This is a minimal interface to the event, which can be used to prevent default behavior.
 *
 * It is a strict subset of `CustomEvent` type and extension of this interface should be considered
 * carefully.
 */


function isMfeEvent(evt) {
  return evt instanceof CustomEvent && evt.type.startsWith('__databricks');
}
/**
 * Defines an event, which should be safe to be used across MFE boundaries.
 *
 * The reason why such events are considered safe is due to the sanitization of their data. More information can be found
 * in the `./sanitize` module.
 *
 * The implementation relies on CustomEvent, which allows several benefits:
 * - Ability to prevent default behavior (useful as a simple communication channel between the producer and consumers)
 * - Synchronous dispatch (it blocks the caller, which might not be always desirable)
 *
 * Note: Once a mapping between a given event name and its type has been defined, all future changes
 * must be backward compatible considering that producers and consumers are likely to be in different
 * deployables.
 *
 * @example
 * // mfe-router.ts
 * export type UrlChangedEventData = {
 *   pathname: string;
 *   query: Record<string, string>;
 *   hash?: string;
 * }
 *
 * export const urlChanged = defineEvent<UrlChangedEventData>('router:url-changed');
 *
 * // producer
 * import { urlChanged } from '.../mfe-router';
 *
 * browserHistory.listen(location => {
 *   const { pathname, query, hash } = location;
 *   urlChanged.dispatch({ pathname, query, hash });
 * });
 *
 * // consumer
 * import { urlChanged } from '.../mfe-router';
 *
 * function MfeComponent() {
 *   const handleUrlChanged = useCallback(({ pathname }) => {
 *     setCurrentPath(pathname);
 *   }, []);
 *
 *   urlChanged.useListener(handleUrlChanged);
 * }
 */


function defineEvent(name) {
  const customEventName = generateEventName(name);

  function useListener(listener) {
    useEffect(() => {
      const listenerAdapter = event => {
        invariant(isMfeEvent(event), 'Expected custom event to be delivered'); // there is no way to validate the data is in the correct shape here so we have to typecast

        const data = event.detail;
        listener(data, event);
      };

      window.addEventListener(customEventName, listenerAdapter);
      return () => {
        window.removeEventListener(customEventName, listenerAdapter);
      };
    }, [listener]);
  }

  function dispatch(data) {
    // @ts-expect-error data is not extending SafeValue for now as it is not easy to make SafeValue allow
    // any arbitrary function
    const safeData = sanitizeValue(data);
    const event = new CustomEvent(customEventName, {
      detail: safeData,
      bubbles: false,
      cancelable: true
    });
    return window.dispatchEvent(event);
  }

  return {
    dispatch,
    useListener
  };
}

export { defineEvent as d, sanitizeValue as s };
//# sourceMappingURL=events-2e8c7eb1.js.map
