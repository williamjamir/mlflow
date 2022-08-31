import { fulfilled, rejected } from '../common/utils/ActionUtils';
import {
  SEARCH_FEATURE_TABLES,
  GET_FEATURE_TABLE,
  GET_FEATURES,
  GET_FEATURE,
  UPDATE_FEATURE,
  GET_ONLINE_STORE,
  UPDATE_FEATURE_TABLE,
  GET_CONSUMERS,
  GET_JOB,
  GET_PIPELINE,
  GET_NOTEBOOKS,
  SEARCH_MODEL_VERSIONS_BY_FEATURE,
  GET_LATEST_RUN_FOR_JOB,
  DELETE_FEATURE_TABLE,
  GET_TAGS_FOR_FEATURE_TABLE,
  SET_TAGS_FOR_FEATURE_TABLE,
  DELETE_TAGS_FOR_FEATURE_TABLE,
  LIST_MODEL_ENDPOINTS,
  GET_TAGS_FOR_FEATURE,
  SET_TAGS_FOR_FEATURE,
  DELETE_TAGS_FOR_FEATURE,
  GET_FEATURE_STORE_WIDE_PERMISSIONS,
} from './actions';
import {
  featureTablesByName,
  features,
  featuresByName,
  onlineStores,
  consumersByFeatureTable,
  jobs,
  notebooks,
  pipelines,
  modelVersionsWithFeatures,
  modelEndpointStatus,
  latestRunForJobs,
  tagsForFeatureTables,
  tagsForFeatures,
  featureStoreWidePermissionLevel,
} from './reducers';
import {
  mockFeatureTable,
  mockFeatures,
  mockFeature,
  mockOnlineStore,
  mockJob,
  mockJobRun,
  mockJobConsumer,
  mockNotebookConsumer,
  mockPipeline,
  mockModelVersionDetailedWithFeatureList,
  mockModelEndpoint,
} from './utils/test-utils';
import { SchedulePauseStatus, PermissionLevels } from './constants';
import { EndpointState } from '../model-serving/utils';

describe('Feature Store reducers', () => {
  describe('featureTablesByName', () => {
    test('sets up initial state correctly', () => {
      expect(featureTablesByName(undefined, {})).toEqual({});
    });

    describe('SEARCH_FEATURE_TABLES', () => {
      test('handles SEARCH_FEATURE_TABLES correctly with empty state', () => {
        const action = {
          type: fulfilled(SEARCH_FEATURE_TABLES),
          payload: {
            feature_tables: [],
          },
        };

        expect(featureTablesByName({}, action)).toEqual({});
      });

      test('handles SEARCH_FEATURE_TABLES correctly with bad response shape', () => {
        const action = {
          type: fulfilled(SEARCH_FEATURE_TABLES),
          payload: {},
        };

        expect(featureTablesByName({}, action)).toEqual({});
      });

      test('SEARCH_FEATURE_TABLES sets feature tables by name', () => {
        const featureTableNames = [
          'prod.user_activity_features',
          'dev.produce_features',
          'production.user_activity_features',
        ];
        const featureTables = featureTableNames.map((name) => mockFeatureTable({ name }));
        const action = {
          type: fulfilled(SEARCH_FEATURE_TABLES),
          payload: {
            feature_tables: featureTables,
          },
        };

        const newState = featureTablesByName({}, action);

        expect(Object.keys(newState)).toEqual(featureTableNames);
        expect(Object.values(newState)).toEqual(featureTables);
      });

      test('SEARCH_FEATURE_TABLES removes previous feature tables stored in state', () => {
        const featureTableA = mockFeatureTable({ name: 'featureTableA' });
        const featureTableB = mockFeatureTable({ name: 'featureTableB' });

        const state = { featureTableA };
        const action = {
          type: fulfilled(SEARCH_FEATURE_TABLES),
          payload: {
            feature_tables: [featureTableB],
          },
        };

        const newState = featureTablesByName(state, action);
        expect(newState).toEqual({ featuretableb: featureTableB });
      });

      test('SEARCH_FEATURE_TABLES flushes previous state if response is empty', () => {
        const featureTableA = mockFeatureTable({ name: 'featureTableA' });
        const featureTableB = mockFeatureTable({ name: 'featureTableB' });

        const state = { featureTableA, featureTableB };
        const action = {
          type: fulfilled(SEARCH_FEATURE_TABLES),
          payload: {
            feature_tables: [],
          },
        };

        const newState = featureTablesByName(state, action);
        expect(newState).toEqual({});
      });
    });

    describe('GET_FEATURE_TABLE', () => {
      test('handles GET_FEATURE_TABLE correctly with empty state', () => {
        const action = {
          type: fulfilled(GET_FEATURE_TABLE),
          payload: {
            feature_table: {},
          },
        };

        expect(featureTablesByName({}, action)).toEqual({});
      });

      test('handles GET_FEATURE_TABLE correctly with bad response shape', () => {
        const action = {
          type: fulfilled(GET_FEATURE_TABLE),
          payload: {},
        };

        expect(featureTablesByName({}, action)).toEqual({});
      });

      test('GET_FEATURE_TABLE sets feature table by name', () => {
        const featureTableName = 'prod.user_activity_features';
        const featureTable = mockFeatureTable({ name: 'prod.user_activity_features' });
        const action = {
          type: fulfilled(GET_FEATURE_TABLE),
          payload: {
            feature_table: featureTable,
          },
        };

        const newState = featureTablesByName({}, action);

        expect(Object.keys(newState)).toEqual([featureTableName]);
        expect(Object.values(newState)).toEqual([featureTable]);
      });
    });

    describe('UPDATE_FEATURE_TABLE', () => {
      test('handles UPDATE_FEATURE_TABLE correctly with empty state', () => {
        const action = {
          type: fulfilled(UPDATE_FEATURE_TABLE),
          payload: {
            feature_table: {},
          },
        };

        expect(featureTablesByName({}, action)).toEqual({});
      });

      test('handles UPDATE_FEATURE_TABLE correctly with bad response shape', () => {
        const action = {
          type: fulfilled(UPDATE_FEATURE_TABLE),
          payload: {},
        };

        expect(featureTablesByName({}, action)).toEqual({});
      });

      test('UPDATE_FEATURE_TABLE update feature table description by name', () => {
        const featureTableName = 'featureTable';
        const featureTable = mockFeatureTable({ name: featureTableName, description: 'old text' });
        const state = { featureTable };
        const action = {
          type: fulfilled(UPDATE_FEATURE_TABLE),
          payload: {
            feature_table: { name: featureTableName, description: 'new text' },
          },
        };

        const newState = featureTablesByName(state, action);
        expect(newState['featuretable'].description).toEqual('new text');
      });
    });

    describe('DELETE_FEATURE_TABLE', () => {
      test('DELETE_FEATURE_TABLE deletes feature table with the matched name from state', () => {
        const featureTableA = mockFeatureTable({ name: 'featureTableA' });
        const featureTableB = mockFeatureTable({ name: 'featureTableB' });

        const state = { featuretablea: featureTableA, featuretableb: featureTableB };
        const action = {
          type: fulfilled(DELETE_FEATURE_TABLE),
          payload: {},
          meta: { name: 'featUrETableA' },
        };

        expect(featureTablesByName(state, action)).toEqual({ featuretableb: featureTableB });
      });

      test('DELETE_FEATURE_TABLE performs no-op if table does not exist in current state', () => {
        const featureTableA = mockFeatureTable({ name: 'featureTableA' });
        const featureTableB = mockFeatureTable({ name: 'featureTableB' });

        const state = { featuretablea: featureTableA, featuretableb: featureTableB };
        const action = {
          type: fulfilled(DELETE_FEATURE_TABLE),
          payload: {},
          meta: { name: 'featureTableC' },
        };

        expect(featureTablesByName(state, action)).toEqual({
          featuretablea: featureTableA,
          featuretableb: featureTableB,
        });
      });
    });
  });

  describe('features', () => {
    test('sets up initial state correctly', () => {
      expect(features(undefined, {})).toEqual({});
    });

    test('handles GET_FEATURES correctly with empty state', () => {
      const action = {
        type: fulfilled(GET_FEATURES),
        payload: {
          features: {},
        },
        meta: {
          featureTable: '',
        },
      };

      expect(features({}, action)).toEqual({});
    });

    test('handles GET_FEATURES correctly with bad response shape', () => {
      const action = {
        type: fulfilled(GET_FEATURES),
        payload: {},
        meta: {},
      };

      expect(features({}, action)).toEqual({});
    });

    test('GET_FEATURES sets features by table name', () => {
      const mockedFeatures = mockFeatures();
      const action = {
        type: fulfilled(GET_FEATURES),
        payload: {
          features: mockedFeatures,
        },
        meta: {
          featureTable: 'tableA',
        },
      };

      const newState = features({}, action);

      expect(Object.keys(newState)).toEqual(['tablea']);
      expect(Object.values(newState['tablea'])).toEqual(mockedFeatures);
    });

    test('DELETE_FEATURE_TABLE deletes feature table with the matched name from state', () => {
      const featuresForTableA = [
        {
          table: 'prod.user_activity_features',
          name: 'count_items_7d',
          data_type: 'INTEGER',
          description: 'This is feature 1',
        },
      ];
      const featuresForTableB = [
        {
          table: 'prod.user_activity_features',
          name: 'total_purchase_value_14d',
          data_type: 'FLOAT',
          description: 'This is feature 2',
        },
      ];
      const state = { featuretablea: featuresForTableA, featuretableb: featuresForTableB };
      const action = {
        type: fulfilled(DELETE_FEATURE_TABLE),
        payload: {},
        meta: { name: 'featUrETableA' },
      };

      expect(features(state, action)).toEqual({ featuretableb: featuresForTableB });
    });

    test('DELETE_FEATURE_TABLE performs no-op if table does not exist in current state', () => {
      const featuresForTableA = [
        {
          table: 'prod.user_activity_features',
          name: 'count_items_7d',
          data_type: 'INTEGER',
          description: 'This is feature 1',
        },
      ];
      const featuresForTableB = [
        {
          table: 'prod.user_activity_features',
          name: 'total_purchase_value_14d',
          data_type: 'FLOAT',
          description: 'This is feature 2',
        },
      ];
      const state = { featuretablea: featuresForTableA, featuretableb: featuresForTableB };
      const action = {
        type: fulfilled(DELETE_FEATURE_TABLE),
        payload: {},
        meta: { name: 'featureTableC' },
      };

      expect(features(state, action)).toEqual({
        featuretablea: featuresForTableA,
        featuretableb: featuresForTableB,
      });
    });
  });

  describe('featuresByName', () => {
    test('handles GET_FEATURE correctly with empty state', () => {
      const action = {
        type: fulfilled(GET_FEATURE),
        payload: {
          feature: {},
        },
        meta: {
          featureTable: '',
        },
      };

      expect(featuresByName({}, action)).toEqual({});
    });

    test('handles GET_FEATURE correctly with bad response shape', () => {
      const action = {
        type: fulfilled(GET_FEATURE),
        payload: {},
        meta: {},
      };

      expect(featuresByName({}, action)).toEqual({});
    });

    test('GET_FEATURE sets feature by table name and feature name', () => {
      const mockedFeature = mockFeature({ table: 'tableA', name: 'feat1' });
      const action = {
        type: fulfilled(GET_FEATURE),
        payload: {
          feature: mockedFeature,
        },
        meta: {
          featureTable: 'tableA',
          name: 'feat1',
        },
      };

      expect(featuresByName({}, action)).toEqual({ tablea: { feat1: mockedFeature } });
    });

    test('GET_FEATURE keeps already existing features', () => {
      const mockedFeature = mockFeature({ table: 'tableA', name: 'feat1' });
      const action = {
        type: fulfilled(GET_FEATURE),
        payload: {
          feature: mockedFeature,
        },
        meta: {
          featureTable: 'tableA',
          name: 'feat1',
        },
      };

      const state = {
        tablea: {
          feata: mockFeature({ table: 'tableA', name: 'featA' }),
          feat_5: mockFeature({ table: 'tableA', name: 'feat_5' }),
        },
      };

      expect(featuresByName(state, action)).toEqual({
        tablea: {
          feata: mockFeature({ table: 'tableA', name: 'featA' }),
          feat_5: mockFeature({ table: 'tableA', name: 'feat_5' }),
          feat1: mockedFeature,
        },
      });
    });

    test('GET_FEATURE replaces existing feature with same name', () => {
      const mockedFeature = mockFeature({ table: 'tableA', name: 'feat1', description: 'desc2' });
      const action = {
        type: fulfilled(GET_FEATURE),
        payload: {
          feature: mockedFeature,
        },
        meta: {
          featureTable: 'tableA',
          name: 'feat1',
        },
      };

      const state = {
        tablea: {
          feata: mockFeature({ table: 'tableA', name: 'featA' }),
          feat1: mockFeature({ table: 'tableA', name: 'feat1', description: 'desc1' }),
        },
      };

      expect(featuresByName(state, action)).toEqual({
        tablea: {
          feata: mockFeature({ table: 'tableA', name: 'featA' }),
          feat1: mockedFeature,
        },
      });
    });

    test('handles UPDATE_FEATURE correctly with empty state', () => {
      const action = {
        type: fulfilled(UPDATE_FEATURE),
        payload: {
          feature: {},
        },
        meta: {
          featureTable: '',
        },
      };

      expect(featuresByName({}, action)).toEqual({});
    });

    test('handles UPDATE_FEATURE correctly with bad response shape', () => {
      const action = {
        type: fulfilled(UPDATE_FEATURE),
        payload: {},
        meta: {},
      };

      expect(featuresByName({}, action)).toEqual({});
    });

    test('UPDATE_FEATURE sets feature by table name and feature name', () => {
      const mockedFeature = mockFeature({ table: 'tableA', name: 'feat1' });
      const action = {
        type: fulfilled(UPDATE_FEATURE),
        payload: {
          feature: mockedFeature,
        },
        meta: {
          featureTable: 'tableA',
          name: 'feat1',
        },
      };

      expect(featuresByName({}, action)).toEqual({ tablea: { feat1: mockedFeature } });
    });

    test('UPDATE_FEATURE keeps already existing features', () => {
      const mockedFeature = mockFeature({ table: 'tableA', name: 'feat1' });
      const action = {
        type: fulfilled(UPDATE_FEATURE),
        payload: {
          feature: mockedFeature,
        },
        meta: {
          featureTable: 'tableA',
          name: 'feat1',
        },
      };

      const state = {
        tablea: {
          feata: mockFeature({ table: 'tableA', name: 'featA' }),
          feat_5: mockFeature({ table: 'tableA', name: 'feat_5' }),
        },
      };

      expect(featuresByName(state, action)).toEqual({
        tablea: {
          feata: mockFeature({ table: 'tableA', name: 'featA' }),
          feat_5: mockFeature({ table: 'tableA', name: 'feat_5' }),
          feat1: mockedFeature,
        },
      });
    });

    test('UPDATE_FEATURE replaces existing feature with same name', () => {
      const mockedFeature = mockFeature({ table: 'tableA', name: 'feat1', description: 'desc2' });
      const action = {
        type: fulfilled(UPDATE_FEATURE),
        payload: {
          feature: mockedFeature,
        },
        meta: {
          featureTable: 'tableA',
          name: 'feat1',
        },
      };

      const state = {
        tablea: {
          feata: mockFeature({ table: 'tableA', name: 'featA' }),
          feat1: mockFeature({ table: 'tableA', name: 'feat1', description: 'desc1' }),
        },
      };

      expect(featuresByName(state, action)).toEqual({
        tablea: {
          feata: mockFeature({ table: 'tableA', name: 'featA' }),
          feat1: mockedFeature,
        },
      });
    });
  });

  describe('onlineStores', () => {
    test('sets up initial state correctly', () => {
      expect(onlineStores(undefined, {})).toEqual({});
    });
    test('handles GET_ONLINE_STORE correctly with empty state', () => {
      const action = {
        type: fulfilled(GET_ONLINE_STORE),
        payload: {
          online_store: {},
        },
        meta: {},
      };

      expect(onlineStores({}, action)).toEqual({});
    });

    test('handles GET_ONLINE_STORE correctly with bad response shape', () => {
      const action = {
        type: fulfilled(GET_ONLINE_STORE),
        payload: {},
      };

      expect(onlineStores({}, action)).toEqual({});
    });

    test('GET_ONLINE_STORE sets online store by key', () => {
      const stores = {
        MYSQL: mockOnlineStore({
          name: 'user.purchase_FEATURES',
          cloud: 'AWS',
          store_type: 'MYSQL',
          mysql_metadata: { host: 'abcdef', port: '1118' },
        }),
        SQLSERVER: mockOnlineStore({
          name: 'user.purchase_FEATURES',
          cloud: 'AZURE',
          store_type: 'SQLSERVER',
          sql_server_metadata: { host: 'abcdef', port: '1118' },
        }),
        DYNAMODB: mockOnlineStore({
          name: 'user.purchase_FEATURES',
          cloud: 'AWS',
          store_type: 'DYNAMODB',
          dynamodb_metadata: { region: 'east', table_arn: '123abc' },
        }),
        COSMOSDB: mockOnlineStore({
          name: 'user.preference_FEATURES',
          cloud: 'Azure',
          store_type: 'COSMOSDB',
          cosmosdb_metadata: {
            account_uri: 'www.account.com',
            container_uri: 'www.account.com/db/db_name/colls/container',
          },
        }),
      };
      const expectedKeys = {
        MYSQL: 'user.all_features-user.purchase_features-aws-mysql',
        SQLSERVER: 'user.all_features-user.purchase_features-azure-sqlserver',
        DYNAMODB: 'user.all_features-user.purchase_features-aws-dynamodb-123abc',
        COSMOSDB:
          'user.all_features-user.preference_features-azure-cosmosdb-www.account.com/db/db_name/colls/container',
      };
      Object.keys(stores).forEach((storeType) => {
        const action = {
          type: fulfilled(GET_ONLINE_STORE),
          payload: {
            online_store: stores[storeType],
          },
          meta: {
            featureTableName: 'user.ALL_features',
          },
        };
        const newState = onlineStores({}, action);
        expect(Object.keys(newState)).toEqual([expectedKeys[storeType]]);
        expect(Object.values(newState)).toEqual([stores[storeType]]);
      });
    });
  });

  describe('consumersByFeatureTable', () => {
    test('sets up initial state correctly', () => {
      expect(consumersByFeatureTable(undefined, {})).toEqual({});
    });
    test('handles GET_CONSUMERS correctly with empty response', () => {
      const action = {
        type: fulfilled(GET_CONSUMERS),
        payload: {},
        meta: { id: 1, featureTableName: 'foo' },
      };

      expect(consumersByFeatureTable({}, action)).toEqual({});
    });

    test('handles GET_CONSUMERS correctly with empty state', () => {
      const action = {
        type: fulfilled(GET_CONSUMERS),
        payload: {
          consumers: [],
        },
        meta: { id: 1, featureTableName: 'foo' },
      };

      expect(consumersByFeatureTable({}, action)).toEqual({});
    });

    test('handles GET_CONSUMERS correctly with bad meta', () => {
      const action = {
        type: fulfilled(GET_CONSUMERS),
        payload: {
          consumers: [
            mockJobConsumer(1111, 9997, ['feat3']),
            mockNotebookConsumer(9876, 9996, ['feat1']),
          ],
        },
        meta: { id: 1 }, // missing featureTableName
      };

      expect(consumersByFeatureTable({}, action)).toEqual({});
    });

    test('GET_CONSUMERS sets consumers by feature table name', () => {
      const consumers = [
        mockJobConsumer(1111, 9997, ['feat3']),
        mockNotebookConsumer(9876, 9996, ['feat1']),
      ];
      const featureTableName = 'user.ALL_features';
      const action = {
        type: fulfilled(GET_CONSUMERS),
        payload: { consumers },
        meta: {
          featureTableName,
          id: 123,
        },
      };
      const newState = consumersByFeatureTable({}, action);
      expect(Object.keys(newState)).toEqual(['user.all_features']);
      expect(newState['user.all_features']).toEqual(consumers);
    });

    test('DELETE_FEATURE_TABLE deletes feature table with the matched name from state', () => {
      const consumersForTableA = [
        mockJobConsumer(1111, 9997, ['feat3']),
        mockNotebookConsumer(9876, 9996, ['feat1']),
      ];
      const consumersForTableB = [
        mockJobConsumer(2222, 8686, ['feat2']),
        mockNotebookConsumer(3636, 9696, ['feat4']),
      ];
      const state = { featuretablea: consumersForTableA, featuretableb: consumersForTableB };
      const action = {
        type: fulfilled(DELETE_FEATURE_TABLE),
        payload: {},
        meta: { name: 'featUrETableA' },
      };

      expect(features(state, action)).toEqual({ featuretableb: consumersForTableB });
    });

    test('DELETE_FEATURE_TABLE performs no-op if table does not exist in current state', () => {
      const consumersForTableA = [
        mockJobConsumer(1111, 9997, ['feat3']),
        mockNotebookConsumer(9876, 9996, ['feat1']),
      ];
      const consumersForTableB = [
        mockJobConsumer(2222, 8686, ['feat2']),
        mockNotebookConsumer(3636, 9696, ['feat4']),
      ];
      const state = { featuretablea: consumersForTableA, featuretableb: consumersForTableB };
      const action = {
        type: fulfilled(DELETE_FEATURE_TABLE),
        payload: {},
        meta: { name: 'featureTableC' },
      };

      expect(features(state, action)).toEqual({
        featuretablea: consumersForTableA,
        featuretableb: consumersForTableB,
      });
    });
  });

  describe('jobs', () => {
    test('sets up initial state correctly', () => {
      expect(jobs(undefined, {})).toEqual({});
    });
    test('handles GET_JOB correctly with empty response', () => {
      const action = {
        type: fulfilled(GET_JOB),
        payload: {},
        meta: {},
      };

      expect(features({}, action)).toEqual({});
    });
    test('GET_JOB sets job name by job id', () => {
      const action = {
        type: fulfilled(GET_JOB),
        payload: mockJob({
          jobId: 123,
          name: 'test job',
          schedule: {
            quartz_cron_expression: '0 15 22 ? * *',
            timezone_id: 'America/Los_Angeles',
            pause_status: SchedulePauseStatus.UNPAUSED,
          },
        }),
        meta: {},
      };
      const newState = jobs({}, action);
      expect(Object.keys(newState)).toEqual(['123']);
      expect(newState['123']).toEqual({
        name: 'test job',
        schedule: {
          quartz_cron_expression: '0 15 22 ? * *',
          timezone_id: 'America/Los_Angeles',
          pause_status: SchedulePauseStatus.UNPAUSED,
        },
      });
    });
  });

  describe('pipelines', () => {
    test('sets up initial state correctly', () => {
      expect(pipelines(undefined, {})).toEqual({});
    });
    test('handles GET_PIPELINE correctly with empty response', () => {
      const action = {
        type: fulfilled(GET_PIPELINE),
        payload: {},
        meta: {},
      };

      expect(features({}, action)).toEqual({});
    });
    test('GET_PIPELINE sets pipeline name by pipeline id', () => {
      const action = {
        type: fulfilled(GET_PIPELINE),
        payload: mockPipeline({
          pipelineId: 'abc123',
          name: 'test pipeline',
        }),
        meta: {},
      };
      const newState = pipelines({}, action);
      expect(Object.keys(newState).length).toEqual(1);
      expect(newState['abc123']).toEqual('test pipeline');
    });
  });

  describe('notebooks', () => {
    test('sets up initial state correctly', () => {
      expect(notebooks(undefined, {})).toEqual({});
    });
    test('handles GET_NOTEBOOKS correctly with empty response', () => {
      const action = {
        type: fulfilled(GET_NOTEBOOKS),
        payload: [],
        meta: {},
      };

      expect(notebooks({}, action)).toEqual({});
    });

    test('GET_NOTEBOOKS sets notebook name by notebook id', () => {
      const action = {
        type: fulfilled(GET_NOTEBOOKS),
        payload: [
          { id: 1234, name: 'test notebook 1' },
          { id: 5678, name: 'test notebook 2' },
        ],
        meta: {},
      };
      const newState = notebooks({}, action);
      expect(Object.keys(newState).length).toEqual(2);
      expect(newState['1234']).toEqual('test notebook 1');
      expect(newState['5678']).toEqual('test notebook 2');
    });
  });

  describe('search model versions by feature', () => {
    // all feature table capitalization change is meant to test redux store is keyed by lowercase
    test('SEARCH_MODEL_VERSIONS_BY_FEATURE handles empty response and empty state', () => {
      const state = {};
      const action = {
        type: fulfilled(SEARCH_MODEL_VERSIONS_BY_FEATURE),
        payload: {
          model_versions_databricks: [],
        },
        meta: {},
      };
      expect(modelVersionsWithFeatures(state, action)).toEqual({});
    });

    test('SEARCH_MODEL_VERSIONS_BY_FEATURE does not modify state for empty response', () => {
      const version1 = mockModelVersionDetailedWithFeatureList({
        name: 'modelA',
        version: 1,
        feature_list: {
          features: [
            { feature_table_name: 'user.ALL_features', feature_name: 'feature_1' },
            { feature_table_name: 'user.all_FEATURES', feature_name: 'feature_2' },
          ],
        },
      });
      const version2 = mockModelVersionDetailedWithFeatureList({
        name: 'modelA',
        version: 2,
        feature_list: {
          features: [{ feature_table_name: 'user.all_FEATURES', feature_name: 'feature_1' }],
        },
      });
      const state = {
        'user.all_features': [version1, version2],
      };
      const action = {
        type: fulfilled(SEARCH_MODEL_VERSIONS_BY_FEATURE),
        payload: {},
        meta: { featureTableName: 'user.ALL_features' },
      };
      expect(new Set(modelVersionsWithFeatures(state, action)['user.all_features'])).toEqual(
        new Set([version1, version2]),
      );
    });

    test('SEARCH_MODEL_VERSIONS_BY_FEATURE updates existing models correctly', () => {
      const version1 = mockModelVersionDetailedWithFeatureList({
        name: 'modelA',
        version: 1,
        feature_list: {
          features: [
            { feature_table_name: 'user.ALL_features', feature_name: 'feature_1' },
            { feature_table_name: 'user.all_FEATURES', feature_name: 'feature_2' },
          ],
        },
      });
      const version2 = mockModelVersionDetailedWithFeatureList({
        name: 'modelA',
        version: 2,
        feature_list: {
          features: [{ feature_table_name: 'user.ALL_features', feature_name: 'feature_2' }],
        },
      });
      const state = {
        'user.all_features': [version1],
      };
      const action = {
        type: fulfilled(SEARCH_MODEL_VERSIONS_BY_FEATURE),
        payload: {
          model_versions_databricks: [version1, version2],
        },
        meta: { featureTableName: 'user.all_FEATURES' },
      };
      expect(new Set(modelVersionsWithFeatures(state, action)['user.all_features'])).toEqual(
        new Set([version1, version2]),
      );
    });

    test('SEARCH_MODEL_VERSIONS_BY_FEATURE adds new models correctly', () => {
      const version1 = mockModelVersionDetailedWithFeatureList({
        name: 'modelA',
        version: 1,
        feature_list: {
          features: [
            { feature_table_name: 'user.all_FEATURES', feature_name: 'feature_1' },
            { feature_table_name: 'user.ALL_FEATURES', feature_name: 'feature_2' },
          ],
        },
      });
      const version2 = mockModelVersionDetailedWithFeatureList({
        name: 'modelA',
        version: 2,
        feature_list: {
          features: [{ feature_table_name: 'user.all_features', feature_name: 'feature_2' }],
        },
      });
      const version3 = mockModelVersionDetailedWithFeatureList({
        name: 'modelB',
        version: 1,
        feature_list: {
          features: [{ feature_table_name: 'user.ALL_features', feature_name: 'feature_2' }],
        },
      });
      const state = {
        'user.all_features': [version1, version2],
      };
      const action = {
        type: fulfilled(SEARCH_MODEL_VERSIONS_BY_FEATURE),
        payload: {
          model_versions_databricks: [version1, version2, version3],
        },
        meta: { featureTableName: 'USER.all_FEATURES' },
      };
      expect(new Set(modelVersionsWithFeatures(state, action)['user.all_features'])).toEqual(
        new Set([version1, version2, version3]),
      );
    });

    test('rejected SEARCH_MODEL_VERSIONS_BY_FEATURE does not add to state', () => {
      const version1 = mockModelVersionDetailedWithFeatureList({
        name: 'modelA',
        version: 1,
        feature_list: {
          features: [
            { feature_table_name: 'user.ALL_features', feature_name: 'feature_1' },
            { feature_table_name: 'user.all_features', feature_name: 'feature_2' },
          ],
        },
      });
      const version2 = mockModelVersionDetailedWithFeatureList({
        name: 'modelA',
        version: 2,
        feature_list: {
          features: [{ feature_table_name: 'user.ALL_FEATURES', feature_name: 'feature_1' }],
        },
      });
      const state = {
        'user.all_features': [version1, version2],
      };
      const action = {
        type: rejected(SEARCH_MODEL_VERSIONS_BY_FEATURE),
        payload: {},
        meta: { featureTableName: 'USER.ALL_features' },
      };
      expect(new Set(modelVersionsWithFeatures(state, action)['user.all_features'])).toEqual(
        new Set([version1, version2]),
      );
    });

    test('SEARCH_MODEL_VERSIONS_BY_FEATURE merges existing model versions with received model versions', () => {
      const version1 = mockModelVersionDetailedWithFeatureList({
        name: 'modelA',
        version: 1,
        feature_list: {
          features: [
            { feature_table_name: 'user.ALL_features', feature_name: 'feature_1' },
            { feature_table_name: 'USER.ALL_features', feature_name: 'feature_2' },
          ],
        },
      });
      const version2 = mockModelVersionDetailedWithFeatureList({
        name: 'modelB',
        version: 1,
        feature_list: {
          features: [{ feature_table_name: 'user.ALL_FEATURES', feature_name: 'feature_1' }],
        },
      });
      const version3 = mockModelVersionDetailedWithFeatureList({
        name: 'modelA',
        version: 2,
        feature_list: {
          features: [{ feature_table_name: 'user.ALL_FEATURES', feature_name: 'feature_2' }],
        },
      });
      const state = {
        'user.all_features': [version1],
      };
      const action = {
        type: fulfilled(SEARCH_MODEL_VERSIONS_BY_FEATURE),
        payload: {
          model_versions_databricks: [version2, version3],
        },
        meta: { featureTableName: 'user.ALL_features' },
      };
      expect(new Set(modelVersionsWithFeatures(state, action)['user.all_features'])).toEqual(
        new Set([version1, version2, version3]),
      );
    });

    test('SEARCH_MODEL_VERSIONS_BY_FEATURE received models overrides existing models in the case of a duplicate', () => {
      const version1 = mockModelVersionDetailedWithFeatureList({
        name: 'modelA',
        version: 1,
        feature_list: {
          features: [{ feature_table_name: 'user.ALL_features', feature_name: 'feature_1' }],
        },
      });
      const version2 = mockModelVersionDetailedWithFeatureList({
        name: 'modelA',
        version: 2,
        feature_list: {
          features: [{ feature_table_name: 'user.ALL_FEATURES', feature_name: 'feature_2' }],
        },
      });
      // duplicates
      const version3 = mockModelVersionDetailedWithFeatureList({
        name: 'modelA',
        version: 1,
        feature_list: {
          features: [{ feature_table_name: 'user.ALL_FEATURES', feature_name: 'feature_3' }],
        },
      });
      const version4 = mockModelVersionDetailedWithFeatureList({
        name: 'modelA',
        version: 2,
        feature_list: {
          features: [{ feature_table_name: 'user.ALL_FEATURES', feature_name: 'feature_4' }],
        },
      });
      const state = {
        'user.all_features': [version1, version2],
      };
      const action = {
        type: fulfilled(SEARCH_MODEL_VERSIONS_BY_FEATURE),
        payload: {
          model_versions_databricks: [version3, version4],
        },
        meta: { featureTableName: 'user.ALL_features' },
      };
      expect(new Set(modelVersionsWithFeatures(state, action)['user.all_features'])).toEqual(
        new Set([version3, version4]),
      );
    });

    test('SEARCH_MODEL_VERSIONS_BY_FEATURE does not modify state of other feature table', () => {
      const version1 = mockModelVersionDetailedWithFeatureList({
        name: 'modelA',
        version: 1,
        feature_list: {
          features: [
            { feature_table_name: 'user.ALL_features', feature_name: 'feature_1' },
            { feature_table_name: 'user.ALL_features', feature_name: 'feature_2' },
          ],
        },
      });
      const version2 = mockModelVersionDetailedWithFeatureList({
        name: 'modelA',
        version: 2,
        feature_list: {
          features: [{ feature_table_name: 'user.PURCHASE_features', feature_name: 'feature_1' }],
        },
      });
      const state = {
        'user.all_features': [version1],
      };
      const action = {
        type: fulfilled(SEARCH_MODEL_VERSIONS_BY_FEATURE),
        payload: {
          model_versions_databricks: [version2],
        },
        meta: { featureTableName: 'user.PURCHASE_features' },
      };
      expect(modelVersionsWithFeatures(state, action)).toEqual({
        'user.all_features': [version1],
        'user.purchase_features': [version2],
      });
    });

    test('DELETE_FEATURE_TABLE deletes feature table with the matched name from state', () => {
      const modelsForTableA = [
        mockModelVersionDetailedWithFeatureList({
          name: 'modelA',
          version: 1,
          feature_list: {
            features: [{ feature_table_name: 'featureTableA', feature_name: 'feature_1' }],
          },
        }),
      ];
      const modelsForTableB = [
        mockModelVersionDetailedWithFeatureList({
          name: 'modelB',
          version: 3,
          feature_list: {
            features: [{ feature_table_name: 'featureTableB', feature_name: 'feature_2' }],
          },
        }),
      ];
      const state = { featuretablea: modelsForTableA, featuretableb: modelsForTableB };
      const action = {
        type: fulfilled(DELETE_FEATURE_TABLE),
        payload: {},
        meta: { name: 'featUrETableA' },
      };

      expect(features(state, action)).toEqual({ featuretableb: modelsForTableB });
    });

    test('DELETE_FEATURE_TABLE performs no-op if table does not exist in current state', () => {
      const modelsForTableA = [
        mockModelVersionDetailedWithFeatureList({
          name: 'modelA',
          version: 1,
          feature_list: {
            features: [{ feature_table_name: 'featureTableA', feature_name: 'feature_1' }],
          },
        }),
      ];
      const modelsForTableB = [
        mockModelVersionDetailedWithFeatureList({
          name: 'modelB',
          version: 3,
          feature_list: {
            features: [{ feature_table_name: 'featureTableB', feature_name: 'feature_2' }],
          },
        }),
      ];
      const state = { featuretablea: modelsForTableA, featuretableb: modelsForTableB };
      const action = {
        type: fulfilled(DELETE_FEATURE_TABLE),
        payload: {},
        meta: { name: 'featureTableC' },
      };

      expect(features(state, action)).toEqual({
        featuretablea: modelsForTableA,
        featuretableb: modelsForTableB,
      });
    });
  });

  describe('modelVersionsEndpointStatus', () => {
    test('sets up initial state correctly', () => {
      expect(modelEndpointStatus(undefined, {})).toEqual({});
    });

    test('LIST_MODEL_VERSION_ENDPOINTS handles empty response', () => {
      const state = {};
      expect(
        modelEndpointStatus(state, {
          type: fulfilled(LIST_MODEL_ENDPOINTS),
          payload: {},
          meta: {},
        }),
      ).toEqual({});
      expect(
        modelEndpointStatus(state, {
          type: fulfilled(LIST_MODEL_ENDPOINTS),
          payload: { endpoints: [] },
          meta: {},
        }),
      ).toEqual({});
    });

    test('LIST_MODEL_VERSION_ENDPOINTS does not modify state for empty response', () => {
      const modelA = mockModelEndpoint({ modelName: 'modelA' });
      const modelB = mockModelEndpoint({ modelName: 'modelB' });
      const modelC = mockModelEndpoint({ modelName: 'modelC' });
      const state = { modelA, modelB, modelC };
      const action = {
        type: fulfilled(LIST_MODEL_ENDPOINTS),
        payload: {},
        meta: {},
      };
      expect(modelEndpointStatus(state, action)).toEqual(state);
    });

    test('LIST_MODEL_VERSION_ENDPOINTS skip endpoints without model name', () => {
      const modelA = mockModelEndpoint({ modelName: 'modelA' });
      const modelB = mockModelEndpoint({ modelName: 'modelB' });
      const modelC = mockModelEndpoint({ modelName: undefined });
      const modelD = mockModelEndpoint({ modelName: null });
      const state = { modelA, modelB };
      const action = {
        type: fulfilled(LIST_MODEL_ENDPOINTS),
        payload: { endpoints: [modelC, modelD] },
        meta: {},
      };
      expect(modelEndpointStatus(state, action)).toEqual(state);
    });

    test('LIST_MODEL_VERSION_ENDPOINTS updates existing endpoints correctly', () => {
      const modelA = mockModelEndpoint({
        modelName: 'modelA',
        state: EndpointState.PENDING,
      });
      const modelB = mockModelEndpoint({ modelName: 'modelB' });
      const modelC = mockModelEndpoint({ modelName: 'modelC' });
      const newModelA = mockModelEndpoint({
        modelName: 'modelA',
        state: EndpointState.READY,
      });
      const state = { modelA: modelA, modelB: modelB };
      const action = {
        type: fulfilled(LIST_MODEL_ENDPOINTS),
        payload: { endpoints: [modelC, newModelA] },
        meta: {},
      };
      expect(modelEndpointStatus(state, action)).toEqual({
        modelA: newModelA,
        modelB,
        modelC,
      });
    });

    test('reject LIST_MODEL_VERSION_ENDPOINTS does not add to state', () => {
      const modelA = mockModelEndpoint({
        modelName: 'modelA',
      });
      const modelB = mockModelEndpoint({
        modelName: 'modelB',
      });
      const state = { modelA, modelB };
      const action = {
        type: rejected(LIST_MODEL_ENDPOINTS),
        payload: {},
        meta: {},
      };
      expect(modelEndpointStatus(state, action)).toEqual(state);
    });
  });

  describe('latestRunForJobs', () => {
    test('sets up initial state correctly', () => {
      expect(latestRunForJobs(undefined, {})).toEqual({});
    });
    test('handles GET_LATEST_RUN_FOR_JOB correctly with empty response', () => {
      const action = {
        type: fulfilled(GET_LATEST_RUN_FOR_JOB),
        payload: {},
        meta: {},
      };
      expect(latestRunForJobs({}, action)).toEqual({});
    });
    test('handles GET_LATEST_RUN_FOR_JOB correctly with empty runs list', () => {
      const action = {
        type: fulfilled(GET_LATEST_RUN_FOR_JOB),
        payload: {
          runs: [],
        },
        meta: {},
      };
      expect(latestRunForJobs({}, action)).toEqual({});
    });
    test('GET_LATEST_RUN_FOR_JOB sets latest run by job id', () => {
      const jobRun = mockJobRun({ jobId: '123' });
      const action = {
        type: fulfilled(GET_LATEST_RUN_FOR_JOB),
        payload: {
          runs: [jobRun],
        },
        meta: {},
      };
      const newState = latestRunForJobs({}, action);
      expect(Object.keys(newState)).toEqual(['123']);
      expect(newState['123']).toEqual(jobRun);
    });
    test('handles GET_LATEST_RUN_FOR_JOB correctly with more than one run returned', () => {
      const jobRun = mockJobRun({ jobId: '123' });
      const action = {
        type: fulfilled(GET_LATEST_RUN_FOR_JOB),
        payload: {
          runs: [
            jobRun,
            {
              job_id: 123,
            },
          ],
        },
        meta: {},
      };
      // this should not happen as we limit the number of runs returned to be 1.
      // In the case that this is not true, we must rely on the fact that result runs are
      // in descending order by start time. We are only interested in the most recent run.
      const newState = latestRunForJobs({}, action);
      expect(Object.keys(newState)).toEqual(['123']);
      expect(newState['123']).toEqual(jobRun);
    });
  });

  describe('tagsForFeatureTables', () => {
    test('sets up initial state correctly', () => {
      expect(tagsForFeatureTables(undefined, {})).toEqual({});
    });
    test('handle GET_TAGS_FOR_FEATURE_TABLE correctly with empty response', () => {
      const action = {
        type: fulfilled(GET_TAGS_FOR_FEATURE_TABLE),
        payload: {},
        meta: {},
      };
      const state = {
        featuretableb: {
          key4: { key: 'key4', value: 'value4' },
          key5: { key: 'key5', value: 'value5' },
        },
      };
      expect(tagsForFeatureTables(state, action)).toEqual(state);
    });
    test('handle GET_TAGS_FOR_FEATURE_TABLE correctly with empty tags', () => {
      const action = {
        type: fulfilled(GET_TAGS_FOR_FEATURE_TABLE),
        payload: { tags: [] },
        meta: { featureTableName: 'featureTableA' },
      };
      const state = {
        featuretableb: {
          key4: { key: 'key4', value: 'value4' },
          key5: { key: 'key5', value: 'value5' },
        },
      };
      expect(tagsForFeatureTables(state, action)).toEqual({
        featuretableb: {
          key4: { key: 'key4', value: 'value4' },
          key5: { key: 'key5', value: 'value5' },
        },
        featuretablea: {},
      });
    });
    test('handle GET_TAGS_FOR_FEATURE_TABLE correctly with tags', () => {
      const action = {
        type: fulfilled(GET_TAGS_FOR_FEATURE_TABLE),
        payload: {
          tags: [
            { key: 'key1', value: 'value1' },
            { key: 'key2', value: 'new value' },
            { key: 'newKey', value: 'some value' },
            { key: 'NewKEY', value: 'different value' },
          ],
        },
        meta: { featureTableName: 'featureTableA' },
      };
      const state = {
        featuretablea: {
          key1: { key: 'key1', value: 'value1' },
          key2: { key: 'key2', value: 'value2' },
          key3: { key: 'key3', value: 'value3' },
          key4: { key: 'key4', value: 'value4' },
        },
        featuretableb: {
          key4: { key: 'key4', value: 'value4' },
          key5: { key: 'key5', value: 'value5' },
        },
        featuretablec: {},
      };
      expect(tagsForFeatureTables(state, action)).toEqual({
        // original feature table tags should be replaced
        featuretablea: {
          key1: { key: 'key1', value: 'value1' },
          key2: { key: 'key2', value: 'new value' },
          // tag key name is case sensitive
          newKey: { key: 'newKey', value: 'some value' },
          NewKEY: { key: 'NewKEY', value: 'different value' },
        },
        // only requested feature table is impacted
        featuretableb: {
          key4: { key: 'key4', value: 'value4' },
          key5: { key: 'key5', value: 'value5' },
        },
        featuretablec: {},
      });
    });
    test('handle SET_TAGS_FOR_FEATURE_TABLE correctly with empty response', () => {
      const action = {
        type: fulfilled(SET_TAGS_FOR_FEATURE_TABLE),
        payload: {},
        meta: {},
      };
      const state = {
        featuretableb: {
          key4: { key: 'key4', value: 'value4' },
          key5: { key: 'key5', value: 'value5' },
        },
      };
      expect(tagsForFeatureTables(state, action)).toEqual(state);
    });
    test('handle SET_TAGS_FOR_FEATURE_TABLE correctly with new tags', () => {
      const action = {
        type: fulfilled(SET_TAGS_FOR_FEATURE_TABLE),
        payload: {},
        meta: {
          featureTableName: 'featureTableA',
          tags: [
            { key: 'someKey', value: 'newValue1' },
            { key: 'SOMEKEY', value: 'newValue2' },
            { key: 'newKey', value: 'newValue3' },
          ],
        },
      };
      const state = {
        featuretablea: {
          someKey: { key: 'someKey', value: 'oldValue1' },
          SOMEKEY: { key: 'SOMEKEY', value: 'oldValue2' },
          ANotherKey: { key: 'ANotherKey', value: 'oldValue3' },
        },
        featuretableb: {
          key4: { key: 'key4', value: 'value4' },
          key5: { key: 'key5', value: 'value5' },
        },
        featuretablec: {},
      };
      expect(tagsForFeatureTables(state, action)).toEqual({
        // old tags with the same key get value overridden and new tags are added
        // other old tags should be the same
        featuretablea: {
          someKey: { key: 'someKey', value: 'newValue1' },
          SOMEKEY: { key: 'SOMEKEY', value: 'newValue2' },
          ANotherKey: { key: 'ANotherKey', value: 'oldValue3' },
          newKey: { key: 'newKey', value: 'newValue3' },
        },
        // only requested feature table is impacted
        featuretableb: {
          key4: { key: 'key4', value: 'value4' },
          key5: { key: 'key5', value: 'value5' },
        },
        featuretablec: {},
      });
    });
    test('handle DELETE_TAGS_FOR_FEATURE_TABLE correctly with empty response', () => {
      const action = {
        type: fulfilled(DELETE_TAGS_FOR_FEATURE_TABLE),
        payload: {},
        meta: {},
      };
      const state = {
        featuretableb: {
          key4: { key: 'key4', value: 'value4' },
          key5: { key: 'key5', value: 'value5' },
        },
      };
      expect(tagsForFeatureTables(state, action)).toEqual(state);
    });
    test('handle DELETE_TAGS_FOR_FEATURE_TABLE correctly with tags', () => {
      const action = {
        type: fulfilled(DELETE_TAGS_FOR_FEATURE_TABLE),
        payload: {},
        meta: { featureTableName: 'featureTableA', keys: ['someKey', 'ANOTHERKey', 'invalid key'] },
      };
      const state = {
        featuretablea: {
          someKey: { key: 'someKey', value: 'value1' },
          SOMEKEY: { key: 'SOMEKEY', value: 'value2' },
          anotherKey: { key: 'anotherKey', value: 'value3' },
          randomKey: { key: 'randomKey', value: 'value4' },
        },
        featuretableb: {
          key4: { key: 'key4', value: 'value4' },
          key5: { key: 'key5', value: 'value5' },
        },
        featuretablec: {},
      };
      expect(tagsForFeatureTables(state, action)).toEqual({
        // requested tags are deleted and invalid tag key is ignored
        featuretablea: {
          // deletion is case sensitive
          SOMEKEY: { key: 'SOMEKEY', value: 'value2' },
          anotherKey: { key: 'anotherKey', value: 'value3' },
          randomKey: { key: 'randomKey', value: 'value4' },
        },
        // only requested feature table is impacted
        featuretableb: {
          key4: { key: 'key4', value: 'value4' },
          key5: { key: 'key5', value: 'value5' },
        },
        featuretablec: {},
      });
    });
    test('handle DELETE_FEATURE_TABLE correctly', () => {
      const action = {
        type: fulfilled(DELETE_FEATURE_TABLE),
        payload: {},
        meta: { name: 'featureTableA' },
      };
      const state = {
        featuretablea: {
          key1: { key: 'key1', value: 'value1' },
          key2: { key: 'key2', value: 'value2' },
          key3: { key: 'key3', value: 'value3' },
        },
        featuretableb: {
          key4: { key: 'key4', value: 'value4' },
          key5: { key: 'key5', value: 'value5' },
        },
        featuretablec: {},
      };
      expect(tagsForFeatureTables(state, action)).toEqual({
        // only requested feature table is impacted
        featuretableb: {
          key4: { key: 'key4', value: 'value4' },
          key5: { key: 'key5', value: 'value5' },
        },
        featuretablec: {},
      });
    });
  });

  describe('tagsForFeatures', () => {
    test('sets up initial state correctly', () => {
      expect(tagsForFeatures(undefined, {})).toEqual({});
    });
    test('handle GET_TAGS_FOR_FEATURE correctly with empty response', () => {
      const action = {
        type: fulfilled(GET_TAGS_FOR_FEATURE),
        payload: {},
        meta: {},
      };
      const state = {
        featuretableb: {
          featureb: {
            key4: { key: 'key4', value: 'value4' },
            key5: { key: 'key5', value: 'value5' },
          },
        },
      };
      expect(tagsForFeatures(state, action)).toEqual(state);
    });
    test('handle GET_TAGS_FOR_FEATURE correctly with empty tags', () => {
      const action = {
        type: fulfilled(GET_TAGS_FOR_FEATURE),
        payload: { tags: [] },
        meta: { featureTableName: 'featureTableA', featureName: 'featureA' },
      };
      const state = {
        featuretableb: {
          featureb: {
            key4: { key: 'key4', value: 'value4' },
            key5: { key: 'key5', value: 'value5' },
          },
        },
      };
      expect(tagsForFeatures(state, action)).toEqual({
        featuretableb: {
          featureb: {
            key4: { key: 'key4', value: 'value4' },
            key5: { key: 'key5', value: 'value5' },
          },
        },
        featuretablea: {
          featurea: {},
        },
      });
    });
    test('handle GET_TAGS_FOR_FEATURE correctly with tags', () => {
      const action = {
        type: fulfilled(GET_TAGS_FOR_FEATURE),
        payload: {
          tags: [
            { key: 'key1', value: 'value1' },
            { key: 'key2', value: 'new value' },
            { key: 'newKey', value: 'some value' },
            { key: 'NewKEY', value: 'different value' },
          ],
        },
        meta: { featureTableName: 'featureTableA', featureName: 'featureA' },
      };
      const state = {
        featuretablea: {
          featurea: {
            key1: { key: 'key1', value: 'value1' },
            key2: { key: 'key2', value: 'value2' },
            key3: { key: 'key3', value: 'value3' },
            key4: { key: 'key4', value: 'value4' },
          },
          featureb: {
            key1: { key: 'key1', value: 'value1' },
            key2: { key: 'key2', value: 'value2' },
            key3: { key: 'key3', value: 'value3' },
            key4: { key: 'key4', value: 'value4' },
          },
        },
        featuretableb: {
          featurea: {
            key4: { key: 'key4', value: 'value4' },
            key5: { key: 'key5', value: 'value5' },
          },
        },
        featuretablec: {},
      };
      expect(tagsForFeatures(state, action)).toEqual({
        // original feature table tags should be replaced
        featuretablea: {
          featurea: {
            key1: { key: 'key1', value: 'value1' },
            key2: { key: 'key2', value: 'new value' },
            // tag key name is case sensitive
            newKey: { key: 'newKey', value: 'some value' },
            NewKEY: { key: 'NewKEY', value: 'different value' },
          },
          featureb: {
            key1: { key: 'key1', value: 'value1' },
            key2: { key: 'key2', value: 'value2' },
            key3: { key: 'key3', value: 'value3' },
            key4: { key: 'key4', value: 'value4' },
          },
        },
        // only requested feature table is impacted
        featuretableb: {
          featurea: {
            key4: { key: 'key4', value: 'value4' },
            key5: { key: 'key5', value: 'value5' },
          },
        },
        featuretablec: {},
      });
    });
    test('handle GET_TAGS_FOR_FEATURE correctly with tags and empty state', () => {
      const action = {
        type: fulfilled(GET_TAGS_FOR_FEATURE),
        payload: {
          tags: [
            { key: 'key1', value: 'value1' },
            { key: 'key2', value: 'new value' },
            { key: 'newKey', value: 'some value' },
            { key: 'NewKEY', value: 'different value' },
          ],
        },
        meta: { featureTableName: 'featureTableA', featureName: 'featureA' },
      };
      const state = {};
      expect(tagsForFeatures(state, action)).toEqual({
        // original feature table tags should be replaced
        featuretablea: {
          featurea: {
            key1: { key: 'key1', value: 'value1' },
            key2: { key: 'key2', value: 'new value' },
            // tag key name is case sensitive
            newKey: { key: 'newKey', value: 'some value' },
            NewKEY: { key: 'NewKEY', value: 'different value' },
          },
        },
      });
    });
    test('handle SET_TAGS_FOR_FEATURE correctly with empty response', () => {
      const action = {
        type: fulfilled(SET_TAGS_FOR_FEATURE),
        payload: {},
        meta: {},
      };
      const state = {
        featuretableb: {
          featurec: {
            key4: { key: 'key4', value: 'value4' },
            key5: { key: 'key5', value: 'value5' },
          },
        },
      };
      expect(tagsForFeatures(state, action)).toEqual(state);
    });
    test('handle SET_TAGS_FOR_FEATURE correctly with new tags', () => {
      const action = {
        type: fulfilled(SET_TAGS_FOR_FEATURE),
        payload: {},
        meta: {
          featureTableName: 'featureTableA',
          featureName: 'featureA',
          tags: [
            { key: 'someKey', value: 'newValue1' },
            { key: 'SOMEKEY', value: 'newValue2' },
            { key: 'newKey', value: 'newValue3' },
          ],
        },
      };
      const state = {
        featuretablea: {
          featurea: {
            someKey: { key: 'someKey', value: 'oldValue1' },
            SOMEKEY: { key: 'SOMEKEY', value: 'oldValue2' },
            ANotherKey: { key: 'ANotherKey', value: 'oldValue3' },
          },
          featureb: {
            someKey: { key: 'someKey', value: 'oldValue1' },
          },
          featurec: {},
        },
        featuretableb: {
          featureb: {
            key4: { key: 'key4', value: 'value4' },
            key5: { key: 'key5', value: 'value5' },
          },
        },
        featuretablec: {},
      };
      expect(tagsForFeatures(state, action)).toEqual({
        featuretablea: {
          featurea: {
            someKey: { key: 'someKey', value: 'newValue1' },
            SOMEKEY: { key: 'SOMEKEY', value: 'newValue2' },
            ANotherKey: { key: 'ANotherKey', value: 'oldValue3' },
            newKey: { key: 'newKey', value: 'newValue3' },
          },
          featureb: {
            someKey: { key: 'someKey', value: 'oldValue1' },
          },
          featurec: {},
        },
        // only requested feature table is impacted
        featuretableb: {
          featureb: {
            key4: { key: 'key4', value: 'value4' },
            key5: { key: 'key5', value: 'value5' },
          },
        },
        featuretablec: {},
      });
    });
    test('handle SET_TAGS_FOR_FEATURE correctly with new tags and empty state', () => {
      const action = {
        type: fulfilled(SET_TAGS_FOR_FEATURE),
        payload: {},
        meta: {
          featureTableName: 'featureTableA',
          featureName: 'featureA',
          tags: [
            { key: 'someKey', value: 'newValue1' },
            { key: 'SOMEKEY', value: 'newValue2' },
            { key: 'newKey', value: 'newValue3' },
          ],
        },
      };
      const state = {};
      expect(tagsForFeatures(state, action)).toEqual({
        featuretablea: {
          featurea: {
            someKey: { key: 'someKey', value: 'newValue1' },
            SOMEKEY: { key: 'SOMEKEY', value: 'newValue2' },
            newKey: { key: 'newKey', value: 'newValue3' },
          },
        },
      });
    });
    test('handle DELETE_TAGS_FOR_FEATURE correctly with empty response', () => {
      const action = {
        type: fulfilled(DELETE_TAGS_FOR_FEATURE),
        payload: {},
        meta: {},
      };
      const state = {
        featuretableb: {
          featureb: {
            key4: { key: 'key4', value: 'value4' },
            key5: { key: 'key5', value: 'value5' },
          },
        },
      };
      expect(tagsForFeatures(state, action)).toEqual(state);
    });
    test('handle DELETE_TAGS_FOR_FEATURE correctly with tags', () => {
      const action = {
        type: fulfilled(DELETE_TAGS_FOR_FEATURE),
        payload: {},
        meta: {
          featureTableName: 'featureTableA',
          featureName: 'featureA',
          keys: ['someKey', 'ANOTHERKey', 'invalid key'],
        },
      };
      const state = {
        featuretablea: {
          featurea: {
            someKey: { key: 'someKey', value: 'value1' },
            SOMEKEY: { key: 'SOMEKEY', value: 'value2' },
            anotherKey: { key: 'anotherKey', value: 'value3' },
            randomKey: { key: 'randomKey', value: 'value4' },
          },
          featureb: {
            someKey: { key: 'someKey', value: 'value1' },
            SOMEKEY: { key: 'SOMEKEY', value: 'value2' },
            anotherKey: { key: 'anotherKey', value: 'value3' },
            randomKey: { key: 'randomKey', value: 'value4' },
          },
          featurec: {},
        },
        featuretableb: {
          featured: {
            key4: { key: 'key4', value: 'value4' },
            key5: { key: 'key5', value: 'value5' },
          },
        },
        featuretablec: {},
      };
      expect(tagsForFeatures(state, action)).toEqual({
        // requested tags are deleted and invalid tag key is ignored
        featuretablea: {
          featurea: {
            // deletion is case sensitive
            SOMEKEY: { key: 'SOMEKEY', value: 'value2' },
            anotherKey: { key: 'anotherKey', value: 'value3' },
            randomKey: { key: 'randomKey', value: 'value4' },
          },
          // only requested feature is impacted
          featureb: {
            someKey: { key: 'someKey', value: 'value1' },
            SOMEKEY: { key: 'SOMEKEY', value: 'value2' },
            anotherKey: { key: 'anotherKey', value: 'value3' },
            randomKey: { key: 'randomKey', value: 'value4' },
          },
          featurec: {},
        },
        // only requested feature table is impacted
        featuretableb: {
          featured: {
            key4: { key: 'key4', value: 'value4' },
            key5: { key: 'key5', value: 'value5' },
          },
        },
        featuretablec: {},
      });
    });
    test('handle DELETE_TAGS_FOR_FEATURE correctly with tags and empty state', () => {
      const action = {
        type: fulfilled(DELETE_TAGS_FOR_FEATURE),
        payload: {},
        meta: {
          featureTableName: 'featureTableA',
          featureName: 'featureA',
          keys: ['someKey', 'ANOTHERKey', 'invalid key'],
        },
      };
      const state = {};
      expect(tagsForFeatures(state, action)).toEqual({
        featuretablea: {
          featurea: {},
        },
      });
    });
  });

  describe('getFeatureStoreWidePermissions', () => {
    test('handles GET_FEATURE_STORE_WIDE_PERMISSIONS correctly with empty response', () => {
      const action = {
        type: fulfilled(GET_FEATURE_STORE_WIDE_PERMISSIONS),
        payload: {},
        meta: { id: 1 },
      };

      expect(featureStoreWidePermissionLevel({}, action)).toEqual({});
    });

    test('handles GET_FEATURE_STORE_WIDE_PERMISSIONS correctly with empty state', () => {
      const action = {
        type: fulfilled(GET_FEATURE_STORE_WIDE_PERMISSIONS),
        payload: {
          permission_level: {},
        },
        meta: { id: 1 },
      };
      const newState = featureStoreWidePermissionLevel({}, action);
      expect(newState.permissionLevel).toEqual({});
    });

    test('GET_FEATURE_STORE_WIDE_PERMISSIONS sets permission_level', () => {
      const action = {
        type: fulfilled(GET_FEATURE_STORE_WIDE_PERMISSIONS),
        payload: { permission_level: PermissionLevels.CAN_MANAGE },
        meta: { id: 1 },
      };
      const newState = featureStoreWidePermissionLevel({}, action);
      expect(newState.permissionLevel).toEqual(PermissionLevels.CAN_MANAGE);
    });

    test('GET_FEATURE_STORE_WIDE_PERMISSIONS overriding existing state', () => {
      const state = { permission_level: PermissionLevels.CAN_CREATE };
      const action = {
        type: fulfilled(GET_FEATURE_STORE_WIDE_PERMISSIONS),
        payload: { permission_level: PermissionLevels.CAN_MANAGE },
        meta: { id: 1 },
      };

      const newState = featureStoreWidePermissionLevel(state, action);
      expect(newState.permissionLevel).toEqual(PermissionLevels.CAN_MANAGE);
    });
  });
});
