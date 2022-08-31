export { u as useStable, a as useStableUID } from './useStableUID-922bf618.js';
import React from 'react';

/**
 * Returns whether the focus is currently within one of the elements in elementRefs.
 * @param elementRefs Element or list of elements to check the focus on
 * @param opts Options object
 */

function useIsFocusWithin(elementRefs) {
  const [isFocusWithin, setIsFocusWithin] = React.useState(false);
  const els = Array.isArray(elementRefs) ? elementRefs : [elementRefs];
  React.useEffect(() => {
    const onFocus = e => {
      const target = e.target;
      let hasFocus = false;

      for (const el of els) {
        var _el$current;

        if ((_el$current = el.current) !== null && _el$current !== void 0 && _el$current.contains(target)) {
          hasFocus = true;
          break;
        }
      }

      setIsFocusWithin(hasFocus);
    };

    document.addEventListener('focusin', onFocus);
    return () => {
      document.removeEventListener('focusin', onFocus);
    }; // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [els.length]);
  return isFocusWithin;
}

export { useIsFocusWithin };
//# sourceMappingURL=hooks.js.map
