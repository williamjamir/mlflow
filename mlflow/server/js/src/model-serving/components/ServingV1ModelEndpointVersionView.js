import React from 'react';
import PropTypes from 'prop-types';
import { Tabs, Typography } from '@databricks/design-system';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import '../../common/styles/CodeSnippet.css';

import { CallModelView } from './CallModelView';
import { ENDPOINT_VERSIONS, getServingModelKey, VersionState } from '../utils';
import { LogsContainer } from './LogsContainer';
import { VersionEventsContainer } from './VersionEventsContainer';
import { getEndpointVersionLogsApi } from '../actions';
import { endpointVersionV1Type } from './ServingPropTypes';
import { ModelUrlContainer } from './ModelUrlContainer';

const { TabPane } = Tabs;
const { Title } = Typography;

export const SERVING_V1_PATH_PREFIX = '/model/';

export class ServingV1ModelEndpointVersionViewImpl extends React.Component {
  static propTypes = {
    modelName: PropTypes.string.isRequired,
    endpointVersionName: PropTypes.string.isRequired,
    // redux state
    endpointVersion: endpointVersionV1Type,
    aliases: PropTypes.arrayOf(PropTypes.string),
    events: PropTypes.array,
    logs: PropTypes.string.isRequired,
    // redux actions
    getEndpointVersionLogsApi: PropTypes.func.isRequired,
  };

  componentDidMount() {
    const { modelName, endpointVersionName } = this.props;
    this.props.getEndpointVersionLogsApi(null, modelName, endpointVersionName);
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.endpointVersionName !== this.props.endpointVersionName) {
      const { modelName, endpointVersionName } = this.props;
      this.props.getEndpointVersionLogsApi(null, modelName, endpointVersionName);
    }
  }

  reloadLogs = () => {
    const { modelName, endpointVersionName } = this.props;
    this.props.getEndpointVersionLogsApi(null, modelName, endpointVersionName);
  };

  onLogsTabClicked = (selectedTab) => {
    if (selectedTab === '1') {
      this.reloadLogs();
    }
  };

  renderModelUrlContainer = () => {
    return (
      <ModelUrlContainer
        modelName={this.props.modelName}
        endpointVersionName={this.props.endpointVersionName}
        aliases={this.props.aliases}
        invocationPathPrefix={SERVING_V1_PATH_PREFIX}
      />
    );
  };

  renderCallModelView = () => {
    const { endpointVersion } = this.props;
    const isModelVersionReady = endpointVersion && endpointVersion.state === VersionState.READY;
    return (
      <CallModelView
        modelName={this.props.modelName}
        servingVersion={ENDPOINT_VERSIONS.V1}
        endpointVersionName={this.props.endpointVersionName}
        invocationPathPrefix={SERVING_V1_PATH_PREFIX}
        isModelVersionReady={isModelVersionReady}
      />
    );
  };

  renderLogsV1Container = () => {
    const { events, endpointVersionName, logs } = this.props;
    return (
      <div className='version-tabs'>
        <Tabs id='version_logs_and_events_tabs' onChange={this.onLogsTabClicked}>
          <TabPane id='version_logs_tab' tab='Logs' key='1'>
            <LogsContainer versionLogs={logs} />
          </TabPane>
          <TabPane id='version_events_tab' tab='Version Events' key='2'>
            <VersionEventsContainer events={events} selectedVersionName={endpointVersionName} />
          </TabPane>
        </Tabs>
      </div>
    );
  };

  render = () => {
    const { endpointVersionName } = this.props;
    return (
      <div>
        <Title withoutMargins level={3}>
          Version {endpointVersionName}
        </Title>
        {this.renderModelUrlContainer()}
        {this.renderCallModelView()}
        {this.renderLogsV1Container()}
      </div>
    );
  };
}

const mapStateToProps = (state, ownProps) => {
  const { modelName, endpointVersionName } = ownProps;
  const servingModelKey = getServingModelKey(null, modelName);
  const endpointVersions = state.entities.endpointVersionStatus[servingModelKey];
  const matchingVersions =
    endpointVersions && endpointVersions.length > 0
      ? endpointVersions.filter((v) => v.endpoint_version_name === endpointVersionName)
      : [];
  const endpointVersion = matchingVersions.length > 0 ? matchingVersions[0] : null;
  const modelAliases = state.entities.endpointAliases[servingModelKey] || [];
  const matchingAliases = modelAliases.filter((v) => {
    return v.endpoint_version_name === endpointVersionName;
  });
  const aliases = matchingAliases.map((v) => v.alias);
  const events = state.entities.endpointEventHistory
    ? state.entities.endpointEventHistory[servingModelKey]
    : undefined;
  const modelLogs = state.entities.endpointLogsByModelVersion[servingModelKey] || {};
  const logs = modelLogs[endpointVersionName] || '';
  return {
    modelName,
    endpointVersionName,
    endpointVersion,
    aliases,
    events,
    logs,
  };
};

const mapDispatchToProps = {
  getEndpointVersionLogsApi,
};

export const ServingV1ModelEndpointVersionView = withRouter(
  connect(mapStateToProps, mapDispatchToProps)(injectIntl(ServingV1ModelEndpointVersionViewImpl)),
);
