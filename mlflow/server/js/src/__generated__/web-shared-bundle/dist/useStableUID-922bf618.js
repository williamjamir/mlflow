import { useRef } from 'react';

const NOT_INITIALIZED = Symbol('NOT_INITIALIZED');
/**
 * Use to keep a stable value on the first mount of a component
 * that cannot change.
 */

function useStable(valueCallback) {
  const ref = useRef(NOT_INITIALIZED);

  if (ref.current === NOT_INITIALIZED) {
    const val = valueCallback();
    ref.current = val;
    return val;
  }

  return ref.current;
}

let sequentialID = 1;
/**
 * Give the component a stable UID on mount that can be used to differentiate between
 * other components. One application is debugging or performance tracing.
 */

function useStableUID() {
  return useStable(() => sequentialID++);
}

export { useStableUID as a, useStable as u };
//# sourceMappingURL=useStableUID-922bf618.js.map
