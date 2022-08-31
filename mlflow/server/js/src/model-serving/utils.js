import DatabricksUtils from '../common/utils/DatabricksUtils';

import { DatabricksModelServingDocUrl } from '../common/constants-databricks';
import _ from 'lodash';
import { CloudProvider } from '../shared/constants-databricks';
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import {
  Popover,
  QuestionMarkFillIcon,
  Typography,
  useDesignSystemTheme,
} from '@databricks/design-system';
import { ReadyIcon } from '../model-registry/utils';
import { DuboisCascader } from '../shared/building_blocks/Cascader';

const { Text } = Typography;

export const ENDPOINT_VERSIONS = {
  V1: 'V1',
  V2: 'V2',
};

export const ONE_HOUR_MS = 60 * 60 * 1000;

export const messages = {
  readyLabel: (
    <FormattedMessage
      defaultMessage='Ready'
      description='Ready label for the state of the model scoring service'
    />
  ),
  pendingLabel: (
    <FormattedMessage
      defaultMessage='Pending'
      description='Pending label for the state of the model scoring service'
    />
  ),
  failedLabel: (
    <FormattedMessage
      defaultMessage='Failed'
      description='Failed label for the state of the model scoring service'
    />
  ),
  retryRequestedLabel: (
    <FormattedMessage
      defaultMessage='Retry Requested'
      description='Retry requested label for the state of the model scoring service'
    />
  ),
  updatingLabel: (
    <FormattedMessage
      defaultMessage='Updating'
      description='Pending label for compute config in version sidebar'
    />
  ),
  updateFailedLabel: (
    <FormattedMessage
      defaultMessage='Update Failed'
      description='Failed label for compute config in version sidebar'
    />
  ),
};

function ServiceStateReady() {
  return (
    <span>
      <ReadyIcon />
      <Text bold color='success'>
        {' '}
        {messages.readyLabel}
      </Text>
    </span>
  );
}

export const ComputeConfigStatusIcons = {
  SERVICE_STATE_READY: <ServiceStateReady />,
  SERVICE_STATE_PENDING: (
    <span>
      <i className='fa fa-spinner fa-spin icon-pending model-version-status-icon' />
      <span className='pending-text'> {messages.pendingLabel}</span>
    </span>
  ),
  SERVICE_STATE_UNKNOWN: (
    <span>
      <i className='fa fa-spinner fa-spin icon-pending model-version-status-icon' />
      <span className='pending-text'> {messages.pendingLabel}</span>
    </span>
  ),
  SERVICE_STATE_RETRY_REQUESTED: (
    <span>
      <i className='fa fa-spinner fa-spin icon-pending model-version-status-icon' />
      <span className='pending-text'> {messages.retryRequestedLabel}</span>
    </span>
  ),
  SERVICE_STATE_FAILED: (
    <span>
      <i className='fa fa-exclamation-triangle icon-fail model-version-status-icon' />
      <span className='error-text'> {messages.failedLabel}</span>
    </span>
  ),
};

export const ComputeConfigSidebarStatusIcons = {
  SERVICE_STATE_READY: null,
  SERVICE_STATE_PENDING: (
    <span>
      <i className='fa fa-spinner fa-spin icon-pending model-version-status-icon' />
      <span className='pending-text'> {messages.updatingLabel}</span>
    </span>
  ),
  SERVICE_STATE_RETRY_REQUESTED: (
    <span>
      <i className='fa fa-spinner fa-spin icon-pending model-version-status-icon' />
      <span className='pending-text'> {messages.updatingLabel}</span>
    </span>
  ),
  SERVICE_STATE_UNKNOWN: (
    <span>
      <i className='fa fa-spinner fa-spin icon-pending model-version-status-icon' />
      <span className='pending-text'> {messages.updatingLabel}</span>
    </span>
  ),
  SERVICE_STATE_FAILED: (
    <span>
      <i className='fa fa-exclamation-triangle icon-fail model-version-status-icon' />
      <span className='error-text'> {messages.updateFailedLabel}</span>
    </span>
  ),
};

export const getServingModelKey = (experimentId, registeredModelName) => {
  if (experimentId === null || experimentId === undefined) {
    return `model=${registeredModelName}`;
  } else {
    return `experiment=${experimentId}`;
  }
};

export const getModelServingDocsUri = () => {
  const cloudProvider = DatabricksUtils.getCloudProvider() || CloudProvider.AWS;
  return DatabricksModelServingDocUrl[cloudProvider];
};

export const isValidNode = (node) => {
  if (node.is_deprecated || node.is_hidden) {
    return false;
  }
  // Todo : Remove this check once GPU support is added.
  if (node.num_gpus && node.num_gpus > 0) {
    return false;
  }
  if (node.node_info && node.node_info.status) {
    if (
      !_.isEmpty(
        _.intersection(['NotEnabledOnSubscription', 'NotAvailableInRegion'], node.node_info.status),
      )
    ) {
      return false;
    }
  }
  return true;
};

export const getServingRequestHeaders = (type, servingVersion) => {
  if (servingVersion === ENDPOINT_VERSIONS.V1 && type && type === VersionDataType.DATAFRAME) {
    return 'application/json; format=pandas-records';
  }
  return 'application/json';
};

// Certain APIs return INVALID_PARAMETER_VALUE if the target object is not valid
// (e.g., if the model is not being served). This situation is perfectly fine,
// so do not throw an exception.
// If the error does not match, this will re-throw the original exception.
export const suppressInvalidParameterValue = (e) => {
  if (
    e.getStatus() === 400 &&
    e.getErrorCode !== undefined &&
    e.getErrorCode() === 'INVALID_PARAMETER_VALUE'
  ) {
    return;
  }
  throw e;
};

// Certain APIs return RESOURCE_DOES_NOT_EXIST if the target object does not exist.
// (e.g., if the model is not being served in serving V2). This situation is perfectly fine,
// so do not throw an exception.
// If the error does not match, this will re-throw the original exception.
export const suppressResourceDoesNotExist = (e) => {
  if (
    e.getStatus() === 404 &&
    e.getErrorCode !== undefined &&
    e.getErrorCode() === 'RESOURCE_DOES_NOT_EXIST'
  ) {
    return;
  }
  throw e;
};

export function Tooltip({ contents }) {
  return (
    <Popover overlayClassName='serving-tooltip' content={contents} placement='bottom'>
      <QuestionMarkFillIcon css={{ marginLeft: 4 }} />
    </Popover>
  );
}

Tooltip.propTypes = {
  contents: PropTypes.any,
};

export function NodeLabel({ nodeInfo }) {
  const { theme } = useDesignSystemTheme();
  const MB_PER_GB = 1024;
  const nodeType = nodeInfo.nodeTypeId;
  const memoryGb = (nodeInfo.memory / MB_PER_GB).toFixed(1);
  const nodeMemory = `${memoryGb} GB Memory`;
  const numCores = nodeInfo.numCores + ' Cores';
  const addInfo = [nodeMemory, numCores];

  return (
    <span className='node-label' css={styles.clusterLabel}>
      <Text css={{ marginRight: theme.spacing.lg }}>{nodeType}</Text>
      <Text>{addInfo.join(', ')}</Text>
    </span>
  );
}
NodeLabel.propTypes = {
  nodeInfo: PropTypes.object,
};

const prepareSupportedClusterNodes = (supportedClusterNodes) => {
  const displaySupportedClusterNodeTypes = [];
  if (supportedClusterNodes) {
    _.forEach(supportedClusterNodes, (nodeTypes, category) => {
      const children = [];
      _.forEach(nodeTypes, (nodeType) => {
        children.push({
          value: nodeType.nodeTypeId,
          label: <NodeLabel nodeInfo={nodeType} />,
        });
      });
      const currentCategory = {
        value: category,
        label: category,
        children: children,
      };
      displaySupportedClusterNodeTypes.push(currentCategory);
    });
  }
  return displaySupportedClusterNodeTypes;
};

export const getCategoryAndNodeInfo = (nodeId, supportedClusterNodes) => {
  if (supportedClusterNodes) {
    for (const category of Object.keys(supportedClusterNodes)) {
      for (const nodeType of supportedClusterNodes[category]) {
        if (nodeId === nodeType.nodeTypeId) {
          return {
            category: category,
            nodeInfo: nodeType,
          };
        }
      }
    }
  }
  return null;
};

export const getWorkloadInfo = (workloadSizeId, scaleToZeroEnabled, servingV2WorkloadSizes) => {
  if (servingV2WorkloadSizes) {
    const currentWorkloadSize = servingV2WorkloadSizes.find(
      (workloadSize) => workloadSize.key === workloadSizeId,
    );
    const workloadInfo = {
      ...currentWorkloadSize,
      min_concurrency: scaleToZeroEnabled ? 0 : currentWorkloadSize.min_concurrency,
    };
    return workloadInfo;
  }
  return null;
};

export function ClusterDropdown({ supportedClusterNodes, defaultValue, displayRender, onChange }) {
  return (
    <DuboisCascader
      options={prepareSupportedClusterNodes(supportedClusterNodes)}
      className='editable-cluster-settings-cascader'
      css={styles.sectionStyle}
      expandTrigger='hover'
      defaultValue={defaultValue}
      displayRender={displayRender}
      onChange={onChange}
      allowClear={false}
    />
  );
}

ClusterDropdown.propTypes = {
  supportedClusterNodes: PropTypes.object,
  supportedServingV2NodeTypes: PropTypes.array,
  defaultValue: PropTypes.array,
  displayRender: PropTypes.func,
  onChange: PropTypes.func,
  v2: PropTypes.bool,
};

const styles = {
  clusterLabel: {
    display: 'flex',
  },
  sectionStyle: {
    width: '600px',
  },
};

export const ClientLanguages = {
  BROWSER: 'Browser',
  CURL: 'Curl',
  PYTHON: 'Python',
};

export const EndpointState = {
  READY: 'ENDPOINT_STATE_READY',
  PENDING: 'ENDPOINT_STATE_PENDING',
  FAILED: 'ENDPOINT_STATE_FAILED',
};

// Only used in Serving V1
export const VersionState = {
  READY: 'VERSION_STATE_READY',
  PENDING: 'VERSION_STATE_PENDING',
  FAILED: 'VERSION_STATE_FAILED',
  LAUNCHING: 'VERSION_STATE_LAUNCHING',
};

export const InferenceServiceState = {
  UNKNOWN: 'SERVICE_STATE_UNKNOWN',
  PENDING: 'SERVICE_STATE_PENDING',
  READY: 'SERVICE_STATE_READY',
  FAILED: 'SERVICE_STATE_FAILED',
  RETRY_REQUESTED: 'SERVICE_STATE_RETRY_REQUESTED',
};

export const VersionDataType = {
  DATAFRAME: 'dataframe',
  TENSOR: 'ndarray',
};

export const LogTypes = {
  SERVICE_LOGS: 'Service Logs',
  BUILD_LOGS: 'Build Logs',
};

export function endpointVersionInTerminalState(state) {
  return state === InferenceServiceState.READY || state === InferenceServiceState.FAILED;
}

export const mapStateToEndpointVersion = (state, ownProps) => {
  const { modelName, endpointVersionName } = ownProps;
  const servingModelKey = getServingModelKey(null, modelName);
  const endpointVersions = state.entities.endpointVersionStatusV2[servingModelKey];
  const matchingVersions =
    endpointVersions && endpointVersions.length > 0
      ? endpointVersions.filter((v) => v.endpoint_version_name === endpointVersionName)
      : [];
  return matchingVersions.length > 0 ? matchingVersions[0] : null;
};

export const mapStateToReplicas = (state, ownProps) => {
  const { modelName, endpointVersionName } = ownProps;
  const servingModelKey = getServingModelKey(null, modelName);
  const modelReplicas = state.entities.replicasByModelVersion[servingModelKey] || {};
  return modelReplicas[endpointVersionName];
};
