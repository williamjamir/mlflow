import ModelServingReducers from './reducers';
import {
  ENABLE_SERVING,
  GET_ENDPOINT_STATUS,
  LIST_ENDPOINTS,
  LIST_ENDPOINT_VERSION_ALIASES,
  LIST_ENDPOINT_VERSIONS,
  LIST_ENDPOINT_VERSIONS_V2,
  GET_ENDPOINT_EVENT_HISTORY,
  GET_SERVING_V2_EVENT_HISTORY,
  GET_ENDPOINT_METRIC_HISTORY,
  GET_CREATE_CLUSTER_PERMISSIONS,
  GET_SUPPORTED_CLUSTER_NODE_TYPES,
  GET_SUPPORTED_WORKLOAD_SIZES,
  GET_ENDPOINT_STATUS_V2,
  LIST_ENDPOINT_VERSION_ALIASES_V2,
} from './actions';
import { getServingModelKey } from './utils';
import { fulfilled, rejected } from '../common/utils/ActionUtils';

const {
  endpointStatus,
  endpointStatusV2,
  endpointVersionStatus,
  endpointVersionStatusV2,
  endpointAliases,
  endpointAliasesV2,
  endpointEventHistory,
  endpointEventHistoryV2,
  endpointMetricHistory,
  clusterPermissions,
  supportedClusterNodes,
  supportedServingV2WorkloadSizes,
} = ModelServingReducers;

import {
  mockEndpointStatus,
  mockEndpointStatusV2,
  mockEndpointVersionStatus,
  mockEndpointVersionStatusV2,
  mockEndpointVersionAlias,
  mockEndpointHistoryEntry,
  mockEndpointMetric,
  mockNodeTypes,
  mockValidNodeTypes,
  mockSupportedWorkloadSizes,
  mockDifferentComputeConfig,
} from './test-utils';

const endpointsToState = (endpoints) => {
  const state = {};
  endpoints.forEach((endpoint) => {
    const key = getServingModelKey(endpoint.experiment_id, endpoint.registered_model_name);
    state[key] = endpoint;
  });
  return state;
};

describe('test endpointStatus', () => {
  test('initial state', () => {
    expect(endpointStatus(undefined, {})).toEqual({});
  });

  test('ENABLE_SERVING adds a dummy status', () => {
    const newEndpoint = mockEndpointStatus({});
    const initialState = {};
    const action = {
      type: fulfilled(ENABLE_SERVING),
      meta: {
        experimentId: newEndpoint.experiment_id,
        registeredModelName: newEndpoint.registered_model_name,
      },
    };
    expect(endpointStatus(initialState, action)).toEqual(endpointsToState([newEndpoint]));
  });

  test('GET_ENDPOINT_STATUS updates the store', () => {
    const endpointA = mockEndpointStatus({ registered_model_name: 'a' });
    const oldEndpointB = mockEndpointStatus({ registered_model_name: 'b' });
    const newEndpointB = mockEndpointStatus({
      registered_model_name: 'b',
      status: 'ENDPOINT_STATUS_READY',
    });
    const initialState = endpointsToState([endpointA, oldEndpointB]);
    const action = {
      type: fulfilled(GET_ENDPOINT_STATUS),
      payload: {
        endpoint_status: newEndpointB,
      },
      meta: {
        experimentId: newEndpointB.experiment_id,
        registeredModelName: newEndpointB.registered_model_name,
      },
    };
    const expectedState = endpointsToState([endpointA, newEndpointB]);
    expect(endpointStatus(initialState, action)).toEqual(expectedState);
  });

  test('LIST_ENDPOINTS updates the store', () => {
    const endpointA = mockEndpointStatus({ registered_model_name: 'a' });
    const oldEndpointB = mockEndpointStatus({ registered_model_name: 'b' });
    const newEndpointB = mockEndpointStatus({
      registered_model_name: 'b',
      status: 'ENDPOINT_STATUS_READY',
    });
    const initialState = endpointsToState([oldEndpointB]);
    const action = {
      type: fulfilled(LIST_ENDPOINTS),
      payload: {
        endpoints: [endpointA, newEndpointB],
      },
      meta: {},
    };
    const expectedState = endpointsToState([endpointA, newEndpointB]);
    expect(endpointStatus(initialState, action)).toEqual(expectedState);
  });

  test('rejected GET_ENDPOINT_STATUS due to nonexistent endpoint removes entry', () => {
    const endpointA = mockEndpointStatus({ registered_model_name: 'a' });
    const endpointB = mockEndpointStatus({ registered_model_name: 'b' });
    const initialState = endpointsToState([endpointA, endpointB]);
    const action = {
      type: rejected(GET_ENDPOINT_STATUS),
      payload: {
        getStatus: () => 400,
        getErrorCode: () => 'INVALID_PARAMETER_VALUE',
      },
      meta: {
        experimentId: endpointA.experiment_id,
        registeredModelName: endpointA.registered_model_name,
      },
    };
    expect(endpointStatus(initialState, action)).toEqual(endpointsToState([endpointB]));
  });

  test('rejected GET_ENDPOINT_STATUS does not error if endpoint already gone', () => {
    const endpointA = mockEndpointStatus({ registered_model_name: 'a' });
    const endpointB = mockEndpointStatus({ registered_model_name: 'b' });
    // NB: Only endpointB is in the initial state.
    const initialState = endpointsToState([endpointB]);
    const action = {
      type: rejected(GET_ENDPOINT_STATUS),
      payload: {
        getStatus: () => 400,
        getErrorCode: () => 'INVALID_PARAMETER_VALUE',
      },
      meta: {
        experimentId: endpointA.experiment_id,
        registeredModelName: endpointA.registered_model_name,
      },
    };
    expect(endpointStatus(initialState, action)).toEqual(endpointsToState([endpointB]));
  });

  test('rejected GET_ENDPOINT_STATUS does not remove if not INVALID_PARAMETER_VALUE', () => {
    const endpointA = mockEndpointStatus({});
    const initialState = endpointsToState([endpointA]);
    const action = {
      type: rejected(GET_ENDPOINT_STATUS),
      payload: {
        getStatus: () => 400,
        getErrorCode: () => 'BAD_REQUEST',
      },
      meta: {
        experimentId: endpointA.experiment_id,
        registeredModelName: endpointA.registered_model_name,
      },
    };
    expect(endpointStatus(initialState, action)).toEqual(endpointsToState([endpointA]));
  });
});

describe('test endpointVersionStatus', () => {
  test('initial state', () => {
    expect(endpointVersionStatus(undefined, {})).toEqual({});
  });

  test('LIST_ENDPOINT_VERSIONS replaces all state for that endpoint', () => {
    const versionA1 = mockEndpointVersionStatus({
      registered_model_name: 'a',
      endpoint_version_name: '1',
    });
    const versionB1 = mockEndpointVersionStatus({
      registered_model_name: 'b',
      endpoint_version_name: '1',
    });
    const versionB2 = mockEndpointVersionStatus({
      registered_model_name: 'b',
      endpoint_version_name: '2',
    });
    const versionB3 = mockEndpointVersionStatus({
      registered_model_name: 'b',
      endpoint_version_name: '3',
    });

    const endpointKeyA = getServingModelKey(null, 'a');
    const endpointKeyB = getServingModelKey(null, 'b');

    const initialState = { [endpointKeyA]: [versionA1], [endpointKeyB]: [versionB1] };
    const action = {
      type: fulfilled(LIST_ENDPOINT_VERSIONS),
      payload: {
        endpoint_versions: [versionB2, versionB3],
      },
      meta: {
        experimentId: versionB1.experiment_id,
        registeredModelName: versionB1.registered_model_name,
      },
    };
    const expectedState = { [endpointKeyA]: [versionA1], [endpointKeyB]: [versionB2, versionB3] };
    expect(endpointVersionStatus(initialState, action)).toEqual(expectedState);
  });

  test('LIST_ENDPOINT_VERSIONS returning absent payload results in empty list', () => {
    const endpointKeyA = getServingModelKey(null, 'a');
    const action = {
      type: fulfilled(LIST_ENDPOINT_VERSIONS),
      payload: {},
      meta: {
        experimentId: null,
        registeredModelName: 'a',
      },
    };
    expect(endpointVersionStatus({}, action)).toEqual({ [endpointKeyA]: [] });
  });
});

describe('test endpointAliases', () => {
  test('initial state', () => {
    expect(endpointAliases(undefined, {})).toEqual({});
  });

  test('test alias update in V1 and V2 replaces all state for aliases', () => {
    const aliasA1 = mockEndpointVersionAlias({ alias: 'dev', endpoint_version_name: '1' });
    const aliasB1 = mockEndpointVersionAlias({ alias: 'dev', endpoint_version_name: '1' });
    const aliasB2 = mockEndpointVersionAlias({ alias: 'staging', endpoint_version_name: '2' });
    const aliasB3 = mockEndpointVersionAlias({ alias: 'production', endpoint_version_name: '3' });

    const endpointKeyA = getServingModelKey(null, 'a');
    const endpointKeyB = getServingModelKey(null, 'b');

    const initialState = { [endpointKeyA]: [aliasA1], [endpointKeyB]: [aliasB1] };
    const expectedState = { [endpointKeyA]: [aliasA1], [endpointKeyB]: [aliasB2, aliasB3] };

    // Update in V1
    const actionV1 = {
      type: fulfilled(LIST_ENDPOINT_VERSION_ALIASES),
      payload: {
        aliases: [aliasB2, aliasB3],
      },
      meta: {
        experimentId: null,
        registeredModelName: 'b',
      },
    };

    expect(endpointAliases(initialState, actionV1)).toEqual(expectedState);

    // Update in V2
    const actionV2 = {
      type: fulfilled(LIST_ENDPOINT_VERSION_ALIASES_V2),
      payload: {
        aliases: [aliasB2, aliasB3],
      },
      meta: {
        experimentId: null,
        registeredModelName: 'b',
      },
    };
    expect(endpointAliasesV2(initialState, actionV2)).toEqual(expectedState);
  });

  test('test alias update in V1 and V2 when payload results in empty list', () => {
    const endpointKeyA = getServingModelKey(null, 'a');

    // V1
    const actionV1 = {
      type: fulfilled(LIST_ENDPOINT_VERSION_ALIASES),
      payload: {},
      meta: {
        experimentId: null,
        registeredModelName: 'a',
      },
    };
    expect(endpointAliases({}, actionV1)).toEqual({ [endpointKeyA]: [] });
    // V2
    const actionV2 = {
      type: fulfilled(LIST_ENDPOINT_VERSION_ALIASES_V2),
      payload: {},
      meta: {
        experimentId: null,
        registeredModelName: 'a',
      },
    };
    expect(endpointAliasesV2({}, actionV2)).toEqual({ [endpointKeyA]: [] });
  });
});

describe('test endpointEventHistory', () => {
  test('initial state', () => {
    expect(endpointEventHistory(undefined, {})).toEqual({});
  });

  test('GET_ENDPOINT_EVENT_HISTORY replaces all state for endpoint', () => {
    const entry1 = mockEndpointHistoryEntry({ message: '1' });
    const entry2 = mockEndpointHistoryEntry({ message: '2' });
    const entry3 = mockEndpointHistoryEntry({ message: '3' });

    const endpointKey = getServingModelKey(null, entry1.registered_model_name);

    const initialState = { [endpointKey]: [entry1] };
    const action = {
      type: fulfilled(GET_ENDPOINT_EVENT_HISTORY),
      payload: {
        events: [entry2, entry3],
      },
      meta: {
        experimentId: null,
        registeredModelName: entry1.registered_model_name,
      },
    };
    expect(endpointEventHistory(initialState, action)).toEqual({ [endpointKey]: [entry2, entry3] });
  });

  test('GET_ENDPOINT_EVENT_HISTORY returning absent payload results in empty list', () => {
    const entry1 = mockEndpointHistoryEntry({ message: '1' });
    const endpointKey = getServingModelKey(null, entry1.registered_model_name);
    const action = {
      type: fulfilled(GET_ENDPOINT_EVENT_HISTORY),
      payload: {},
      meta: {
        experimentId: null,
        registeredModelName: entry1.registered_model_name,
      },
    };
    expect(endpointEventHistory({}, action)).toEqual({ [endpointKey]: [] });
  });

  test('GET_SERVING_V2_EVENT_HISTORY replaces all state for endpoint', () => {
    const entry1 = mockEndpointHistoryEntry({ message: '1' });
    const entry2 = mockEndpointHistoryEntry({ message: '2' });
    const entry3 = mockEndpointHistoryEntry({ message: '3' });

    const endpointKey = getServingModelKey(null, entry1.registered_model_name);

    const initialState = { [endpointKey]: [entry1] };
    const action = {
      type: fulfilled(GET_SERVING_V2_EVENT_HISTORY),
      payload: {
        events: [entry2, entry3],
      },
      meta: {
        registeredModelName: entry1.registered_model_name,
      },
    };
    expect(endpointEventHistoryV2(initialState, action)).toEqual({
      [endpointKey]: [entry2, entry3],
    });
  });

  test('GET_SERVING_V2_EVENT_HISTORY returning absent payload results in empty list', () => {
    const entry1 = mockEndpointHistoryEntry({ message: '1' });
    const endpointKey = getServingModelKey(null, entry1.registered_model_name);
    const action = {
      type: fulfilled(GET_SERVING_V2_EVENT_HISTORY),
      payload: {},
      meta: {
        registeredModelName: entry1.registered_model_name,
      },
    };
    expect(endpointEventHistoryV2({}, action)).toEqual({ [endpointKey]: [] });
  });
});

describe('test endpointMetricHistory', () => {
  test('initial state', () => {
    expect(endpointMetricHistory(undefined, {})).toEqual({});
  });

  test('GET_ENDPOINT_METRIC_HISTORY replaces all state for endpoint', () => {
    const m1 = mockEndpointMetric({ timestamp: 1 });
    const m2 = mockEndpointMetric({ timestamp: '2' });
    const m3 = mockEndpointMetric({ timestamp: '3' });

    const endpointKey = getServingModelKey(null, 'a');

    const initialState = { [endpointKey]: [m1] };
    const action = {
      type: fulfilled(GET_ENDPOINT_METRIC_HISTORY),
      payload: {
        metrics: [m2, m3],
      },
      meta: {
        experimentId: null,
        registeredModelName: 'a',
      },
    };
    expect(endpointMetricHistory(initialState, action)).toEqual({ [endpointKey]: [m2, m3] });
  });

  test('GET_ENDPOINT_METRIC_HISTORY returning absent payload results in empty list', () => {
    const endpointKey = getServingModelKey(null, 'a');
    const action = {
      type: fulfilled(GET_ENDPOINT_METRIC_HISTORY),
      payload: {},
      meta: {
        experimentId: null,
        registeredModelName: 'a',
      },
    };
    expect(endpointMetricHistory({}, action)).toEqual({ [endpointKey]: [] });
  });
});

describe('test clusterPermissions', () => {
  test('GET_CREATE_CLUSTER_PERMISSIONS works with empty state', () => {
    const initialState = undefined;
    const action = {
      type: fulfilled(GET_CREATE_CLUSTER_PERMISSIONS),
      payload: {
        canCreateServingClusters: false,
      },
    };
    const expectedState = { canCreateServingClusters: false };
    expect(clusterPermissions(initialState, action)).toEqual(expectedState);
  });

  test('GET_CREATE_CLUSTER_PERMISSIONS updates the state', () => {
    const initialState = { canCreateServingClusters: false };
    const action = {
      type: fulfilled(GET_CREATE_CLUSTER_PERMISSIONS),
      payload: {
        canCreateServingClusters: true,
      },
    };
    const expectedState = { canCreateServingClusters: true };
    expect(clusterPermissions(initialState, action)).toEqual(expectedState);
  });

  test('Rejected GET_CREATE_CLUSTER_PERMISSIONS works as expected', () => {
    const initialState = { canCreateServingClusters: false };
    const action = {
      type: rejected(GET_CREATE_CLUSTER_PERMISSIONS),
      payload: {
        error: 'error message.',
      },
    };
    const expectedState = { canCreateServingClusters: true, error: { error: 'error message.' } };
    expect(clusterPermissions(initialState, action)).toEqual(expectedState);
  });
});

describe('test gettingSupportedClusterNodeTypes', () => {
  test('GET_SUPPORTED_CLUSTER_NODE_TYPES updates the store with node types', () => {
    const initialState = undefined;
    const action = {
      type: fulfilled(GET_SUPPORTED_CLUSTER_NODE_TYPES),
      payload: {
        node_types: mockNodeTypes,
      },
    };
    expect(supportedClusterNodes(initialState, action)).toEqual(mockValidNodeTypes);
  });

  test('GET_SUPPORTED_CLUSTER_NODE_TYPES returns empty object if action is empty', () => {
    const initialState = undefined;
    const action = {};
    expect(supportedClusterNodes(initialState, action)).toEqual({});
  });
});

describe('test getSupportedWorkloadSizes', () => {
  test('GET_SUPPORTED_WORKLOAD_SIZES updates the store with supported workload sizes', () => {
    const initialState = undefined;
    const action = {
      type: fulfilled(GET_SUPPORTED_WORKLOAD_SIZES),
      payload: {
        workload_sizes: mockSupportedWorkloadSizes,
      },
    };
    expect(supportedServingV2WorkloadSizes(initialState, action)).toEqual(
      mockSupportedWorkloadSizes,
    );
  });

  test('GET_SUPPORTED_WORKLOAD_SIZES returns empty object if action is empty', () => {
    const initialState = undefined;
    const action = {};
    expect(supportedServingV2WorkloadSizes(initialState, action)).toEqual({});
  });
});

describe('test endpointStatusV2', () => {
  test('initial state', () => {
    expect(endpointStatusV2(undefined, {})).toEqual({});
  });

  test('GET_ENDPOINT_STATUS_V2 updates the store', () => {
    const endpointA = mockEndpointStatusV2({ registered_model_name: 'a' });
    const oldEndpointB = mockEndpointStatusV2({ registered_model_name: 'b' });
    const newEndpointB = mockEndpointStatusV2({
      registered_model_name: 'b',
      status: 'ENDPOINT_STATUS_READY',
      compute_config: mockDifferentComputeConfig,
    });
    const initialState = endpointsToState([endpointA, oldEndpointB]);
    const action = {
      type: fulfilled(GET_ENDPOINT_STATUS_V2),
      payload: {
        endpoint_status: newEndpointB,
      },
      meta: {
        registeredModelName: newEndpointB.registered_model_name,
      },
    };
    const expectedState = endpointsToState([endpointA, newEndpointB]);
    expect(endpointStatusV2(initialState, action)).toEqual(expectedState);
  });

  test('rejected GET_ENDPOINT_STATUS_V2 due to nonexistent endpoint removes entry', () => {
    const endpointA = mockEndpointStatusV2({ registered_model_name: 'a' });
    const endpointB = mockEndpointStatusV2({ registered_model_name: 'b' });
    const initialState = endpointsToState([endpointA, endpointB]);
    const action = {
      type: rejected(GET_ENDPOINT_STATUS_V2),
      payload: {
        getStatus: () => 404,
        getErrorCode: () => 'RESOURCE_DOES_NOT_EXIST',
      },
      meta: {
        registeredModelName: endpointA.registered_model_name,
      },
    };
    expect(endpointStatusV2(initialState, action)).toEqual(endpointsToState([endpointB]));
  });

  test('rejected GET_ENDPOINT_STATUS_V2 does not error if endpoint already gone', () => {
    const endpointA = mockEndpointStatusV2({ registered_model_name: 'a' });
    const endpointB = mockEndpointStatusV2({ registered_model_name: 'b' });
    // NB: Only endpointB is in the initial state.
    const initialState = endpointsToState([endpointB]);
    const action = {
      type: rejected(GET_ENDPOINT_STATUS_V2),
      payload: {
        getStatus: () => 404,
        getErrorCode: () => 'RESOURCE_DOES_NOT_EXIST',
      },
      meta: {
        registeredModelName: endpointA.registered_model_name,
      },
    };
    expect(endpointStatusV2(initialState, action)).toEqual(endpointsToState([endpointB]));
  });

  test('rejected GET_ENDPOINT_STATUS_V2 does not remove if not RESOURCE_DOES_NOT_EXIST', () => {
    const endpointA = mockEndpointStatusV2({});
    const initialState = endpointsToState([endpointA]);
    const action = {
      type: rejected(GET_ENDPOINT_STATUS_V2),
      payload: {
        getStatus: () => 400,
        getErrorCode: () => 'BAD_REQUEST',
      },
      meta: {
        registeredModelName: endpointA.registered_model_name,
      },
    };
    expect(endpointStatusV2(initialState, action)).toEqual(endpointsToState([endpointA]));
  });
});

describe('test endpointVersionStatusV2', () => {
  test('initial state', () => {
    expect(endpointVersionStatusV2(undefined, {})).toEqual({});
  });

  test('LIST_ENDPOINT_VERSIONS_V2 replaces all state for that endpoint', () => {
    const versionA1 = mockEndpointVersionStatusV2({
      registered_model_name: 'a',
      endpoint_version_name: '1',
    });
    const versionB1 = mockEndpointVersionStatusV2({
      registered_model_name: 'b',
      endpoint_version_name: '1',
    });
    const versionB2 = mockEndpointVersionStatusV2({
      registered_model_name: 'b',
      endpoint_version_name: '2',
    });
    const versionB3 = mockEndpointVersionStatusV2({
      registered_model_name: 'b',
      endpoint_version_name: '3',
    });

    const endpointKeyA = getServingModelKey(null, 'a');
    const endpointKeyB = getServingModelKey(null, 'b');

    const initialState = { [endpointKeyA]: [versionA1], [endpointKeyB]: [versionB1] };
    const action = {
      type: fulfilled(LIST_ENDPOINT_VERSIONS_V2),
      payload: {
        endpoint_statuses: [versionB2, versionB3],
      },
      meta: {
        registeredModelName: versionB1.registered_model_name,
      },
    };
    const expectedState = { [endpointKeyA]: [versionA1], [endpointKeyB]: [versionB2, versionB3] };
    expect(endpointVersionStatusV2(initialState, action)).toEqual(expectedState);
  });

  test('LIST_ENDPOINT_VERSIONS_V2 returning absent payload results in empty list', () => {
    const endpointKeyA = getServingModelKey(null, 'a');
    const action = {
      type: fulfilled(LIST_ENDPOINT_VERSIONS_V2),
      payload: {},
      meta: {
        registeredModelName: 'a',
      },
    };
    expect(endpointVersionStatusV2({}, action)).toEqual({ [endpointKeyA]: [] });
  });
});
