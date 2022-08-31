import React from 'react';

import { mountWithIntl } from '../../../common/utils/TestUtils';
import { AutoMLExperimentPanelView } from './AutoMLExperimentPanelView';

const getDefaultAutoMLExperimentData = () => {
  return {
    startTimeSeconds: 100,
    timeoutMinutes: 20,
    explorationNotebookId: 'mock-notebook-id',
    state: undefined, // should be overridden
    dataset: 'mock-dataset',
    targetCol: 'mock-target-col',
    evaluationMetric: 'mock-evaluation-metric',
    errorMessage: 'mock-error-message',
    bestTrialNotebookId: 'mock-best-trial-notebook-id',
  };
};

const getAutoMLPageMock = (autoMLExperimentData = {}, autoMLWarnings = []) => {
  const mergedAutoMLExperimentData = {
    ...getDefaultAutoMLExperimentData(),
    ...autoMLExperimentData,
  };
  const cancelJobRun = jest.fn(() => Promise.resolve());
  return mountWithIntl(
    <AutoMLExperimentPanelView
      automlExperimentData={mergedAutoMLExperimentData}
      automlWarnings={autoMLWarnings}
      cancelJobRun={cancelJobRun}
      jobLink='mock-job-link'
    />,
  );
};

test('Should show warning if dataset is sampled by AutoML after data exploration', () => {
  for (const state of ['SUCCESS', 'FAILED', 'CANCELED']) {
    const wrapper = getAutoMLPageMock({
      state,
      sampleFraction: 0.4,
      explorationNotebookId: '123',
    });
    expect(wrapper.find('[data-test-id="sample-warning-badge"]').get(0)).not.toBe(undefined);
    expect(wrapper.find('[data-test-id="sample-warning-after-exploration"]').get(0)).not.toBe(
      undefined,
    );
  }
});

test('Should show warning if dataset is sampled by AutoML before data exploration', () => {
  for (const state of ['SUCCESS', 'FAILED', 'CANCELED']) {
    const wrapper = getAutoMLPageMock({
      state,
      sampleFraction: 0.4,
      explorationNotebookId: undefined,
    });
    expect(wrapper.find('[data-test-id="sample-warning-badge"]').get(0)).not.toBe(undefined);
    expect(wrapper.find('[data-test-id="sample-warning-before-exploration"]').get(0)).not.toBe(
      undefined,
    );
  }
});

test('Should show warning if dataset is sampled by AutoML when running', () => {
  const wrapper = getAutoMLPageMock({ state: 'RUNNING', sampleFraction: 0.4 });
  expect(wrapper.find('[data-test-id="sample-warning-badge"]').get(0)).not.toBe(undefined);
  expect(wrapper.find('[data-test-id="sample-warning-state-running"]').get(0)).not.toBe(undefined);
});

test('Pending state should render correctly', () => {
  const wrapper = getAutoMLPageMock({ state: 'PENDING' });
  expect(wrapper.find('[data-test-id="train-step"]').get(0).props.status).toBe('process');
  expect(wrapper.find('[data-test-id="evaluate-step"]').get(0).props.status).toBe('wait');
});

test('Running state should render processing step with cancel and exploration buttons', () => {
  const wrapper = getAutoMLPageMock({ state: 'RUNNING' });

  // test the tracker elements
  expect(wrapper.find('[data-test-id="train-step"]').get(0).props.status).toBe('process');
  expect(wrapper.find('[data-test-id="evaluate-step"]').get(0).props.status).toBe('wait');

  // test the sampling warning should not appear
  expect(wrapper.find('[data-test-id="sample-warning"]').get(0)).toBe(undefined);

  // test the expected text
  expect(wrapper.find('[data-test-id="automl-running-text"]').get(0)).not.toBe(undefined);

  // test the buttons
  expect(wrapper.find('[data-test-id="cancel-button"]').get(0)).not.toBe(undefined);
  expect(wrapper.find('[data-test-id="data-exploration-button"]').get(0).props.disabled).toBe(
    false,
  );

  // test the buttons that should not appear
  expect(wrapper.find('[data-test-id="model-edit-button"]').get(0)).toBe(undefined);
});

test('Running state should disable exploration notebook if unavailable', () => {
  const wrapper = getAutoMLPageMock({ state: 'RUNNING', explorationNotebookId: undefined });
  expect(wrapper.find('[data-test-id="data-exploration-button"]').get(0).props.disabled).toBe(true);
});

test('Failed state should render correctly', () => {
  const wrapper = getAutoMLPageMock({ state: 'FAILED', explorationNotebookId: undefined });

  // test the tracker elements
  expect(wrapper.find('[data-test-id="train-step"]').get(0).props.status).toBe('error');
  expect(wrapper.find('[data-test-id="evaluate-step"]').get(0).props.status).toBe('wait');

  // test the sampling warning should not appear
  expect(wrapper.find('[data-test-id="sample-warning"]').get(0)).toBe(undefined);

  // test the expected text
  expect(wrapper.find('[data-test-id="automl-failed-text"]').get(0)).not.toBe(undefined);

  // test the buttons that should be disabled
  expect(wrapper.find('[data-test-id="data-exploration-button"]').get(0).props.disabled).toBe(true);

  // test the buttons that should not appear
  expect(wrapper.find('[data-test-id="model-edit-button"]').get(0)).toBe(undefined);
  expect(wrapper.find('[data-test-id="cancel-button"]').get(0)).toBe(undefined);
});

test('Failed state should show exploration notebook if available', () => {
  const wrapper = getAutoMLPageMock({ state: 'FAILED' });
  expect(wrapper.find('[data-test-id="data-exploration-button"]').get(0).props.disabled).toBe(
    false,
  );
});

test('Success state should render correctly', () => {
  const wrapper = getAutoMLPageMock({ state: 'SUCCESS' });

  // test the tracker elements
  expect(wrapper.find('[data-test-id="train-step"]').get(0).props.status).toBe('finish');
  expect(wrapper.find('[data-test-id="evaluate-step"]').get(0).props.status).toBe('process');

  // test the sampling warning should not appear
  expect(wrapper.find('[data-test-id="sample-warning"]').get(0)).toBe(undefined);

  // test the expected text
  expect(wrapper.find('[data-test-id="evaluation-details-text"]').get(0)).not.toBe(undefined);
  expect(wrapper.find('[data-test-id="best-model-text"]').get(0)).not.toBe(undefined);

  // test the buttons
  expect(wrapper.find('[data-test-id="model-edit-button"]').get(0).props.disabled).toBe(false);
  expect(wrapper.find('[data-test-id="data-exploration-button"]').get(0).props.disabled).toBe(
    false,
  );

  // test the buttons that should not appear
  expect(wrapper.find('[data-test-id="cancel-button"]').get(0)).toBe(undefined);
});

test('Canceled state should render correctly with disabled model edit button', () => {
  const wrapper = getAutoMLPageMock({ state: 'CANCELED', bestTrialNotebookId: undefined });

  // test the tracker elements
  expect(wrapper.find('[data-test-id="train-step"]').get(0).props.status).toBe('error');
  expect(wrapper.find('[data-test-id="evaluate-step"]').get(0).props.status).toBe('wait');

  // test the sampling warning should not appear
  expect(wrapper.find('[data-test-id="sample-warning"]').get(0)).toBe(undefined);

  // test the expected text
  expect(wrapper.find('[data-test-id="cancel-details-text"]').get(0)).not.toBe(undefined);

  // test the buttons
  expect(wrapper.find('[data-test-id="model-edit-button"]').get(0).props.disabled).toBe(true);
  expect(wrapper.find('[data-test-id="data-exploration-button"]').get(0).props.disabled).toBe(
    false,
  );
});

test('Warnings tab pane should be disabled if no warnings', () => {
  const wrapper = getAutoMLPageMock();
  expect(wrapper.find('[data-test-id="warnings-tab-pane"]').get(0).props.disabled).toBe(true);
});

test('Warnings tab pane should be enabled if there are warnings', () => {
  const wrapper = getAutoMLPageMock({}, [{}]);
  expect(wrapper.find('[data-test-id="warnings-tab-pane"]').get(0).props.disabled).toBe(false);
});
