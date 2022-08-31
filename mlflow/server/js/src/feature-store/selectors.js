import { getEntities } from '../experiment-tracking/reducers/Reducers';
import { getFeatureTableKey, getOnlineStoreKey, getFeatureKey } from './reducers';
import { Stages } from '../model-registry/constants';
import _ from 'lodash';
import { EndpointState } from '../model-serving/utils';
import { ProducerTypes } from './constants';

export const getFeatureTables = (state) => {
  const { featureTablesByName } = getEntities(state);
  return (featureTablesByName && Object.values(featureTablesByName)) || [];
};

export const getFeatureTableDetails = (state, featureTableName) => {
  const { featureTablesByName } = getEntities(state);
  const key = getFeatureTableKey(featureTableName);
  return (featureTablesByName && featureTablesByName[key]) || {};
};

export const getFeaturesByTable = (state, featureTableName) => {
  const { features } = getEntities(state);
  const key = getFeatureTableKey(featureTableName);
  return (features && features[key] && Object.values(features[key])) || [];
};

export const getFeatureByTableAndName = (state, featureTableName, featureName) => {
  const { featuresByName } = getEntities(state);
  const featureTableKey = getFeatureTableKey(featureTableName);
  const featureKey = getFeatureKey(featureName);
  return (
    (featuresByName &&
      featuresByName[featureTableKey] &&
      featuresByName[featureTableKey][featureKey]) ||
    {}
  );
};

// parse modelVersionsWithFeaturesByName to a map of feature to list of model versions
// output format: { feature_name: [...modelVersions...], ... }
export const getModelVersionsByFeature = (state, featureTableName) => {
  const { modelVersionsWithFeatures, modelEndpointStatus } = getEntities(state);
  const featureTableKey = getFeatureTableKey(featureTableName);
  if (!modelVersionsWithFeatures || !modelVersionsWithFeatures[featureTableKey]) {
    return {};
  }
  // generating feature to model version key value pairs from model version list
  const featureModelVersionPairs = _.flatMap(
    modelVersionsWithFeatures[featureTableKey],
    (modelVersionWithFeatures) => {
      const { feature_list, ...modelVersion } = modelVersionWithFeatures;
      if (!feature_list || !feature_list.features) {
        return [];
      }
      const { name, current_stage } = modelVersion;
      const servingEnabled =
        !!modelEndpointStatus &&
        !!modelEndpointStatus[name] &&
        modelEndpointStatus[name]['state'] === EndpointState.READY &&
        current_stage !== Stages.ARCHIVED;
      return feature_list.features
        .filter(
          ({ feature_table_name }) => getFeatureTableKey(feature_table_name) === featureTableKey,
        )
        .map(({ feature_name }) => ({
          featureName: feature_name,
          modelVersion: { ...modelVersion, serving_enabled: servingEnabled },
        }));
    },
  );
  // reduce feature -> model version key value pairs to be keyed by feature name
  return featureModelVersionPairs.reduce((featureToModelVersions, featureModelVersionPair) => {
    const { featureName, modelVersion } = featureModelVersionPair;
    const modelVersions = featureToModelVersions[featureName] || [];
    return {
      ...featureToModelVersions,
      [featureName]: [...modelVersions, modelVersion],
    };
  }, {});
};

// Reported during ESLint upgrade
// eslint-disable-next-line max-len
export const getOnlineStore = (
  state,
  featureTableName,
  onlineTableName,
  cloud,
  storeType,
  tableArn,
  containerUri,
) => {
  const { onlineStores } = getEntities(state);
  const key = getOnlineStoreKey(
    featureTableName,
    onlineTableName,
    cloud,
    storeType,
    tableArn,
    containerUri,
  );
  return (onlineStores && onlineStores[key]) || {};
};

export const getNotebookConsumers = (state, featureTableName) => {
  const { consumersByFeatureTable, notebooks } = getEntities(state);
  if (!consumersByFeatureTable || !notebooks) {
    return [];
  }
  const consumers = consumersByFeatureTable[getFeatureTableKey(featureTableName)] || [];
  return consumers
    .filter(({ notebook }) => !!notebook)
    .map((consumer) => ({
      ...consumer,
      ...(notebooks[consumer.notebook.notebook_id] && {
        name: notebooks[consumer.notebook.notebook_id],
      }),
    }));
};

export const getJobConsumers = (state, featureTableName) => {
  const { consumersByFeatureTable, jobs } = getEntities(state);
  if (!consumersByFeatureTable || !jobs) {
    return [];
  }
  const consumers = consumersByFeatureTable[getFeatureTableKey(featureTableName)] || [];
  return consumers
    .filter(({ job_run }) => !!job_run)
    .map((consumer) => ({
      ...consumer,
      ...(jobs[consumer.job_run.job_id] && { name: jobs[consumer.job_run.job_id].name }),
    }));
};

export const getNotebookProducers = (state, featureTableName) => {
  const { notebooks } = getEntities(state);
  if (!notebooks) {
    return [];
  }

  const featureTable = getFeatureTableDetails(state, featureTableName);
  if (!featureTable || !featureTable.notebook_producers) {
    return [];
  }
  // we do not want to filter out notebooks that does not exist in `notebooks` reducer because
  // it might be a notebook from remote workspace.
  return featureTable.notebook_producers
    .filter(({ notebook_id }) => !!notebook_id)
    .map((producer) => ({
      ...producer,
      ...(notebooks[producer.notebook_id] && { name: notebooks[producer.notebook_id] }),
      type: ProducerTypes.NOTEBOOK,
    }));
};

export const getJobProducers = (state, featureTableName) => {
  const { jobs, latestRunForJobs } = getEntities(state);
  if (!jobs || !latestRunForJobs) {
    return [];
  }

  const featureTable = getFeatureTableDetails(state, featureTableName);
  if (!featureTable || !featureTable.job_producers) {
    return [];
  }
  // render as long as job id is present in jobs, latest run is not required.
  // we do not want to filter out jobs that does not exist in `jobs` reducer because
  // it might be a job from remote workspace.
  return featureTable.job_producers
    .filter(({ job_id }) => !!job_id)
    .map((producer) => ({
      ...producer,
      ...(jobs[producer.job_id] && {
        name: jobs[producer.job_id].name,
        schedule: jobs[producer.job_id].schedule,
      }),
      ...(latestRunForJobs[producer.job_id] && { latest_run: latestRunForJobs[producer.job_id] }),
      type: ProducerTypes.JOB,
    }));
};

export const getPipelineProducers = (state, featureTableName) => {
  const { pipelines } = getEntities(state);
  if (!pipelines) {
    return [];
  }

  const featureTable = getFeatureTableDetails(state, featureTableName);
  if (!featureTable || !featureTable.dlt_pipeline_producers) {
    return [];
  }

  return featureTable.dlt_pipeline_producers
    .filter(({ pipeline_id }) => !!pipeline_id)
    .map((producer) => ({
      ...producer,
      ...(pipelines[producer.pipeline_id] && {
        name: pipelines[producer.pipeline_id],
      }),
      type: ProducerTypes.PIPELINE,
    }));
};

export const getScheduledJobsForFeatureTables = (state, featureTables) => {
  const { jobs } = getEntities(state);
  if (!featureTables || !jobs) {
    return {};
  }
  return featureTables.reduce((jobForTables, featureTable) => {
    const { name, job_producers } = featureTable;
    const jobProducers = job_producers || [];
    if (!name) {
      return jobForTables;
    }
    return {
      ...jobForTables,
      [getFeatureTableKey(name)]: jobProducers
        .filter(({ job_id }) => !!job_id && !!jobs[job_id] && !!jobs[job_id].schedule)
        .map((jobProducer) => ({
          ...jobProducer,
          name: jobs[jobProducer.job_id].name,
          schedule: jobs[jobProducer.job_id].schedule,
        })),
    };
  }, {});
};

export const getFeatureTableTags = (state, featureTableName) => {
  const { tagsForFeatureTables } = getEntities(state);
  return (tagsForFeatureTables && tagsForFeatureTables[getFeatureTableKey(featureTableName)]) || {};
};

export const getFeatureTags = (state, featureTableName, featureName) => {
  const { tagsForFeatures } = getEntities(state);
  const featureTableKey = getFeatureTableKey(featureTableName);
  const featureKey = getFeatureKey(featureName);
  return (
    (tagsForFeatures &&
      tagsForFeatures[featureTableKey] &&
      tagsForFeatures[featureTableKey][featureKey]) ||
    {}
  );
};

export const getFeatureStoreWidePermissionLevel = (state) => {
  const { featureStoreWidePermissionLevel } = getEntities(state);
  return featureStoreWidePermissionLevel && featureStoreWidePermissionLevel.permissionLevel;
};
