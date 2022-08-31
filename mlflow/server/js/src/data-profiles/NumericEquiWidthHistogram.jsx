import React from 'react';
import { VegaLite } from 'react-vega';
import { PropTypes } from 'prop-types';
import { HistogramUtils } from './HistogramUtils';

export function NumericEquiWidthHistogram({
  quantilesData,
  numBuckets,
  width = 640,
  height = 400,
  includeTooltips = true,
  includeLegend = false,
  colorRange = ['#157CBC', '#FFAB00', '#99DDB4', '#BF7080'],
}) {
  // Flatten the input to a single histogram structure where each bucket also records the group.
  const hists = quantilesData.flatMap((qg) => {
    const { group, quantiles, totalFreq } = qg;

    const hist = HistogramUtils.computeEquiWidthHistogram(quantiles, totalFreq, numBuckets);
    return hist.map((b) => {
      return { ...b, group };
    });
  });

  // We will use global min and max to set the values on the x-axis
  const globalMin = Math.min.apply(
    null,
    hists.map((b) => b.left),
  );
  const globalMax = Math.max.apply(
    null,
    hists.map((b) => b.right),
  );

  // Set chart parameters depending on whether we visualize a single vs multiple histograms
  let values;
  let labelExpr;
  let mark;
  let tooltip;
  let color;

  if (quantilesData.length === 1) {
    const { quantiles } = quantilesData[0];
    const midPoint = Math.floor(quantiles.length / 2);
    let median;
    if (quantiles.length % 2 === 1) {
      median = quantiles[midPoint];
    } else {
      median = (quantiles[midPoint] + quantiles[midPoint + 1]) / 2;
    }
    values = [globalMin, median, globalMax];
    labelExpr =
      `if(datum.value == ${median}, format(datum.value,"~s")+" (median)", ` +
      `format(datum.value, "~s"))`;
    mark = 'bar';
    tooltip = [{ field: 'left' }, { field: 'right' }, { field: 'freq' }];
  } else {
    values = [globalMin, globalMax];
    labelExpr = 'format(datum.value, "~s")';
    mark = 'line';
    tooltip = [{ field: 'left' }, { field: 'right' }, { field: 'freq' }, { field: 'group' }];
    color = {
      field: 'group',
      type: 'nominal',
      scale: { range: colorRange },
      ...(!includeLegend && { legend: null }),
    };
  }

  const spec = {
    mark,
    encoding: {
      x: {
        title: null,
        field: 'left',
        bin: { binned: true },
        axis: {
          ticks: false,
          grid: false,
          values,
          labelExpr,
        },
      },
      x2: {
        field: 'right',
      },
      y: {
        title: null,
        field: 'freq',
        type: 'quantitative',
        axis: null,
      },
      ...(includeTooltips && { tooltip }),
      color,
    },
    background: 'transparent',
    view: { stroke: 'transparent' },
    data: { values: hists },
    width,
    height,
  };
  return (
    <div
      css={{
        '&, & .vega-embed': {
          width: '100%',
          height: '100%',
        },
      }}
    >
      <VegaLite spec={spec} actions={false} />
    </div>
  );
}

NumericEquiWidthHistogram.propTypes = {
  quantilesData: PropTypes.arrayOf(
    PropTypes.shape({
      group: PropTypes.string.isRequired,
      quantiles: PropTypes.arrayOf(PropTypes.number),
      totalFreq: PropTypes.number.isRequired,
    }),
  ).isRequired,
  numBuckets: PropTypes.number.isRequired,
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  height: PropTypes.number,
  includeTooltips: PropTypes.bool,
  includeLegend: PropTypes.bool,
  colorRange: PropTypes.arrayOf(PropTypes.string),
};
