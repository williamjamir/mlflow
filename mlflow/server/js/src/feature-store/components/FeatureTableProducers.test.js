import { BrowserRouter } from 'react-router-dom';
import { FeatureTableProducers } from './FeatureTableProducers';
import { mountWithIntl } from '../../common/utils/TestUtils';
import React from 'react';
import {
  mockJobProducer,
  mockJobRun,
  mockNotebookProducer,
  mockSchedule,
  mockPipelineProducer,
} from '../utils/test-utils';
import {
  RunLifeCycleState,
  SchedulePauseStatus,
  RunResultState,
  ProducerActions,
} from '../constants';
import DatabricksUtils from '../../common/utils/DatabricksUtils';
import { CloudProvider } from '../../shared/databricks_edge/constants-databricks';
import Utils from '../../common/utils/Utils';
import LinkUtils from '../utils/LinkUtils';

const getDefaultProducerViewProps = (overrides = {}) => ({
  notebookProducers: [],
  jobProducers: [],
  pipelineProducers: [],
  ...overrides,
});

describe('FeatureTableProducers', () => {
  const getProducerNames = (wrapper) =>
    wrapper.find('[data-test-id="producer-name"]').map((r) => r.text());
  const getProducerNameLinks = (wrapper) =>
    wrapper
      .find('[data-test-id="producer-name"]')
      .find('a')
      .map((r) => r.prop('href'));
  const getProducerSchedules = (wrapper) =>
    wrapper.find('[data-test-id="producer-schedule"]').map((r) => r.text());
  const getProducerScheduleLinks = (wrapper) =>
    wrapper
      .find('[data-test-id="producer-schedule"]')
      .find('a')
      .map((r) => r.prop('href'));
  const getProducerStatuses = (wrapper) =>
    wrapper.find('[data-test-id="producer-status"]').map((r) => r.text());
  const getProducerLastRuns = (wrapper) =>
    wrapper.find('[data-test-id="producer-last-run"]').map((r) => r.text());
  const getProducerLastRunLinks = (wrapper) =>
    wrapper
      .find('[data-test-id="producer-last-run"]')
      .find('a')
      .map((r) => r.prop('href'));
  const getProducerLastWrittens = (wrapper) =>
    wrapper.find('[data-test-id="producer-last-written"]').map((r) => r.text());
  const getProducerLastWrittenLinks = (wrapper) =>
    wrapper
      .find('[data-test-id="producer-last-written"]')
      .find('a')
      .map((r) => r.prop('href'));

  it('renders with minimal props without exploding', () => {
    const wrapper = mountWithIntl(
      <BrowserRouter>
        <FeatureTableProducers {...getDefaultProducerViewProps()} />
      </BrowserRouter>,
    );
    expect(wrapper.length).toBe(1);
  });

  it('have n rows in producers table with correct values', () => {
    const mockJobProducers = [
      mockJobProducer(
        123,
        1,
        1625444444444,
        'user@email.com',
        'dummyJob',
        mockJobRun({
          jobId: 123,
          numberInJob: 2,
          startTime: 1625444444444,
          state: {
            life_cycle_state: RunLifeCycleState.INTERNAL_ERROR,
          },
        }),
        mockSchedule({
          cronExpression: '0 15 22 ? * *',
          timezone: 'America/Chicago',
          pauseStatus: SchedulePauseStatus.UNPAUSED,
        }),
        undefined,
        'https://dogfood.staging.cloud.databricks.com',
      ),
      mockJobProducer(
        666,
        2,
        1625333333333,
        'user@email.com',
        'smartJob',
        mockJobRun({
          jobId: 666,
          numberInJob: 3,
          startTime: 1625333333333,
          state: {
            life_cycle_state: RunLifeCycleState.TERMINATED,
            result_state: RunResultState.SUCCESS,
          },
        }),
        mockSchedule({
          cronExpression: '46 0 22 * * ?',
          timezone: 'America/Los_Angeles',
          pauseStatus: SchedulePauseStatus.PAUSED,
        }),
      ),
    ];
    const mockPipelineProducers = [
      mockPipelineProducer(
        'def456',
        'a1',
        1615329298000,
        'pipeline abc123 creator',
        'new pipeline',
      ),
      mockPipelineProducer(
        'abc123',
        'd4',
        1615329200000,
        'pipeline def456 creator',
        'old pipeline',
      ),
    ];
    const mockNotebookProducers = [
      mockNotebookProducer(111, 222, 1625222222222, 'user@email.com', '/xxx/notebook1'),
      mockNotebookProducer(333, 444, 1625111111111, 'user@email.com', '/xxx/notebook2'),
    ];
    // use AWS documentation link for testing
    DatabricksUtils.getCloudProvider = jest.fn().mockReturnValue(CloudProvider.AWS);
    const wrapper = mountWithIntl(
      <BrowserRouter>
        <FeatureTableProducers
          {...getDefaultProducerViewProps({
            jobProducers: mockJobProducers,
            notebookProducers: mockNotebookProducers,
            pipelineProducers: mockPipelineProducers,
          })}
        />
      </BrowserRouter>,
    );

    // check producer name column
    // this list should be sorted by last written timestamp
    expect(getProducerNames(wrapper)).toEqual([
      'dummyJob',
      'smartJob',
      'notebook1',
      'notebook2',
      'new pipeline',
      'old pipeline',
    ]);
    // jobs producers will link to the job, notebook producers will link to the notebook revision
    expect(getProducerNameLinks(wrapper)).toEqual([
      'https://dogfood.staging.cloud.databricks.com/#job/123',
      'http://localhost/#job/666',
      'http://localhost/#notebook/111/revision/222',
      'http://localhost/#notebook/333/revision/444',
      'http://localhost/#joblist/pipelines/def456',
      'http://localhost/#joblist/pipelines/abc123',
    ]);

    // check producer schedule column
    expect(getProducerSchedules(wrapper)).toEqual([
      'At 10:15 PM (America/Chicago)',
      'Paused - At 10:00 PM (America/Los_Angeles)',
      'No schedule',
      'No schedule',
      'No schedule',
      'No schedule',
    ]);
    expect(getProducerScheduleLinks(wrapper)).toEqual(
      Array(4).fill(LinkUtils.getScheduleJobLearnMoreLinkUrl()),
    );

    // check producer status column
    expect(getProducerStatuses(wrapper)).toEqual(['Internal Error', 'Success', '-', '-', '-', '-']);

    // check producer last run column
    expect(getProducerLastRuns(wrapper)).toEqual([
      Utils.formatTimestamp(1625444444444),
      Utils.formatTimestamp(1625333333333),
      '-',
      '-',
      '-',
      '-',
    ]);
    expect(getProducerLastRunLinks(wrapper)).toEqual([
      'https://dogfood.staging.cloud.databricks.com/#job/123/run/2',
      'http://localhost/#job/666/run/3',
    ]);

    // check producer last written column
    expect(getProducerLastWrittens(wrapper)).toEqual([
      Utils.formatTimestamp(1625444444444),
      Utils.formatTimestamp(1625333333333),
      Utils.formatTimestamp(1625222222222),
      Utils.formatTimestamp(1625111111111),
      Utils.formatTimestamp(1615329298000),
      Utils.formatTimestamp(1615329200000),
    ]);
    expect(getProducerLastWrittenLinks(wrapper)).toEqual([
      'https://dogfood.staging.cloud.databricks.com/#job/123/run/1',
      'http://localhost/#job/666/run/2',
      'http://localhost/#notebook/111/revision/222',
      'http://localhost/#notebook/333/revision/444',
      'http://localhost/#joblist/pipelines/def456',
      'http://localhost/#joblist/pipelines/abc123',
    ]);
  });

  it('importer producers should not render last written', () => {
    const mockJobProducers = [
      mockJobProducer(
        123,
        1,
        1625444444444,
        'user@email.com',
        'dummyJob',
        mockJobRun({
          jobId: 123,
          numberInJob: 2,
          startTime: 1625444444444,
          state: {
            life_cycle_state: RunLifeCycleState.INTERNAL_ERROR,
          },
        }),
        undefined,
        undefined,
        undefined,
        ProducerActions.WRITE,
      ),
      mockJobProducer(
        666,
        2,
        1625333333333,
        'user@email.com',
        'smartJob',
        mockJobRun({
          jobId: 666,
          numberInJob: 3,
          startTime: 1625333333333,
          state: {
            life_cycle_state: RunLifeCycleState.TERMINATED,
            result_state: RunResultState.SUCCESS,
          },
        }),
        undefined,
        undefined,
        undefined,
        ProducerActions.REGISTER,
      ),
    ];
    const mockNotebookProducers = [
      mockNotebookProducer(
        111,
        222,
        1625222222222,
        'user@email.com',
        '/xxx/notebook1',
        undefined,
        undefined,
        ProducerActions.REGISTER,
      ),
      mockNotebookProducer(
        333,
        444,
        1625111111111,
        'user@email.com',
        '/xxx/notebook2',
        undefined,
        undefined,
        null,
      ),
    ];

    DatabricksUtils.getCloudProvider = jest.fn().mockReturnValue(CloudProvider.AWS);
    const wrapper = mountWithIntl(
      <BrowserRouter>
        <FeatureTableProducers
          {...getDefaultProducerViewProps({
            jobProducers: mockJobProducers,
            notebookProducers: mockNotebookProducers,
          })}
        />
      </BrowserRouter>,
    );

    // check producer last written column
    expect(getProducerLastWrittens(wrapper)).toEqual([
      Utils.formatTimestamp(1625444444444),
      '-',
      '-',
      Utils.formatTimestamp(1625111111111),
    ]);
    expect(getProducerLastWrittenLinks(wrapper)).toEqual([
      'http://localhost/#job/123/run/1',
      'http://localhost/#notebook/333/revision/444',
    ]);
  });

  it('warning icon shows up only when last run did not wrote to the feature table', () => {
    const mockJobProducers = [
      // this run wrote to the feature table
      mockJobProducer(
        666,
        2,
        111,
        'a@b.com',
        'job 666',
        mockJobRun({
          jobId: 666,
          numberInJob: 1,
        }),
      ),
      // this run did not wrote to feature table but last run is currently running
      mockJobProducer(
        123,
        2,
        111,
        'a@b.com',
        'job 123',
        mockJobRun({
          jobId: 123,
          numberInJob: 3,
          state: {
            life_cycle_state: RunLifeCycleState.PENDING,
          },
        }),
      ),
      // this run did not wrote to feature table and last run is NOT currently running
      // warning icon should show up
      mockJobProducer(
        456,
        2,
        111,
        'a@b.com',
        'job 456',
        mockJobRun({
          jobId: 456,
          numberInJob: 3,
          state: {
            life_cycle_state: RunLifeCycleState.SKIPPED,
          },
        }),
      ),
      // this run did not wrote to feature table and last run is NOT currently running
      // warning icon should show up
      mockJobProducer(
        789,
        2,
        111,
        'a@b.com',
        'job 789',
        mockJobRun({
          jobId: 789,
          numberInJob: 3,
          state: {
            life_cycle_state: RunLifeCycleState.TERMINATED,
            result_state: RunResultState.SUCCESS,
          },
        }),
      ),
    ];
    const wrapper = mountWithIntl(
      <BrowserRouter>
        <FeatureTableProducers
          {...getDefaultProducerViewProps({
            jobProducers: mockJobProducers,
          })}
        />
      </BrowserRouter>,
    );

    const producerLastWritten = wrapper.find('[data-test-id="producer-last-written"]');
    expect(producerLastWritten.length).toEqual(4);
    for (let i = 0; i < 4; i += 1) {
      const expectedWarningIconLength = i < 2 ? 0 : 1;
      expect(producerLastWritten.at(i).find('[data-test-id="warning-icon"]').length).toEqual(
        expectedWarningIconLength,
      );
    }
  });

  it('producers from other workspaces are rendered correctly', () => {
    const workspaceId1 = '6666666';
    const workspaceId2 = '1234567';
    const workspaceId3 = '9876543';
    DatabricksUtils.getCurrentWorkspaceId = jest.fn().mockReturnValue(workspaceId1);

    const jobProducers = [
      mockJobProducer(666, 45, 444, 'a@b', 'a job', mockJobRun(), mockSchedule(), workspaceId1),
      // from a different workspace
      mockJobProducer(999, 23, 333, 'a@b', undefined, undefined, undefined, workspaceId2),
    ];
    const notebookProducers = [
      mockNotebookProducer(123, 86, 222, 'a@b', '/xxx/notebook1', workspaceId1),
      // from a different workspace
      mockNotebookProducer(987, 69, 111, 'a@b', undefined, workspaceId3),
    ];

    const wrapper = mountWithIntl(
      <BrowserRouter>
        <FeatureTableProducers
          {...getDefaultProducerViewProps({
            jobProducers: jobProducers,
            notebookProducers: notebookProducers,
          })}
        />
      </BrowserRouter>,
    );

    // check producer name column
    expect(getProducerNames(wrapper)).toEqual([
      'a job',
      // job producer link now links to the job's page so name will only show the job id
      `workspace ${workspaceId2}: job 999`,
      'notebook1',
      `workspace ${workspaceId3}: revision 69 of notebook 987`,
    ]);
    // jobs producers will link to the job, notebook producers will link to the notebook revision
    expect(getProducerNameLinks(wrapper)).toEqual([
      `http://localhost/?o=${workspaceId1}#job/666`,
      `http://localhost/?o=${workspaceId2}#job/999`,
      `http://localhost/?o=${workspaceId1}#notebook/123/revision/86`,
      `http://localhost/?o=${workspaceId3}#notebook/987/revision/69`,
    ]);

    // check job producer from different workspace show `View` and link to the job
    expect(getProducerSchedules(wrapper)).toEqual([
      'At 10:15 PM (America/Los_Angeles)',
      'View',
      'No schedule',
      'No schedule',
    ]);
    expect(getProducerScheduleLinks(wrapper)).toEqual([
      `http://localhost/?o=${workspaceId2}#job/999`,
      LinkUtils.getScheduleJobLearnMoreLinkUrl(),
      LinkUtils.getScheduleJobLearnMoreLinkUrl(),
    ]);

    // check last written timestamp links to the correct workspace
    expect(getProducerLastWrittenLinks(wrapper)).toEqual([
      `http://localhost/?o=${workspaceId1}#job/666/run/45`,
      `http://localhost/?o=${workspaceId2}#job/999/run/23`,
      `http://localhost/?o=${workspaceId1}#notebook/123/revision/86`,
      `http://localhost/?o=${workspaceId3}#notebook/987/revision/69`,
    ]);
  });
});
