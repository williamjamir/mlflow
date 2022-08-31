import React from 'react';
import { VegaLite } from 'react-vega';
import { PropTypes } from 'prop-types';

export function TopValues({
  data,
  width = 'container',
  height = undefined,
  includeLegend = false,
  includeTooltips = true,
  colorRange = ['#157CBC', '#FFAB00', '#99DDB4', '#BF7080'],
}) {
  const spec = {
    background: 'transparent',
    view: { stroke: 'transparent' },
    layer: [
      { mark: 'bar' },
      {
        mark: { type: 'text', align: 'left', baseline: 'middle', dx: 3 },
        encoding: { text: { field: 'count', type: 'quantitative' } },
      },
    ],
    encoding: {
      x: { type: 'quantitative', field: 'count', axis: null },
      y: {
        field: 'item',
        sort: {
          field: 'count',
          op: 'sum',
          order: 'descending',
        },
        axis: { title: null },
      },
      yOffset: { field: 'group' },
      ...(includeTooltips && {
        tooltip: [{ field: 'item' }, { field: 'group' }, { field: 'count', type: 'nominal' }],
      }),
      color: {
        field: 'group',
        scale: { range: colorRange },
        ...(!includeLegend && { legend: null }),
      },
    },
    data: { values: data },
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

TopValues.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      item: PropTypes.string.isRequired,
      count: PropTypes.number.isRequired,
      group: PropTypes.string,
    }),
  ).isRequired,
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  height: PropTypes.number,
  includeLegend: PropTypes.bool,
  includeTooltips: PropTypes.bool,
  colorRange: PropTypes.arrayOf(PropTypes.string),
};
