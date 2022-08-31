import { CloudProvider } from '../shared/constants-databricks';

export const PermissionLevels = {
  CAN_MANAGE: 'CAN_MANAGE',
  CAN_EDIT_METADATA: 'CAN_EDIT_METADATA',
  CAN_VIEW_METADATA: 'CAN_VIEW_METADATA',
  // Only applicable at the feature store level and is the least permissible level.
  // Only for internal use, not exposed to the user in UI.
  CAN_CREATE: 'CAN_CREATE',
};

export const ProducerTypes = {
  NOTEBOOK: 'NOTEBOOK',
  JOB: 'JOB',
  PIPELINE: 'PIPELINE',
};

export const ProducerActions = {
  CREATE: 'CREATE',
  WRITE: 'WRITE',
  REGISTER: 'REGISTER',
};

export const ComplexDataTypes = {
  ARRAY: 'ARRAY',
  MAP: 'MAP',
};

export const SearchScopes = {
  FEATURE_TABLES: 'FEATURE_TABLES',
  FEATURES: 'FEATURES',
  DATA_SOURCES: 'DATA_SOURCES',
  FEATURE_TABLE_TAGS: 'FEATURE_TABLE_TAGS',
  FEATURE_TAGS: 'FEATURE_TAGS',
};

/**
 * The following enums are copied from webapp/web/js/generated_files/enums/jobs.js and
 * webapp/web/__generated__/globalTypes.ts. We should keep them in sync those files.
 */

export const SchedulePauseStatus = {
  PAUSED: 'PAUSED',
  UNPAUSED: 'UNPAUSED',
};

export const RunLifeCycleState = {
  PENDING: 'PENDING',
  RUNNING: 'RUNNING',
  TERMINATING: 'TERMINATING',
  TERMINATED: 'TERMINATED',
  SKIPPED: 'SKIPPED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
};

export const RunResultState = {
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
  TIMEDOUT: 'TIMEDOUT',
  CANCELED: 'CANCELED',
};

export const RunFailureStates = [
  RunLifeCycleState.SKIPPED,
  RunLifeCycleState.INTERNAL_ERROR,
  RunResultState.FAILED,
  RunResultState.TIMEDOUT,
  RunResultState.CANCELED,
];

export const RunSuccessStates = [RunResultState.SUCCESS];

export const RunRunningStates = [
  RunLifeCycleState.PENDING,
  RunLifeCycleState.RUNNING,
  RunLifeCycleState.TERMINATING,
];

// Max number of features can be supplied per request in searchModelVersionsByFeature.
// This number should be kept in sync with SearchSqlUtils.SEARCH_RUNS_MAX_RESULTS_UI_DEFAULT in
// mlflow backend.
export const MAX_NUMBER_OF_FEATURES_PER_REQUEST = 200;

// Max number of data sources to render by default in different pages in a expandable list.
export const MAX_DATA_SOURCES_TABLE_SEARCH_PAGE = 1;
export const MAX_DATA_SOURCES_TABLE_DETAILED_PAGE = 3;

// Documentation links
export const DatabricksFeatureStoreDocUrl = {
  [CloudProvider.AWS]:
    'https://docs.databricks.com/applications/machine-learning/feature-store/index.html',
  [CloudProvider.GCP]:
    'https://docs.gcp.databricks.com/applications/machine-learning/feature-store/index.html',
  [CloudProvider.Azure]:
    'https://docs.microsoft.com/azure/databricks/applications/machine-learning/feature-store',
};

export const DatabricksFeatureStoreScheduleJobDocUrl = {
  [CloudProvider.AWS]:
    'https://docs.databricks.com/applications/machine-learning/feature-store/' +
    'feature-tables.html#schedule-a-job-to-update-a-feature-table',
  [CloudProvider.GCP]:
    'https://docs.gcp.databricks.com/applications/machine-learning/feature-store/' +
    'feature-tables.html#schedule-a-job-to-update-a-feature-table',
  [CloudProvider.Azure]:
    'https://docs.microsoft.com/azure/databricks/applications/machine-learning/feature-store/' +
    'feature-tables#schedule-a-job-to-update-a-feature-table',
};

export const DatabricksFeatureStoreDeleteTableDocUrl = {
  [CloudProvider.AWS]:
    'https://docs.databricks.com/applications/machine-learning/feature-store/' +
    'ui.html#delete-a-feature-table',
  [CloudProvider.GCP]:
    'https://docs.gcp.databricks.com/applications/machine-learning/feature-store/' +
    'ui.html#delete-a-feature-table',
  [CloudProvider.Azure]:
    'https://docs.microsoft.com/azure/databricks/applications/machine-learning/feature-store/' +
    'ui#delete-a-feature-table',
};

// TODO(alexcheng): Update these links when documentation for feature table profiling becomes avail
export const DatabricksFeatureTableProfilingDocUrl = {
  [CloudProvider.AWS]:
    'https://docs.databricks.com/applications/machine-learning/feature-store/' +
    'ui.html#delete-a-feature-table',
  [CloudProvider.GCP]:
    'https://docs.gcp.databricks.com/applications/machine-learning/feature-store/' +
    'ui.html#delete-a-feature-table',
  [CloudProvider.Azure]:
    'https://docs.microsoft.com/azure/databricks/applications/machine-learning/feature-store/' +
    'ui#delete-a-feature-table',
};
