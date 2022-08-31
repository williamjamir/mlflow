import { fulfilled } from '../common/utils/ActionUtils';
import {
  GET_FEATURE_TABLE,
  GET_FEATURES,
  GET_FEATURE,
  UPDATE_FEATURE,
  GET_ONLINE_STORE,
  SEARCH_FEATURE_TABLES,
  SEARCH_MODEL_VERSIONS_BY_FEATURE,
  UPDATE_FEATURE_TABLE,
  GET_CONSUMERS,
  GET_JOB,
  GET_PIPELINE,
  GET_NOTEBOOKS,
  GET_LATEST_RUN_FOR_JOB,
  DELETE_FEATURE_TABLE,
  SET_TAGS_FOR_FEATURE_TABLE,
  GET_TAGS_FOR_FEATURE_TABLE,
  DELETE_TAGS_FOR_FEATURE_TABLE,
  LIST_MODEL_ENDPOINTS,
  SET_TAGS_FOR_FEATURE,
  GET_TAGS_FOR_FEATURE,
  DELETE_TAGS_FOR_FEATURE,
  GET_FEATURE_STORE_WIDE_PERMISSIONS,
} from './actions';
import { getProtoField } from '../model-registry/utils';
import _ from 'lodash';

export const featureTablesByName = (state = {}, action) => {
  switch (action.type) {
    case fulfilled(SEARCH_FEATURE_TABLES): {
      const { payload } = action;
      const featureTables = payload.feature_tables;
      const tablesByName = {};
      if (featureTables) {
        featureTables.forEach((featureTable) => {
          const featureTableName = getFeatureTableKey(featureTable.name);
          tablesByName[featureTableName] = featureTable;
        });
      }
      return {
        ...tablesByName,
      };
    }
    // use fall-through here as both methods returns an updated feature table
    case fulfilled(UPDATE_FEATURE_TABLE):
    case fulfilled(GET_FEATURE_TABLE): {
      const { payload } = action;
      const tableDetails = payload.feature_table;
      if (tableDetails && tableDetails.name) {
        const featureTableKey = getFeatureTableKey(tableDetails.name);
        const tableDetailsWithUpdatedMetadata = {
          ...state[featureTableKey],
          ...tableDetails,
        };
        return {
          ...state,
          [featureTableKey]: tableDetailsWithUpdatedMetadata,
        };
      } else {
        return state;
      }
    }
    case fulfilled(DELETE_FEATURE_TABLE): {
      const { meta } = action;
      return _.omit(state, getFeatureTableKey(meta.name));
    }
    default:
      return state;
  }
};

export const features = (state = {}, action) => {
  switch (action.type) {
    case fulfilled(GET_FEATURES): {
      const { payload } = action;
      const featuresList = payload.features;
      if (featuresList && action.meta && action.meta.featureTable) {
        const featureTableKey = getFeatureTableKey(action.meta.featureTable);
        const featuresByTableNameWithUpdatedMetadata = {
          ...state[featureTableKey],
          ...featuresList,
        };
        return {
          ...state,
          [featureTableKey]: featuresByTableNameWithUpdatedMetadata,
        };
      } else {
        return state;
      }
    }
    case fulfilled(DELETE_FEATURE_TABLE): {
      const { meta } = action;
      return _.omit(state, getFeatureTableKey(meta.name));
    }
    default:
      return state;
  }
};

export const featuresByName = (state = {}, action) => {
  switch (action.type) {
    // use fall-through here as both methods return an updated feature
    case fulfilled(UPDATE_FEATURE):
    case fulfilled(GET_FEATURE): {
      const { payload } = action;
      const { feature } = payload;
      if (feature && action.meta && action.meta.name && action.meta.featureTable) {
        const featureTableKey = getFeatureTableKey(action.meta.featureTable);
        const featureKey = getFeatureKey(action.meta.name);
        const updatedFeaturesByTableName = {
          ...state[featureTableKey],
          [featureKey]: feature,
        };
        return {
          ...state,
          [featureTableKey]: updatedFeaturesByTableName,
        };
      } else {
        return state;
      }
    }
    default:
      return state;
  }
};

export const getFeatureTableKey = (featureTableName) => {
  return featureTableName.toLowerCase();
};

export const getFeatureKey = (featureName) => {
  return featureName.toLowerCase();
};

// Reported during ESLint upgrade
// eslint-disable-next-line max-len
export const getOnlineStoreKey = (
  featureTableName,
  onlineTableName,
  cloud,
  storeType,
  tableArn,
  containerUri,
) => {
  // Reported during ESLint upgrade
  // eslint-disable-next-line max-len
  return [featureTableName, onlineTableName, cloud, storeType, tableArn, containerUri]
    .filter((f) => f !== undefined)
    .join('-')
    .toLowerCase();
};

export const getProducerKey = (producerType, entityId, childId) => {
  return [producerType, entityId, childId]
    .filter((k) => !!k)
    .join('-')
    .toLowerCase();
};

export const onlineStores = (state = {}, action) => {
  switch (action.type) {
    case fulfilled(GET_ONLINE_STORE): {
      const { payload, meta } = action;
      const onlineStore = payload.online_store;
      if (meta && meta.featureTableName && onlineStore && onlineStore.name) {
        const { featureTableName } = meta;
        const { name, cloud, store_type: storeType } = onlineStore;
        // Reported during ESLint upgrade
        // eslint-disable-next-line max-len
        const key = getOnlineStoreKey(
          featureTableName,
          name,
          cloud,
          storeType,
          onlineStore.dynamodb_metadata && onlineStore.dynamodb_metadata.table_arn,
          onlineStore.cosmosdb_metadata && onlineStore.cosmosdb_metadata.container_uri,
        );
        return {
          ...state,
          [key]: onlineStore,
        };
      }
      return state;
    }
    default:
      return state;
  }
};

export const consumersByFeatureTable = (state = {}, action) => {
  switch (action.type) {
    case fulfilled(GET_CONSUMERS): {
      const { payload, meta } = action;
      const { consumers } = payload;
      const { featureTableName } = meta;
      if (featureTableName && consumers && consumers.length > 0) {
        return {
          ...state,
          [getFeatureTableKey(featureTableName)]: consumers,
        };
      }
      return state;
    }
    case fulfilled(DELETE_FEATURE_TABLE): {
      const { meta } = action;
      return _.omit(state, getFeatureTableKey(meta.name));
    }
    default:
      return state;
  }
};

export const jobs = (state = {}, action) => {
  switch (action.type) {
    case fulfilled(GET_JOB): {
      const { payload } = action;
      const { job_id, settings } = payload;
      if (!job_id || !settings || !settings.name) {
        return state;
      }
      const { name, schedule } = settings;
      return {
        ...state,
        [job_id]: {
          name,
          schedule,
        },
      };
    }
    default:
      return state;
  }
};

export const latestRunForJobs = (state = {}, action) => {
  switch (action.type) {
    case fulfilled(GET_LATEST_RUN_FOR_JOB): {
      const { payload } = action;
      const { runs } = payload;
      if (!runs || runs.length === 0) {
        return state;
      }
      const latestRun = runs[0];
      return {
        ...state,
        [latestRun.job_id]: latestRun,
      };
    }
    default:
      return state;
  }
};

export const pipelines = (state = {}, action) => {
  switch (action.type) {
    case fulfilled(GET_PIPELINE): {
      const { payload } = action;
      const { pipeline_id, spec } = payload;
      if (!pipeline_id || !spec || !spec.name) {
        return state;
      }
      const { name } = spec;
      return {
        ...state,
        // Only store the name of the pipeline. The DLT pipelines API automatically redirects to
        // the latest update page given a pipeline ID.
        [pipeline_id]: name,
      };
    }
    default:
      return state;
  }
};

export const notebooks = (state = {}, action) => {
  switch (action.type) {
    case fulfilled(GET_NOTEBOOKS): {
      const { payload } = action;
      const idToName = payload.reduce((acc, { id, name }) => ({ ...acc, [id]: name }), {});
      return { ...state, ...idToName };
    }
    default:
      return state;
  }
};

export const modelEndpointStatus = (state = {}, action) => {
  switch (action.type) {
    case fulfilled(LIST_MODEL_ENDPOINTS): {
      const endpoints = action.payload.endpoints || [];
      return endpoints
        .filter((endpoint) => !!endpoint.registered_model_name)
        .reduce(
          (acc, endpoint) => ({
            ...acc,
            [endpoint.registered_model_name]: endpoint,
          }),
          { ...state },
        );
    }
    default:
      return state;
  }
};

export const modelVersionsWithFeatures = (state = {}, action) => {
  switch (action.type) {
    case fulfilled(SEARCH_MODEL_VERSIONS_BY_FEATURE): {
      const modelVersions = action.payload[getProtoField('model_versions')];
      const { featureTableName } = action.meta;
      if (!featureTableName || !modelVersions) {
        return state;
      }
      const currentModelVersions = state[getFeatureTableKey(featureTableName)] || [];
      // union the received model versions with existing model versions in redux because
      // we may send multiple requests to model registry to fetch model versions for the same table.
      // In the case of a duplicate, the element from the first array (received model versions)
      // will overrides the element from the second array (existing model versions in redux).
      return {
        ...state,
        [getFeatureTableKey(featureTableName)]: _.unionWith(
          modelVersions,
          currentModelVersions,
          (mv1, mv2) => mv1.name === mv2.name && mv1.version === mv2.version,
        ),
      };
    }
    case fulfilled(DELETE_FEATURE_TABLE): {
      const { meta } = action;
      return _.omit(state, getFeatureTableKey(meta.name));
    }
    default:
      return state;
  }
};

export const tagsForFeatureTables = (state = {}, action) => {
  switch (action.type) {
    case fulfilled(GET_TAGS_FOR_FEATURE_TABLE): {
      const { tags } = action.payload;
      const { featureTableName } = action.meta;
      if (featureTableName && tags) {
        return {
          ...state,
          [getFeatureTableKey(featureTableName)]: tags.reduce(
            (acc, tag) => ({ ...acc, [tag.key]: tag }),
            {},
          ),
        };
      }
      return state;
    }
    case fulfilled(SET_TAGS_FOR_FEATURE_TABLE): {
      const { featureTableName, tags } = action.meta;
      if (featureTableName && tags) {
        const featureTableKey = getFeatureTableKey(featureTableName);
        const oldTags = state[featureTableKey] || {};
        const newTags = tags.reduce((acc, tag) => ({ ...acc, [tag.key]: tag }), {});
        return {
          ...state,
          // newTags will overrides oldTags
          [featureTableKey]: {
            ...oldTags,
            ...newTags,
          },
        };
      }
      return state;
    }
    case fulfilled(DELETE_TAGS_FOR_FEATURE_TABLE): {
      const { featureTableName, keys } = action.meta;
      if (featureTableName && keys) {
        const featureTableKey = getFeatureTableKey(featureTableName);
        const oldTags = state[featureTableKey] || {};
        return {
          ...state,
          [featureTableKey]: _.omit(oldTags, keys),
        };
      }
      return state;
    }
    case fulfilled(DELETE_FEATURE_TABLE): {
      const { name } = action.meta;
      return _.omit(state, getFeatureTableKey(name));
    }
    default:
      return state;
  }
};

export const tagsForFeatures = (state = {}, action) => {
  switch (action.type) {
    case fulfilled(GET_TAGS_FOR_FEATURE): {
      const { tags } = action.payload;
      const { featureTableName, featureName } = action.meta;
      if (featureTableName && featureName && tags) {
        const featureTableKey = getFeatureTableKey(featureTableName);
        const featureKey = getFeatureKey(featureName);
        const featuresByTableNameWithUpdatedTags = {
          ...state[featureTableKey],
          [featureKey]: tags.reduce((acc, tag) => ({ ...acc, [tag.key]: tag }), {}),
        };
        return {
          ...state,
          [featureTableKey]: featuresByTableNameWithUpdatedTags,
        };
      }
      return state;
    }
    case fulfilled(SET_TAGS_FOR_FEATURE): {
      const { featureTableName, featureName, tags } = action.meta;
      if (featureTableName && featureName && tags) {
        const featureTableKey = getFeatureTableKey(featureTableName);
        const featureKey = getFeatureKey(featureName);
        const oldTags = (state[featureTableKey] && state[featureTableKey][featureKey]) || {};
        const newTags = tags.reduce((acc, tag) => ({ ...acc, [tag.key]: tag }), {});
        const featuresByTableNameWithUpdatedTags = {
          ...state[featureTableKey],
          // newTags will override oldTags with the same key
          [featureKey]: {
            ...oldTags,
            ...newTags,
          },
        };
        return {
          ...state,
          [featureTableKey]: featuresByTableNameWithUpdatedTags,
        };
      }
      return state;
    }
    case fulfilled(DELETE_TAGS_FOR_FEATURE): {
      const { featureTableName, featureName, keys } = action.meta;
      if (featureTableName && featureName && keys) {
        const featureTableKey = getFeatureTableKey(featureTableName);
        const featureKey = getFeatureKey(featureName);
        const oldTags = (state[featureTableKey] && state[featureTableKey][featureKey]) || {};
        const featuresByTableNameWithUpdatedTags = {
          ...state[featureTableKey],
          [featureKey]: _.omit(oldTags, keys),
        };
        return {
          ...state,
          [featureTableKey]: featuresByTableNameWithUpdatedTags,
        };
      }
      return state;
    }
    default:
      return state;
  }
};

export const featureStoreWidePermissionLevel = (state = {}, action) => {
  switch (action.type) {
    case fulfilled(GET_FEATURE_STORE_WIDE_PERMISSIONS): {
      const permissionLevel = action.payload['permission_level'];
      return {
        ...state,
        permissionLevel,
      };
    }
    default:
      return state;
  }
};

export const featureStoreReducers = {
  featureTablesByName,
  features,
  featuresByName,
  onlineStores,
  consumersByFeatureTable,
  jobs,
  pipelines,
  notebooks,
  modelEndpointStatus,
  modelVersionsWithFeatures,
  latestRunForJobs,
  tagsForFeatureTables,
  tagsForFeatures,
  featureStoreWidePermissionLevel,
};
