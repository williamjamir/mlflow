import {
  // BEGIN-EDGE
  defaultError,
  // END-EDGE
  deleteJson,
  getBigIntJson,
  getJson,
  patchBigIntJson,
  patchJson,
  postBigIntJson,
  postJson,
} from '../common/utils/FetchUtils';

export class Services {
  /**
   * Create a registered model
   */
  static createRegisteredModel = (data) =>
    postBigIntJson({ relativeUrl: 'ajax-api/2.0/preview/mlflow/registered-models/create', data });

  // BEGIN-EDGE
  /**
   * List all registered models (Databricks internal)
   */
  static listRegisteredModels = (data) =>
    getBigIntJson({ relativeUrl: 'ajax-api/2.0/mlflow/databricks/registered-models/list', data });

  // END-EDGE
  /**
   * List all registered models
   */
  static oss_listRegisteredModels = (data) =>
    getBigIntJson({ relativeUrl: 'ajax-api/2.0/preview/mlflow/registered-models/list', data });

  // BEGIN-EDGE
  /**
   * Search registered models (Databricks internal)
   */
  static searchRegisteredModels = (data) =>
    getBigIntJson({ relativeUrl: 'ajax-api/2.0/mlflow/databricks/registered-models/search', data });

  // END-EDGE
  /**
   * Search registered models
   */
  static oss_searchRegisteredModels = (data) =>
    getBigIntJson({ relativeUrl: 'ajax-api/2.0/preview/mlflow/registered-models/search', data });

  /**
   * Update registered model
   */
  static updateRegisteredModel = (data) =>
    patchBigIntJson({ relativeUrl: 'ajax-api/2.0/preview/mlflow/registered-models/update', data });

  /**
   * Delete registered model
   */
  static deleteRegisteredModel = (data) =>
    deleteJson({ relativeUrl: 'ajax-api/2.0/preview/mlflow/registered-models/delete', data });

  /**
   * Set registered model tag
   */
  static setRegisteredModelTag = (data) =>
    postJson({ relativeUrl: 'ajax-api/2.0/preview/mlflow/registered-models/set-tag', data });

  /**
   * Delete registered model tag
   */
  static deleteRegisteredModelTag = (data) =>
    deleteJson({ relativeUrl: 'ajax-api/2.0/preview/mlflow/registered-models/delete-tag', data });

  /**
   * Create model version
   */
  static createModelVersion = (data) =>
    postBigIntJson({ relativeUrl: 'ajax-api/2.0/preview/mlflow/model-versions/create', data });

  // BEGIN-EDGE
  /**
   * List all activities for a model version (Databricks internal)
   */
  static getModelVersionActivities = (data) =>
    getBigIntJson({
      relativeUrl: 'ajax-api/2.0/preview/mlflow/model-versions/get-activities',
      data,
    });

  /**
   * Search model versions (Databricks internal)
   */
  static searchModelVersions = (data) =>
    getJson({ relativeUrl: 'ajax-api/2.0/mlflow/databricks/model-versions/search', data });

  // END-EDGE
  /**
   * Search model versions
   */
  static oss_searchModelVersions = (data) =>
    getJson({ relativeUrl: 'ajax-api/2.0/preview/mlflow/model-versions/search', data });

  /**
   * Update model version
   */
  static updateModelVersion = (data) =>
    patchJson({ relativeUrl: 'ajax-api/2.0/preview/mlflow/model-versions/update', data });

  // BEGIN-EDGE
  /**
   * Transition model version stage (Databricks internal)
   */
  static transitionModelVersionStage = (data) =>
    postJson({
      relativeUrl: 'ajax-api/2.0/mlflow/databricks/model-versions/transition-stage',
      data,
    });

  // END-EDGE
  /**
   * Transition model version stage
   */
  static oss_transitionModelVersionStage = (data) =>
    postJson({ relativeUrl: 'ajax-api/2.0/preview/mlflow/model-versions/transition-stage', data });

  /**
   * Delete model version
   */
  static deleteModelVersion = (data) =>
    deleteJson({ relativeUrl: 'ajax-api/2.0/preview/mlflow/model-versions/delete', data });

  // BEGIN-EDGE
  /**
   * Get permissions for a registered model - for registry-wide ACLs (Databricks internal)
   */
  static getRegistryWidePermissions = (data) =>
    getJson({
      relativeUrl: 'ajax-api/2.0/mlflow/registered-models/get-registry-wide-permissions',
      data,
    });

  /**
   * Get individual registered model (Databricks internal)
   */
  static getRegisteredModel = (data) =>
    getJson({ relativeUrl: 'ajax-api/2.0/mlflow/databricks/registered-models/get', data });

  // END-EDGE
  /**
   * Get individual registered model
   */
  static oss_getRegisteredModel = (data) =>
    getJson({ relativeUrl: 'ajax-api/2.0/preview/mlflow/registered-models/get', data });

  // BEGIN-EDGE
  /**
   * Get individual model version (Databricks internal)
   */
  static getModelVersion = (data) =>
    getJson({ relativeUrl: 'ajax-api/2.0/mlflow/databricks/model-versions/get', data });

  /**
   * Get model version artifact download uri (Databricks internal)
   */
  static getModelVersionArtifactsDownloadUri = (data) =>
    getJson({ relativeUrl: 'ajax-api/2.0/preview/mlflow/model-versions/get-download-uri', data });

  /**
   * Get file from dbfs (Databricks internal)
   */
  static getDbfsFile = (data) =>
    getJson({
      relativeUrl: `ajax-dbfs/${data.path}`,
      options: { redirect: 'follow' },
      timeoutMs: data.timeout,
    });

  // END-EDGE
  /**
   * Get individual model version
   */
  static oss_getModelVersion = (data) =>
    getJson({ relativeUrl: 'ajax-api/2.0/preview/mlflow/model-versions/get', data });

  // BEGIN-EDGE
  /**
   * Create a comment (Databricks internal)
   */
  static createComment = (data) =>
    postJson({ relativeUrl: 'ajax-api/2.0/mlflow/comments/create', data });

  /**
   * Update the comment on a comment activity (Databricks internal)
   */
  static updateComment = (data) =>
    patchJson({ relativeUrl: 'ajax-api/2.0/mlflow/comments/update', data });

  /**
   * Delete a comment activity (Databricks internal)
   */
  static deleteComment = (data) =>
    deleteJson({ relativeUrl: 'ajax-api/2.0/mlflow/comments/delete', data });

  /**
   * Create a transition request (Databricks internal)
   */
  static createTransitionRequest = (data) =>
    postJson({ relativeUrl: 'ajax-api/2.0/preview/mlflow/transition-requests/create', data });

  /**
   * List transition requests (Databricks internal)
   */
  static listTransitionRequests = (data) =>
    getJson({ relativeUrl: 'ajax-api/2.0/preview/mlflow/transition-requests/list', data });

  /**
   * Approve transition request (Databricks internal)
   */
  static approveTransitionRequest = (data) =>
    postJson({ relativeUrl: 'ajax-api/2.0/preview/mlflow/transition-requests/approve', data });

  /**
   * Reject transition request (Databricks internal)
   */
  static rejectTransitionRequest = (data) =>
    postJson({ relativeUrl: 'ajax-api/2.0/preview/mlflow/transition-requests/reject', data });

  /**
   * Delete a transition request (Databricks internal)
   */
  static deleteTransitionRequest = (data) =>
    deleteJson({ relativeUrl: 'ajax-api/2.0/preview/mlflow/transition-requests/delete', data });

  // END-EDGE
  /**
   * Set model version tag
   */
  static setModelVersionTag = (data) =>
    postJson({ relativeUrl: 'ajax-api/2.0/preview/mlflow/model-versions/set-tag', data });

  /**
   * Delete model version tag
   */
  static deleteModelVersionTag = (data) =>
    deleteJson({ relativeUrl: 'ajax-api/2.0/preview/mlflow/model-versions/delete-tag', data });
  // BEGIN-EDGE
  /**
   * Email notifications APIs
   */
  /**
   * Set email subscription status (Databricks internal)
   */
  static setEmailSubscriptionStatus = (data) =>
    postJson({
      relativeUrl: 'ajax-api/2.0/mlflow/email-notifications/registry/set-subscription-status',
      data,
    });

  /**
   * Get email subscription status (Databricks internal)
   */
  static getEmailSubscriptionStatus = (data) =>
    getJson({
      relativeUrl: 'ajax-api/2.0/mlflow/email-notifications/registry/get-subscription-status',
      data,
      error: ({ resolve, reject, response }) => {
        if (response.status && response.status === 404) {
          resolve({ subscription_type: 'DEFAULT' });
        } else {
          defaultError({ reject, response });
        }
      },
    });

  /**
   * Get user-level email subscription status (Databricks internal)
   */
  static getUserLevelEmailSubscriptionStatus = (data) =>
    getJson({
      relativeUrl:
        'ajax-api/2.0/mlflow/email-notifications/registry/get-user-level-subscription-status',
      data,
      error: ({ resolve, reject, response }) => {
        if (response.status && response.status === 404) {
          resolve({ subscription_type: 'UNSUBSCRIBED' });
        } else {
          defaultError({ reject, response });
        }
      },
    });

  /**
   * Generate batch inference notebook (Databricks internal)
   */
  static generateBatchInferenceNotebook = (data) =>
    postJson({
      relativeUrl:
        'ajax-api/2.0/preview/mlflow/registered-models/generate-batch-inference-notebook',
      data,
    });
  // END-EDGE
}
