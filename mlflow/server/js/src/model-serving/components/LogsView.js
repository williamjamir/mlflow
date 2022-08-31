import React from 'react';
import PropTypes from 'prop-types';
import { Radio } from 'antd';
import { Tabs } from '@databricks/design-system';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { FormattedMessage, injectIntl } from 'react-intl';

import { CollapsibleSection } from '../../common/components/CollapsibleSection';
import {
  getServingModelKey,
  endpointVersionInTerminalState,
  suppressResourceDoesNotExist,
  mapStateToEndpointVersion,
  mapStateToReplicas,
} from '../utils';
import { LogsV2TextArea } from './LogsV2TextArea';
import { getEndpointVersionLogsV2Api, getEndpointVersionBuildLogsApi } from '../actions';
import { endpointVersionV2Type } from './ServingPropTypes';
import { LogTypes } from '../utils';

const { TabPane } = Tabs;

export const ALL_LOGS_TAB_NAME = 'All Replicas';
const REPLICA_PREFIX = 'Replica';

// Serving V2 logs view.
export class LogsViewImpl extends React.Component {
  static propTypes = {
    modelName: PropTypes.string.isRequired,
    endpointVersionName: PropTypes.string.isRequired,
    // redux state
    endpointVersion: endpointVersionV2Type,
    replicas: PropTypes.array,
    versionBuildLogs: PropTypes.array,
    // redux actions
    getEndpointVersionLogsV2Api: PropTypes.func.isRequired,
    getEndpointVersionBuildLogsApi: PropTypes.func.isRequired,
  };

  state = {
    activeLogsReplica: null,
    logType: LogTypes.SERVICE_LOGS,
  };

  getBuildLogsIfRequired = () => {
    if (
      !this.props.versionBuildLogs &&
      endpointVersionInTerminalState(this.props.endpointVersion.service_status.state)
    ) {
      this.props
        .getEndpointVersionBuildLogsApi(this.props.modelName, this.props.endpointVersionName)
        .catch(suppressResourceDoesNotExist);
    }
  };

  componentDidMount = () => {
    const { modelName, endpointVersionName } = this.props;
    this.props.getEndpointVersionLogsV2Api(modelName, endpointVersionName);
    this.getBuildLogsIfRequired();
  };

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.endpointVersionName !== this.props.endpointVersionName) {
      const { modelName, endpointVersionName } = this.props;
      this.props.getEndpointVersionLogsV2Api(modelName, endpointVersionName);
      this.getBuildLogsIfRequired();
    }
    const prevEndpointVersionState =
      prevProps.endpointVersion && prevProps.endpointVersion.service_status
        ? prevProps.endpointVersion.service_status.state
        : undefined;
    // this condition covers:
    // 1. An endpoint version transitioned from PENDING to READY, so we should trigger a call.
    // 2. You switched from another endpoint version to this one and so we want to fetch build logs
    //    if available.
    // 3. This is the first time the component is mounting to an endpoint version, so its previous
    //    props did not contain an endpoint version. Therefore, we attempt to evaluate the new
    //    endpoint version to see if we need to fetch its build logs.
    if (
      this.props.endpointVersion &&
      this.props.endpointVersion.service_status &&
      prevProps.endpointVersionName === this.props.endpointVersionName &&
      prevEndpointVersionState !== this.props.endpointVersion.service_status.state
    ) {
      this.getBuildLogsIfRequired();
    }
  }

  reloadV2Logs = (replicaId) => {
    const { modelName, endpointVersionName } = this.props;
    const newReplicaId = replicaId === ALL_LOGS_TAB_NAME ? null : replicaId;
    this.setState({ activeLogsReplica: newReplicaId });
    this.props.getEndpointVersionLogsV2Api(modelName, endpointVersionName, newReplicaId);
  };

  onLogsV2TabClicked = (selectedTab) => {
    this.reloadV2Logs(selectedTab);
  };

  onLogRadioButtonSelectorClicked = (logsElem) => {
    this.setState({ logType: logsElem.target.value });
  };

  render = () => {
    const { logType } = this.state;
    const { modelName, endpointVersionName } = this.props;
    const replicas = this.props.replicas ? this.props.replicas : [];

    const getReplicaStatusLabel = (status) => {
      let statusLabel;
      switch (status) {
        case 'PENDING':
        case 'CONTAINERCREATING':
          statusLabel = messages.replicaStatusPendingLabel;
          break;
        case 'RUNNING':
          statusLabel = messages.replicaStatusRunningLabel;
          break;
        case 'TERMINATING':
          statusLabel = messages.replicaStatusTerminatingLabel;
          break;
        case 'SUCCEEDED':
        case 'FAILED':
          statusLabel = messages.replicaStatusTerminatedLabel;
          break;
        default:
          statusLabel = messages.replicaStatusErrorLabel;
      }
      return statusLabel;
    };

    const renderLogs = () => {
      if (logType === LogTypes.SERVICE_LOGS) {
        const allTab = (
          <TabPane
            tab={
              <span>
                <FormattedMessage
                  defaultMessage={ALL_LOGS_TAB_NAME}
                  description='Tab name for tab to display merged view of all replica logs'
                />{' '}
              </span>
            }
            key={ALL_LOGS_TAB_NAME}
          >
            <LogsV2TextArea
              modelName={modelName}
              endpointVersionName={endpointVersionName}
              activeReplica={null}
              logType={LogTypes.SERVICE_LOGS}
            />
          </TabPane>
        );
        const tabs = [allTab].concat(
          replicas.map((replica) => (
            <TabPane
              tab={
                <span>
                  {REPLICA_PREFIX + '-' + replica.replica_name}
                  {' ('}
                  {getReplicaStatusLabel(replica.last_known_status)}
                  {') '}
                </span>
              }
              key={replica.replica_id}
            >
              <LogsV2TextArea
                modelName={modelName}
                endpointVersionName={endpointVersionName}
                activeReplica={replica.replica_id}
                logType={LogTypes.SERVICE_LOGS}
              />
            </TabPane>
          )),
        );
        return (
          <Tabs id='version_logs_tabs' animated={false} onChange={this.onLogsV2TabClicked}>
            {tabs}
          </Tabs>
        );
      } else if (logType === LogTypes.BUILD_LOGS) {
        return (
          <LogsV2TextArea
            modelName={modelName}
            endpointVersionName={endpointVersionName}
            activeReplica={null}
            logType={LogTypes.BUILD_LOGS}
            defaultString='Build logs not available yet.'
          />
        );
      }
      return '';
    };

    return (
      <div className='servingv2-logs-container'>
        <CollapsibleSection
          title={
            <FormattedMessage
              defaultMessage='Logs'
              description="Title text for logs section on model version's serving page"
            />
          }
        >
          <div className='servingv2-log-type-select'>
            <Radio.Group onChange={this.onLogRadioButtonSelectorClicked} value={logType}>
              <Radio.Button value={LogTypes.SERVICE_LOGS}>
                <FormattedMessage
                  defaultMessage='Service Logs'
                  description="Tab text for service logs on the model version's serving page"
                />
              </Radio.Button>
              <Radio.Button value={LogTypes.BUILD_LOGS}>
                <FormattedMessage
                  defaultMessage='Build Logs'
                  description="Tab text for build logs on the model version's serving page"
                />
              </Radio.Button>
            </Radio.Group>
          </div>
          <div className='servingv2-logs-content'>{renderLogs(logType)}</div>
        </CollapsibleSection>
      </div>
    );
  };
}

const messages = {
  replicaStatusPendingLabel: (
    <FormattedMessage
      defaultMessage='Pending'
      description='Pending replica status label for serving V2 logs panel'
    />
  ),
  replicaStatusRunningLabel: (
    <FormattedMessage
      defaultMessage='Running'
      description='Running replica status label for serving V2 logs panel'
    />
  ),
  replicaStatusTerminatingLabel: (
    <FormattedMessage
      defaultMessage='Terminating'
      description='Terminating replica status label for serving V2 logs panel'
    />
  ),
  replicaStatusTerminatedLabel: (
    <FormattedMessage
      defaultMessage='Terminated'
      description='Terminated replica status label for serving V2 logs panel'
    />
  ),
  replicaStatusErrorLabel: (
    <FormattedMessage
      defaultMessage='Error'
      description='Error replica status label for serving V2 logs panel'
    />
  ),
};

const mapStateToProps = (state, ownProps) => {
  const { modelName, endpointVersionName } = ownProps;
  const servingModelKey = getServingModelKey(null, modelName);
  const endpointVersion = mapStateToEndpointVersion(state, ownProps);
  const replicas = mapStateToReplicas(state, ownProps);
  const modelBuildLogs = state.entities.endpointV2BuildLogsByModelVersion[servingModelKey] || {};
  const versionBuildLogs = modelBuildLogs[endpointVersionName] || undefined;
  return {
    endpointVersion,
    replicas,
    versionBuildLogs,
  };
};

const mapDispatchToProps = {
  getEndpointVersionLogsV2Api,
  getEndpointVersionBuildLogsApi,
};

export const LogsView = withRouter(
  connect(mapStateToProps, mapDispatchToProps)(injectIntl(LogsViewImpl)),
);
