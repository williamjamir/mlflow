import { getJson, postJson, putJson } from '../common/utils/FetchUtils';
import _ from 'lodash';

// filter out null fields
const filterNullFields = (data) => _.pickBy(data, (v) => v !== null);

export class Services {
  /**
   * List model endpoints
   */
  static listEndpoints = (data) =>
    getJson({ relativeUrl: 'ajax-api/2.0/preview/mlflow/endpoints/list', data });

  /**
   * List model endpoints V2
   */
  static listEndpointsV2 = (data) =>
    getJson({ relativeUrl: 'ajax-api/2.0/preview/mlflow/endpoints-v2/list', data });

  /**
   * Enable serving
   */
  static enableServing = (data) =>
    postJson({
      relativeUrl: 'ajax-api/2.0/preview/mlflow/endpoints/enable',
      data: filterNullFields(data),
    });

  /**
   * Enable serving V2
   */
  static enableServingV2 = (data) =>
    postJson({
      relativeUrl: 'ajax-api/2.0/preview/mlflow/endpoints-v2/enable',
      data: filterNullFields(data),
    });

  /**
   * Disable serving
   */
  static disableServing = (data) =>
    postJson({
      relativeUrl: 'ajax-api/2.0/preview/mlflow/endpoints/disable',
      data: filterNullFields(data),
    });

  /**
   * Disable serving
   */
  static disableServingV2 = (data) =>
    postJson({
      relativeUrl: 'ajax-api/2.0/preview/mlflow/endpoints-v2/disable',
      data: filterNullFields(data),
    });

  /**
   * Get endpoint status
   */
  static getEndpointStatus = (data) =>
    getJson({
      relativeUrl: 'ajax-api/2.0/preview/mlflow/endpoints/get-status',
      data: filterNullFields(data),
    });

  /**
   * List endpoint versions
   */
  static listEndpointVersions = (data) =>
    getJson({
      relativeUrl: 'ajax-api/2.0/preview/mlflow/endpoints/list-versions',
      data: filterNullFields(data),
    });

  /**
   * Get endpoint version logs
   */
  static getEndpointVersionLogs = (data) =>
    postJson({
      relativeUrl: 'ajax-api/2.0/preview/mlflow/endpoints/get-version-logs',
      data: filterNullFields(data),
    });

  /**
   * Get endpoint version logs
   */
  static getEndpointVersionLogsV2 = (data) =>
    postJson({
      relativeUrl: 'ajax-api/2.0/preview/mlflow/endpoints-v2/get-version-logs',
      data: filterNullFields(data),
    });

  /**
   * Get endpoint version build logs
   */
  static getEndpointVersionBuildLogs = (data) =>
    postJson({
      relativeUrl: 'ajax-api/2.0/preview/mlflow/endpoints-v2/get-version-build-logs',
      data: filterNullFields(data),
    });

  /**
   * Get metrics for model version
   */
  static getVersionMetrics = (data) =>
    getJson({
      relativeUrl: 'ajax-api/2.0/preview/mlflow/endpoints-v2/get-version-metrics',
      data: filterNullFields(data),
    });

  /**
   * Get replicas for model version
   */
  static getVersionReplicas = (data) =>
    getJson({
      relativeUrl: 'ajax-api/2.0/preview/mlflow/endpoints-v2/get-version-replicas',
      data: filterNullFields(data),
    });

  /**
   * List endpoint version aliases for Serving V2
   */
  static listEndpointVersionAliasesV2 = (data) =>
    getJson({
      relativeUrl: 'ajax-api/2.0/preview/mlflow/endpoints-v2/list-version-aliases',
      data: filterNullFields(data),
    });

  /**
   * List endpoint version aliases
   */
  static listEndpointVersionAliases = (data) =>
    getJson({
      relativeUrl: 'ajax-api/2.0/preview/mlflow/endpoints/list-version-aliases',
      data: filterNullFields(data),
    });

  /**
   * Get event history
   */
  static getEndpointEventHistory = (data) =>
    getJson({
      relativeUrl: 'ajax-api/2.0/preview/mlflow/endpoints/get-event-history',
      data: filterNullFields(data),
    });

  /**
   * Get V2 event history
   */
  static getServingEventHistory = (data) =>
    getJson({
      relativeUrl: 'ajax-api/2.0/preview/mlflow/endpoints-v2/get-event-history',
      data: filterNullFields(data),
    });

  /**
   * Get endpoint metric history
   */
  static getEndpointMetricHistory = (data) =>
    getJson({
      relativeUrl: 'ajax-api/2.0/preview/mlflow/endpoints/get-metric-history',
      data: filterNullFields(data),
    });

  /**
   * Submit model serving request for serving V1
   */
  static submitServingRequest = (data) =>
    postJson({
      relativeUrl: `ajax-model/${data.modelName}/${data.modelVersionName}/invocations`,
      data: data.servingRequestPayload,
      headerOptions: {
        'Content-Type': data.headers,
      },
    });

  /**
   * Submit model serving request for serving V2
   */
  static submitServingRequestV2 = (data) =>
    postJson({
      relativeUrl: `ajax-model-endpoint/${data.modelName}/${data.modelVersionName}/invocations`,
      data: data.servingRequestPayload,
      headerOptions: {
        'Content-Type': data.headers,
      },
    });

  /**
   * Request to update the cluster configuration of the serving endpoint
   */
  static updateEndpointClusterConfig = (data) =>
    putJson({
      relativeUrl: 'ajax-api/2.0/preview/mlflow/endpoints/update-cluster-config',
      data: filterNullFields(data),
    });

  /**
   * Get supported cluster node types
   */
  static getSupportedClusterNodeTypes = (data) =>
    getJson({ relativeUrl: 'ajax-api/2.0/clusters/list-node-types', data });

  /**
   * Get Serving V2 supported workload sizes
   */
  static getSupportedWorkloadSizes = (data) =>
    getJson({
      relativeUrl: 'ajax-api/2.0/preview/mlflow/endpoints-v2/get-supported-workload-sizes',
      data,
    });

  /**
   * Get the status of a serving v2 endpoint
   */
  static getEndpointStatusV2 = (data) =>
    getJson({
      relativeUrl: 'ajax-api/2.0/preview/mlflow/endpoints-v2/get-status',
      data: filterNullFields(data),
    });

  /**
   * List the versions of a serving v2 endpoint
   */
  static listEndpointVersionsV2 = (data) =>
    getJson({
      relativeUrl: 'ajax-api/2.0/preview/mlflow/endpoints-v2/list-versions',
      data: filterNullFields(data),
    });

  /**
   * Request to update the compute configuration of the serving v2 endpoint
   */
  static updateEndpointComputeConfig = (data) =>
    putJson({
      relativeUrl: 'ajax-api/2.0/preview/mlflow/endpoints-v2/update-compute-config',
      data: filterNullFields(data),
    });

  /**
   * Request to restart a failed compute configuration update
   */
  static restartComputeConfigUpdate = (data) =>
    postJson({
      relativeUrl: 'ajax-api/2.0/preview/mlflow/endpoints-v2/restart-compute-config-update',
      data: filterNullFields(data),
    });
}
