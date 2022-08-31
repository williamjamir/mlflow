import { Services } from './services';
import { getUUID } from '../common/utils/ActionUtils';
import { UniverseFrontendApis } from '../common/utils/UniverseFrontendApis';

export const LIST_ENDPOINTS = 'LIST_ENDPOINTS';
export const listEndpointsApi = (id = getUUID()) => ({
  type: LIST_ENDPOINTS,
  payload: Services.listEndpoints({}),
  meta: { id },
});

export const LIST_ENDPOINTS_V2 = 'LIST_ENDPOINTS_V2';
export const listEndpointsV2Api = (id = getUUID()) => ({
  type: LIST_ENDPOINTS_V2,
  payload: Services.listEndpointsV2({}),
  meta: { id },
});

export const ENABLE_SERVING = 'ENABLE_SERVING';
export const enableServingApi = (experimentId, registeredModelName, id = getUUID()) => ({
  type: ENABLE_SERVING,
  payload: Services.enableServing({
    experiment_id: experimentId,
    registered_model_name: registeredModelName,
  }),
  meta: { id, experimentId, registeredModelName },
});

export const ENABLE_SERVING_V2 = 'ENABLE_SERVING_V2';
export const enableServingV2Api = (registeredModelName, id = getUUID()) => ({
  type: ENABLE_SERVING_V2,
  payload: Services.enableServingV2({
    registered_model_name: registeredModelName,
  }),
  meta: { id, registeredModelName },
});

export const DISABLE_SERVING = 'DISABLE_SERVING';
export const disableServingApi = (experimentId, registeredModelName, id = getUUID()) => ({
  type: DISABLE_SERVING,
  payload: Services.disableServing({
    experiment_id: experimentId,
    registered_model_name: registeredModelName,
  }),
  meta: { id, experimentId, registeredModelName },
});

export const DISABLE_SERVING_V2 = 'DISABLE_SERVING_V2';
export const disableServingV2Api = (registeredModelName, id = getUUID()) => ({
  type: DISABLE_SERVING_V2,
  payload: Services.disableServingV2({
    registered_model_name: registeredModelName,
  }),
  meta: { id, registeredModelName },
});

export const GET_ENDPOINT_STATUS = 'GET_ENDPOINT_STATUS';
export const getEndpointStatusApi = (experimentId, registeredModelName, id = getUUID()) => ({
  type: GET_ENDPOINT_STATUS,
  payload: Services.getEndpointStatus({
    experiment_id: experimentId,
    registered_model_name: registeredModelName,
  }),
  meta: { id, experimentId, registeredModelName },
});

export const UPDATE_ENDPOINT_CLUSTER_CONFIG = 'UPDATE_ENDPOINT_CLUSTER_CONFIG';
export const updateEndpointClusterConfigApi = (
  experimentId,
  registeredModelName,
  desiredClusterConfig,
  id = getUUID(),
) => ({
  type: UPDATE_ENDPOINT_CLUSTER_CONFIG,
  payload: Services.updateEndpointClusterConfig({
    experiment_id: experimentId,
    registered_model_name: registeredModelName,
    desired_cluster_config: desiredClusterConfig,
  }),
  meta: { id },
});

export const LIST_ENDPOINT_VERSIONS = 'LIST_ENDPOINT_VERSIONS';
export const listEndpointVersionsApi = (experimentId, registeredModelName, id = getUUID()) => ({
  type: LIST_ENDPOINT_VERSIONS,
  payload: Services.listEndpointVersions({
    experiment_id: experimentId,
    registered_model_name: registeredModelName,
  }),
  meta: { id, experimentId, registeredModelName },
});

export const GET_ENDPOINT_VERSION_LOGS = 'GET_ENDPOINT_VERSION_LOGS';
export const getEndpointVersionLogsApi = (
  experimentId,
  registeredModelName,
  endpointVersionName,
  id = getUUID(),
) => ({
  type: GET_ENDPOINT_VERSION_LOGS,
  payload: Services.getEndpointVersionLogs({
    experiment_id: experimentId,
    registered_model_name: registeredModelName,
    endpoint_version_name: endpointVersionName,
  }),
  meta: { id, experimentId, registeredModelName, endpointVersionName },
});

export const GET_ENDPOINT_VERSION_LOGS_V2 = 'GET_ENDPOINT_VERSION_LOGS_V2';
export const getEndpointVersionLogsV2Api = (
  registeredModelName,
  endpointVersionName,
  replicaId = null,
  id = getUUID(),
) => ({
  type: GET_ENDPOINT_VERSION_LOGS_V2,
  payload: Services.getEndpointVersionLogsV2({
    registered_model_name: registeredModelName,
    endpoint_version_name: endpointVersionName,
    replica_id: replicaId,
  }),
  meta: { id, registeredModelName, endpointVersionName, replicaId },
});

export const GET_VERSION_METRICS = 'GET_VERSION_METRICS';
export const getVersionMetricsApi = (
  registeredModelName,
  endpointVersionName,
  startTimestamp,
  endTimestamp,
  id = getUUID(),
) => ({
  type: GET_VERSION_METRICS,
  payload: Services.getVersionMetrics({
    registered_model_name: registeredModelName,
    endpoint_version_name: endpointVersionName,
    start_timestamp: startTimestamp,
    end_timestamp: endTimestamp,
  }),
  meta: { id, registeredModelName, endpointVersionName },
});

export const GET_VERSION_REPLICAS = 'GET_VERSION_REPLICAS';
export const getVersionReplicasApi = (
  registeredModelName,
  endpointVersionName,
  id = getUUID(),
) => ({
  type: GET_VERSION_REPLICAS,
  payload: Services.getVersionReplicas({
    registered_model_name: registeredModelName,
    endpoint_version_name: endpointVersionName,
  }),
  meta: { id, registeredModelName, endpointVersionName },
});

export const LIST_ENDPOINT_VERSION_ALIASES = 'LIST_ENDPOINT_VERSION_ALIASES';
export const listEndpointVersionAliasesApi = (
  experimentId,
  registeredModelName,
  id = getUUID(),
) => ({
  type: LIST_ENDPOINT_VERSION_ALIASES,
  payload: Services.listEndpointVersionAliases({
    experiment_id: experimentId,
    registered_model_name: registeredModelName,
  }),
  meta: { id, experimentId, registeredModelName },
});

export const LIST_ENDPOINT_VERSION_ALIASES_V2 = 'LIST_ENDPOINT_VERSION_ALIASES_V2';
export const listEndpointVersionAliasesV2Api = (registeredModelName, id = getUUID()) => ({
  type: LIST_ENDPOINT_VERSION_ALIASES_V2,
  payload: Services.listEndpointVersionAliasesV2({
    registered_model_name: registeredModelName,
  }),
  meta: { id, registeredModelName },
});

export const GET_ENDPOINT_EVENT_HISTORY = 'GET_ENDPOINT_EVENT_HISTORY';
export const getEndpointEventHistoryApi = (experimentId, registeredModelName, id = getUUID()) => ({
  type: GET_ENDPOINT_EVENT_HISTORY,
  payload: Services.getEndpointEventHistory({
    experiment_id: experimentId,
    registered_model_name: registeredModelName,
  }),
  meta: { id, experimentId, registeredModelName },
});

export const GET_SERVING_V2_EVENT_HISTORY = 'GET_SERVING_V2_EVENT_HISTORY';
export const getServingEventHistoryApi = (registeredModelName, id = getUUID()) => ({
  type: GET_SERVING_V2_EVENT_HISTORY,
  payload: Services.getServingEventHistory({
    registered_model_name: registeredModelName,
  }),
  meta: { id, registeredModelName },
});

export const GET_ENDPOINT_METRIC_HISTORY = 'GET_ENDPOINT_METRIC_HISTORY';
export const getEndpointMetricHistoryApi = (experimentId, registeredModelName, id = getUUID()) => ({
  type: GET_ENDPOINT_METRIC_HISTORY,
  payload: Services.getEndpointMetricHistory({
    experiment_id: experimentId,
    registered_model_name: registeredModelName,
  }),
  meta: { id, experimentId, registeredModelName },
});

export const SUBMIT_SERVING_REQUEST = 'SUBMIT_SERVING_REQUEST';
export const submitServingRequestApi = (
  modelName,
  modelVersionName,
  servingRequestPayload,
  headers,
  id = getUUID(),
) => ({
  type: SUBMIT_SERVING_REQUEST,
  payload: Services.submitServingRequest({
    modelName: modelName,
    modelVersionName: modelVersionName,
    servingRequestPayload: servingRequestPayload,
    headers: headers,
  }),
  meta: { id },
});

export const SUBMIT_SERVING_REQUEST_V2 = 'SUBMIT_SERVING_REQUEST_V2';
export const submitServingRequestV2Api = (
  modelName,
  modelVersionName,
  servingRequestPayload,
  headers,
  id = getUUID(),
) => ({
  type: SUBMIT_SERVING_REQUEST_V2,
  payload: Services.submitServingRequestV2({
    modelName: modelName,
    modelVersionName: modelVersionName,
    servingRequestPayload: servingRequestPayload,
    headers: headers,
  }),
  meta: { id },
});

export const SET_INPUT_EXAMPLE_FOR_MODEL_VERSION = 'SET_INPUT_EXAMPLE_FOR_MODEL_VERSION';
export const setInputExampleForModelVersion = (
  modelName,
  modelVersionName,
  exampleContent,
  id = getUUID(),
) => ({
  type: SET_INPUT_EXAMPLE_FOR_MODEL_VERSION,
  payload: exampleContent,
  meta: { id, modelName, modelVersionName },
});

export const SET_INPUT_EXAMPLE_TYPE_FOR_MODEL_VERSION = 'SET_INPUT_EXAMPLE_TYPE_FOR_MODEL_VERSION';
export const setInputExampleTypeForModelVersion = (
  modelName,
  modelVersionName,
  exampleType,
  id = getUUID(),
) => ({
  type: SET_INPUT_EXAMPLE_TYPE_FOR_MODEL_VERSION,
  payload: exampleType,
  meta: { id, modelName, modelVersionName },
});

export const GET_CREATE_CLUSTER_PERMISSIONS = 'GET_CREATE_CLUSTER_PERMISSIONS';
export const getCreateClusterPermissions = (id = getUUID()) => ({
  type: GET_CREATE_CLUSTER_PERMISSIONS,
  payload: UniverseFrontendApis.getCreateClusterPermissions(),
  meta: { id },
});

export const GET_SUPPORTED_CLUSTER_NODE_TYPES = 'GET_SUPPORTED_CLUSTER_NODE_TYPES';
export const getSupportedClusterNodeTypes = (id = getUUID()) => ({
  type: GET_SUPPORTED_CLUSTER_NODE_TYPES,
  payload: Services.getSupportedClusterNodeTypes({}),
  meta: { id },
});

export const GET_SUPPORTED_WORKLOAD_SIZES = 'GET_SUPPORTED_WORKLOAD_SIZES';
export const getSupportedWorkloadSizes = (id = getUUID()) => ({
  type: GET_SUPPORTED_WORKLOAD_SIZES,
  payload: Services.getSupportedWorkloadSizes({}),
  meta: { id },
});

export const GET_ENDPOINT_STATUS_V2 = 'GET_ENDPOINT_STATUS_V2';
export const getEndpointStatusV2Api = (registeredModelName, id = getUUID()) => ({
  type: GET_ENDPOINT_STATUS_V2,
  payload: Services.getEndpointStatusV2({
    registered_model_name: registeredModelName,
  }),
  meta: { id, registeredModelName },
});

export const LIST_ENDPOINT_VERSIONS_V2 = 'LIST_ENDPOINT_VERSIONS_V2';
export const listEndpointVersionsV2Api = (registeredModelName, id = getUUID()) => ({
  type: LIST_ENDPOINT_VERSIONS_V2,
  payload: Services.listEndpointVersionsV2({
    registered_model_name: registeredModelName,
  }),
  meta: { id, registeredModelName },
});

export const UPDATE_ENDPOINT_COMPUTE_CONFIG = 'UPDATE_ENDPOINT_COMPUTE_CONFIG';
export const updateEndpointComputeConfigApi = (
  registeredModelName,
  stage,
  desiredComputeConfigSpec,
  id = getUUID(),
) => ({
  type: UPDATE_ENDPOINT_COMPUTE_CONFIG,
  payload: Services.updateEndpointComputeConfig({
    registered_model_name: registeredModelName,
    stage: stage,
    desired_workload_config_spec: desiredComputeConfigSpec,
  }),
  meta: { id, registeredModelName },
});

export const RESTART_COMPUTE_CONFIG_UPDATE = 'RESTART_COMPUTE_CONFIG_UPDATE';
export const restartComputeConfigUpdateApi = (
  registeredModelName,
  endpointVersionName,
  id = getUUID(),
) => ({
  type: RESTART_COMPUTE_CONFIG_UPDATE,
  payload: Services.restartComputeConfigUpdate({
    registered_model_name: registeredModelName,
    endpoint_version_name: endpointVersionName,
  }),
  meta: { id, registeredModelName, endpointVersionName },
});

export const GET_ENDPOINT_VERSION_BUILD_LOGS = 'GET_ENDPOINT_VERSION_BUILD_LOGS';
export const getEndpointVersionBuildLogsApi = (
  registeredModelName,
  endpointVersionName,
  id = getUUID(),
) => ({
  type: GET_ENDPOINT_VERSION_BUILD_LOGS,
  payload: Services.getEndpointVersionBuildLogs({
    registered_model_name: registeredModelName,
    endpoint_version_name: endpointVersionName,
  }),
  meta: { id, registeredModelName, endpointVersionName },
});
