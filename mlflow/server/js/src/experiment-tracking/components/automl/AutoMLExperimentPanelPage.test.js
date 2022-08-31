import React from 'react';
import { shallow } from 'enzyme';

import { AutoMLExperimentPanelPageImpl } from './AutoMLExperimentPanelPage';
import AutoMLService from './AutoMLService';

jest.useFakeTimers();

let experimentId;
let experiment;
let automlExperimentData;
let automlWarnings;
let refreshIntervalMs;
let getExperimentApi;
let cancelJobRunApi;
let setExperimentTagApi;
let getJobRunApi;

const getJobRunApiPromise = Promise.resolve();
const setExperimentTagApiPromise = Promise.resolve();

beforeEach(() => {
  experimentId = '12345';
  experiment = {};
  automlExperimentData = {};
  automlWarnings = [];
  refreshIntervalMs = 5000;
  getExperimentApi = jest.fn(() => Promise.resolve());
  cancelJobRunApi = jest.fn(() => Promise.resolve());
  setExperimentTagApi = jest.fn(() => setExperimentTagApiPromise);
  getJobRunApi = jest.fn(() => getJobRunApiPromise);
});

const getAutoMLPageMock = () => {
  return shallow(
    <AutoMLExperimentPanelPageImpl
      experimentId={experimentId}
      experiment={experiment}
      automlExperimentData={automlExperimentData}
      automlWarnings={automlWarnings}
      refreshIntervalMs={refreshIntervalMs}
      getExperimentApi={getExperimentApi}
      cancelJobRunApi={cancelJobRunApi}
      setExperimentTagApi={setExperimentTagApi}
      getJobRunApi={getJobRunApi}
    />,
  );
};

describe('AutoMLExperimentPanelPage', () => {
  beforeEach(() => {
    /* eslint-disable no-restricted-globals */
    top.settings = {};
  });

  describe('Update timer', () => {
    test('should refresh once after refreshIntervalMs', async () => {
      // API immediately resolves
      getAutoMLPageMock();
      jest.advanceTimersByTime(4999);
      expect(getExperimentApi).not.toBeCalled();
      jest.advanceTimersByTime(2);
      await getJobRunApiPromise;
      expect(getExperimentApi).toHaveBeenCalledTimes(1);
    });

    test('should refresh multiple times', async () => {
      // API immediately resolves
      const apiPromise = new Promise((resolve) => resolve());
      getExperimentApi.mockReturnValue(apiPromise);
      automlExperimentData = { state: 'RUNNING' };
      getAutoMLPageMock();
      jest.advanceTimersByTime(5001);
      await apiPromise; // Have to wait for resolve, otherwise it remains in the queue
      await getJobRunApiPromise;
      await setExperimentTagApiPromise;
      jest.advanceTimersByTime(5001);
      await apiPromise;
      await getJobRunApiPromise;
      await setExperimentTagApiPromise;
      expect(getExperimentApi).toHaveBeenCalledTimes(2);
    });

    test('should not pile up API requests if they do not return', async () => {
      // API never resolves
      const apiPromise = new Promise(() => {});
      getExperimentApi.mockReturnValue(apiPromise);
      getAutoMLPageMock();
      jest.advanceTimersByTime(20000);
      await getJobRunApiPromise;
      expect(getExperimentApi).toHaveBeenCalledTimes(1);
    });

    test('should not make api requests after unmounting', async () => {
      const wrapper = getAutoMLPageMock();
      jest.advanceTimersByTime(5001);
      await getJobRunApiPromise;
      expect(getExperimentApi).toHaveBeenCalledTimes(1);
      wrapper.unmount();
      jest.advanceTimersByTime(5001);
      await getJobRunApiPromise;
      expect(getExperimentApi).toHaveBeenCalledTimes(1);
    });
  });

  describe('Cancellation', () => {
    const cancelSpy = jest
      .spyOn(AutoMLService, 'cancelAutoMLExperiment')
      .mockImplementation(() => ({
        catch: () => {},
      }));

    test('cancelling should call cancel api and on success set cancelled state tag', async () => {
      const wrapper = getAutoMLPageMock();
      await wrapper.instance().cancelJobRun(123);

      expect(cancelJobRunApi).toHaveBeenCalledTimes(1);
      expect(setExperimentTagApi).toHaveBeenCalledTimes(1);
      expect(cancelSpy).toHaveBeenCalledTimes(0);
    });

    test('successful cancellation should set cancelled state tag', async () => {
      const wrapper = getAutoMLPageMock();
      await wrapper.instance().cancelJobRun(123);

      expect(setExperimentTagApi).toHaveBeenCalledTimes(1);
      expect(cancelSpy).toHaveBeenCalledTimes(0);
    });

    test('failed cancellation should not set cancelled state tag', async () => {
      cancelJobRunApi.mockReturnValue(Promise.reject());
      const wrapper = getAutoMLPageMock();
      await wrapper.instance().cancelJobRun(123);

      expect(setExperimentTagApi).toHaveBeenCalledTimes(0);
      expect(cancelSpy).toHaveBeenCalledTimes(0);
    });

    test('should call AutoML service to cancel if flag is enabled', async () => {
      /* eslint-disable no-restricted-globals */
      top.settings = {
        autoMLServiceAPIUsed: true,
      };
      const wrapper = getAutoMLPageMock();
      await wrapper.instance().cancelJobRun(123);

      expect(cancelJobRunApi).toHaveBeenCalledTimes(0);
      expect(setExperimentTagApi).toHaveBeenCalledTimes(0);
      expect(cancelSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('UpdateExperiment', () => {
    const experimentPromise = Promise.resolve({
      value: { experiment: { state: 'RUNNING', run_page_url: 'test_url' } },
    });
    const warningsPromise = Promise.resolve({ warnings: [] });
    const getAutoMLExperimentSpy = jest
      .spyOn(AutoMLService, 'getAutoMLExperiment')
      .mockImplementation(() => experimentPromise);
    const getAutoMLWarningsSpy = jest
      .spyOn(AutoMLService, 'getAutoMLWarnings')
      .mockImplementation(() => warningsPromise);

    const jobStatus = (return_status) => {
      return Promise.resolve({
        value: {
          state: {
            result_state: return_status,
          },
          run_page_url: 'test-url',
        },
      });
    };

    test('UpdateExperiment should update from jobRun status of failed run when autoMLServiceAPIUsed is false', async () => {
      automlExperimentData = { jobRunId: '123' };
      getJobRunApi.mockReturnValue(jobStatus('FAILED'));
      const wrapper = getAutoMLPageMock();
      await wrapper.instance().updateExperiment();

      expect(getJobRunApi).toHaveBeenCalledTimes(1);
      expect(setExperimentTagApi).toHaveBeenCalledTimes(2);
      expect(getAutoMLExperimentSpy).toHaveBeenCalledTimes(0);
      expect(getAutoMLWarningsSpy).toHaveBeenCalledTimes(0);
    });

    test('UpdateExperiment should update from jobRun status of timed out run when autoMLServiceAPIUsed is false', async () => {
      automlExperimentData = { jobRunId: '123' };
      getJobRunApi.mockReturnValue(jobStatus('TIMEDOUT'));
      const wrapper = getAutoMLPageMock();
      await wrapper.instance().updateExperiment();

      expect(getJobRunApi).toHaveBeenCalledTimes(1);
      expect(setExperimentTagApi).toHaveBeenCalledTimes(2);
      expect(getAutoMLExperimentSpy).toHaveBeenCalledTimes(0);
      expect(getAutoMLWarningsSpy).toHaveBeenCalledTimes(0);
    });

    test('UpdateExperiment should update from jobRun status of cancelled run when autoMLServiceAPIUsed is false', async () => {
      automlExperimentData = { jobRunId: '123' };
      getJobRunApi.mockReturnValue(jobStatus('CANCELED'));
      const wrapper = getAutoMLPageMock();
      await wrapper.instance().updateExperiment();

      expect(getJobRunApi).toHaveBeenCalledTimes(1);
      expect(setExperimentTagApi).toHaveBeenCalledTimes(1);
      expect(getAutoMLExperimentSpy).toHaveBeenCalledTimes(0);
      expect(getAutoMLWarningsSpy).toHaveBeenCalledTimes(0);
    });

    test('UpdateExperiment should call service when autoMLServiceAPIUsed is true', async () => {
      /* eslint-disable no-restricted-globals */
      top.settings = {
        ...top.settings,
        autoMLServiceAPIUsed: true,
      };
      automlExperimentData = { jobRunId: '123' };
      getJobRunApi.mockReturnValue(jobStatus('CANCELED'));
      const wrapper = getAutoMLPageMock();
      await wrapper.instance().updateExperiment();

      expect(getJobRunApi).toHaveBeenCalledTimes(0);
      expect(setExperimentTagApi).toHaveBeenCalledTimes(0);
      expect(getAutoMLExperimentSpy).toHaveBeenCalledTimes(1);
      expect(getAutoMLWarningsSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('Render', () => {
    test('does not load skeleton when service is not used', () => {
      automlExperimentData = { jobRunId: '123' };
      const wrapper = getAutoMLPageMock();
      expect(
        wrapper.find('[data-test-id="automl-experiment-view-skeleton"]').get(0).props.loading,
      ).toBe(false);
    });

    test('loads skeleton when service is props is empty', () => {
      automlExperimentData = null;
      const wrapper = getAutoMLPageMock();
      expect(
        wrapper.find('[data-test-id="automl-experiment-view-skeleton"]').get(0).props.loading,
      ).toBe(true);
    });

    test('correctly loads/ unloads skeleton when service data is absent / present', async () => {
      /* eslint-disable no-restricted-globals */
      top.settings = {
        ...top.settings,
        autoMLServiceAPIUsed: true,
      };

      const wrapper = getAutoMLPageMock();
      expect(
        wrapper.find('[data-test-id="automl-experiment-view-skeleton"]').get(0).props.loading,
      ).toBe(true);

      wrapper.setState({ automlServiceExperimentData: {} });
      expect(
        wrapper.find('[data-test-id="automl-experiment-view-skeleton"]').get(0).props.loading,
      ).toBe(false);
    });
  });

  describe('camelCaseWarningKeys', () => {
    test('converts warning data as expected', () => {
      const warningInput = [
        {
          name: 'data_exploration_truncate_rows',
          severity: 'LOW',
          version: 1,
        },
        {
          name: 'high_correlation_cols',
          severity: 'HIGH',
          version: 2,
          affected: {
            values: [
              {
                id: 'marital_status',
              },
            ],
          },
        },
        {
          name: 'high_cardinality_cols',
          severity: 'MEDIUM',
          version: 1,
          affected: {
            values: [
              {
                id: 'marital_status',
              },
            ],
            others: 3,
          },
        },
      ];

      const expectedOutput = [
        {
          name: 'dataExplorationTruncateRows',
          severity: 'LOW',
          version: 1,
        },
        {
          name: 'highCorrelationCols',
          severity: 'HIGH',
          version: 2,
          affected: {
            values: [
              {
                id: 'marital_status',
              },
            ],
          },
        },
        {
          name: 'highCardinalityCols',
          severity: 'MEDIUM',
          version: 1,
          affected: {
            values: [
              {
                id: 'marital_status',
              },
            ],
            others: 3,
          },
        },
      ];

      const wrapper = getAutoMLPageMock();
      expect(wrapper.instance().camelCaseWarningKeys(warningInput)).toEqual(expectedOutput);
    });

    test('does not fail on empty input', () => {
      const wrapper = getAutoMLPageMock();
      expect(wrapper.instance().camelCaseWarningKeys(undefined)).toEqual(null);
    });
  });
});
