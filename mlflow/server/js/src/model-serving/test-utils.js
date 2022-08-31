// TODO [ML-22801] (Anirudh): Create new utils for workload based compute config unit tests
// TODO [ML-22801] (Anirudh): Delete utils used for replica based compute config unit tests
import { ENDPOINT_VERSIONS, getServingModelKey } from './utils';
import { mountWithIntl } from '../common/utils/TestUtils';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ServingView } from './components/ServingView';
import { MetricsView } from './components/MetricsView';
import { EditableComputeSettingsView } from './components/EditableComputeSettingsView';
import React from 'react';
import { Stages } from '../model-registry/constants';
import { ModelEndpointVersionView } from './components/ModelEndpointVersionView';
import { ComputeConfigView } from './components/ComputeConfigView';
import { EventsView } from './components/EventsView';
import { LogsView, LogsViewImpl } from './components/LogsView';
import { CallModelViewImpl } from './components/CallModelView';
import { DesignSystemProvider } from '@databricks/design-system';
import { WORKLOAD_TSHIRT_SIZES } from './constants';

// This code awaits all internal promise resolution in a component which happens after an API
// call is made. This allows us to test async behavior that happens after promise resolution.
export const awaitComponentPromises = async (callback) => {
  const wait = () => new Promise((resolve) => setTimeout(resolve));
  await wait().then(callback);
};

export const mockEndpointV2Status = ({
  registered_model_name = 'default_model_name',
  state = 'ENDPOINT_STATE_READY',
  state_message = 'Namespace created.',
}) => {
  return {
    registered_model_name: registered_model_name,
    state: state,
    state_message: state_message,
    compute_config: [
      {
        stage: 'Production',
        version: 0,
        creation_timestamp: 1629940166000,
        user_id: 7104772444337105,
        workload_spec: {
          workload_size_id: 'Medium',
          scale_to_zero_enabled: false,
        },
      },
      {
        stage: 'Staging',
        version: 0,
        creation_timestamp: 1629940166000,
        user_id: 7104772444337105,
        workload_spec: {
          workload_size_id: 'Small',
          scale_to_zero_enabled: false,
        },
      },
    ],
  };
};

export const mockEndpointStatus = ({
  experiment_id = null,
  registered_model_name = 'abc',
  state = 'ENDPOINT_STATE_PENDING',
  actual_cluster_config,
  serving_version,
}) => {
  if (actual_cluster_config) {
    return {
      experiment_id,
      registered_model_name,
      actual_cluster_config,
      state,
      serving_version,
    };
  }
  return {
    experiment_id,
    registered_model_name,
    state,
    serving_version,
  };
};

export const mockEndpointVersionStatus = ({
  experiment_id = null,
  registered_model_name = 'abc',
  endpoint_version_name = '1',
  state = 'VERSION_STATE_PENDING',
}) => {
  return {
    experiment_id,
    registered_model_name,
    endpoint_version_name,
    state,
  };
};

export const mockEndpointVersionAlias = ({ alias = 'Production', endpoint_version_name = '2' }) => {
  return {
    alias,
    endpoint_version_name,
  };
};

export const mockEndpointHistoryEntry = ({
  experiment_id = null,
  registered_model_name = 'abc',
  endpoint_version_name = null,
  event_type = 'ENDPOINT_UPDATED',
  message = '',
}) => {
  return {
    experiment_id,
    registered_model_name,
    endpoint_version_name,
    event_type,
    message,
  };
};

export const mockEndpointMetric = ({ key = 'successes', value = 3, timestamp = 123 }) => {
  return {
    key,
    value,
    timestamp,
  };
};

export const mockInputExampleState = (modelName, modelVersions, examples = undefined) => {
  const versions = {};
  if (examples === undefined) {
    modelVersions.forEach((v) => {
      versions[v.endpoint_version_name] = { content: JSON.stringify(v.endpoint_version_name) };
    });
  } else {
    modelVersions.forEach((v, i) => {
      versions[v.endpoint_version_name] = examples[i];
    });
  }
  return { [getServingModelKey(null, modelName)]: versions };
};

export const mockInputExampleTypeState = (modelName, modelVersions, exampleTypes = undefined) => {
  const versions = {};
  if (exampleTypes === undefined) {
    modelVersions.forEach((v) => {
      versions[v.endpoint_version_name] = v.endpoint_version_name;
    });
  } else {
    modelVersions.forEach((v, i) => {
      versions[v.endpoint_version_name] = exampleTypes[i];
    });
  }
  return { [getServingModelKey(null, modelName)]: versions };
};

export const mockActualClusterConfig = {
  node_type_id: 'validNode1',
  tags: [{ key: 'dummyKey', value: 'dummyValue' }],
};

export const mockValidNodeTypes = {
  dummy: [{ nodeTypeId: 'm5a.large', memory: 1024, numCores: 4 }],
  dumDum: [{ nodeTypeId: 'm5a.xlarge', memory: 2048, numCores: 4 }],
};

// TODO [ML-22801] (Anirudh): Delete this once we are completely switched over to
//                            concurrency compute config
export const mockSupportedNodeTypeIdsV2 = [
  { key: 'm5a.large', memory_gb: 8, cores: 2 },
  { key: 'm5a.xlarge', memory_gb: 16, cores: 4 },
];

export const mockSupportedWorkloadSizes = [
  { key: WORKLOAD_TSHIRT_SIZES.SMALL, min_concurrency: 4, max_concurrency: 4 },
  { key: WORKLOAD_TSHIRT_SIZES.MEDIUM, min_concurrency: 8, max_concurrency: 16 },
  { key: WORKLOAD_TSHIRT_SIZES.LARGE, min_concurrency: 16, max_concurrency: 64 },
];

export const mockNodeTypes = [
  // valid Node
  {
    node_type_id: 'm5a.large',
    memory_mb: 1024,
    num_cores: 4,
    category: 'dummy',
  },
  // valid Node
  {
    node_type_id: 'm5a.xlarge',
    memory_mb: 2048,
    num_cores: 4,
    category: 'dumDum',
  },
  // deprecated Node
  {
    node_type_id: 'deprecatedNode',
    memory_mb: 2048,
    num_cores: 4,
    is_deprecated: true,
    category: 'dumDum',
  },
  // hidden Node
  {
    node_type_id: 'hiddenNode',
    memory_mb: 2048,
    num_cores: 4,
    is_hidden: true,
    category: 'dumDum',
  },
  // Node with gpus
  {
    node_type_id: 'nodeWithGpu',
    memory_mb: 2048,
    num_cores: 4,
    num_gpus: 1,
    category: 'dumDum',
  },
  // NotEnabledOnSubscription Node
  {
    node_type_id: 'notEnabledOnSubscriptionNode',
    memory_mb: 2048,
    num_cores: 4,
    category: 'dumDum',
    node_info: {
      status: ['NotEnabledOnSubscription'],
    },
  },
  // NotAvailableInRegion Node
  {
    node_type_id: 'notAvailableInRegionNode',
    memory_mb: 2048,
    num_cores: 4,
    category: 'dumDum',
    node_info: {
      status: ['NotAvailableInRegion'],
    },
  },
  // NotAvailableInRegion and NotEnabledOnSubscription Node
  {
    node_type_id: 'unavailableNode',
    memory_mb: 2048,
    num_cores: 4,
    category: 'dumDum',
    node_info: {
      status: ['NotAvailableInRegion', 'NotEnabledOnSubscription'],
    },
  },
];

/* Wrappers for components that inject stores and props */

export const componentWrapper = (Component) => {
  return (store, props) => {
    return mountWithIntl(
      <Provider store={store}>
        <BrowserRouter>
          <DesignSystemProvider>
            <Component {...props} />
          </DesignSystemProvider>
        </BrowserRouter>
      </Provider>,
    );
  };
};

export const servingViewWrapper = componentWrapper(ServingView);
export const modelEndpointVersionViewWrapper = componentWrapper(ModelEndpointVersionView);
export const computeConfigViewWrapper = componentWrapper(ComputeConfigView);
export const eventsViewWrapper = componentWrapper(EventsView);
export const logsViewWrapper = componentWrapper(LogsView);
export const rawLogsViewWrapper = componentWrapper(LogsViewImpl);
export const rawCallModelViewWrapper = componentWrapper(CallModelViewImpl);
export const metricsViewWrapper = componentWrapper(MetricsView);
export const computeSettingsWrapper = componentWrapper(EditableComputeSettingsView);

export const mockEndpointStatusV2 = ({
  registered_model_name = 'abcv2',
  state = 'ENDPOINT_STATE_PENDING',
  compute_config,
}) => {
  if (compute_config) {
    return {
      registered_model_name,
      compute_config,
      state,
    };
  }
  return {
    registered_model_name,
    state,
  };
};

/* Mocked objects returned by serving APIs */

export const mockDifferentComputeConfig = [
  {
    stage: Stages.STAGING,
    version: 1,
    creation_timestamp: 0,
    user_id: 123,
    workload_spec: {
      workload_size_id: WORKLOAD_TSHIRT_SIZES.SMALL,
      scale_to_zero_enabled: false,
    },
  },
  {
    stage: Stages.PRODUCTION,
    version: 2,
    creation_timestamp: 1,
    user_id: 321,
    workload_spec: {
      workload_size_id: WORKLOAD_TSHIRT_SIZES.MEDIUM,
      scale_to_zero_enabled: false,
    },
  },
];

export const mockSameComputeConfig = [
  {
    stage: Stages.STAGING,
    version: 1,
    creation_timestamp: 0,
    user_id: 123,
    workload_spec: {
      workload_size_id: WORKLOAD_TSHIRT_SIZES.SMALL,
      scale_to_zero_enabled: false,
    },
  },
  {
    stage: Stages.PRODUCTION,
    version: 1,
    creation_timestamp: 0,
    user_id: 123,
    workload_spec: {
      workload_size_id: WORKLOAD_TSHIRT_SIZES.SMALL,
      scale_to_zero_enabled: false,
    },
  },
];

export const mockComputeConfig = ({
  stage = 'Production',
  version = 1,
  creation_timestamp = 0,
  user_id = 123,
  workload_spec = mockComputeConfigSpec({}),
}) => {
  return {
    stage,
    version,
    creation_timestamp,
    user_id,
    workload_spec,
  };
};

export const mockComputeConfigSpec = ({
  workload_size_id = WORKLOAD_TSHIRT_SIZES.MEDIUM,
  scale_to_zero_enabled = false,
}) => {
  return {
    workload_size_id,
    scale_to_zero_enabled,
  };
};

export const mockEndpointVersionStatusV2 = ({
  registered_model_name = 'abcv2',
  endpoint_version_name = '1',
  service_status = {
    state: 'SERVICE_STATE_PENDING',
    config: mockComputeConfig({}),
  },
  config_update_status = null,
}) => {
  return {
    registered_model_name,
    endpoint_version_name,
    service_status,
    config_update_status,
  };
};

// these are shared mocked state entities for Serving V2

export const mockModelName = 'ModelA';

export const mockNodeId = 'm5a.large';

export const mockNodeId2 = 'm5a.xlarge';

export const mockEndpoint = mockEndpointStatus({
  registered_model_name: mockModelName,
  state: 'ENDPOINT_STATE_READY',
  actual_cluster_config: {
    node_type_id: mockNodeId,
    tags: [{ key: 'dummyKey', value: 'dummyValue' }],
  },
  serving_version: ENDPOINT_VERSIONS.V1,
});

export const mockVersions = [
  mockEndpointVersionStatus({
    registered_model_name: mockModelName,
    endpoint_version_name: '1',
    state: 'VERSION_STATE_READY',
  }),
  mockEndpointVersionStatus({
    registered_model_name: mockModelName,
    endpoint_version_name: '2',
    state: 'VERSION_STATE_READY',
  }),
  mockEndpointVersionStatus({
    registered_model_name: mockModelName,
    endpoint_version_name: '4',
    state: 'VERSION_STATE_PENDING',
  }),
];

export const mockEvents = [
  {
    timestamp: 127,
    event_type: 'MODEL_UPDATE',
    message: 'Internal Message.',
    internal: true,
  },
  {
    timestamp: 125,
    event_type: 'MODEL_UPDATE',
    message: 'Message.',
  },
  {
    timestamp: 124,
    event_type: 'VERSION_UPDATE',
    endpoint_version_name: '1',
    message: 'Second message for version 1.',
  },
  {
    timestamp: 126,
    event_type: 'VERSION_UPDATE',
    endpoint_version_name: '4',
    message: 'First message for version 4.',
  },
  {
    timestamp: 123,
    event_type: 'VERSION_UPDATE',
    endpoint_version_name: '1',
    message: 'First message for version 1.',
  },
];

export const mockEndpointV2 = mockEndpointV2Status({
  registered_model_name: mockModelName,
  state: 'ENDPOINT_STATE_READY',
});

export const mockV2Events = [
  {
    timestamp: 127,
    type: 'MODEL_SERVING_EVENT',
    message: 'Model message 2',
  },
  {
    timestamp: 125,
    type: 'MODEL_SERVICE_EVENT',
    endpoint_version_name: '4',
    stage: 'Staging',
    message: 'Some message for version 4',
  },
  {
    timestamp: 124,
    type: 'MODEL_VERSION_SERVING_EVENT',
    endpoint_version_name: '1',
    stage: 'Production',
    message: 'Second message for version 1',
  },
  {
    timestamp: 122,
    type: 'MODEL_SERVING_EVENT',
    message: 'Model message 1',
  },
  {
    timestamp: 121,
    type: 'CONTAINER_EVENT',
    endpoint_version_name: '1',
    stage: 'Production',
    message: 'First message for version 1',
  },
];

export const mockConfig1 = mockComputeConfig({
  stage: 'Staging',
  version: 1,
  workload_spec: mockComputeConfigSpec({}),
});

export const mockConfig2 = mockComputeConfig({
  stage: 'Staging',
  version: 2,
  workload_spec: mockComputeConfigSpec({
    workload_size_id: WORKLOAD_TSHIRT_SIZES.SMALL,
    scale_to_zero_enabled: false,
  }),
});

export const mockReadyEndpointVersionStatusV2 = mockEndpointVersionStatusV2({
  registered_model_name: mockModelName,
  endpoint_version_name: '1',
  service_status: {
    state: 'SERVICE_STATE_READY',
    config: mockConfig1,
  },
});

export const mockPendingEndpointVersionStatusV2 = mockEndpointVersionStatusV2({
  registered_model_name: mockModelName,
  endpoint_version_name: '2',
  service_status: {
    state: 'SERVICE_STATE_PENDING',
    config: mockConfig1,
  },
  config_update_status: {
    state: 'SERVICE_STATE_PENDING',
    config: mockConfig2,
  },
});

export const mockFailedEndpointVersionStatusV2 = mockEndpointVersionStatusV2({
  registered_model_name: mockModelName,
  endpoint_version_name: '4',
  service_status: {
    state: 'SERVICE_STATE_FAILED',
    config: mockConfig1,
  },
  config_update_status: {
    state: 'SERVICE_STATE_FAILED',
    config: mockConfig2,
  },
});

export const mockUnknownEndpointVersionStatusV2 = mockEndpointVersionStatusV2({
  registered_model_name: mockModelName,
  endpoint_version_name: '5',
  service_status: {
    state: 'SERVICE_STATE_UNKNOWN',
    config: mockConfig1,
  },
  config_update_status: {
    state: 'SERVICE_STATE_UNKNOWN',
    config: mockConfig2,
  },
});

export const mockRetryRequestedEndpointVersionStatusV2 = mockEndpointVersionStatusV2({
  registered_model_name: mockModelName,
  endpoint_version_name: '6',
  service_status: {
    state: 'SERVICE_STATE_RETRY_REQUESTED',
    config: mockConfig1,
  },
  config_update_status: {
    state: 'SERVICE_STATE_RETRY_REQUESTED',
    config: mockConfig2,
  },
});

export const mockVersionsV2 = [
  mockReadyEndpointVersionStatusV2,
  mockPendingEndpointVersionStatusV2,
  mockFailedEndpointVersionStatusV2,
];

export const mockAliases = [
  mockEndpointVersionAlias({ alias: 'Production', endpoint_version_name: '1' }),
  mockEndpointVersionAlias({ alias: 'Staging', endpoint_version_name: '2' }),
];

export const mockEndpointVersionBuildLogs = {
  1: 'Build logs for version 1',
  2: 'Build logs for version 2',
};

export const modelKey = getServingModelKey(null, mockModelName);
export const modelReplicas = {
  1: [
    { replica_name: 'v1replica1', last_known_status: 'RUNNING', replica_id: 'v1r1' },
    { replica_name: 'v1replica2', last_known_status: 'RUNNING', replica_id: 'v1r2' },
  ],
  2: [
    { replica_name: 'v2replica1', last_known_status: 'RUNNING', replica_id: 'v2r1' },
    { replica_name: 'v2replica2', replica_id: 'v2r2' },
    { replica_name: 'v2replica3', replica_id: 'v2r3' },
  ],
};

export const mockStoreV1 = {
  entities: {
    endpointStatus: { [[modelKey]]: mockEndpoint },
    endpointStatusV2: {},
    endpointVersionStatus: { [[modelKey]]: mockVersions },
    endpointVersionStatusV2: {},
    endpointAliases: { [[modelKey]]: mockAliases },
    endpointAliasesV2: {},
    endpointEventHistory: { [[modelKey]]: mockEvents },
    endpointEventHistoryV2: {},
    inputExampleByModelVersion: mockInputExampleState(mockModelName, mockVersions),
    inputExampleTypeByModelVersion: mockInputExampleTypeState(mockModelName, mockVersions),
    supportedClusterNodes: mockValidNodeTypes,
    supportedServingV2NodeTypeIds: mockSupportedNodeTypeIdsV2,
    endpointLogsByModelVersion: { [[modelKey]]: { 1: 'Hello!', 4: 'Boopity!' } },
  },
};

export const mockStoreV2 = {
  entities: {
    endpointStatus: {},
    endpointStatusV2: { [[modelKey]]: mockEndpointV2 },
    endpointVersionStatus: {},
    endpointVersionStatusV2: { [[modelKey]]: mockVersionsV2 },
    endpointAliases: {},
    endpointAliasesV2: { [[modelKey]]: mockAliases },
    endpointEventHistory: {},
    endpointEventHistoryV2: { [[modelKey]]: mockV2Events },
    inputExampleByModelVersion: mockInputExampleState(mockModelName, mockVersionsV2),
    inputExampleTypeByModelVersion: mockInputExampleTypeState(mockModelName, mockVersionsV2),
    supportedServingV2WorkloadSizes: mockSupportedWorkloadSizes,
    supportedClusterNodes: mockValidNodeTypes,
    replicasByModelVersion: {
      [[modelKey]]: modelReplicas,
    },
    endpointV2LogsByModelVersion: {
      [[modelKey]]: {
        1: { null: 'Hello from ALL', v1r1: 'Hello from v1r1', v1r2: 'Hello from v1r2' },
        2: {
          null: 'Boopity from ALL',
          v2r1: 'Boopity from v2r1',
          v2r2: 'Boopity from v2r2',
          v2r3: 'Boopity from v2r3',
        },
      },
    },
    endpointV2BuildLogsByModelVersion: {
      [[modelKey]]: mockEndpointVersionBuildLogs,
    },
  },
};
