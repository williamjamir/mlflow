import { useStableUID } from '@databricks/web-shared-bundle/hooks';
import React, { useEffect, useRef } from 'react';
import { PlotlyCss } from '../styles/vendorStyles';

/**
 * This component solves problems with Plotly styling inside MFE by copying
 * hardcoded snapshot CSS to the shadow DOM root.
 *
 * Explanation: Plotly have pretty outdated approach to attaching CSS - it forcibly attaches
 * its generated styles to the document.head which ends up in CSS being isolated from the component
 * that renders the plot due to obvious shadow DOM specifics. The first solution was to hook up to
 * plot initialization event, copy all generated plotly styles residing in the document.head
 * and rewrite them inside the shadow root - which turned out to be unstable (and pretty hacky).
 *
 * After consulting with JAWS team (which had the same exact issue) it turned out that
 * injecting snapshotted version of plotly CSS solves the problem. We have a jest test that
 * ensures that the CSS won't drift away on the version update.
 */
export const PlotlyStylesProvider = () => {
  const elementRef = useRef(null);
  const uid = useStableUID();

  useEffect(() => {
    let injectedStyleElement = null;
    if (elementRef.current) {
      // Let's find the root node
      const rootNode = elementRef.current.getRootNode();

      // Root node being not equal to the document indicates
      // that we're inside the shadow DOM
      if (rootNode !== document && !rootNode.querySelector('.plotly-snapshot-base-css')) {
        injectedStyleElement = document.createElement('style');
        injectedStyleElement.id = `plotly-snapshot-base-css-${uid}`;
        injectedStyleElement.className = `plotly-snapshot-base-css`;
        injectedStyleElement.appendChild(document.createTextNode(PlotlyCss));
        rootNode.appendChild(injectedStyleElement);
      }
    }
  }, [uid]);

  // We need to have any element that will render itself in the DOM tree
  // so we can check if it's inside the shadow root
  return <span ref={elementRef} />;
};

export default PlotlyStylesProvider;
