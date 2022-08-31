import {
  compareModelVersionsPageRoute,
  createModelPageRoute,
  modelListPageRoute,
  modelPageRoute,
  modelSubpageRoute,
  modelSubpageRouteWithName,
  modelVersionPageRoute,
} from '../model-registry/routes';
import Routes from '../experiment-tracking/routes';
import { FeatureStoreRoutes } from '../feature-store/routes';
import { InteractionName } from '@databricks/web-shared-bundle/metrics';
import { matchPath } from 'react-router';

const mlflowInteractionMap = {
  [Routes.rootRoute]: InteractionName.MLFLOW_EXPERIMENT_OBSERVATORY_LIST,
  [Routes.experimentsObservatoryRoute]: InteractionName.MLFLOW_EXPERIMENT_OBSERVATORY_LIST,
  [Routes.experimentPageRoute]: InteractionName.MLFLOW_EXPERIMENT_PAGE,
  [Routes.runPageWithArtifactSelectedRoute]: InteractionName.MLFLOW_RUN_PAGE,
  [Routes.runPageRoute]: InteractionName.MLFLOW_RUN_PAGE,
  [Routes.metricPageRoute]: InteractionName.MLFLOW_METRIC_PAGE,
  [Routes.compareRunPageRoute]: InteractionName.MLFLOW_COMPARE_RUN_PAGE,
  [Routes.compareExperimentsSearchPageRoute]: InteractionName.MLFLOW_COMPARE_EXPERIMENTS_HOME_PAGE,
  [Routes.experimentPageSearchRoute]: InteractionName.MLFLOW_EXPERIMENT_PAGE,
  [modelListPageRoute]: InteractionName.MLFLOW_MODEL_LIST_PAGE,
  [modelVersionPageRoute]: InteractionName.MLFLOW_MODEL_VERSION_PAGE,
  [modelPageRoute]: InteractionName.MLFLOW_MODEL_PAGE,
  [modelSubpageRoute]: InteractionName.MLFLOW_MODEL_PAGE_SUBPAGE,
  [modelSubpageRouteWithName]: InteractionName.MLFLOW_MODEL_PAGE_SUBPAGE_WITH_NAME,
  [compareModelVersionsPageRoute]: InteractionName.MLFLOW_COMPARE_MODEL_VERSIONS_PAGE,
  [createModelPageRoute]: InteractionName.MLFLOW_CREATE_MODEL_PAGE,
  [FeatureStoreRoutes.BASE]: InteractionName.FEATURE_STORE_PAGE,
  [FeatureStoreRoutes.TABLE_DETAIL]: InteractionName.FEATURE_STORE_TABLE_PAGE,
  [FeatureStoreRoutes.ONLINE_STORE]: InteractionName.FEATURE_STORE_STORE_PAGE,
};

/**
 * Generic version of a function that seeks through the interaction map (string->string dictionary)
 * and returns the first interaction name that matches given location pathname with a pattern.
 * If no interactions are provided, default fallback value is being returned.
 */
export const getMappedInteractionName = (locationPathname, interactionMap, defaultValue) => {
  /**
   * Iterate through the list of route<>interaction mapping and
   * try to find first matching route. If a route is found,
   * ignore the rest of the list.
   */
  const result = Object.entries(interactionMap).reduce(
    (foundInteractionName, [path, currentInteractionName]) => {
      if (foundInteractionName) {
        return foundInteractionName;
      }

      return matchPath(locationPathname, { path, exact: true })
        ? currentInteractionName
        : foundInteractionName;
    },
    undefined,
  );

  /**
   *  If no interaction name is found, fall back to the default value
   */
  return result || defaultValue;
};

export const getMlflowInteractionName = (locationPathname) =>
  getMappedInteractionName(locationPathname, mlflowInteractionMap, InteractionName.MLFLOW_UNKNOWN);
