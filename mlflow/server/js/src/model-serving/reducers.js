import {
  DISABLE_SERVING,
  DISABLE_SERVING_V2,
  ENABLE_SERVING,
  GET_CREATE_CLUSTER_PERMISSIONS,
  GET_ENDPOINT_EVENT_HISTORY,
  GET_ENDPOINT_METRIC_HISTORY,
  GET_ENDPOINT_STATUS,
  GET_ENDPOINT_STATUS_V2,
  GET_ENDPOINT_VERSION_BUILD_LOGS,
  GET_ENDPOINT_VERSION_LOGS,
  GET_ENDPOINT_VERSION_LOGS_V2,
  GET_SERVING_V2_EVENT_HISTORY,
  GET_SUPPORTED_CLUSTER_NODE_TYPES,
  GET_SUPPORTED_WORKLOAD_SIZES,
  GET_VERSION_METRICS,
  GET_VERSION_REPLICAS,
  LIST_ENDPOINT_VERSION_ALIASES,
  LIST_ENDPOINT_VERSION_ALIASES_V2,
  LIST_ENDPOINT_VERSIONS,
  LIST_ENDPOINT_VERSIONS_V2,
  LIST_ENDPOINTS,
  LIST_ENDPOINTS_V2,
  SET_INPUT_EXAMPLE_FOR_MODEL_VERSION,
  SET_INPUT_EXAMPLE_TYPE_FOR_MODEL_VERSION,
} from './actions';
import { getServingModelKey, isValidNode } from './utils';
import _ from 'lodash';
import { fulfilled, rejected } from '../common/utils/ActionUtils';

const processListEndpointsApiCall = (endpoints, initState) => {
  // Merge all endpoints into the store
  const st = endpoints.reduce(
    (newState, endpoint) => {
      const { experiment_id, registered_model_name } = endpoint;
      return {
        ...newState,
        [getServingModelKey(experiment_id, registered_model_name)]: endpoint,
      };
    },
    { ...initState },
  );
  return st;
};

const endpointStatus = (state = {}, action) => {
  switch (action.type) {
    case fulfilled(ENABLE_SERVING): {
      const { experimentId, registeredModelName } = action.meta;
      return {
        ...state,
        [getServingModelKey(experimentId, registeredModelName)]: {
          experiment_id: experimentId,
          registered_model_name: registeredModelName,
          state: 'ENDPOINT_STATE_PENDING',
        },
      };
    }
    case fulfilled(DISABLE_SERVING): {
      const { experimentId, registeredModelName } = action.meta;
      return _.omit(state, getServingModelKey(experimentId, registeredModelName));
    }
    case fulfilled(GET_ENDPOINT_STATUS): {
      const { experimentId, registeredModelName } = action.meta;
      const endpoint = action.payload.endpoint_status;
      return {
        ...state,
        [getServingModelKey(experimentId, registeredModelName)]: endpoint,
      };
    }
    case fulfilled(LIST_ENDPOINTS_V2): {
      const endpointsV2 = action.payload.endpoint_statuses || [];
      return processListEndpointsApiCall(endpointsV2, { ...state });
    }
    case fulfilled(LIST_ENDPOINTS): {
      const endpoints = action.payload.endpoints || [];
      return processListEndpointsApiCall(endpoints, { ...state });
    }
    case rejected(GET_ENDPOINT_STATUS): {
      const { experimentId, registeredModelName } = action.meta;
      const e = action.payload;
      if (e.getStatus() === 400 && e.getErrorCode() === 'INVALID_PARAMETER_VALUE') {
        return _.omit(state, getServingModelKey(experimentId, registeredModelName));
      }
      return state;
    }
    default:
      return state;
  }
};

const endpointStatusV2 = (state = {}, action) => {
  switch (action.type) {
    case fulfilled(DISABLE_SERVING_V2): {
      const { experimentId, registeredModelName } = action.meta;
      return _.omit(state, getServingModelKey(experimentId, registeredModelName));
    }
    case fulfilled(GET_ENDPOINT_STATUS_V2): {
      const { registeredModelName } = action.meta;
      const endpoint = action.payload.endpoint_status;
      const servingKey = getServingModelKey(null, registeredModelName);

      if (_.isEqual(state[servingKey], endpoint)) {
        return state;
      }
      return {
        ...state,
        [servingKey]: endpoint,
      };
    }
    case rejected(GET_ENDPOINT_STATUS_V2): {
      const { registeredModelName } = action.meta;
      const e = action.payload;
      if (
        e.getStatus() === 404 &&
        (e.getErrorCode() === 'RESOURCE_DOES_NOT_EXIST' || e.getErrorCode() === 'FEATURE_DISABLED')
      ) {
        return _.omit(state, getServingModelKey(null, registeredModelName));
      }
      return state;
    }
    default:
      return state;
  }
};

const endpointVersionStatus = (state = {}, action) => {
  switch (action.type) {
    case fulfilled(DISABLE_SERVING): {
      const { experimentId, registeredModelName } = action.meta;
      return _.omit(state, getServingModelKey(experimentId, registeredModelName));
    }
    case fulfilled(LIST_ENDPOINT_VERSIONS): {
      const { experimentId, registeredModelName } = action.meta;
      const modelVersions = action.payload.endpoint_versions || [];
      const servingKey = getServingModelKey(experimentId, registeredModelName);
      if (_.isEqual(state[servingKey], modelVersions)) {
        return state;
      }
      return {
        ...state,
        [servingKey]: modelVersions,
      };
    }
    default:
      return state;
  }
};

const endpointVersionStatusV2 = (state = {}, action) => {
  switch (action.type) {
    case fulfilled(DISABLE_SERVING_V2): {
      const { experimentId, registeredModelName } = action.meta;
      return _.omit(state, getServingModelKey(experimentId, registeredModelName));
    }
    case fulfilled(LIST_ENDPOINT_VERSIONS_V2): {
      const { registeredModelName } = action.meta;
      const modelVersions = action.payload.endpoint_statuses || [];
      const servingKey = getServingModelKey(null, registeredModelName);

      if (_.isEqual(state[servingKey], modelVersions)) {
        return state;
      }
      return {
        ...state,
        [servingKey]: modelVersions,
      };
    }
    default:
      return state;
  }
};

const endpointAliases = (state = {}, action) => {
  switch (action.type) {
    case fulfilled(DISABLE_SERVING): {
      const { experimentId, registeredModelName } = action.meta;
      return _.omit(state, getServingModelKey(experimentId, registeredModelName));
    }
    case fulfilled(LIST_ENDPOINT_VERSION_ALIASES): {
      const { experimentId, registeredModelName } = action.meta;
      const aliases = action.payload.aliases || [];
      const servingKey = getServingModelKey(experimentId, registeredModelName);
      if (_.isEqual(state[servingKey], aliases)) {
        return state;
      }
      return {
        ...state,
        [getServingModelKey(experimentId, registeredModelName)]: aliases,
      };
    }
    default:
      return state;
  }
};

const endpointAliasesV2 = (state = {}, action) => {
  switch (action.type) {
    case fulfilled(DISABLE_SERVING_V2): {
      const { experimentId, registeredModelName } = action.meta;
      return _.omit(state, getServingModelKey(experimentId, registeredModelName));
    }
    case fulfilled(LIST_ENDPOINT_VERSION_ALIASES_V2): {
      const { registeredModelName } = action.meta;
      const aliases = action.payload.aliases || [];
      const servingKey = getServingModelKey(null, registeredModelName);
      if (_.isEqual(state[servingKey], aliases)) {
        return state;
      }
      return {
        ...state,
        [servingKey]: aliases,
      };
    }
    default:
      return state;
  }
};

const endpointEventHistory = (state = {}, action) => {
  switch (action.type) {
    case fulfilled(DISABLE_SERVING): {
      const { experimentId, registeredModelName } = action.meta;
      return _.omit(state, getServingModelKey(experimentId, registeredModelName));
    }
    case fulfilled(GET_ENDPOINT_EVENT_HISTORY): {
      const { experimentId, registeredModelName } = action.meta;
      // ML-11448: If there were no events for this model, that will resolve to undefined. Convert
      // this to an empty list so we can distinguish whether the events have been loaded or not.
      const events = action.payload.events || [];
      const servingKey = getServingModelKey(experimentId, registeredModelName);
      if (_.isEqual(state[servingKey], events)) {
        return state;
      }
      return {
        ...state,
        [servingKey]: events,
      };
    }
    default:
      return state;
  }
};

const endpointEventHistoryV2 = (state = {}, action) => {
  switch (action.type) {
    case fulfilled(DISABLE_SERVING_V2): {
      const { experimentId, registeredModelName } = action.meta;
      return _.omit(state, getServingModelKey(experimentId, registeredModelName));
    }
    case fulfilled(GET_SERVING_V2_EVENT_HISTORY): {
      const { registeredModelName } = action.meta;
      // ML-11448: If there were no events for this model, that will resolve to undefined. Convert
      // this to an empty list so we can distinguish whether the events have been loaded or not.
      const events = action.payload.events || [];
      const servingKey = getServingModelKey(null, registeredModelName);
      if (_.isEqual(state[servingKey], events)) {
        return state;
      }
      return {
        ...state,
        [servingKey]: events,
      };
    }
    default:
      return state;
  }
};

const endpointMetricHistory = (state = {}, action) => {
  switch (action.type) {
    case fulfilled(DISABLE_SERVING): {
      const { experimentId, registeredModelName } = action.meta;
      return _.omit(state, getServingModelKey(experimentId, registeredModelName));
    }
    case fulfilled(GET_ENDPOINT_METRIC_HISTORY): {
      const metrics = action.payload.metrics || [];
      const { experimentId, registeredModelName } = action.meta;
      const modelKey = getServingModelKey(experimentId, registeredModelName);
      return {
        ...state,
        [modelKey]: metrics,
      };
    }
    default:
      return state;
  }
};

const metricsByModelVersion = (state = {}, action) => {
  switch (action.type) {
    case fulfilled(DISABLE_SERVING_V2): {
      const { experimentId, registeredModelName } = action.meta;
      return _.omit(state, getServingModelKey(experimentId, registeredModelName));
    }
    case fulfilled(GET_VERSION_METRICS): {
      const { registeredModelName, endpointVersionName } = action.meta;
      const modelKey = getServingModelKey(null, registeredModelName);
      const modelMetrics = state[modelKey];
      return {
        ...state,
        [modelKey]: { ...modelMetrics, [endpointVersionName]: action.payload },
      };
    }
    default:
      return state;
  }
};

const inputExampleByModelVersion = (state = {}, action) => {
  switch (action.type) {
    case SET_INPUT_EXAMPLE_FOR_MODEL_VERSION: {
      const { experimentId, modelName, modelVersionName } = action.meta;
      const modelKey = getServingModelKey(experimentId, modelName);
      const examples = state[modelKey];
      return {
        ...state,
        [modelKey]: { ...examples, [modelVersionName]: action.payload },
      };
    }
    default:
      return state;
  }
};

const inputExampleTypeByModelVersion = (state = {}, action) => {
  switch (action.type) {
    case SET_INPUT_EXAMPLE_TYPE_FOR_MODEL_VERSION: {
      const { experimentId, modelName, modelVersionName } = action.meta;
      const modelKey = getServingModelKey(experimentId, modelName);
      const examples = state[modelKey];
      return {
        ...state,
        [modelKey]: { ...examples, [modelVersionName]: action.payload },
      };
    }
    default:
      return state;
  }
};

const clusterPermissions = (state = {}, action) => {
  switch (action.type) {
    case fulfilled(GET_CREATE_CLUSTER_PERMISSIONS): {
      const { canCreateServingClusters } = action.payload;
      return { canCreateServingClusters };
    }
    case rejected(GET_CREATE_CLUSTER_PERMISSIONS): {
      // NB: Enable the button if we can not retrieve cluster create permissions. We'd rather
      // have ineligible users to try and fail than disable the button for eligible users.
      return { canCreateServingClusters: true, error: action.payload };
    }
    default:
      return state;
  }
};

const supportedClusterNodes = (state = {}, action) => {
  switch (action.type) {
    case fulfilled(GET_SUPPORTED_CLUSTER_NODE_TYPES): {
      const nodeTypes = action.payload.node_types || [];
      const validNodeTypes = {};
      if (nodeTypes) {
        nodeTypes.forEach((node) => {
          if (isValidNode(node)) {
            const { category } = node;
            if (!validNodeTypes[category]) {
              validNodeTypes[category] = [];
            }
            validNodeTypes[category].push({
              nodeTypeId: node.node_type_id,
              memory: node.memory_mb,
              numCores: node.num_cores,
            });
          }
        });
      }
      return validNodeTypes;
    }
    default:
      return state;
  }
};

const supportedServingV2WorkloadSizes = (state = {}, action) => {
  switch (action.type) {
    case fulfilled(GET_SUPPORTED_WORKLOAD_SIZES): {
      return action.payload.workload_sizes || [];
    }
    default:
      return state;
  }
};

const endpointLogsByModelVersion = (state = {}, action) => {
  switch (action.type) {
    case fulfilled(DISABLE_SERVING): {
      const { experimentId, registeredModelName } = action.meta;
      return _.omit(state, getServingModelKey(experimentId, registeredModelName));
    }
    case fulfilled(GET_ENDPOINT_VERSION_LOGS): {
      const { experimentId, registeredModelName, endpointVersionName } = action.meta;
      const modelKey = getServingModelKey(experimentId, registeredModelName);
      const currentModelLogs = state[modelKey];
      const logs = action.payload.logs || '';
      return {
        ...state,
        [modelKey]: { ...currentModelLogs, [endpointVersionName]: logs },
      };
    }
    default:
      return state;
  }
};

const endpointV2LogsByModelVersion = (state = {}, action) => {
  switch (action.type) {
    case fulfilled(DISABLE_SERVING_V2): {
      const { registeredModelName } = action.meta;
      return _.omit(state, getServingModelKey(null, registeredModelName));
    }
    case fulfilled(GET_ENDPOINT_VERSION_LOGS_V2): {
      const { registeredModelName, endpointVersionName, replicaId } = action.meta;
      const modelKey = getServingModelKey(null, registeredModelName);
      const currentModelLogs = state[modelKey] || {};
      const currentVersionLogs = currentModelLogs[endpointVersionName] || {};
      const logs = action.payload.logs || '';
      return {
        ...state,
        [modelKey]: {
          ...currentModelLogs,
          [endpointVersionName]: { ...currentVersionLogs, [replicaId]: logs },
        },
      };
    }
    case rejected(GET_ENDPOINT_VERSION_LOGS_V2): {
      const { registeredModelName, endpointVersionName, replicaId } = action.meta;
      const modelKey = getServingModelKey(null, registeredModelName);
      const currentModelLogs = state[modelKey] || {};
      const currentVersionLogs = currentModelLogs[endpointVersionName] || {};
      const e = action.payload;
      if (e.getStatus() === 404 && e.getErrorCode() === 'RESOURCE_DOES_NOT_EXIST') {
        return {
          ...state,
          [modelKey]: {
            ...currentModelLogs,
            [endpointVersionName]: {
              ...currentVersionLogs,
              [replicaId]: 'Unable to retrieve logs for this replica.',
            },
          },
        };
      }
      return state;
    }
    default:
      return state;
  }
};

const endpointV2BuildLogsByModelVersion = (state = {}, action) => {
  switch (action.type) {
    case fulfilled(DISABLE_SERVING_V2): {
      const { registeredModelName } = action.meta;
      return _.omit(state, getServingModelKey(null, registeredModelName));
    }
    case fulfilled(GET_ENDPOINT_VERSION_BUILD_LOGS): {
      const { registeredModelName, endpointVersionName } = action.meta;
      const modelKey = getServingModelKey(null, registeredModelName);
      const currentModelLogs = state[modelKey] || {};
      const logs = action.payload.logs || '';
      return {
        ...state,
        [modelKey]: {
          ...currentModelLogs,
          [endpointVersionName]: logs,
        },
      };
    }
    case rejected(GET_ENDPOINT_VERSION_BUILD_LOGS): {
      const { registeredModelName, endpointVersionName } = action.meta;
      const modelKey = getServingModelKey(null, registeredModelName);
      const currentModelLogs = state[modelKey] || {};
      const e = action.payload;
      if (
        e.getStatus() === 404 &&
        e.getErrorCode() === 'RESOURCE_DOES_NOT_EXIST' &&
        e.getMessageField().includes('could not be parsed')
      ) {
        return {
          ...state,
          [modelKey]: {
            ...currentModelLogs,
            [endpointVersionName]: 'Build Logs are not available for this model.',
          },
        };
      }
      return state;
    }
    default:
      return state;
  }
};

const replicasByModelVersion = (state = {}, action) => {
  switch (action.type) {
    case fulfilled(DISABLE_SERVING_V2): {
      const { registeredModelName } = action.meta;
      return _.omit(state, getServingModelKey(null, registeredModelName));
    }
    case fulfilled(GET_VERSION_REPLICAS): {
      const { registeredModelName, endpointVersionName } = action.meta;
      const modelKey = getServingModelKey(null, registeredModelName);
      const currentModelReplicas = state[modelKey];
      const replicas = action.payload.version_replicas || [];
      return {
        ...state,
        [modelKey]: { ...currentModelReplicas, [endpointVersionName]: replicas },
      };
    }
    default:
      return state;
  }
};

export default {
  endpointStatus,
  endpointStatusV2,
  endpointVersionStatus,
  endpointVersionStatusV2,
  endpointAliases,
  endpointAliasesV2,
  endpointEventHistory,
  endpointEventHistoryV2,
  endpointMetricHistory,
  inputExampleByModelVersion,
  inputExampleTypeByModelVersion,
  clusterPermissions,
  supportedClusterNodes,
  supportedServingV2WorkloadSizes,
  metricsByModelVersion,
  endpointLogsByModelVersion,
  endpointV2LogsByModelVersion,
  endpointV2BuildLogsByModelVersion,
  replicasByModelVersion,
};
