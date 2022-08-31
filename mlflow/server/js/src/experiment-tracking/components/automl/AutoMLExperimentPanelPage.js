import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import React, { Component } from 'react';
import { Skeleton } from '@databricks/design-system';
import _ from 'lodash';

import { getUUID } from '../../../common/utils/ActionUtils';
import {
  cancelJobRunApi,
  getExperimentApi,
  getJobRunApi,
  setExperimentTagApi,
} from '../../actions';
import AutoMLService from './AutoMLService';
import DatabricksUtils from '../../../common/utils/DatabricksUtils';
import Utils from '../../../common/utils/Utils';
import { AutoMLExperimentPanelView } from './AutoMLExperimentPanelView';

export const AUTOML_TAG_PREFIX = '_databricks_automl';
export const AUTOML_EVALUATION_METRIC_TAG = `${AUTOML_TAG_PREFIX}.evaluation_metric`;
export const AUTOML_EVALUATION_METRIC_ORDER_BY_ASC_TAG =
  AUTOML_TAG_PREFIX + '.evaluation_metric_order_by_asc';

export class AutoMLExperimentPanelPageImpl extends Component {
  static propTypes = {
    experimentId: PropTypes.string.isRequired,
    getExperimentApi: PropTypes.func.isRequired,
    cancelJobRunApi: PropTypes.func.isRequired,
    getJobRunApi: PropTypes.func.isRequired,
    setExperimentTagApi: PropTypes.func.isRequired,
    refreshIntervalMs: PropTypes.number,
    automlExperimentData: PropTypes.object,
    automlWarnings: PropTypes.array,
  };

  reloadExperimentRequestId = getUUID();

  constructor(props) {
    super(props);
    this.state = {
      // placeholder states if we have to fetch the data from AutoML service
      automlServiceExperimentData: null,
      automlServiceWarnings: null,
      refreshing: false,
      jobLink: null,
    };
  }

  async updateExperiment() {
    // Ensure refreshes don't pile up by skipping this refresh if the previous one is not done
    if (this.state.refreshing) {
      return;
    }
    try {
      const automlExperimentData = this.getAutoMLExperimentData();
      // Stop polling after this run if experiment is already in a terminal state.
      if (
        automlExperimentData &&
        ['SUCCESS', 'FAILED', 'CANCELED'].includes(automlExperimentData.state)
      ) {
        clearInterval(this.timerID);
      }
      this.setState({ refreshing: true });

      if (this.shouldUseAutoMLService()) {
        const [experimentResp, warningsResp] = await Promise.all([
          AutoMLService.getAutoMLExperiment(this.props.experimentId),
          AutoMLService.getAutoMLWarnings(this.props.experimentId),
        ]);

        const { experiment } = experimentResp;
        const { warnings } = warningsResp;
        const automlServiceExperimentData = this.camelCaseExperimentData(experiment);
        const automlServiceWarnings = this.camelCaseWarningKeys(warnings);

        // Update refreshing state
        // Ensure we don't set state if component is unmounted
        if (this._ismounted) {
          this.setState({
            automlServiceExperimentData: automlServiceExperimentData,
            automlServiceWarnings: automlServiceWarnings,
            refreshing: false,
            jobLink: automlServiceExperimentData.runPageUrl,
          });
        }
      } else {
        const { jobRunId } = this.getAutoMLExperimentData();

        /*
        If AutoML is started through the GUI and runs as a Databricks job run, it is possible
        that the experiment tags are inconsistent with the job state in case of an error.
        Reconcile job state and experiment state. First we fetch the Job run state (if available),
        and only then the experiment state. This way we avoid the race condition where the
        experiment had correct tags set and we are acting on stale data.
       */
        let jobRun;
        if (jobRunId) {
          jobRun = await this.props.getJobRunApi(jobRunId);
        } else {
          jobRun = await Promise.resolve();
        }

        // trigger the action to refresh the MLflow experiment which will be consumed by
        // ExperimentPage and update it's props which will be passed down here
        await this.props.getExperimentApi(this.props.experimentId, this.reloadExperimentRequestId);

        // Update experiment state according to job run data
        // TODO: Verify we're not overwriting data here
        if (jobRun) {
          const { state } = jobRun.value;
          const setTagPromises = [];
          if (state.result_state === 'FAILED') {
            setTagPromises.push(
              this.props.setExperimentTagApi(
                this.props.experimentId,
                AUTOML_TAG_PREFIX + '.state',
                'FAILED',
              ),
            );
            setTagPromises.push(
              this.props.setExperimentTagApi(
                this.props.experimentId,
                AUTOML_TAG_PREFIX + '.error_message',
                state.state_message,
              ),
            );
          } else if (state.result_state === 'TIMEDOUT') {
            setTagPromises.push(
              this.props.setExperimentTagApi(
                this.props.experimentId,
                AUTOML_TAG_PREFIX + '.state',
                'FAILED',
              ),
            );
            setTagPromises.push(
              this.props.setExperimentTagApi(
                this.props.experimentId,
                AUTOML_TAG_PREFIX + '.error_message',
                'Job run timed out',
              ),
            );
          } else if (state.result_state === 'CANCELED') {
            setTagPromises.push(
              this.props.setExperimentTagApi(
                this.props.experimentId,
                AUTOML_TAG_PREFIX + '.state',
                'CANCELED',
              ),
            );
          }
          await Promise.all(setTagPromises);
        }
        // Update refreshing state
        // Ensure we don't set state if component is unmounted
        if (this._ismounted) {
          this.setState({
            refreshing: false,
            jobLink: jobRun ? jobRun.value.run_page_url : null,
          });
        }
      }
    } catch (e) {
      Utils.logErrorAndNotifyUser(e);
      if (this._ismounted) {
        this.setState({ refreshing: false });
      }
    }
  }

  componentDidMount() {
    this._ismounted = true;
    this.timerID = setInterval(() => this.updateExperiment(), this.props.refreshIntervalMs);
  }

  componentWillUnmount() {
    this._ismounted = false;
    clearInterval(this.timerID);
  }

  cancelJobRun(jobRunId) {
    if (this.shouldUseAutoMLService()) {
      return AutoMLService.cancelAutoMLExperiment(this.props.experimentId).catch((e) =>
        Utils.logErrorAndNotifyUser(e),
      );
    }

    return this.props
      .cancelJobRunApi(jobRunId)
      .then(() =>
        this.props.setExperimentTagApi(
          this.props.experimentId,
          AUTOML_TAG_PREFIX + '.state',
          'CANCELED',
        ),
      )
      .catch((error) => {
        Utils.logErrorAndNotifyUser(error);
      });
  }

  shouldUseAutoMLService() {
    return !!DatabricksUtils.getConf('autoMLServiceAPIUsed');
  }

  camelCaseExperimentData(automlExperimentData) {
    if (!automlExperimentData) {
      return {};
    }
    const experimentData = {};
    for (const [key, value] of Object.entries(automlExperimentData)) {
      const camelCaseKey = _.camelCase(key);
      experimentData[camelCaseKey] = value;
    }
    return experimentData;
  }

  camelCaseWarningKeys(warnings) {
    if (!warnings) {
      return null;
    }
    return warnings.map((warning) => {
      const { name, ...otherKeys } = warning;
      return {
        name: _.camelCase(name),
        ...otherKeys,
      };
    });
  }

  // get automl experiment data from the appropriate source
  getAutoMLExperimentData() {
    if (this.shouldUseAutoMLService()) {
      return this.state.automlServiceExperimentData;
    }
    return this.props.automlExperimentData;
  }

  // get automl warnings data from the appropriate source
  getAutoMLWarnings() {
    if (this.shouldUseAutoMLService()) {
      return this.state.automlServiceWarnings;
    }
    return this.props.automlWarnings;
  }

  render() {
    const automlExperimentData = this.getAutoMLExperimentData();
    const automlWarnings = this.getAutoMLWarnings();

    const cancelFunc = () => {
      this.cancelJobRun(automlExperimentData ? automlExperimentData.jobRunId : null);
    };
    const cancel =
      automlExperimentData &&
      automlExperimentData.jobRunId &&
      automlExperimentData.state === 'RUNNING'
        ? cancelFunc
        : null;

    return (
      <Skeleton
        active
        loading={!automlExperimentData}
        data-test-id='automl-experiment-view-skeleton'
      >
        <AutoMLExperimentPanelView
          automlExperimentData={automlExperimentData || {}}
          automlWarnings={automlWarnings}
          cancelJobRun={cancel}
          jobLink={this.state.jobLink}
        />
      </Skeleton>
    );
  }
}

AutoMLExperimentPanelPageImpl.defaultProps = {
  refreshIntervalMs: 5000,
};

const mapDispatchToProps = {
  cancelJobRunApi,
  getExperimentApi,
  getJobRunApi,
  setExperimentTagApi,
};

export const AutoMLExperimentPanelPage = withRouter(
  connect(null, mapDispatchToProps)(AutoMLExperimentPanelPageImpl),
);
