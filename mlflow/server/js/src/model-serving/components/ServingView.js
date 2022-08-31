import React from 'react';
import PropTypes from 'prop-types';
import '../../common/styles/CodeSnippet.css';

import { Col, Modal, Row } from 'antd';
import { Button, ErrorBorderIcon, Tabs } from '@databricks/design-system';

import { ServingV1ModelEndpointVersionView } from './ServingV1ModelEndpointVersionView';
import { ModelEndpointVersionView } from './ModelEndpointVersionView';
import { StageTagComponents } from '../../model-registry/constants';
import classNames from 'classnames';
import {
  Tooltip,
  ComputeConfigSidebarStatusIcons,
  messages as utilMessages,
  getServingModelKey,
} from '../utils';
import { EditableClusterSettingsView } from './EditableClusterSettingsView';
import { ModelEventsTable } from './ModelEventsTable';
import { injectIntl } from 'react-intl';
import { ModelEventsV2Table } from './ModelEventsV2Table';
import { ServingV2EmptyState } from './ServingV2EmptyState';
import { EndpointState, VersionState, InferenceServiceState } from '../utils';
import { updateEndpointClusterConfigApi, updateEndpointComputeConfigApi } from '../actions';
import { connect } from 'react-redux';
import {
  endpointV1Type,
  endpointV2Type,
  aliasType,
  endpointVersionsV1Type,
  endpointVersionsV2Type,
} from './ServingPropTypes';
import { getModelPageRoute } from '../../model-registry/routes';
import { withRouter } from 'react-router-dom';
import { CircleIcon } from '../../model-registry/utils';
import { EditableComputeSettingsView } from './EditableComputeSettingsView';

const { TabPane } = Tabs;

export class ServingViewImpl extends React.Component {
  static propTypes = {
    modelName: PropTypes.string.isRequired,
    endpoint: endpointV1Type,
    endpointV2: endpointV2Type,
    endpointVersions: endpointVersionsV1Type,
    endpointVersionsV2: endpointVersionsV2Type,
    aliases: PropTypes.arrayOf(aliasType),
    aliasesV2: PropTypes.arrayOf(aliasType),
    events: PropTypes.array,
    eventsV2: PropTypes.array,
    handleDisableServing: PropTypes.func.isRequired,
    handleDisableServingV2: PropTypes.func.isRequired,
    updateEndpointClusterConfigApi: PropTypes.func.isRequired,
    updateEndpointComputeConfigApi: PropTypes.func.isRequired,
    history: PropTypes.object.isRequired,
  };

  iconReady = (<CircleIcon type='READY' />);
  iconPending = (<CircleIcon type='PENDING' />);
  iconFailed = (<CircleIcon type='FAILED' />);

  getAliasesForVersion = (endpointVersionName) => {
    const { endpointV2, aliases, aliasesV2 } = this.props;
    const currAliases = endpointV2 ? aliasesV2 : aliases;

    if (!currAliases) {
      return [];
    }
    const matchingAliases = currAliases.filter((v) => {
      return v.endpoint_version_name === endpointVersionName;
    });
    return matchingAliases.map((v) => v.alias);
  };

  state = {
    enableServingInProgress: false,
    selectedVersionName: null,
    activeTab: '1',
  };

  getClusterTooltip = () => {
    const { endpoint } = this.props;
    if (!endpoint) {
      return null;
    }
    const stateMessage = endpoint.state_message ? endpoint.state_message : 'None';
    const message = <div>Message: {stateMessage}</div>;
    return (
      <div>
        Cluster associated with serving endpoint.
        {message}
      </div>
    );
  };

  componentDidMount = () => {
    this.selectDefaultVersion();
  };

  componentDidUpdate = () => {
    this.selectDefaultVersion();
  };

  selectDefaultVersion = () => {
    if (!this.state.selectedVersionName) {
      if (this.props.endpointVersionsV2 && this.props.endpointVersionsV2.length > 0) {
        this.selectVersion(this.props.endpointVersionsV2[0]);
      } else if (this.props.endpointVersions && this.props.endpointVersions.length > 0) {
        this.selectVersion(this.props.endpointVersions[0]);
      }
    }
  };

  enableDisablementComplete = () => {
    this.setState({ enableServingInProgress: false });
  };

  disableServing = () => {
    this.setState({
      enableServingInProgress: true,
      selectedVersionName: null,
    });

    if (this.props.endpointV2) {
      this.props.handleDisableServingV2(this.enableDisablementComplete);
    } else {
      this.props.handleDisableServing(this.enableDisablementComplete);
    }
  };

  selectVersion = (version) => {
    this.setState({
      selectedVersionName: version.endpoint_version_name,
    });
  };

  isSelected = (version) => {
    return (
      this.state.selectedVersionName &&
      this.state.selectedVersionName === version.endpoint_version_name
    );
  };

  getV1StatusIcon = (version) => {
    if (version.state === VersionState.READY) {
      return <span>{this.iconReady} Ready</span>;
    } else if (version.state === VersionState.PENDING) {
      return <span>{this.iconPending} Pending</span>;
    } else if (version.state === VersionState.LAUNCHING) {
      return <span>{this.iconPending} Launching</span>;
    } else if (version.state === VersionState.FAILED) {
      return <span>{this.iconFailed} Failed</span>;
    }
    return null;
  };

  getV2StatusIcon = (version) => {
    const versionState = version.service_status.state;
    if (
      versionState === InferenceServiceState.READY ||
      versionState === InferenceServiceState.RETRY_REQUESTED
    ) {
      return (
        <span>
          {this.iconReady} {utilMessages.readyLabel}
        </span>
      );
    } else if (versionState === InferenceServiceState.PENDING) {
      return (
        <span>
          {this.iconPending} {utilMessages.pendingLabel}
        </span>
      );
    } else if (
      versionState === InferenceServiceState.FAILED ||
      versionState === InferenceServiceState.UNKNOWN
    ) {
      return (
        <span>
          {this.iconFailed} {utilMessages.failedLabel}
        </span>
      );
    }
    return null;
  };

  renderVersionOnSidebar = (version) => {
    const { endpointVersionsV2 } = this.props;
    const { endpoint_version_name } = version;

    const statusIcon = endpointVersionsV2
      ? this.getV2StatusIcon(version)
      : this.getV1StatusIcon(version);

    const aliases = this.getAliasesForVersion(endpoint_version_name);
    const tagComponents = aliases.map((alias) => StageTagComponents[alias]);
    const containerClassNames = classNames({
      'serving-version-container': true,
      selected: this.isSelected(version),
    });
    const updating_config_status =
      endpointVersionsV2 && version.config_update_status
        ? ComputeConfigSidebarStatusIcons[version.config_update_status.state]
        : null;

    return (
      <div
        key={endpoint_version_name}
        onClick={() => this.selectVersion(version)}
        className={containerClassNames}
        data-test-id='serving-sidebar-version-container'
      >
        <div className='serving-version-status-container'>
          <div className='serving-version-version-num'>Version {endpoint_version_name}</div>
          <div className='serving-version-status-indicator' data-test-id='sidebar-version-status'>
            {statusIcon}
          </div>
        </div>
        <div className='serving-version-status-container'>
          <div className='serving-version-stage-container'>{tagComponents}</div>
          <div className='serving-version-status-indicator' data-test-id='sidebar-config-status'>
            {updating_config_status}
          </div>
        </div>
      </div>
    );
  };

  renderVersionsSidebar = () => {
    const { endpointVersions, endpointVersionsV2 } = this.props;
    if (!endpointVersions && !endpointVersionsV2) {
      return [];
    }
    const versions =
      endpointVersionsV2 && endpointVersionsV2.length > 0
        ? endpointVersionsV2
        : endpointVersions && endpointVersions.length > 0
        ? endpointVersions
        : [];
    const versionCells = versions.map((version) => this.renderVersionOnSidebar(version));
    if (endpointVersionsV2) {
      const modelDetailsCell = (
        <div
          className='serving-version-model-detail-cell'
          key='model-details-cell'
          data-test-id='serving-sidebar-version-model-detail-cell'
        >
          <p className='serving-version-model-detail-cell-content'>
            See your other model versions in the
            <Button
              type='link'
              className='model-details-link-button'
              onClick={() => this.props.history.push(getModelPageRoute(this.props.modelName))}
            >
              {' '}
              model details
            </Button>{' '}
            tab
          </p>
        </div>
      );
      versionCells.push(modelDetailsCell);
      return versionCells;
    } else if (endpointVersions) {
      return versionCells;
    } else {
      return [];
    }
  };

  confirmDisableServing = () => {
    return Modal.confirm({
      title: 'Are you sure you want to stop serving?',
      content: 'Serving of all model versions will be stopped and the cluster will be terminated.',
      okText: 'Stop Serving',
      cancelText: 'Cancel',
      icon: <ErrorBorderIcon />,
      onOk: this.disableServing,
    });
  };

  renderEndpointStatus = () => {
    const { endpoint, endpointV2 } = this.props;
    const state = endpointV2 ? endpointV2.state : endpoint ? endpoint.state : undefined;
    const disableServingButton = (
      <span>
        -{' '}
        <span onClick={this.confirmDisableServing} className='serving-stop-link'>
          Stop
        </span>
      </span>
    );
    if (state === EndpointState.READY) {
      return (
        <span className='serving-endpoint-status'>
          {this.iconReady} Ready {disableServingButton}
        </span>
      );
    } else if (state === EndpointState.PENDING) {
      return (
        <span className='serving-endpoint-status'>
          {this.iconPending} Pending {disableServingButton}
        </span>
      );
    } else if (state === EndpointState.FAILED) {
      return (
        <span className='serving-endpoint-status'>
          {this.iconFailed} Failed {disableServingButton}
        </span>
      );
    }
    return null;
  };

  renderModelEventsTable = () => {
    const { endpointV2, events, eventsV2 } = this.props;
    if (endpointV2) {
      return <ModelEventsV2Table events={eventsV2} />;
    } else {
      return <ModelEventsTable events={events} />;
    }
  };

  changeTab = (activeKey) => {
    this.setState({
      activeTab: activeKey,
    });
  };

  renderVersionDetails = () => {
    const { selectedVersionName } = this.state;
    if (!selectedVersionName) {
      return null;
    }

    const { endpoint, endpointV2 } = this.props;

    if (endpointV2) {
      return (
        <ModelEndpointVersionView
          modelName={this.props.modelName}
          endpointVersionName={selectedVersionName}
          changeTab={this.changeTab}
        />
      );
    } else if (endpoint) {
      return (
        <ServingV1ModelEndpointVersionView
          modelName={this.props.modelName}
          endpointVersionName={selectedVersionName}
        />
      );
    } else {
      return null;
    }
  };

  handleUpdateClusterConfigSubmit = (desiredClusterState) => {
    return this.props.updateEndpointClusterConfigApi(
      null,
      this.props.modelName,
      desiredClusterState,
    );
  };

  handleUpdateComputeConfigSubmit = (stage, desiredComputeConfigSpec) => {
    return this.props.updateEndpointComputeConfigApi(
      this.props.modelName,
      stage,
      desiredComputeConfigSpec,
    );
  };

  renderClusterLink = (modelName) => {
    return (
      <Col className='metadata-entry' span={8}>
        <span className='metadata-header'>Cluster: </span>
        <span className='metadata-info'>
          <a href='/#setting/clusters/automated' target='_blank' rel='noopener noreferrer'>
            mlflow-model-{modelName}
          </a>
          <Tooltip contents={this.getClusterTooltip()} />
        </span>
      </Col>
    );
  };

  renderComputeSettingsView = () => {
    const { modelName, endpoint, endpointV2 } = this.props;
    if (!endpointV2 && endpoint) {
      return (
        <EditableClusterSettingsView
          modelName={modelName}
          endpoint={endpoint}
          handleSubmit={this.handleUpdateClusterConfigSubmit}
        />
      );
    } else if (endpointV2 && endpointV2.compute_config) {
      // when an endpoint is just being created, the compute config will temporarily be undefined,
      // so we need to handle this branch
      return (
        <EditableComputeSettingsView
          modelName={modelName}
          endpoint={endpointV2}
          handleSubmit={this.handleUpdateComputeConfigSubmit}
        />
      );
    } else {
      // this may be rendered very briefly in V1 if endpoint becomes undefined but ServingPane has
      // not been re-rendered.
      return (
        <ServingV2EmptyState
          modelName={modelName}
          dataTestId='serving-compute-settings-empty-state'
          emptyStateHeader={'Please wait until the endpoint is ready to be configured.'}
        />
      );
    }
  };

  getEmptyStateRecommendationText = () => {
    const { endpointV2 } = this.props;
    if (endpointV2 && endpointV2.state === EndpointState.PENDING) {
      return 'The endpoint for this registered model is still being created.';
    } else if (endpointV2 && endpointV2.state === EndpointState.FAILED) {
      return (
        'Something went wrong creating the endpoint for your registered model. ' +
        'Please contact Databricks support.'
      );
    } else {
      return 'Move a model version into Staging or Production to create an endpoint.';
    }
  };

  render = () => {
    const { modelName, endpointV2, endpointVersionsV2 } = this.props;
    const tab3Name = !endpointV2 ? 'Cluster Settings' : 'Compute Settings';
    const tab3Component = this.renderComputeSettingsView();
    const versionsView = (
      <div>
        <div className='serving-main-panel'>
          <div className='serving-versions-panel'>{this.renderVersionsSidebar()}</div>
          <div className='serving-version-details-panel'>{this.renderVersionDetails()}</div>
        </div>
      </div>
    );
    const emptyState = (
      <ServingV2EmptyState
        modelName={this.props.modelName}
        emptyStateHeader={'There are no served versions'}
        emptyStateText={this.getEmptyStateRecommendationText()}
      />
    );
    return (
      <div>
        <Row className='metadata-container'>
          <Col className='metadata-entry' span={8}>
            <span className='metadata-header'>Status: </span>
            <span className='metadata-info' id='serving-endpoint-state'>
              {this.renderEndpointStatus()}
            </span>
          </Col>
          {endpointV2 ? null : this.renderClusterLink(modelName)}
        </Row>
        <Tabs
          activeKey={this.state.activeTab}
          animated={false}
          onChange={this.changeTab}
          type='card'
        >
          <TabPane tab='Model Versions' key='1'>
            {endpointV2 &&
            ((endpointVersionsV2 && endpointVersionsV2.length === 0) || !endpointVersionsV2)
              ? emptyState
              : versionsView}
          </TabPane>
          <TabPane tab='Model Events' key='2'>
            <div className='serving-model-events-panel'>{this.renderModelEventsTable()}</div>
          </TabPane>
          <TabPane tab={tab3Name} key='3'>
            <div data-test-id='serving-compute-settings-panel'>{tab3Component}</div>
          </TabPane>
        </Tabs>
      </div>
    );
  };
}

const mapStateToProps = (state, ownProps) => {
  const { modelName } = ownProps;
  const servingModelKey = getServingModelKey(null, modelName);
  const endpoint = state.entities.endpointStatus[servingModelKey];
  const endpointV2 = state.entities.endpointStatusV2[servingModelKey];
  const endpointVersions = state.entities.endpointVersionStatus[servingModelKey];
  const endpointVersionsV2 = state.entities.endpointVersionStatusV2[servingModelKey];
  const aliases = state.entities.endpointAliases[servingModelKey];
  const aliasesV2 = state.entities.endpointAliasesV2[servingModelKey];
  const events = state.entities.endpointEventHistory
    ? state.entities.endpointEventHistory[servingModelKey]
    : undefined;
  const eventsV2 = state.entities.endpointEventHistoryV2
    ? state.entities.endpointEventHistoryV2[servingModelKey]
    : undefined;
  return {
    modelName,
    endpoint,
    endpointV2,
    endpointVersions,
    endpointVersionsV2,
    aliases,
    aliasesV2,
    events,
    eventsV2,
  };
};

// todo: move these down into cluster config component.
const mapDispatchToProps = {
  updateEndpointClusterConfigApi,
  updateEndpointComputeConfigApi,
};

export const ServingView = withRouter(
  connect(mapStateToProps, mapDispatchToProps)(injectIntl(ServingViewImpl)),
);
