import React from 'react';

import { NumericEquiWidthHistogram } from './NumericEquiWidthHistogram';

export default {
  title: 'Data Profiles/Numerical feature',
  component: NumericEquiWidthHistogram,
  argTypes: {},
};

const Template = (args) => <NumericEquiWidthHistogram {...args} />;

export const VisualizationSingle = Template.bind({});
VisualizationSingle.args = {
  width: 640,
  height: 400,
  includeTooltips: false,
  includeLegend: false,
  quantilesData: [
    {
      group: 'A',
      quantiles: [10, 20, 30, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50],
      totalFreq: 100,
    },
  ],
  numBuckets: 10,
};

export const VisualizationMultiple = Template.bind({});
VisualizationMultiple.args = {
  width: 640,
  height: 400,
  includeTooltips: false,
  includeLegend: false,
  quantilesData: [
    {
      group: 'A',
      quantiles: [5, 8, 9, 10, 13, 20, 30, 41, 42, 43, 44, 45, 46, 48, 49, 50],
      totalFreq: 100,
    },
    {
      group: 'B',
      quantiles: [1, 2, 3, 4, 5, 6, 9, 10, 15, 20, 30, 40],
      totalFreq: 150,
    },
  ],
  numBuckets: 10,
};
