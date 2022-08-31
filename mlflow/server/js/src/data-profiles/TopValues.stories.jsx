import React from 'react';

import { TopValues } from './TopValues';

export default {
  title: 'Data Profiles/Categorical feature',
  component: TopValues,
  argTypes: {},
};

const Template = (args) => <TopValues {...args} />;

export const TopValuesVisualization = Template.bind({});
TopValuesVisualization.args = {
  width: 640,
  height: 400,
  includeLegend: false,
  includeTooltips: false,
  data: [
    { item: 'Self-emp-not-inc', count: 81, group: 'a' },
    { item: 'Self-emp-not-inc', count: 82, group: 'b' },
    { item: 'Self-emp-not-inc', count: 81, group: 'c' },
    { item: 'Private', count: 699, group: 'a' },
    { item: 'Private', count: 659, group: 'b' },
    { item: 'Private', count: 649, group: 'c' },
    { item: 'Local-gov', count: 62, group: 'a' },
    { item: 'Local-gov', count: 68, group: 'b' },
    { item: 'Local-gov', count: 78, group: 'c' },
    { item: '?', count: 62, group: 'a' },
    { item: '?', count: 62, group: 'b' },
    { item: '?', count: 61, group: 'c' },
    { item: 'State-gov', count: 32, group: 'a' },
    { item: 'State-gov', count: 36, group: 'b' },
    { item: 'State-gov', count: 36, group: 'c' },
    { item: 'Self-emp-inc', count: 33, group: 'a' },
    { item: 'Self-emp-inc', count: 33, group: 'b' },
    { item: 'Self-emp-inc', count: 33, group: 'c' },
    { item: 'Federal-gov', count: 21, group: 'b' },
    { item: 'Federal-gov', count: 72, group: 'a' },
    { item: 'Federal-gov', count: 21, group: 'c' },
  ],
};
