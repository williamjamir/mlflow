import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { FeatureConsumers } from './FeatureConsumers';
import { mountWithIntl } from '../../common/utils/TestUtils';
import ExpandableList from '../../common/components/ExpandableList';
import {
  mockJobConsumer,
  mockModelVersionsByFeature,
  mockNotebookConsumer,
} from '../utils/test-utils';

const getDefaultFeatureConsumersProps = (overrides = {}) => ({
  feature: {},
  notebookConsumers: [],
  jobConsumers: [],
  modelVersionsByFeature: {},
  ...overrides,
});

const getLinksFromExpandableList = (element) =>
  element
    .find(ExpandableList)
    .first()
    .props()
    .children.map((html) => mountWithIntl(html).find('a').first());

describe('FeatureConsumers', () => {
  it('renders with minimal props without exploding', () => {
    const wrapper = mountWithIntl(
      <BrowserRouter>
        <FeatureConsumers {...getDefaultFeatureConsumersProps()} />
      </BrowserRouter>,
    );
    expect(wrapper.length).toBe(1);
  });

  it('have n rows for feature consumers with correct job names', () => {
    const wrapper = mountWithIntl(
      <BrowserRouter>
        <FeatureConsumers
          {...getDefaultFeatureConsumersProps({
            feature: {
              table: 'prod.user_activity_features',
              name: 'count_items_7d',
              data_type: 'INTEGER',
              description: 'This is feature 1',
            },
            jobConsumers: [
              mockJobConsumer(456, 2222, ['count_items_7d'], 'job 2'),
              mockJobConsumer(789, 3333, ['total_purchase_value_14d'], 'job 3'),
              mockJobConsumer(999, 4444, ['count_items_7d', 'total_purchase_value_14d'], 'job 4'),
            ],
          })}
        />
      </BrowserRouter>,
    );

    const jobCells = wrapper.find('[data-test-id="feature-jobs"]');
    expect(jobCells.length).toEqual(1);

    const jobs = getLinksFromExpandableList(jobCells.at(0));
    expect(jobs.length).toEqual(2);
    const [job1, job2] = jobs;
    expect(job1.text()).toEqual('job 2');
    expect(job1.props().href).toContain('#job/456/run/2222');
    expect(job2.text()).toEqual('job 4');
    expect(job2.props().href).toContain('#job/999/run/4444');
  });

  it('have n rows for feature consumers with correct model names and endpoints', () => {
    let wrapper = mountWithIntl(
      <BrowserRouter>
        <FeatureConsumers
          {...getDefaultFeatureConsumersProps({
            feature: {
              table: 'prod.user_activity_features',
              name: 'count_items_7d',
              data_type: 'INTEGER',
              description: 'This is feature 1',
            },
            modelVersionsByFeature: mockModelVersionsByFeature(),
          })}
        />
      </BrowserRouter>,
    );

    let models = wrapper.find('[data-test-id="feature-models"]').map((r) => r.text().trim());
    expect(models).toEqual(['modelA/1modelB/1']);

    let endpoints = wrapper.find('[data-test-id="feature-endpoints"]').map((r) => r.text().trim());
    expect(endpoints).toEqual(['-']);

    wrapper = mountWithIntl(
      <BrowserRouter>
        <FeatureConsumers
          {...getDefaultFeatureConsumersProps({
            feature: {
              table: 'prod.user_activity_features',
              name: 'total_purchase_value_14d',
              data_type: 'FLOAT',
              description: 'This is feature 2',
            },
            modelVersionsByFeature: mockModelVersionsByFeature(),
          })}
        />
      </BrowserRouter>,
    );

    models = wrapper.find('[data-test-id="feature-models"]').map((r) => r.text().trim());
    expect(models).toEqual(['modelA/2modelB/1']);

    endpoints = wrapper.find('[data-test-id="feature-endpoints"]').map((r) => r.text().trim());
    expect(endpoints).toEqual(['modelA/2']);
  });

  it('have n rows for feature consumers with correct notebook names', () => {
    const wrapper = mountWithIntl(
      <BrowserRouter>
        <FeatureConsumers
          {...getDefaultFeatureConsumersProps({
            feature: {
              table: 'prod.user_activity_features',
              name: 'count_items_7d',
              data_type: 'INTEGER',
              description: 'This is feature 1',
            },
            notebookConsumers: [
              mockNotebookConsumer(456, 2222, ['count_items_7d'], 'notebook 2'),
              mockNotebookConsumer(789, 3333, ['total_purchase_value_14d'], 'notebook 3'),
              mockNotebookConsumer(
                999,
                4444,
                ['count_items_7d', 'total_purchase_value_14d'],
                'notebook 4',
              ),
            ],
          })}
        />
      </BrowserRouter>,
    );

    const notebookCells = wrapper.find('[data-test-id="feature-notebooks"]');
    expect(notebookCells.length).toEqual(1);

    const notebooks = getLinksFromExpandableList(notebookCells.at(0));
    expect(notebooks.length).toEqual(2);
    const [notebook1, notebook2] = notebooks;
    expect(notebook1.text()).toEqual('notebook 2');
    expect(notebook1.props().href).toContain('#notebook/456/revision/2222');
    expect(notebook2.text()).toEqual('notebook 4');
    expect(notebook2.props().href).toContain('#notebook/999/revision/4444');
  });
});
