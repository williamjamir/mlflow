import React from 'react';
import {
  mockFeatures,
  mockJobConsumer,
  mockModelVersionsByFeature,
  mockNotebookConsumer,
} from '../utils/test-utils';
import { mountWithIntl } from '../../common/utils/TestUtils';
import { BrowserRouter } from 'react-router-dom';
import ExpandableList from '../../common/components/ExpandableList';
import { FeatureTableFeatures } from './FeatureTableFeatures';
import DatabricksUtils from '../../common/utils/DatabricksUtils';

const getLinksFromExpandableList = (element) =>
  element
    .find(ExpandableList)
    .first()
    .props()
    .children.map((html) => mountWithIntl(html).find('a').first());

const getDefaultFeaturesViewProps = (overrides = {}) => ({
  features: [],
  notebookConsumers: [],
  jobConsumers: [],
  modelVersionsByFeature: {},
  ...overrides,
});

describe('FeatureTableFeatures', () => {
  it('renders with minimal props without exploding', () => {
    const wrapper = mountWithIntl(
      <BrowserRouter>
        <FeatureTableFeatures {...getDefaultFeaturesViewProps()} />
      </BrowserRouter>,
    );
    expect(wrapper.length).toBe(1);
  });

  it('have n rows in features table', () => {
    const wrapper = mountWithIntl(
      <BrowserRouter>
        <FeatureTableFeatures
          {...getDefaultFeaturesViewProps({
            features: mockFeatures(),
          })}
        />
      </BrowserRouter>,
    );

    const names = wrapper.find('[data-test-id="feature-link"]').map((r) => r.text());
    expect(names).toEqual(['count_items_14d', 'count_items_7d', 'total_purchase_value_14d']);

    const types = wrapper.find('[data-test-id="feature-type"]').map((r) => r.text());
    expect(types).toEqual(['INTEGER', 'INTEGER', 'FLOAT']);

    const models = wrapper.find('[data-test-id="feature-models"]').map((r) => r.text().trim());
    expect(models).toEqual(['-', '-', '-']);

    const endpoints = wrapper
      .find('[data-test-id="feature-endpoints"]')
      .map((r) => r.text().trim());
    expect(endpoints).toEqual(['-', '-', '-']);

    const notebooks = wrapper
      .find('[data-test-id="feature-notebooks"]')
      .map((r) => r.text().trim());
    expect(notebooks).toEqual(['-', '-', '-']);

    const jobs = wrapper.find('[data-test-id="feature-jobs"]').map((r) => r.text().trim());
    expect(jobs).toEqual(['-', '-', '-']);
  });

  it('link from feature name to feature page', () => {
    const wrapper = mountWithIntl(
      <BrowserRouter>
        <FeatureTableFeatures
          {...getDefaultFeaturesViewProps({
            features: mockFeatures(),
          })}
        />
      </BrowserRouter>,
    );

    const names = wrapper.find('[data-test-id="feature-link"]').map((r) => r.text());
    expect(names).toEqual(['count_items_14d', 'count_items_7d', 'total_purchase_value_14d']);

    const featureLinks = wrapper
      .find('[data-test-id="feature-link"]')
      .map((r) => (r.find('a').length > 0 ? r.find('a').prop('href') : ''));
    expect(featureLinks).toEqual([
      '/feature-store/prod.user_activity_features/features/count_items_14d',
      '/feature-store/prod.user_activity_features/features/count_items_7d',
      '/feature-store/prod.user_activity_features/features/total_purchase_value_14d',
    ]);
  });

  it('have n rows in features table with correct model names and endpoints', () => {
    const wrapper = mountWithIntl(
      <BrowserRouter>
        <FeatureTableFeatures
          {...getDefaultFeaturesViewProps({
            features: mockFeatures(),
            modelVersionsByFeature: mockModelVersionsByFeature(),
          })}
        />
      </BrowserRouter>,
    );

    const names = wrapper.find('[data-test-id="feature-link"]').map((r) => r.text());
    expect(names).toEqual(['count_items_14d', 'count_items_7d', 'total_purchase_value_14d']);

    const models = wrapper.find('[data-test-id="feature-models"]').map((r) => r.text().trim());
    expect(models).toEqual(['modelA/1+1 more', 'modelA/1+1 more', 'modelA/2+1 more']);

    const endpoints = wrapper
      .find('[data-test-id="feature-endpoints"]')
      .map((r) => r.text().trim());
    expect(endpoints).toEqual(['-', '-', 'modelA/2']);

    const types = wrapper.find('[data-test-id="feature-type"]').map((r) => r.text());
    expect(types).toEqual(['INTEGER', 'INTEGER', 'FLOAT']);
  });

  it('have n rows in features table with correct notebook names', () => {
    const wrapper = mountWithIntl(
      <BrowserRouter>
        <FeatureTableFeatures
          {...getDefaultFeaturesViewProps({
            features: mockFeatures(),
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

    const names = wrapper.find('[data-test-id="feature-link"]').map((r) => r.text());
    expect(names).toEqual(['count_items_14d', 'count_items_7d', 'total_purchase_value_14d']);

    const notebookCells = wrapper.find('[data-test-id="feature-notebooks"]');
    expect(notebookCells.length).toEqual(3);

    expect(notebookCells.at(0).text()).toEqual('-');

    const feature2Notebooks = getLinksFromExpandableList(notebookCells.at(1));
    expect(feature2Notebooks.length).toEqual(2);
    const [feature2Notebook1, feature2Notebook2] = feature2Notebooks;
    expect(feature2Notebook1.text()).toEqual('notebook 2');
    expect(feature2Notebook1.props().href).toContain('#notebook/456/revision/2222');
    expect(feature2Notebook2.text()).toEqual('notebook 4');
    expect(feature2Notebook2.props().href).toContain('#notebook/999/revision/4444');

    const feature3Notebooks = getLinksFromExpandableList(notebookCells.at(2));
    expect(feature3Notebooks.length).toEqual(2);
    const [feature3Notebook1, feature3Notebook2] = feature3Notebooks;
    expect(feature3Notebook1.props().href).toContain('#notebook/789/revision/3333');
    expect(feature3Notebook1.text()).toEqual('notebook 3');
    expect(feature3Notebook2.props().href).toContain('#notebook/999/revision/4444');
    expect(feature3Notebook2.text()).toEqual('notebook 4');
  });

  it('have n rows in features table with correct job names', () => {
    const wrapper = mountWithIntl(
      <BrowserRouter>
        <FeatureTableFeatures
          {...getDefaultFeaturesViewProps({
            features: mockFeatures(),
            jobConsumers: [
              mockJobConsumer(456, 2222, ['count_items_7d'], 'job 2'),
              mockJobConsumer(789, 3333, ['total_purchase_value_14d'], 'job 3'),
              mockJobConsumer(999, 4444, ['count_items_7d', 'total_purchase_value_14d'], 'job 4'),
            ],
          })}
        />
      </BrowserRouter>,
    );

    const names = wrapper.find('[data-test-id="feature-link"]').map((r) => r.text());
    expect(names).toEqual(['count_items_14d', 'count_items_7d', 'total_purchase_value_14d']);

    const jobCells = wrapper.find('[data-test-id="feature-jobs"]');
    expect(jobCells.length).toEqual(3);

    expect(jobCells.at(0).text()).toEqual('-');

    const feature2Jobs = getLinksFromExpandableList(jobCells.at(1));
    expect(feature2Jobs.length).toEqual(2);
    const [feature2Job1, feature2Job2] = feature2Jobs;
    expect(feature2Job1.text()).toEqual('job 2');
    expect(feature2Job1.props().href).toContain('#job/456/run/2222');
    expect(feature2Job2.text()).toEqual('job 4');
    expect(feature2Job2.props().href).toContain('#job/999/run/4444');

    const feature3Jobs = getLinksFromExpandableList(jobCells.at(2));
    expect(feature3Jobs.length).toEqual(2);
    const [feature3Job1, feature3Job2] = feature3Jobs;
    expect(feature3Job1.props().href).toContain('#job/789/run/3333');
    expect(feature3Job1.text()).toEqual('job 3');
    expect(feature3Job2.props().href).toContain('#job/999/run/4444');
    expect(feature3Job2.text()).toEqual('job 4');
  });

  it('consumers from other workspaces are rendered correctly', () => {
    const workspaceId1 = '6666666';
    const workspaceId2 = '1234567';
    const workspaceId3 = '9876543';
    DatabricksUtils.getCurrentWorkspaceId = jest.fn().mockReturnValue(workspaceId1);

    const wrapper = mountWithIntl(
      <BrowserRouter>
        <FeatureTableFeatures
          {...getDefaultFeaturesViewProps({
            features: mockFeatures(),
            notebookConsumers: [
              // from a different workspace
              mockNotebookConsumer(
                456,
                2222,
                ['count_items_7d'],
                undefined,
                workspaceId2,
                undefined,
              ),
              mockNotebookConsumer(
                789,
                3333,
                ['total_purchase_value_14d'],
                'notebook 3',
                workspaceId1,
                undefined,
              ),
            ],
            jobConsumers: [
              mockJobConsumer(456, 2222, ['count_items_7d'], 'job 2', workspaceId1, undefined),
              // from a different workspace
              mockJobConsumer(
                789,
                3333,
                ['total_purchase_value_14d'],
                undefined,
                workspaceId3,
                'https://databricks',
              ),
            ],
          })}
        />
      </BrowserRouter>,
    );

    const names = wrapper.find('[data-test-id="feature-link"]').map((r) => r.text());
    expect(names).toEqual(['count_items_14d', 'count_items_7d', 'total_purchase_value_14d']);
    const notebookCells = wrapper.find('[data-test-id="feature-notebooks"]');
    expect(notebookCells.length).toEqual(3);
    expect(notebookCells.at(0).text()).toEqual('-');
    const jobCells = wrapper.find('[data-test-id="feature-jobs"]');
    expect(jobCells.length).toEqual(3);
    expect(jobCells.at(0).text()).toEqual('-');

    const feature1Job = getLinksFromExpandableList(jobCells.at(1))[0];
    const feature1Notebook = getLinksFromExpandableList(notebookCells.at(1))[0];
    const feature2Job = getLinksFromExpandableList(jobCells.at(2))[0];
    const feature2Notebook = getLinksFromExpandableList(notebookCells.at(2))[0];
    expect(feature1Job.text()).toEqual('job 2');
    expect(feature1Job.props().href).toContain(`?o=${workspaceId1}#job/456/run/2222`);
    expect(feature1Notebook.text()).toEqual(
      `workspace ${workspaceId2}: revision 2222 of notebook 456`,
    );
    // link to the other workspace
    expect(feature1Notebook.props().href).toContain(
      `?o=${workspaceId2}#notebook/456/revision/2222`,
    );
    expect(feature2Job.text()).toEqual(`workspace ${workspaceId3}: run 3333 of job 789`);
    expect(feature2Job.props().href).toContain(
      `https://databricks/?o=${workspaceId3}#job/789/run/3333`,
    );
    expect(feature2Notebook.text()).toEqual('notebook 3');
    expect(feature2Notebook.props().href).toContain(
      `?o=${workspaceId1}#notebook/789/revision/3333`,
    );
  });
});
