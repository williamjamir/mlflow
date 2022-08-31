import React from 'react';
import LinkUtils from '../utils/LinkUtils';
import { Spacer } from '../../shared/building_blocks/Spacer';
import { PropTypes } from 'prop-types';
import { Tooltip, Table } from 'antd';
import { FormattedMessage } from 'react-intl';
import IconUtils from '../utils/IconUtils';
import { ProducerActions, ProducerTypes, RunLifeCycleState, RunRunningStates } from '../constants';
import CronUtils from '../utils/CronUtils';
import { capitalizeFirstChar } from '../../common/utils/StringUtils';
import Utils from '../../common/utils/Utils';
import { getProducerKey } from '../reducers';
import TableUtils from '../utils/TableUtils';

const checkJobRunExist = (producer) => {
  return producer.type === ProducerTypes.JOB && !!producer.latest_run;
};

export class FeatureTableProducers extends React.Component {
  static propTypes = {
    jobProducers: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    notebookProducers: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    pipelineProducers: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  };

  renderProducerLinkCell(producer) {
    switch (producer.type) {
      case ProducerTypes.NOTEBOOK: {
        const { notebook_id, revision_id, name, notebook_workspace_id, notebook_workspace_url } =
          producer;
        return TableUtils.renderNotebookCell(
          notebook_id,
          revision_id,
          null,
          name,
          notebook_workspace_url,
          notebook_workspace_id,
        );
      }
      case ProducerTypes.JOB: {
        // link to the job's page rather than the job run's page in producer name column
        const { job_id, name, job_workspace_id, job_workspace_url } = producer;
        return TableUtils.renderJobCell(job_id, null, name, job_workspace_url, job_workspace_id);
      }
      case ProducerTypes.PIPELINE: {
        // link to the DLT pipeline's page rather than the pipeline's update page in
        // producer name column
        const { pipeline_id, name } = producer;
        return TableUtils.renderPipelineCell(pipeline_id, name);
      }
      default:
        return null;
    }
  }

  renderProducerScheduleCell(producer) {
    const viewLink = Utils.renderJobSource(
      Utils.addQueryParams(Utils.getQueryParams(), { o: producer.job_workspace_id }),
      producer.job_id,
      null,
      null,
      producer.job_workspace_url,
      'View',
    );
    // Ordering matters here:
    // 1. if the producer is not a job producer, we should render `No schedule`
    // that links to the documentation.
    // 2. if the producer is a job producer from remote workspace, we should render `View`
    // that links to the job.
    // 3. if the producer is a job producer from current workspace
    // without a schedule (non-scheduled job), we should render `No schedule`
    // that links to the documentation.
    // 4. If the producer is a job producer from current workspace with a schedule,
    // we should render the schedule.
    if (producer.type !== ProducerTypes.JOB) {
      return LinkUtils.renderNoScheduleLink();
    } else if (
      !!producer.job_workspace_id &&
      !Utils.isCurrentWorkspace(producer.job_workspace_id)
    ) {
      return viewLink;
    } else if (!producer.schedule) {
      return LinkUtils.renderNoScheduleLink();
    }
    return CronUtils.getJobRunScheduleText(producer.schedule);
  }

  getRunStatusFromState(runState) {
    const { life_cycle_state, result_state } = runState;
    if (life_cycle_state.toUpperCase() === RunLifeCycleState.TERMINATED) {
      return result_state;
    }
    return life_cycle_state;
  }

  renderProducerStatusCell(producer) {
    if (!checkJobRunExist(producer) || !producer.latest_run.state) {
      return TableUtils.renderEmptyCellText();
    }
    const status = this.getRunStatusFromState(producer.latest_run.state);
    // make the text format consistent with the jobs UI
    const statusText =
      status === RunLifeCycleState.INTERNAL_ERROR ? 'Internal Error' : capitalizeFirstChar(status);
    return (
      <Spacer direction='horizontal' size='small'>
        {IconUtils.getJobRunStatusIcon(status)}
        <span>{statusText}</span>
      </Spacer>
    );
  }

  renderProducerLastRunCell(producer) {
    if (!checkJobRunExist(producer)) {
      return TableUtils.renderEmptyCellText();
    }
    return Utils.renderJobSource(
      Utils.getQueryParams(),
      producer.latest_run.job_id,
      producer.latest_run.number_in_job,
      producer.name,
      producer.job_workspace_url,
      Utils.formatTimestamp(producer.latest_run.start_time),
    );
  }

  // The number_in_job returned by jobs API is
  // the most recent job run number (Nth run) * number_of_tasks per run (M tasks per run)
  // number_in_job = N * M, the rendered url will take you to the multitask run page.

  // The run id we record in feature catalog is actually
  // number_in_job + the number of task for that run that wrote to the feature table.
  // e.g. If we have a job running for the Nth time, number of tasks per run is M
  // and the task that wrote to feature table was the Kth task for that job.
  // run_id = M * N + K and the rendered url will take you to that specific job run task.

  // To check if two ids are in the same run, the following condition must be true
  // number_in_job <= run_id <= number_in_job + M.
  // Since we are getting the latest run, we only need number_in_job <= run_id.
  renderJobRunsMismatchWarning(producer) {
    if (!checkJobRunExist(producer) || !producer.latest_run.state) {
      return null;
    }
    const status = this.getRunStatusFromState(producer.latest_run.state);
    const isTheSameRun = producer.latest_run.number_in_job <= producer.run_id;
    // if the job run is currently running we do not want to show the warning icon
    if (isTheSameRun || RunRunningStates.includes(status.toUpperCase())) {
      return null;
    }
    return (
      <Tooltip
        overlay={
          <FormattedMessage
            defaultMessage={
              'The last job run may not have successfully written to this feature table.'
            }
            description={
              // eslint-disable-next-line max-len
              'Text on the warning icon of the last written column describing the last job run may have not written to the feature table.'
            }
          />
        }
        placement='top'
      >
        {IconUtils.getWarningIcon()}
      </Tooltip>
    );
  }

  renderProducerLastWrittenCell(producer) {
    // REGISTER does not count as a write operation therefore not returning last written
    if (producer.producer_action === ProducerActions.REGISTER) {
      return TableUtils.renderEmptyCellText();
    }
    switch (producer.type) {
      case ProducerTypes.JOB: {
        const { job_id, run_id, name, creation_timestamp, job_workspace_id } = producer;
        return (
          <Spacer direction='horizontal' size='small'>
            {this.renderJobRunsMismatchWarning(producer)}
            {Utils.renderJobSource(
              Utils.addQueryParams(Utils.getQueryParams(), { o: job_workspace_id }),
              job_id,
              run_id,
              name,
              producer.job_workspace_url,
              Utils.formatTimestamp(creation_timestamp),
            )}
          </Spacer>
        );
      }
      case ProducerTypes.NOTEBOOK: {
        const { notebook_id, revision_id, name, creation_timestamp, notebook_workspace_id } =
          producer;
        return Utils.renderNotebookSource(
          Utils.addQueryParams(Utils.getQueryParams(), { o: notebook_workspace_id }),
          notebook_id,
          revision_id,
          null,
          name,
          producer.notebook_workspace_url,
          Utils.formatTimestamp(creation_timestamp),
        );
      }
      case ProducerTypes.PIPELINE: {
        const { pipeline_id, name, creation_timestamp } = producer;
        return Utils.renderPipelineSource(
          Utils.getQueryParams(),
          pipeline_id,
          name,
          null,
          null,
          Utils.formatTimestamp(creation_timestamp),
        );
      }
      default:
        return TableUtils.renderEmptyCellText();
    }
  }

  getLastJobRunStartTime(producer) {
    if (!checkJobRunExist(producer)) {
      return 0;
    }
    return producer.latest_run.start_time || 0;
  }

  getProducerColumns() {
    return [
      {
        title: (
          <FormattedMessage
            defaultMessage={'Name'}
            description={'Title text for the producer name column.'}
          />
        ),
        width: '20%',
        key: 'name',
        sorter: (a, b) =>
          TableUtils.getProducerName(a).localeCompare(TableUtils.getProducerName(b)),
        render: (producer) => {
          return <div data-test-id='producer-name'>{this.renderProducerLinkCell(producer)}</div>;
        },
      },
      {
        title: TableUtils.renderTitleWithIcon(
          <FormattedMessage
            defaultMessage={'Schedule'}
            description={'Title text for the producer schedule column.'}
          />,
          <div>
            <FormattedMessage
              defaultMessage={'Schedule of the job producers.'}
              description={
                // eslint-disable-next-line max-len
                'Text on the tooltip of the scheduled jobs column title describing the definition of the column title.'
              }
            />{' '}
            {LinkUtils.renderLearnMoreLink(LinkUtils.getScheduleJobLearnMoreLinkUrl())}
          </div>,
        ),
        width: '20%',
        key: 'schedule',
        render: (producer) => {
          return (
            <div data-test-id='producer-schedule'>{this.renderProducerScheduleCell(producer)}</div>
          );
        },
      },
      {
        title: (
          <FormattedMessage
            defaultMessage={'Status'}
            description={'Title text for the producer status column.'}
          />
        ),
        width: '20%',
        key: 'status',
        render: (producer) => {
          return (
            <div data-test-id='producer-status'>{this.renderProducerStatusCell(producer)}</div>
          );
        },
      },
      {
        title: TableUtils.renderTitleWithIcon(
          <FormattedMessage
            defaultMessage={'Last run'}
            description={'Title text for the producer last run column.'}
          />,
          <FormattedMessage
            defaultMessage={'Start time of the last job run.'}
            description={
              // eslint-disable-next-line max-len
              'Text on the tooltip of the last run column describing the start time of the last job run.'
            }
          />,
        ),
        width: '20%',
        key: 'last_run',
        sorter: (a, b) => this.getLastJobRunStartTime(a) - this.getLastJobRunStartTime(b),
        render: (producer) => {
          return (
            <div data-test-id='producer-last-run'>{this.renderProducerLastRunCell(producer)}</div>
          );
        },
      },
      {
        title: TableUtils.renderTitleWithIcon(
          <FormattedMessage
            defaultMessage={'Last written'}
            description={'Title text for the producer last written column.'}
          />,
          <FormattedMessage
            defaultMessage={'Last time the producer wrote to this table.'}
            description={
              // eslint-disable-next-line max-len
              'Text on the tooltip of the last written column describing the last time the producer wrote to this table.'
            }
          />,
        ),
        width: '20%',
        key: 'last_written',
        sorter: (a, b) => a.creation_timestamp - b.creation_timestamp,
        defaultSortOrder: 'descend',
        render: (producer) => {
          return (
            <div data-test-id='producer-last-written'>
              {this.renderProducerLastWrittenCell(producer)}
            </div>
          );
        },
      },
    ];
  }

  getProducerRowKey(producer) {
    switch (producer.type) {
      case ProducerTypes.NOTEBOOK:
        return getProducerKey(ProducerTypes.NOTEBOOK, producer.notebook_id, producer.revision_id);
      case ProducerTypes.JOB:
        return getProducerKey(ProducerTypes.JOB, producer.job_id, producer.run_id);
      case ProducerTypes.PIPELINE:
        return getProducerKey(ProducerTypes.PIPELINE, producer.pipeline_id, null);
      default:
        return '-';
    }
  }

  render() {
    const { jobProducers, notebookProducers, pipelineProducers } = this.props;
    const producers = [...notebookProducers, ...jobProducers, ...pipelineProducers];
    return (
      <Table
        columns={this.getProducerColumns()}
        dataSource={producers}
        rowKey={this.getProducerRowKey}
        locale={{
          emptyText: (
            <FormattedMessage
              defaultMessage={'No producers found.'}
              description={'Text on the producer section describing no producers exist.'}
            />
          ),
        }}
        size='middle'
        pagination={{ hideOnSinglePage: true, size: 'default' }}
        showSorterTooltip={false}
      />
    );
  }
}
