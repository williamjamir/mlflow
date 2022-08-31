import React from 'react';
import PropTypes from 'prop-types';
import { Typography } from '@databricks/design-system';
// TODO: move this into emotion
import '../../common/styles/CodeSnippet.css';

import { CollapsibleSection } from '../../common/components/CollapsibleSection';
import { MetricsView } from './MetricsView';
import {
  getServingModelKey,
  ENDPOINT_VERSIONS,
  mapStateToEndpointVersion,
  mapStateToReplicas,
} from '../utils';
import { FormattedMessage } from 'react-intl';
import { injectIntl } from 'react-intl';
import { Tooltip, InferenceServiceState } from '../utils';
import { getVersionReplicasApi } from '../actions';
import { aliasType, endpointVersionV2Type } from './ServingPropTypes';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { CallModelView } from './CallModelView';
import { ModelUrlContainer } from './ModelUrlContainer';
import { ComputeConfigView } from './ComputeConfigView';
import { EventsView } from './EventsView';
import { LogsView } from './LogsView';

const { Title } = Typography;

const REPLICAS_POLL_INTERVAL = 10000;

export const SERVING_V2_PATH_PREFIX = '/model-endpoint/';

// Serving V2 model version view.
export class ModelEndpointVersionViewImpl extends React.Component {
  static propTypes = {
    modelName: PropTypes.string.isRequired,
    endpointVersionName: PropTypes.string.isRequired,
    changeTab: PropTypes.func.isRequired,
    // redux state
    endpointVersion: endpointVersionV2Type,
    aliases: PropTypes.arrayOf(aliasType),
    replicas: PropTypes.array,
    // redux actions
    getVersionReplicasApi: PropTypes.func.isRequired,
  };

  state = {
    pollReplicasIntervalId: null,
  };

  componentDidMount = () => {
    const { modelName, endpointVersionName } = this.props;
    if (!this.state.pollReplicasIntervalId) {
      this.setState({
        pollReplicasIntervalId: setInterval(this.reloadVersionReplicas, REPLICAS_POLL_INTERVAL),
      });
    }
    this.props.getVersionReplicasApi(modelName, endpointVersionName);
  };

  componentWillUnmount = () => {
    if (this.state.pollReplicasIntervalId) {
      clearInterval(this.state.pollReplicasIntervalId);
      this.setState({
        pollReplicasIntervalId: null,
      });
    }
  };

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.endpointVersionName !== this.props.endpointVersionName) {
      const { modelName, endpointVersionName } = this.props;
      this.props.getVersionReplicasApi(modelName, endpointVersionName);
    }
  }

  reloadVersionReplicas = () => {
    const { modelName, endpointVersionName } = this.props;
    this.props.getVersionReplicasApi(modelName, endpointVersionName);
  };

  renderCallModelView = () => {
    const { endpointVersion } = this.props;
    const isModelVersionReady =
      endpointVersion &&
      endpointVersion.service_status &&
      endpointVersion.service_status.state === InferenceServiceState.READY;
    return (
      <CallModelView
        modelName={this.props.modelName}
        servingVersion={ENDPOINT_VERSIONS.V2}
        endpointVersionName={this.props.endpointVersionName}
        invocationPathPrefix={SERVING_V2_PATH_PREFIX}
        isModelVersionReady={isModelVersionReady}
      />
    );
  };

  metricsTooltip = (
    <div>
      <FormattedMessage
        defaultMessage='Newly emitted metrics may take a few minutes to be available.
        The graph will be updated automatically every 10 seconds. Note that rate limited requests
        and requests that fail authentication are not included in these metrics. Also note that
        there may be temporary spikes in the number of replicas when a compute config change is
        pending.'
        description='Tooltip for metrics section'
      />
    </div>
  );

  renderMetricsView = () => {
    return (
      <div className='serving-metrics-container'>
        <CollapsibleSection
          title={
            <div>
              <FormattedMessage
                defaultMessage='Metrics'
                description="Title text for metrics section on model version's serving page"
              />
              <Tooltip contents={this.metricsTooltip} />
            </div>
          }
        >
          <MetricsView
            modelName={this.props.modelName}
            endpointVersionName={this.props.endpointVersionName}
          />
        </CollapsibleSection>
      </div>
    );
  };

  render = () => {
    const { aliases, changeTab, endpointVersionName, modelName } = this.props;
    return (
      <div>
        <Title withoutMargins level={3}>
          Version {endpointVersionName}
        </Title>
        <ComputeConfigView
          modelName={modelName}
          endpointVersionName={endpointVersionName}
          changeTab={changeTab}
        />
        <ModelUrlContainer
          modelName={modelName}
          endpointVersionName={endpointVersionName}
          aliases={aliases}
          invocationPathPrefix={SERVING_V2_PATH_PREFIX}
        />
        {this.renderCallModelView()}
        {this.renderMetricsView()}
        <LogsView modelName={modelName} endpointVersionName={endpointVersionName} />
        <EventsView modelName={modelName} endpointVersionName={endpointVersionName} />
      </div>
    );
  };
}

const mapStateToProps = (state, ownProps) => {
  const { modelName, endpointVersionName } = ownProps;
  const servingModelKey = getServingModelKey(null, modelName);
  const endpointVersion = mapStateToEndpointVersion(state, ownProps);
  const modelAliases = state.entities.endpointAliasesV2[servingModelKey] || [];
  const matchingAliases = modelAliases.filter((v) => {
    return v.endpoint_version_name === endpointVersionName;
  });
  const aliases = matchingAliases.map((v) => v.alias);
  const replicas = mapStateToReplicas(state, ownProps);
  return {
    endpointVersion,
    aliases,
    replicas,
  };
};

const mapDispatchToProps = {
  getVersionReplicasApi,
};

export const ModelEndpointVersionView = withRouter(
  connect(mapStateToProps, mapDispatchToProps)(injectIntl(ModelEndpointVersionViewImpl)),
);
