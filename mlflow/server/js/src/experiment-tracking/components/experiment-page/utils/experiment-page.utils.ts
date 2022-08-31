import { difference } from 'lodash';
import { ExperimentEntity } from '../../../types';
import { SearchExperimentRunsFacetsState } from '../models/SearchExperimentRunsFacetsState';

const MLFLOW_NOTEBOOK_TYPE = 'NOTEBOOK';
const MLFLOW_EXPERIMENT_TYPE = 'MLFLOW_EXPERIMENT';

const EXPERIMENT_TYPE_TAG = 'mlflow.experimentType';

/**
 * Function that gets the experiment type for a given experiment object
 */
export const getExperimentType = (experiment: ExperimentEntity) => {
  const experimentType = experiment.tags.find((tag) => tag.key === EXPERIMENT_TYPE_TAG);
  if (experimentType) {
    return experimentType.value;
  }
  return null;
};

const hasExperimentType = (experiment: ExperimentEntity, type: string) =>
  getExperimentType(experiment) === type;

/**
 * Function returns true if the experiment is of default ("MLFLOW_EXPERIMENT") type
 */
export const isExperimentTypeDefault = (experiment: ExperimentEntity) =>
  hasExperimentType(experiment, MLFLOW_EXPERIMENT_TYPE);

/**
 * Function returns true if the experiment is of notebook type
 */
export const isExperimentTypeNotebook = (experiment: ExperimentEntity) =>
  hasExperimentType(experiment, MLFLOW_NOTEBOOK_TYPE);

/**
 * Function that checks if experiment's allowed actions include
 * modification. TODO: fix typo in the const name.
 */
export const canModifyExperiment = (experiment: ExperimentEntity) =>
  experiment.allowed_actions.includes('MODIFIY_PERMISSION');

const getFilteredKeysByCategorizedUncheckedKeys = (keyList: string[], uncheckedKeys: string[]) =>
  difference<string>(keyList, uncheckedKeys);

export const getFilteredParams = (
  paramKeyList: string[],
  searchFacetsState: SearchExperimentRunsFacetsState,
) =>
  getFilteredKeysByCategorizedUncheckedKeys(
    paramKeyList,
    searchFacetsState.categorizedUncheckedKeys.params,
  );

export const getFilteredMetrics = (
  metricKeyList: string[],
  searchFacetsState: SearchExperimentRunsFacetsState,
) =>
  getFilteredKeysByCategorizedUncheckedKeys(
    metricKeyList,
    searchFacetsState.categorizedUncheckedKeys.metrics,
  );

export const getFilteredTags = (
  tagKeyList: string[],
  searchFacetsState: SearchExperimentRunsFacetsState,
) =>
  getFilteredKeysByCategorizedUncheckedKeys(
    tagKeyList,
    searchFacetsState.categorizedUncheckedKeys.tags,
  );
