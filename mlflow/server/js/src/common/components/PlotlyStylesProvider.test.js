import { mount } from 'enzyme';
import React from 'react';
import Plot from 'react-plotly.js';
import { PlotlyStylesProvider } from './PlotlyStylesProvider';

describe('PlotlyStylesProvider', () => {
  let customWrapper;

  // Let's define a custom web component that renders the style provider
  // via mount() inside the shadow DOM
  window.customElements.define(
    'databricks-mlflow',
    class extends HTMLElement {
      constructor() {
        super();
        this._shadowRoot = this.attachShadow({ mode: 'open' });
      }
      connectedCallback() {
        const instanceCount = parseInt(this.getAttribute('instanceCount'), 10) || 1;
        const elementJsx = new Array(instanceCount)
          .fill()
          .map((_, i) => <PlotlyStylesProvider key={i} />);
        customWrapper = mount(<div>{elementJsx}</div>, { attachTo: this._shadowRoot });
      }
    },
  );

  // Prevent flooding console with react-plotly.js-originating warnings
  beforeEach(() => {
    jest.spyOn(console, 'warn').mockReturnValue();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // Somehow generatedPlotlyStylesRules is also being run through a formatter that changes
  // some values like `'` into `\"` and `#000` into `black` etc.
  test('Confirm if injected plotly CSS styles are the same as resulting from the plotly library', () => {
    // Step #1: we're going to render <PlotlyStylesProvider /> inside the shadow DOM
    const customElement = window.document.createElement('databricks-mlflow');
    window.document.body.appendChild(customElement);

    // Step #2: we're finding the generated style element INSIDE the shadow root
    const generatedPlotlyStyles = customElement.shadowRoot.querySelector(
      'style.plotly-snapshot-base-css',
    );

    // We can't use element.sheet due to jsdom limitations so we just
    // fall back to inner HTML
    // See: https://github.com/jsdom/jsdom/issues/3179
    const generatedPlotlyStylesRules = generatedPlotlyStyles.innerHTML;

    // Step #3: we're mounting very real <Plot> that provides itself with its own styles
    mount(<Plot data={[]} layout={{}} />);

    // Step #4: we're looking for plotly's own styles and convert them to string
    // (those styles don't include text nodes so we have to do it this way)
    const originalPlotlyStyle = document.head.querySelector("style[id='plotly.js-style-global']");
    const originalPlotlyStyleRules = [...originalPlotlyStyle.sheet.cssRules]
      .map(({ cssText }) => cssText)
      .join(' ');

    // Step #5: we're comparing out hardcoded/generated styles to plotly's CSS
    expect(generatedPlotlyStylesRules).toEqual(originalPlotlyStyleRules);
  });

  test("Make sure that there's only one stylesheet injected that is being retained", () => {
    // Step #1: Render three instances of <PlotlyStylesProvider />
    const customElement = window.document.createElement('databricks-mlflow');
    customElement.setAttribute('instanceCount', 3);
    window.document.body.appendChild(customElement);

    const getStyles = () =>
      customElement.shadowRoot.querySelectorAll('style.plotly-snapshot-base-css');

    // Step #2: Expect only one stylesheet to be present
    expect(getStyles().length).toBe(1);

    // Step #3: Unmount it and expect that the single stylesheet is still there
    customWrapper.unmount();
    expect(getStyles().length).toBe(1);
  });

  test('Make sure that the component works only in shadow DOM environment', () => {
    mount(
      <>
        <PlotlyStylesProvider />
        <Plot data={[]} layout={{}} />
      </>,
    );

    expect(document.querySelectorAll("style[id='plotly.js-style-global']").length).toBe(1);
    expect(document.querySelectorAll('style.plotly-snapshot-base-css').length).toBe(0);
  });
});
