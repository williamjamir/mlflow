import { deleteJson, getJson, patchJson, postJson } from '../common/utils/FetchUtils';

export class Services {
  /**
   * Search through feature store for feature tables.
   */
  static searchFeatureTables = (data) =>
    postJson({ relativeUrl: 'ajax-api/2.0/feature-store/feature-tables/search', data });

  /**
   * Get feature table by name.
   */
  static getFeatureTable = (data) =>
    getJson({ relativeUrl: 'ajax-api/2.0/feature-store/feature-tables/get', data });

  /**
   * Update feature table description by name.
   */
  static updateFeatureTable = (data) =>
    patchJson({ relativeUrl: 'ajax-api/2.0/feature-store/feature-tables/update', data });

  /**
   * Delete feature table by name.
   */
  static deleteFeatureTable = (data) =>
    deleteJson({ relativeUrl: 'ajax-api/2.0/feature-store/feature-tables/delete', data });

  /**
   * Get features associated with a feature table.
   */
  static getFeatures = (data) =>
    getJson({ relativeUrl: 'ajax-api/2.0/feature-store/features/get', data });

  /**
   * Get feature by feature table name and feature name,
   */
  static getFeature = (data) =>
    getJson({ relativeUrl: 'ajax-api/2.0/feature-store/features/get-by-name', data });

  /**
   * Get online store.
   */
  static getOnlineStore = (data) =>
    getJson({ relativeUrl: 'ajax-api/2.0/feature-store/feature-tables/get-online-store', data });

  /**
   * Get consumers.
   */
  static getConsumers = (data) =>
    getJson({ relativeUrl: 'ajax-api/2.0/feature-store/feature-tables/get-consumers', data });

  /**
   * Get feature store wide permissions.
   */
  static getFeatureStoreWidePermissions = (data) =>
    getJson({
      relativeUrl: 'ajax-api/2.0/feature-store/feature-tables/get-feature-store-wide-permissions',
      data,
    });

  /**
   * Get Tags.
   */
  static getTags = (data) => getJson({ relativeUrl: 'ajax-api/2.0/feature-store/tags/get', data });

  /**
   * Set Tags.
   */
  static setTags = (data) => postJson({ relativeUrl: 'ajax-api/2.0/feature-store/tags/set', data });

  /**
   * Delete Tags.
   */
  static deleteTags = (data) =>
    deleteJson({ relativeUrl: 'ajax-api/2.0/feature-store/tags/delete', data });

  /**
   * Update Feature.
   */
  static updateFeature = (data) =>
    patchJson({ relativeUrl: 'ajax-api/2.0/feature-store/features/update', data });

  // Feature table profile endpoints

  /**
   * Get monitoring config by feature table
   * @param feature_table (feature table name)
   */
  static getMonitoringConfig = (data) =>
    getJson({
      relativeUrl: 'ajax-api/2.0/feature-store/feature-tables/get-monitoring-config',
      data,
    });

  // TODO(alexcheng): update endpoint to use set-monitoring-config when it gets merged
  /**
   * Update monitoring config endpoint by feature table
   * @param feature_table (feature table name)
   */
  static updateMonitoringConfig = (data) =>
    postJson({
      relativeUrl: 'ajax-api/2.0/feature-store/feature-tables/update-monitoring-config',
      data,
    });

  /**
   * List profiles by feature table
   * @param feature_table (feature table name)
   */
  static listProfiles = (data) =>
    getJson({ relativeUrl: 'ajax-api/2.0/feature-store/profiles/list', data });

  /**
   * Get profile
   * @param feature_table (feature table name)
   * @param profile_id
   */
  static getProfile = (data) =>
    getJson({ relativeUrl: 'ajax-api/2.0/feature-store/profiles/get', data });

  /**
   * Stub function that should be removed after we have proper data from the backend
   */
  static getMockProfile = async (data) => {
    const array = await Promise.all([
      import('../data-profiles/sample-data/airbnb.json').then((module) => module.default),
    ]);
    // From the API doc:
    const response = array.map((d, i) => ({
      profile: {
        profile_id: `Profile_xyz${i + 1}`,
        window_start_timestamp: 1652641200000,
        window_granularity: '1 day',
        creation_timestamp: 132342424 + i,
        table_stats: {
          num_rows: d[0].count,
        },
        column_profiles: d,
      },
    }));

    return response[0];
  };
}
