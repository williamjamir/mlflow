import { Services } from './services';
import { getUUID } from '../common/utils/ActionUtils';
import { getArtifactContent } from '../common/utils/ArtifactUtils';
import yaml from 'js-yaml';
// BEGIN-EDGE
import { ACTIVE_STAGES } from './constants';
// END-EDGE

export const CREATE_REGISTERED_MODEL = 'CREATE_REGISTERED_MODEL';
export const createRegisteredModelApi = (name, id = getUUID()) => ({
  type: CREATE_REGISTERED_MODEL,
  payload: Services.createRegisteredModel({ name }),
  meta: { id, name },
});

export const LIST_REGISTERED_MODELS = 'LIST_REGISTERED_MODELS';
export const listRegisteredModelsApi = (id = getUUID()) => ({
  type: LIST_REGISTERED_MODELS,
  payload: Services.listRegisteredModels({}),
  meta: { id },
});

export const SEARCH_REGISTERED_MODELS = 'SEARCH_REGISTERED_MODELS';
export const searchRegisteredModelsApi = (
  filter,
  maxResults,
  orderBy,
  pageToken,
  id = getUUID(),
) => {
  return {
    type: SEARCH_REGISTERED_MODELS,
    payload: Services.searchRegisteredModels({
      filter,
      max_results: maxResults,
      order_by: orderBy,
      ...(pageToken ? { page_token: pageToken } : null),
    }),
    meta: { id },
  };
};

export const UPDATE_REGISTERED_MODEL = 'UPDATE_REGISTERED_MODEL';
export const updateRegisteredModelApi = (name, description, id = getUUID()) => ({
  type: UPDATE_REGISTERED_MODEL,
  payload: Services.updateRegisteredModel({
    name,
    description,
  }),
  meta: { id },
});

export const DELETE_REGISTERED_MODEL = 'DELETE_REGISTERED_MODEL';
export const deleteRegisteredModelApi = (model, id = getUUID(), localUpdateOnly) => ({
  type: DELETE_REGISTERED_MODEL,
  payload: localUpdateOnly
    ? Promise.resolve()
    : Services.deleteRegisteredModel({
        name: model,
      }),
  meta: { id, model },
});

export const SET_REGISTERED_MODEL_TAG = 'SET_REGISTERED_MODEL_TAG';
export const setRegisteredModelTagApi = (modelName, key, value, id = getUUID()) => ({
  type: SET_REGISTERED_MODEL_TAG,
  payload: Services.setRegisteredModelTag({
    name: modelName,
    key: key,
    value: value,
  }),
  meta: { id, modelName, key, value },
});

export const DELETE_REGISTERED_MODEL_TAG = 'DELETE_REGISTERED_MODEL_TAG';
export const deleteRegisteredModelTagApi = (modelName, key, id = getUUID()) => ({
  type: DELETE_REGISTERED_MODEL_TAG,
  payload: Services.deleteRegisteredModelTag({
    name: modelName,
    key: key,
  }),
  meta: { id, modelName, key },
});

export const CREATE_MODEL_VERSION = 'CREATE_MODEL_VERSION';
export const createModelVersionApi = (name, source, runId, id = getUUID()) => ({
  type: CREATE_MODEL_VERSION,
  payload: Services.createModelVersion({ name, source, run_id: runId }),
  meta: { id, name, runId },
});

// BEGIN-EDGE
export const GET_MODEL_VERSION_ARTIFACT_URI = 'GET_MODEL_VERSION_ARTIFACT_URI';
export const getModelVersionArtifactUriApi = (modelName, version, id = getUUID()) => ({
  type: GET_MODEL_VERSION_ARTIFACT_URI,
  payload: Services.getModelVersionArtifactsDownloadUri({
    name: modelName,
    version: version,
  }),
  meta: { id, modelName, version },
});

export const GET_DBFS_FILE = 'GET_DBFS_FILE';
export const getDbfsFileApi = (path, timeout = 15000, id = getUUID()) => ({
  type: GET_DBFS_FILE,
  payload: Services.getDbfsFile({
    path: path,
    timeout: timeout,
  }),
  meta: { id, path },
});

export const GET_MODEL_VERSION_ARTIFACT = 'GET_MODEL_VERSION_ARTIFACT';
export const getModelVersionArtifactApi = (
  modelName,
  version,
  id = getUUID(),
  timeout = 15000,
) => ({
  type: GET_MODEL_VERSION_ARTIFACT,
  payload: Services.getModelVersionArtifactsDownloadUri({
    name: modelName,
    version: version,
  }).then((uri) =>
    Services.getDbfsFile({
      path: `${uri.artifact_uri.replace('dbfs:/', '')}/MLmodel`,
      timeout: timeout,
    }),
  ),
  meta: { id, modelName, version },
});

// END-EDGE
export const oss_GET_MODEL_VERSION_ARTIFACT = 'GET_MODEL_VERSION_ARTIFACT';
export const oss_getModelVersionArtifactApi = (modelName, version, id = getUUID()) => {
  const baseUri = 'model-versions/get-artifact?path=MLmodel';
  const uriEncodedModelName = `name=${encodeURIComponent(modelName)}`;
  const uriEncodedModelVersion = `version=${encodeURIComponent(version)}`;
  const artifactLocation = `${baseUri}&${uriEncodedModelName}&${uriEncodedModelVersion}`;
  return {
    type: GET_MODEL_VERSION_ARTIFACT,
    payload: getArtifactContent(artifactLocation),
    meta: { id, modelName, version },
  };
};

// pass `null` to the `parseMlModelFile` API when we failed to fetch the
// file from DBFS. This will ensure requestId is registered in redux `apis` state
export const PARSE_MLMODEL_FILE = 'PARSE_MLMODEL_FILE';
export const parseMlModelFile = (modelName, version, mlModelFile, id = getUUID()) => {
  if (mlModelFile) {
    try {
      const parsedMlModelFile = yaml.safeLoad(mlModelFile);
      return {
        type: PARSE_MLMODEL_FILE,
        payload: Promise.resolve(parsedMlModelFile),
        meta: { id, modelName, version },
      };
    } catch (error) {
      console.error(error);
      return {
        type: PARSE_MLMODEL_FILE,
        payload: Promise.reject(),
        meta: { id, modelName, version },
      };
    }
  } else {
    return {
      type: PARSE_MLMODEL_FILE,
      payload: Promise.reject(),
      meta: { id, modelName, version },
    };
  }
};

export const GET_MODEL_VERSION_ACTIVITIES = 'GET_MODEL_VERSION_ACTIVITIES';
export const getModelVersionActivitiesApi = (modelName, version, id = getUUID()) => ({
  type: GET_MODEL_VERSION_ACTIVITIES,
  payload: Services.getModelVersionActivities({
    name: modelName,
    version: version,
  }),
  meta: { id, modelName, version },
});

export const resolveFilterValue = (value, includeWildCard = false) => {
  const wrapper = includeWildCard ? '%' : '';
  return value.includes("'") ? `"${wrapper}${value}${wrapper}"` : `'${wrapper}${value}${wrapper}'`;
};

export const SEARCH_MODEL_VERSIONS = 'SEARCH_MODEL_VERSIONS';
export const searchModelVersionsApi = (filterObj, id = getUUID()) => {
  const filter = Object.keys(filterObj)
    .map((key) => {
      if (Array.isArray(filterObj[key]) && filterObj[key].length > 1) {
        return `${key} IN (${filterObj[key].map((elem) => resolveFilterValue(elem)).join()})`;
      } else if (Array.isArray(filterObj[key]) && filterObj[key].length === 1) {
        return `${key}=${resolveFilterValue(filterObj[key][0])}`;
      } else {
        return `${key}=${resolveFilterValue(filterObj[key])}`;
      }
    })
    .join('&');

  return {
    type: SEARCH_MODEL_VERSIONS,
    payload: Services.searchModelVersions({ filter }),
    meta: { id },
  };
};

export const UPDATE_MODEL_VERSION = 'UPDATE_MODEL_VERSION';
export const updateModelVersionApi = (modelName, version, description, id = getUUID()) => ({
  type: UPDATE_MODEL_VERSION,
  payload: Services.updateModelVersion({
    name: modelName,
    version: version,
    description,
  }),
  meta: { id },
});

export const oss_TRANSITION_MODEL_VERSION_STAGE = 'TRANSITION_MODEL_VERSION_STAGE';
export const oss_transitionModelVersionStageApi = (
  modelName,
  version,
  stage,
  archiveExistingVersions,
  id = getUUID(),
) => ({
  type: TRANSITION_MODEL_VERSION_STAGE,
  payload: Services.transitionModelVersionStage({
    name: modelName,
    version,
    stage,
    archive_existing_versions: archiveExistingVersions,
  }),
  meta: { id },
});

// BEGIN-EDGE
export const TRANSITION_MODEL_VERSION_STAGE = 'TRANSITION_MODEL_VERSION_STAGE';
export const transitionModelVersionStageApi = (
  modelName,
  version,
  stage,
  archiveExistingVersions,
  comment,
  id = getUUID(),
) => ({
  type: TRANSITION_MODEL_VERSION_STAGE,
  payload: Services.transitionModelVersionStage({
    name: modelName,
    version,
    stage,
    archive_existing_versions: archiveExistingVersions,
    comment,
  }),
  meta: { id },
});

// END-EDGE
export const DELETE_MODEL_VERSION = 'DELETE_MODEL_VERSION';
export const deleteModelVersionApi = (modelName, version, id = getUUID(), localUpdateOnly) => ({
  type: DELETE_MODEL_VERSION,
  payload: localUpdateOnly
    ? Promise.resolve()
    : Services.deleteModelVersion({
        name: modelName,
        version: version,
      }),
  meta: { id, modelName, version },
});

// BEGIN-EDGE
export const GET_REGISTRY_WIDE_PERMISSIONS = 'GET_REGISTRY_WIDE_PERMISSIONS';
export const getRegistryWidePermissionsApi = (id = getUUID()) => ({
  type: GET_REGISTRY_WIDE_PERMISSIONS,
  payload: Services.getRegistryWidePermissions({}),
  meta: { id },
});

// END-EDGE
export const GET_REGISTERED_MODEL = 'GET_REGISTERED_MODEL';
export const getRegisteredModelApi = (modelName, id = getUUID()) => ({
  type: GET_REGISTERED_MODEL,
  payload: Services.getRegisteredModel({
    name: modelName,
  }),
  meta: { id, modelName },
});

export const GET_MODEL_VERSION = 'GET_MODEL_VERSION';
export const getModelVersionApi = (modelName, version, id = getUUID()) => ({
  type: GET_MODEL_VERSION,
  payload: Services.getModelVersion({
    name: modelName,
    version: version,
  }),
  meta: { id, modelName, version },
});
// BEGIN-EDGE

export const CREATE_COMMENT = 'CREATE_COMMENT';
export const createCommentApi = (modelName, version, comment, id = getUUID()) => ({
  type: CREATE_COMMENT,
  payload: Services.createComment({
    name: modelName,
    version: version,
    comment: comment,
  }),
  meta: { id, modelName, version, comment },
});

export const UPDATE_COMMENT = 'UPDATE_COMMENT';
export const updateCommentApi = (commentId, comment, id = getUUID()) => ({
  type: UPDATE_COMMENT,
  payload: Services.updateComment({
    id: commentId,
    comment: comment,
  }),
  meta: { id, commentId, comment },
});

export const DELETE_COMMENT = 'DELETE_COMMENT';
export const deleteCommentApi = (commentId, id = getUUID()) => ({
  type: DELETE_COMMENT,
  payload: Services.deleteComment({
    id: commentId,
  }),
  meta: { id, commentId },
});

export const CREATE_TRANSITION_REQUEST = 'CREATE_TRANSITION_REQUEST';
export const createTransitionRequestApi = (modelName, version, stage, comment, id = getUUID()) => ({
  type: CREATE_TRANSITION_REQUEST,
  payload: Services.createTransitionRequest({
    name: modelName,
    version: version,
    stage: stage,
    comment,
  }),
  meta: { id, modelName, version },
});

export const LIST_TRANSITION_REQUESTS = 'LIST_TRANSITION_REQUESTS';
export const listTransitionRequestsApi = (modelName, version, id = getUUID()) => ({
  type: LIST_TRANSITION_REQUESTS,
  payload: Services.listTransitionRequests({
    name: modelName,
    version: version,
  }),
  meta: { id, modelName, version },
});

export const APPROVE_TRANSITION_REQUEST = 'APPROVE_TRANSITION_REQUEST';
export const approveTransitionRequestApi = (
  modelName,
  version,
  stage,
  archiveExistingVersions,
  comment,
  id = getUUID(),
) => ({
  type: APPROVE_TRANSITION_REQUEST,
  payload: Services.approveTransitionRequest({
    name: modelName,
    version,
    stage,
    archive_existing_versions: archiveExistingVersions,
    comment,
  }),
  meta: { id },
});

export const REJECT_TRANSITION_REQUEST = 'REJECT_TRANSITION_REQUEST';
export const rejectTransitionRequestApi = (modelName, version, stage, comment, id = getUUID()) => ({
  type: REJECT_TRANSITION_REQUEST,
  payload: Services.rejectTransitionRequest({
    name: modelName,
    version,
    stage,
    comment,
  }),
  meta: { id },
});

export const DELETE_TRANSITION_REQUEST = 'DELETE_TRANSITION_REQUEST';
export const deleteTransitionRequestApi = (
  modelName,
  version,
  comment,
  creatorId,
  stage,
  id = getUUID(),
) => ({
  type: DELETE_TRANSITION_REQUEST,
  payload: Services.deleteTransitionRequest({
    name: modelName,
    version: version,
    stage: stage,
    creator: creatorId,
    comment,
  }),
  meta: { id },
});
// END-EDGE

export const SET_MODEL_VERSION_TAG = 'SET_MODEL_VERSION_TAG';
export const setModelVersionTagApi = (modelName, version, key, value, id = getUUID()) => ({
  type: SET_MODEL_VERSION_TAG,
  payload: Services.setModelVersionTag({
    name: modelName,
    version: version,
    key: key,
    value: value,
  }),
  meta: { id, modelName, version, key, value },
});

export const DELETE_MODEL_VERSION_TAG = 'DELETE_MODEL_VERSION_TAG';
export const deleteModelVersionTagApi = (modelName, version, key, id = getUUID()) => ({
  type: DELETE_MODEL_VERSION_TAG,
  payload: Services.deleteModelVersionTag({
    name: modelName,
    version: version,
    key: key,
  }),
  meta: { id, modelName, version, key },
});
// BEGIN-EDGE

export const SET_EMAIL_SUBSCRIPTION_STATUS = 'SET_EMAIL_SUBSCRIPTION_STATUS';
export const setEmailSubscriptionStatusApi = (modelName, subscriptionType, id = getUUID()) => ({
  type: SET_EMAIL_SUBSCRIPTION_STATUS,
  payload: Services.setEmailSubscriptionStatus({
    model_name: modelName,
    subscription_type: subscriptionType,
  }),
  meta: { id, modelName, subscriptionType },
});

export const GET_EMAIL_SUBSCRIPTION_STATUS = 'GET_EMAIL_SUBSCRIPTION_STATUS';
export const getEmailSubscriptionStatusApi = (modelName, id = getUUID()) => ({
  type: GET_EMAIL_SUBSCRIPTION_STATUS,
  payload: Services.getEmailSubscriptionStatus({
    model_name: modelName,
  }),
  meta: { id, modelName },
});

export const GET_USER_LEVEL_EMAIL_SUBSCRIPTION_STATUS = 'GET_USER_LEVEL_EMAIL_SUBSCRIPTION_STATUS';
export const getUserLevelEmailSubscriptionStatusApi = (id = getUUID()) => ({
  type: GET_USER_LEVEL_EMAIL_SUBSCRIPTION_STATUS,
  payload: Services.getUserLevelEmailSubscriptionStatus({}),
  meta: { id },
});

export const GENERATE_BATCH_INFERENCE_NOTEBOOK = 'GENERATE_BATCH_INFERENCE_NOTEBOOK';
export const generateBatchInferenceNotebookApi = (
  modelName,
  stageOrVersion,
  inputData,
  outputPath,
  id = getUUID(),
) => ({
  type: GENERATE_BATCH_INFERENCE_NOTEBOOK,
  payload: Services.generateBatchInferenceNotebook(
    ACTIVE_STAGES.includes(stageOrVersion)
      ? { name: modelName, stage: stageOrVersion, input_data: inputData, output_path: outputPath }
      : {
          name: modelName,
          version: stageOrVersion,
          input_data: inputData,
          output_path: outputPath,
        },
  ),
  meta: { id, modelName, stageOrVersion },
});
// END-EDGE
