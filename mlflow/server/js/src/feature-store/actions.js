import { getUUID } from '../common/utils/ActionUtils';

import { Services } from './services';
import { Services as ModelRegistryServices } from '../model-registry/services';
import { Services as ModelServingServices } from '../model-serving/services';
import { JobsService } from '../common/sdk/JobsService';
import { PipelinesService } from '../common/sdk/PipelinesService';

export const SEARCH_FEATURE_TABLES = 'SEARCH_FEATURE_TABLES';
export const searchFeatureTablesApi = (
  text,
  max_results,
  pageToken,
  search_scopes,
  id = getUUID(),
) => ({
  type: SEARCH_FEATURE_TABLES,
  payload: Services.searchFeatureTables({
    ...(text && { text }),
    max_results,
    ...(pageToken && { page_token: pageToken }),
    search_scopes,
  }),
  meta: { id, search_scopes },
});

export const GET_FEATURE_TABLE = 'GET_FEATURE_TABLE';
export const getFeatureTableApi = (name, id = getUUID()) => ({
  type: GET_FEATURE_TABLE,
  payload: Services.getFeatureTable({
    name,
  }),
  meta: { id },
});

export const UPDATE_FEATURE_TABLE = 'UPDATE_FEATURE_TABLE';
export const updateFeatureTableApi = (name, description, id = getUUID()) => ({
  type: UPDATE_FEATURE_TABLE,
  payload: Services.updateFeatureTable({
    name,
    description,
  }),
  meta: { id },
});

export const DELETE_FEATURE_TABLE = 'DELETE_FEATURE_TABLE';
export const deleteFeatureTableApi = (name, id = getUUID()) => ({
  type: DELETE_FEATURE_TABLE,
  payload: Services.deleteFeatureTable({
    name,
  }),
  meta: { name, id },
});

export const GET_FEATURES = 'GET_FEATURES';
export const getFeaturesApi = (feature_table, id = getUUID()) => ({
  type: GET_FEATURES,
  payload: Services.getFeatures({
    feature_table,
  }),
  meta: {
    id,
    featureTable: feature_table,
  },
});

export const GET_FEATURE = 'GET_FEATURE';
export const getFeatureApi = (feature_table, name, id = getUUID()) => ({
  type: GET_FEATURE,
  payload: Services.getFeature({
    feature_table,
    name,
  }),
  meta: {
    id,
    featureTable: feature_table,
    name: name,
  },
});

export const UPDATE_FEATURE = 'UPDATE_FEATURE';
export const updateFeatureApi = (featureTable, featureName, description, id = getUUID()) => ({
  type: UPDATE_FEATURE,
  payload: Services.updateFeature({
    feature_table: featureTable,
    name: featureName,
    description: description,
  }),
  meta: { id, featureTable, name: featureName },
});

export const GET_ONLINE_STORE = 'GET_ONLINE_STORE';
// Reported during ESLint upgrade
// eslint-disable-next-line max-len
export const getOnlineStoreApi = (
  featureTableName,
  name,
  cloud,
  storeType,
  tableArn,
  containerUri,
  id = getUUID(),
) => ({
  type: GET_ONLINE_STORE,
  payload: Services.getOnlineStore({
    feature_table: featureTableName,
    online_table: name,
    cloud: cloud && cloud.toUpperCase(),
    store_type: storeType && storeType.toUpperCase(),
    table_arn: tableArn,
    container_uri: containerUri,
  }),
  meta: { id, featureTableName },
});

export const GET_CONSUMERS = 'GET_CONSUMERS';
export const getConsumersApi = (featureTableName, id = getUUID()) => ({
  type: GET_CONSUMERS,
  payload: Services.getConsumers({
    feature_table: featureTableName,
  }),
  meta: { id, featureTableName },
});

export const GET_JOB = 'GET_JOB';
export const getJobApi = (jobId, id = getUUID()) => ({
  type: GET_JOB,
  payload: JobsService.getJob({
    job_id: jobId,
  }),
  meta: { id },
});

export const GET_PIPELINE = 'GET_PIPELINE';
export const getPipelineApi = (pipelineId, id = getUUID()) => ({
  type: GET_PIPELINE,
  payload: PipelinesService.getPipeline(pipelineId),
  meta: { id },
});

export const GET_NOTEBOOKS = 'GET_NOTEBOOKS';
export const getNotebooks = (notebookIds, notebookFetcher, id = getUUID()) => ({
  type: GET_NOTEBOOKS,
  payload: notebookFetcher.getNotebooks(notebookIds),
  meta: { id },
});

export const LIST_MODEL_ENDPOINTS = 'LIST_MODEL_ENDPOINTS';
export const listModelEndpointsApi = (id = getUUID()) => ({
  type: LIST_MODEL_ENDPOINTS,
  // Reported during ESLint upgrade
  // eslint-disable-next-line no-undef
  payload: ModelServingServices.listEndpoints({}),
  meta: { id },
});

export const SEARCH_MODEL_VERSIONS_BY_FEATURE = 'SEARCH_MODEL_VERSIONS_BY_FEATURE';
export const searchModelVersionsByFeatureApi = (filterObj, id = getUUID()) => {
  const { featureTableName, featureNames } = filterObj;
  const featureTableFilter = `featureTableName = '${featureTableName}'`;
  const featureNamesFilter = `featureName IN (${featureNames.map((fn) => `'${fn}'`).join(', ')})`;
  const filter = `${featureTableFilter} AND ${featureNamesFilter}`;

  return {
    type: SEARCH_MODEL_VERSIONS_BY_FEATURE,
    payload: ModelRegistryServices.searchModelVersions({ filter }),
    meta: { id, featureTableName },
  };
};

// This will be replaced with a batch API in the future
export const GET_LATEST_RUN_FOR_JOB = 'GET_LATEST_RUN_FOR_JOB';
export const getLatestRunForJobApi = (jobId, id = getUUID()) => ({
  type: GET_LATEST_RUN_FOR_JOB,
  payload: JobsService.listRuns({
    job_id: jobId,
    limit: 1,
  }),
  meta: { jobId, id },
});

export const GET_TAGS_FOR_FEATURE_TABLE = 'GET_TAGS_FOR_FEATURE_TABLE';
export const getTagsForFeatureTableApi = (featureTableName, featureTableId, id = getUUID()) => ({
  type: GET_TAGS_FOR_FEATURE_TABLE,
  payload: Services.getTags({
    feature_table_id: featureTableId,
  }),
  meta: { featureTableName, id },
});

export const SET_TAGS_FOR_FEATURE_TABLE = 'SET_TAGS_FOR_FEATURE_TABLE';
export const setTagsForFeatureTableApi = (
  featureTableName,
  featureTableId,
  tags,
  id = getUUID(),
) => ({
  type: SET_TAGS_FOR_FEATURE_TABLE,
  payload: Services.setTags({
    feature_table_id: featureTableId,
    tags: tags,
  }),
  meta: { featureTableName, tags, id },
});

export const DELETE_TAGS_FOR_FEATURE_TABLE = 'DELETE_TAGS_FOR_FEATURE_TABLE';
export const deleteTagsForFeatureTableApi = (
  featureTableName,
  featureTableId,
  keys,
  id = getUUID(),
) => ({
  type: DELETE_TAGS_FOR_FEATURE_TABLE,
  payload: Services.deleteTags({
    feature_table_id: featureTableId,
    keys: keys,
  }),
  meta: { featureTableName, keys, id },
});

export const GET_TAGS_FOR_FEATURE = 'GET_TAGS_FOR_FEATURE';
export const getTagsForFeatureApi = (featureTableName, featureName, featureId, id = getUUID()) => ({
  type: GET_TAGS_FOR_FEATURE,
  payload: Services.getTags({
    feature_id: featureId,
  }),
  meta: { featureTableName, featureName, id },
});

export const SET_TAGS_FOR_FEATURE = 'SET_TAGS_FOR_FEATURE';
export const setTagsForFeatureApi = (
  featureTableName,
  featureName,
  featureId,
  tags,
  id = getUUID(),
) => ({
  type: SET_TAGS_FOR_FEATURE,
  payload: Services.setTags({
    feature_id: featureId,
    tags: tags,
  }),
  meta: { featureTableName, featureName, tags, id },
});

export const DELETE_TAGS_FOR_FEATURE = 'DELETE_TAGS_FOR_FEATURE';
export const deleteTagsForFeatureApi = (
  featureTableName,
  featureName,
  featureId,
  keys,
  id = getUUID(),
) => ({
  type: DELETE_TAGS_FOR_FEATURE,
  payload: Services.deleteTags({
    feature_id: featureId,
    keys: keys,
  }),
  meta: { featureTableName, featureName, keys, id },
});

export const GET_FEATURE_STORE_WIDE_PERMISSIONS = 'GET_FEATURE_STORE_WIDE_PERMISSIONS';
export const getFeatureStoreWidePermissionsApi = (id = getUUID()) => ({
  type: GET_FEATURE_STORE_WIDE_PERMISSIONS,
  payload: Services.getFeatureStoreWidePermissions({}),
  meta: { id },
});
