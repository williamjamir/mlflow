import React from 'react';

import { CategoricalFeature } from './CategoricalFeature';
import { extractData } from './utils';

const rawGlobalData = {
  profile_name: 'Global',
  column_profiles: [
    {
      count: 999,
      column_name: 'workclass',
      data_type: 'STRING',
      num_nulls: 158,
      avg: null,
      quantiles: null,
      distinct_count: 7,
      min: null,
      max: null,
      stddev: null,
      num_zeros: null,
      num_nan: null,
      min_length: 1,
      max_length: 16,
      avg_length: 7.814,
      frequent_items: [
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
      custom_stats: null,
    },
  ],
  table_stats: { num_rows: 999 },
};

const rawTodayData = {
  profile_name: 'Today',
  column_profiles: [
    {
      count: 996,
      column_name: 'workclass',
      data_type: 'STRING',
      num_nulls: 12,
      avg: null,
      quantiles: null,
      distinct_count: 7,
      min: null,
      max: null,
      stddev: null,
      num_zeros: null,
      num_nan: null,
      min_length: 1,
      max_length: 16,
      avg_length: 7.814,
      frequent_items: [
        {
          item: 'Private',
          count: 689.0,
        },
        {
          item: 'Self-emp-not-inc',
          count: 85.0,
        },
        {
          item: 'Local-gov',
          count: 70.0,
        },
        {
          item: '?',
          count: 66.0,
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
      custom_stats: null,
    },
  ],
  table_stats: { num_rows: 999 },
};

const singleSourceData = extractData([rawGlobalData])['workclass'];
const multipleDataSources = extractData([rawGlobalData, rawTodayData])['workclass'];

export default {
  title: 'Data Profiles/Categorical feature',
  component: CategoricalFeature,
  argTypes: {
    viewType: { control: 'select', options: ['small', 'tall', 'wide'] },
  },
};

const Template = (args) => <CategoricalFeature {...args} />;

export const SingleDataSource = Template.bind({});
SingleDataSource.args = {
  viewType: 'small',
  data: singleSourceData,
};

export const MultipleDataSources = Template.bind({});
MultipleDataSources.args = {
  data: multipleDataSources,
  viewType: 'wide',
};
