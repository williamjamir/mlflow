import React from 'react';
import PropTypes from 'prop-types';
import { Button, Typography } from '@databricks/design-system';

import Utils from '../../common/utils/Utils';
import {
  ComputeConfigStatusIcons,
  mapStateToEndpointVersion,
  mapStateToReplicas,
  getWorkloadInfo,
} from '../utils';
import { FormattedMessage } from 'react-intl';
import { injectIntl } from 'react-intl';
import { InferenceServiceState } from '../utils';
import { endpointVersionV2Type } from './ServingPropTypes';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { CONCURRENCY_PER_REPLICA } from '../constants';

const { Text } = Typography;

// Serving V2 compute config view.
export class ComputeConfigViewImpl extends React.Component {
  static propTypes = {
    modelName: PropTypes.string.isRequired,
    endpointVersionName: PropTypes.string.isRequired,
    changeTab: PropTypes.func.isRequired,
    // redux state
    endpointVersion: endpointVersionV2Type,
    supportedServingV2WorkloadSizes: PropTypes.array.isRequired,
    replicas: PropTypes.array,
  };

  renderComputeConfigContainer = (
    config,
    status,
    message,
    renderProvisionedConcurrency,
    confirmModal,
    button,
  ) => {
    if (!config) {
      return null;
    }
    const workloadInfo = getWorkloadInfo(
      config.workload_spec.workload_size_id,
      config.workload_spec.scale_to_zero_enabled,
      this.props.supportedServingV2WorkloadSizes,
    );

    const numProvisionedConcurrency =
      renderProvisionedConcurrency && this.props.replicas
        ? ' (' +
          this.props.replicas.filter((r) => {
            return r.last_known_status === 'RUNNING';
          }).length *
            CONCURRENCY_PER_REPLICA +
          ' provisioned)'
        : null;
    const concurrency =
      workloadInfo.min_concurrency === workloadInfo.max_concurrency ? (
        <span>
          {workloadInfo.min_concurrency}
          {numProvisionedConcurrency}
        </span>
      ) : (
        <span>
          {workloadInfo.min_concurrency}-{workloadInfo.max_concurrency}
          {numProvisionedConcurrency}
        </span>
      );
    const rowClassName = 'serving-version-compute-config-row';
    const childClassName = 'serving-version-compute-config-container-child';
    return (
      <div
        className='serving-version-compute-config-container'
        data-test-id='compute-config-container'
      >
        <div className={rowClassName}>
          <div className={childClassName} data-test-id='compute-config-status'>
            <div>{messages.statusLabel}</div>
            {status}
          </div>
          <div className={childClassName} data-test-id='compute-config-concurrency'>
            <div>{messages.concurrencyLabel}</div>
            <Text className='compute-config-values'>{concurrency}</Text>
          </div>
        </div>
        <div className={rowClassName}>
          <div className={childClassName} data-test-id='compute-config-message'>
            {message}
          </div>
        </div>
      </div>
    );
  };

  getLastUpdatedMessage = (config) => {
    if (!config) {
      return null;
    }
    return (
      <span>
        <FormattedMessage
          defaultMessage='Last updated by {userId} at {timestamp}'
          description='Last updated message for compute config'
          values={{
            userId: config.user_id,
            timestamp: Utils.formatTimestamp(config.creation_timestamp),
          }}
        />
      </span>
    );
  };

  renderCurrentComputeContainer = () => {
    const versionStatus = this.props.endpointVersion;
    if (!versionStatus || !versionStatus.service_status) {
      return null;
    }
    const deployedConfig = versionStatus.service_status.config;
    const currentStatus = ComputeConfigStatusIcons[versionStatus.service_status.state];
    const currentMessage = this.getLastUpdatedMessage(deployedConfig);
    return this.renderComputeConfigContainer(deployedConfig, currentStatus, currentMessage, true);
  };

  renderInProgressComputeContainer = () => {
    const versionStatus = this.props.endpointVersion;
    if (
      !versionStatus ||
      !versionStatus.config_update_status ||
      versionStatus.config_update_status === {}
    ) {
      return null;
    }
    const inProgressConfig = versionStatus.config_update_status.config;
    const configStatus = versionStatus.config_update_status.state;
    const isConfigFailed = configStatus === InferenceServiceState.FAILED;

    return isConfigFailed
      ? this.renderComputeConfigContainer(
          inProgressConfig,
          ComputeConfigStatusIcons[configStatus],
          <FormattedMessage
            // Reported during ESLint upgrade
            // eslint-disable-next-line max-len
            defaultMessage='Your current compute is still active. You can retry this configuration update or update to another configuration through the <linkButton>Compute Settings tab</linkButton>.'
            description='Message for compute config update failure'
            values={{
              linkButton: (text) => (
                <Button
                  className='update-compute-config-link'
                  data-test-id='serving-failed-compute-tab-link'
                  type='link'
                  onClick={() => {
                    this.props.changeTab('3'); // TODO(ML-20435): put current tab in redux store
                  }}
                >
                  {text}
                </Button>
              ),
            }}
          />,
          false,
        )
      : this.renderComputeConfigContainer(
          inProgressConfig,
          ComputeConfigStatusIcons[configStatus],
          this.getLastUpdatedMessage(inProgressConfig),
          false,
        );
  };

  render = () => {
    return (
      <div className='serving-version-compute-config-container-wrapper'>
        {this.renderCurrentComputeContainer()}
        {this.renderInProgressComputeContainer()}
      </div>
    );
  };
}

const messages = {
  statusLabel: (
    <FormattedMessage defaultMessage='Status:' description='Status label for compute config' />
  ),
  instanceLabel: (
    <FormattedMessage
      defaultMessage='Instance Size:'
      description='Instance label for compute config'
    />
  ),
  replicasLabel: (
    <FormattedMessage defaultMessage='Replicas:' description='Replicas label for compute config' />
  ),
  concurrencyLabel: (
    <FormattedMessage
      defaultMessage='Provisioned Concurrency:'
      description='Concurrency label for compute config'
    />
  ),
};

const mapStateToProps = (state, ownProps) => {
  const endpointVersion = mapStateToEndpointVersion(state, ownProps);
  const { supportedServingV2WorkloadSizes } = state.entities;
  const replicas = mapStateToReplicas(state, ownProps);
  return {
    endpointVersion,
    supportedServingV2WorkloadSizes,
    replicas,
  };
};

export const ComputeConfigView = withRouter(
  connect(mapStateToProps)(injectIntl(ComputeConfigViewImpl)),
);
