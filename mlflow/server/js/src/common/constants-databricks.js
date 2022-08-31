// Please keep this in sync with CloudProviderInterface in
// `webapp/web/js/generated_files/enums/cluster.d.ts`
import { FormattedMessage } from 'react-intl';
import React from 'react';
import { CloudProvider } from '../shared/constants-databricks';

export const DatabricksExperimentTrackingDocUrl = {
  [CloudProvider.AWS]: 'https://docs.databricks.com/applications/mlflow/tracking.html',
  [CloudProvider.GCP]: 'https://docs.gcp.databricks.com/applications/mlflow/tracking.html',
  [CloudProvider.Azure]:
    'https://docs.microsoft.com/en-us/azure/databricks/applications/mlflow/tracking',
};

export const DatabricksLoggingRunsDocUrl = {
  [CloudProvider.AWS]:
    'https://docs.databricks.com/applications/mlflow/' +
    'tracking.html#log-runs-to-a-notebook-or-workspace-experiment',
  [CloudProvider.GCP]:
    'https://docs.gcp.databricks.com/applications/mlflow/' +
    'tracking.html#log-runs-to-a-notebook-or-workspace-experiment',
  [CloudProvider.Azure]:
    'https://docs.microsoft.com/en-us/azure/databricks/applications/mlflow/' +
    'tracking#--log-runs-to-a-notebook-or-workspace-experiment',
};

export const DatabricksRegisterAModelDocUrl = {
  [CloudProvider.AWS]:
    'https://docs.databricks.com/applications/machine-learning/' +
    'manage-model-lifecycle/index.html#create-or-register-a-model',
  [CloudProvider.GCP]:
    'https://docs.gcp.databricks.com/applications/machine-learning/' +
    'manage-model-lifecycle/index.html#create-or-register-a-model',
  [CloudProvider.Azure]:
    'https://docs.microsoft.com/azure/databricks/applications/machine-learning/' +
    'manage-model-lifecycle/#create-or-register-a-model',
};

export const DatabricksModelRegistryDocUrl = {
  [CloudProvider.AWS]:
    'https://docs.databricks.com/applications/machine-learning/' +
    'manage-model-lifecycle/index.html',
  [CloudProvider.GCP]:
    'https://docs.gcp.databricks.com/applications/machine-learning/' +
    'manage-model-lifecycle/index.html',
  [CloudProvider.Azure]:
    'https://docs.microsoft.com/azure/databricks/applications/machine-learning/' +
    'manage-model-lifecycle/',
};

export const DatabricksModelRegistryOnboardingString = {
  [CloudProvider.AWS]: (
    <FormattedMessage
      defaultMessage='Share and serve machine learning models.'
      description='Text for model registry onboarding on the model list page on AWS'
    />
  ),
  [CloudProvider.GCP]: (
    <FormattedMessage
      defaultMessage='Share and manage machine learning models.'
      description='Text for model registry onboarding on the model list page on GCP'
    />
  ),
  [CloudProvider.Azure]: (
    <FormattedMessage
      defaultMessage='Share and serve machine learning models.'
      description='Text for model registry onboarding on the model list page on Azure'
    />
  ),
};

export const DatabricksModelRegistryEmailDocUrl = {
  [CloudProvider.AWS]:
    'https://docs.databricks.com/applications/machine-learning/manage-model-lifecycle/index.html' +
    '#control-notification-preferences',
  [CloudProvider.GCP]:
    'https://docs.gcp.databricks.com/applications/machine-learning/manage-model-lifecycle/' +
    'index.html#control-notification-preferences',
  [CloudProvider.Azure]:
    'https://docs.microsoft.com/en-us/azure/databricks/applications/machine-learning/' +
    'manage-model-lifecycle/#control-notification-preferences',
};

export const DatabricksModelServingDocUrl = {
  [CloudProvider.AWS]: 'https://docs.databricks.com/applications/mlflow/model-serving.html',
  [CloudProvider.GCP]: 'https://docs.gcp.databricks.com/applications/mlflow/model-serving.html',
  [CloudProvider.Azure]:
    'https://docs.microsoft.com/azure/databricks/applications/mlflow/model-serving',
};

// TODO: These doc links don't currently (6-10-22) exist. Make sure they do before we remove the GOC
export const DatabricksModelMonitoringDocUrl = {
  [CloudProvider.AWS]: 'https://docs.databricks.com/applications/mlflow/model-monitoring.html',
  [CloudProvider.GCP]: 'https://docs.gcp.databricks.com/applications/mlflow/model-monitoring.html',
  [CloudProvider.Azure]:
    'https://docs.microsoft.com/azure/databricks/applications/mlflow/model-monitoring',
};

export const DatabricksArtifactPermissionsDocUrl = {
  [CloudProvider.AWS]:
    'https://docs.databricks.com/' +
    'security/access-control/workspace-acl.html#mlflow-artifact-permissions',
  [CloudProvider.GCP]:
    'https://docs.gcp.databricks.com/' +
    'security/access-control/workspace-acl.html#mlflow-artifact-permissions',
  [CloudProvider.Azure]:
    'https://docs.microsoft.com/azure/databricks/' +
    'security/access-control/workspace-acl#mlflow-artifact-permissions',
};

export const DatabricksSupportPageUrl = {
  [CloudProvider.AWS]: 'https://docs.databricks.com/resources/support.html',
  [CloudProvider.GCP]: 'https://docs.gcp.databricks.com/resources/support.html',
  [CloudProvider.Azure]: 'https://azure.microsoft.com/en-us/support/plans/',
};
