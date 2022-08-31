import React from 'react';
import _ from 'lodash';
import { mountWithIntl } from '../../common/utils/TestUtils';
import { JobHistorySection } from './JobHistorySection';
import { JOB_FETCH_LIMIT } from '../hooks/useJobFetch';
import { RunLifeCycleState, RunResultState, RunRunningStates } from '../../feature-store/constants';
import { jobRunStatusMessages } from './RecentRuns';

describe('JobHistorySection', () => {
  const props = {
    isLoading: false,
    runHistory: [
      {
        start_time: 1233400,
        end_time: 1233455,
        state: {
          result_state: RunResultState.SUCCESS,
          life_cycle_state: RunLifeCycleState.TERMINATED,
        },
      },
    ],
    jobId: ':jobId',
    loggingTableName: 'logging table name',
    analysisMetricsTableName: 'analysis table name',
    driftMetricsTableName: 'drift name',
  };

  it('renders with minimal props without exploding', () => {
    const wrapper = mountWithIntl(<JobHistorySection {...props} />);
    expect(wrapper.find('[data-testid="job-history-section"]')).toHaveLength(1);
  });

  _.forEach(RunResultState, (runState) => {
    it(`renders most recent run in the run section with the correct state text for ${runState} runs`, () => {
      const { defaultMessage: message } = jobRunStatusMessages[runState];
      const dynamicRuns = {
        ...props,
        runHistory: [
          {
            start_time: 1600000000000, // Sep 13 2020
            end_time: 0,
            state: {
              life_cycle_state: RunLifeCycleState.TERMINATED,
              result_state: runState,
            },
          },
        ],
      };
      const wrapper = mountWithIntl(<JobHistorySection {...dynamicRuns} />);
      expect(wrapper.find('span[data-testid="most-recent-run-state"]').text()).toEqual(
        expect.stringContaining(message),
      );
    });
  });

  it('displays links as normal by default', () => {
    const wrapper = mountWithIntl(<JobHistorySection {...props} />);
    ['logging-table-name', 'analysis-metrics-table-name', 'drift-metrics-table-name'].forEach(
      (key) => {
        expect(wrapper.find(`span[data-testid='artifact-link-${key}'] a`).length).toBe(1);
        expect(
          wrapper.find(`span[data-testid='artifact-link-${key}'] a`).prop('disabled'),
        ).toBeFalsy();
      },
    );
  });

  it('displays baseline/scored tables if logging table does not exist', () => {
    const splitLoggingData = {
      ...props,
      loggingTableName: '',
      baselineDataTableName: 'baseline data table name',
      scoredDataTableName: 'scored data table name',
    };
    const wrapper = mountWithIntl(<JobHistorySection {...splitLoggingData} />);
    ['baseline-data-table-name', 'scored-data-table-name'].forEach((key) => {
      expect(wrapper.find(`span[data-testid='artifact-link-${key}'] a`).length).toBe(1);
      expect(
        wrapper.find(`span[data-testid='artifact-link-${key}'] a`).prop('disabled'),
      ).toBeFalsy();
    });
  });

  it('does not display last successful run section', () => {
    const wrapper = mountWithIntl(<JobHistorySection {...props} />);
    expect(wrapper.find('[data-testid="last-successful-run-section"]')).toHaveLength(0);
  });

  describe('with unsuccessful runs', () => {
    const runs = [
      {
        start_time: 10000000000,
        end_time: 1600000000000, // Sep 13 2020
        state: {
          result_state: RunResultState.FAILED,
          life_cycle_state: RunLifeCycleState.TERMINATED,
        },
      },
      {
        start_time: 10000000000,
        end_time: 1595000000000,
        state: {
          result_state: RunResultState.FAILED,
          life_cycle_state: RunLifeCycleState.TERMINATED,
        },
      },
      {
        start_time: 10000000000,
        end_time: 1590000000000, // May 20 2020
        state: {
          result_state: 'SUCCESS',
          life_cycle_state: RunLifeCycleState.TERMINATED,
        },
      },
      {
        start_time: 10000000000,
        end_time: 1580000000000,
        state: {
          result_state: RunResultState.FAILED,
          life_cycle_state: RunLifeCycleState.TERMINATED,
        },
      },
      {
        start_time: 10000000000,
        end_time: 1570000000000, // Oct 2 2019
        state: {
          result_state: 'SUCCESS',
          life_cycle_state: RunLifeCycleState.TERMINATED,
        },
      },
    ];

    const maxFailedRuns = _.times(JOB_FETCH_LIMIT, (n) => ({
      start_time: 10000000000,
      end_time: 1600000000000 - n, // Sep 13 2020
      state: {
        result_state: RunResultState.FAILED,
        life_cycle_state: RunLifeCycleState.TERMINATED,
      },
    }));

    it('renders "None" if history does not exist', () => {
      const noHistory = { ...props, runHistory: undefined };
      const wrapper = mountWithIntl(<JobHistorySection {...noHistory} />);
      expect(wrapper.find('[data-testid="recent-runs"]').text()).toBe('None');
    });

    it('renders the last successful run section', () => {
      const mixedRuns = { ...props, runHistory: runs };
      const wrapper = mountWithIntl(<JobHistorySection {...mixedRuns} />);
      expect(wrapper.find('span[data-testid="last-successful-run-state"]')).toHaveLength(1);
    });

    it('shows the most recent successful run', () => {
      const mixedRuns = { ...props, runHistory: runs };
      const wrapper = mountWithIntl(<JobHistorySection {...mixedRuns} />);
      expect(wrapper.find('span[data-testid="last-successful-timestamp"]').text()).toEqual(
        expect.stringContaining('May 20 2020'),
      );
    });

    it('renders the last successful run section with "None" if no successful runs exists', () => {
      const failedRunsOnly = { ...props, runHistory: runs.slice(0, 2) };
      const wrapper = mountWithIntl(<JobHistorySection {...failedRunsOnly} />);
      expect(wrapper.find('div[data-testid="last-successful-run-section"]')).toHaveLength(1);
      expect(wrapper.find('div[data-testid="last-successful-run-section"]').text()).toEqual(
        expect.stringContaining('None'),
      );
    });

    ['analysis-metrics-table-name', 'drift-metrics-table-name'].forEach((table) => {
      it(`disables the link for ${table} if all runs have failed but less than max fetch limit`, () => {
        const failedRunsOnly = { ...props, runHistory: runs.slice(0, 2) };
        const wrapper = mountWithIntl(<JobHistorySection {...failedRunsOnly} />);
        expect(
          wrapper.find(`span[data-testid='artifact-link-${table}'] a`).prop('disabled'),
        ).toBeTruthy();
      });

      it(`${table} is not copyable if no runs have succeeded`, () => {
        const failedRunsOnly = { ...props, runHistory: runs.slice(0, 2) };
        const wrapper = mountWithIntl(<JobHistorySection {...failedRunsOnly} />);
        expect(
          wrapper.find(`span[data-testid='artifact-link-${table}'] [role='img']`),
        ).toHaveLength(0);
      });

      it(`enables the link for ${table} if all runs failed and at fetch limit`, () => {
        const failedRunsAtLimit = { ...props, runHistory: maxFailedRuns };
        const wrapper = mountWithIntl(<JobHistorySection {...failedRunsAtLimit} />);
        expect(
          wrapper.find(`span[data-testid='artifact-link-${table}'] a`).prop('disabled'),
        ).toBeFalsy();
      });
    });
  });

  describe('with in progress runs', () => {
    RunRunningStates.forEach((runningState) => {
      it(`renders in progress run in the recent section for ${runningState} runs`, () => {
        const runs = [
          {
            start_time: 1600000000000, // Sep 13 2020
            end_time: 0,
            state: {
              life_cycle_state: runningState,
            },
          },
        ];
        const mixedRuns = { ...props, runHistory: runs };
        const wrapper = mountWithIntl(<JobHistorySection {...mixedRuns} />);
        expect(wrapper.find('span[data-testid="most-recent-run-state"]').text()).toEqual(
          expect.stringContaining('In progress'),
        );
      });

      it(`uses the start time instead of end time for ${runningState} runs`, () => {
        const runs = [
          {
            start_time: 1600000000000, // Sep 13 2020
            end_time: 0,
            state: {
              life_cycle_state: runningState,
            },
          },
        ];
        const mixedRuns = { ...props, runHistory: runs };
        const wrapper = mountWithIntl(<JobHistorySection {...mixedRuns} />);
        expect(wrapper.find('span[data-testid="most-recent-timestamp"]').text()).toEqual(
          expect.stringContaining('Sep 13 2020'),
        );
      });
    });
  });
});
