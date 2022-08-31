import React from 'react';

import { TopValuesList as Component } from './TopValuesList';

export default {
  title: 'Data Profiles/Categorical feature',
  component: Component,
  argTypes: {},
};

const Template = (args) => <Component {...args} />;

export const TopValuesList = Template.bind({});
TopValuesList.args = {
  limit: 3,
  list: [
    {
      item: 'Private',
      count: 699.0,
    },
    {
      item: 'Self-emp-not-inc',
      count: 81.0,
    },
    {
      item: 'Local-gov',
      count: 68.0,
    },
    {
      item: '?',
      count: 62.0,
    },
    {
      item: 'State-gov',
      count: 36.0,
    },
    {
      item: 'Self-emp-inc',
      count: 33.0,
    },
    {
      item: 'Federal-gov',
      count: 21.0,
    },
  ],
};
