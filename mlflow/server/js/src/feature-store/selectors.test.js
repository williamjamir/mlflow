import { getOnlineStoreKey } from './reducers';
import {
  getFeatureTables,
  getFeatureTableDetails,
  getFeaturesByTable,
  getFeatureByTableAndName,
  getOnlineStore,
  getNotebookConsumers,
  getJobConsumers,
  getModelVersionsByFeature,
  getNotebookProducers,
  getPipelineProducers,
  getJobProducers,
  getScheduledJobsForFeatureTables,
  getFeatureTableTags,
  getFeatureTags,
  getFeatureStoreWidePermissionLevel,
} from './selectors';
import {
  mockFeatureTable,
  mockFeatures,
  mockFeature,
  mockOnlineStore,
  mockJobConsumer,
  mockNotebookConsumer,
  mockModelVersionDetailedWithFeatureList,
  mockModelVersionDetailedWithServingStatus,
  mockNotebookProducer,
  mockPipelineProducer,
  mockJobProducer,
  mockJobRun,
  mockSchedule,
  mockModelEndpoint,
} from './utils/test-utils';
import { EndpointState } from '../model-serving/utils';
import { Stages } from '../model-registry/constants';
import { ProducerTypes, PermissionLevels } from './constants';

describe('Feature Store redux selectors', () => {
  describe('getFeatureTables', () => {
    test('when feature tables are defined', () => {
      const featureTableA = mockFeatureTable({ name: 'featureTableA' });
      const featureTableB = mockFeatureTable({ name: 'featureTableB' });
      const state = {
        entities: {
          featureTablesByName: {
            featureTableA,
            featureTableB,
          },
        },
      };

      expect(getFeatureTables(state)).toEqual([featureTableA, featureTableB]);
    });

    test('when feature tables are undefined', () => {
      const state = {
        entities: {},
      };

      expect(getFeatureTables(state)).toEqual([]);
    });
  });

  describe('getFeatureTableDetails', () => {
    test('when feature tables are defined', () => {
      const featureTableA = mockFeatureTable({ name: 'featureTableA' });
      const featureTableB = mockFeatureTable({ name: 'featureTableB' });
      const state = {
        entities: {
          featureTablesByName: {
            featuretablea: featureTableA,
            featuretableb: featureTableB,
          },
        },
      };

      expect(getFeatureTableDetails(state, 'featureTableB')).toEqual(featureTableB);
    });

    test('when feature tables are undefined', () => {
      const state = {
        entities: {},
      };

      expect(getFeatureTableDetails(state, 'featureTableB')).toEqual({});
    });
  });

  describe('getFeaturesByTable', () => {
    test('when features are defined', () => {
      const features = mockFeatures();
      const state = {
        entities: {
          features: {
            featuretableb: features,
          },
        },
      };

      expect(getFeaturesByTable(state, 'featureTableB')).toEqual(features);
    });

    test('when features are undefined', () => {
      const state = {
        entities: {
          features: {},
        },
      };

      expect(getFeaturesByTable(state, 'featureTableB')).toEqual([]);
    });
  });

  describe('getFeatureByTableAndName', () => {
    test('when feature table and feature are defined', () => {
      const feature = mockFeature({ name: 'featureA' });
      const state = {
        entities: {
          featuresByName: {
            featuretableb: {
              featurea: feature,
              featureb: mockFeature({ name: 'featureB' }),
            },
          },
        },
      };

      expect(getFeatureByTableAndName(state, 'featureTableB', 'featureA')).toEqual(feature);
    });

    test('when feature table is defined, but feature is not', () => {
      const state = {
        entities: {
          featuresByName: {
            featuretableb: {
              featureb: mockFeature({ name: 'featureB' }),
            },
          },
        },
      };

      expect(getFeatureByTableAndName(state, 'featureTableB', 'featureA')).toEqual({});
    });

    test('when feature is defined in the wrong table', () => {
      const feature = mockFeature({ name: 'featureA' });
      const state = {
        entities: {
          featuresByName: {
            featuretableb: {},
            featuretablec: {
              featurea: feature,
              featureb: mockFeature({ name: 'featureB' }),
            },
          },
        },
      };

      expect(getFeatureByTableAndName(state, 'featureTableB', 'featureA')).toEqual({});
    });

    test('when feature table and feature are undefined', () => {
      const state = {
        entities: {
          featuresByName: {},
        },
      };

      expect(getFeatureByTableAndName(state, 'featureTableB', 'featureA')).toEqual({});
    });
  });

  describe('getOnlineStore', () => {
    const toKey = (featureTableName, onlineStore) => {
      return getOnlineStoreKey(
        featureTableName,
        onlineStore.name,
        onlineStore.cloud,
        onlineStore.store_type,
      );
    };

    const featureTableNameA = 'user.all_features';
    const onlineStoreA1 = mockOnlineStore({
      name: 'user.purchase_features',
      store_type: 'DYNAMODB',
      cloud: 'AWS',
      dynamodb_metadata: { region: 'east', table_arn: 'abc123' },
    });
    const onlineStoreA2 = mockOnlineStore({
      name: 'user.location_features',
      store_type: 'MYSQL',
      cloud: 'AWS',
      mysql_metadata: { host: 'www.example.com', port: 123 },
    });
    const onlineStoreA3 = mockOnlineStore({
      name: 'user.preference_features',
      store_type: 'COSMOSDB',
      cloud: 'Azure',
      cosmosdb_metadata: {
        account_uri: 'www.account.com',
        container_uri: 'www.account.com/db/db_name/colls/container',
      },
    });

    const featureTableNameB = 'user.all_features_dev';
    const onlineStoreB1 = mockOnlineStore({
      name: 'user.ads_features_dev',
      cloud: 'AZURE',
      store_type: 'SQL_SERVER',
      sql_server_metadata: { host: 'www.example.com', port: 123 },
    });

    test('when online stores are defined', () => {
      const state = {
        entities: {
          onlineStores: {
            [toKey(featureTableNameA, onlineStoreA1)]: onlineStoreA1,
            [toKey(featureTableNameA, onlineStoreA2)]: onlineStoreA2,
            [toKey(featureTableNameA, onlineStoreA3)]: onlineStoreA3,
            [toKey(featureTableNameB, onlineStoreB1)]: onlineStoreB1,
          },
        },
      };
      expect(Object.keys(state.entities.onlineStores).length).toEqual(4);

      expect(
        getOnlineStore(state, 'user.all_FEATURES', 'user.PURCHASE_features', 'AWS', 'DynamoDb'),
      ).toEqual(onlineStoreA1);
      expect(
        getOnlineStore(state, 'user.ALL_features', 'user.location_FEATURES', 'aWs', 'Mysql'),
      ).toEqual(onlineStoreA2);
      expect(
        getOnlineStore(state, 'user.ALL_features', 'user.preference_FEATURES', 'azure', 'CosmosDb'),
      ).toEqual(onlineStoreA3);
      expect(
        getOnlineStore(
          state,
          'user.all_features_DEV',
          'user.ads_features_dev',
          'azURE',
          'sql_SERVER',
        ),
      ).toEqual(onlineStoreB1);
    });

    test('when online stores are undefined', () => {
      const state = {
        entities: {},
      };
      expect(
        getOnlineStore(state, 'user.all_FEATURES', 'user.PURCHASE_features', 'azure', 'reDIS'),
      ).toEqual({});
    });

    test('when online store does not exist', () => {
      const state = {
        entities: {
          onlineStores: {
            [toKey(featureTableNameA, onlineStoreA1)]: onlineStoreA1,
            [toKey(featureTableNameB, onlineStoreB1)]: onlineStoreB1,
          },
        },
      };
      expect(
        getOnlineStore(state, 'user.ALL_features', 'user.location_FEATURES', 'aWs', 'Mysql'),
      ).toEqual({});
    });
  });

  describe('getNotebookConsumers', () => {
    test('when notebooks are undefined', () => {
      const state = { entities: { consumersByFeatureTable: {} } };
      expect(getNotebookConsumers(state, 'foo.bar')).toEqual([]);
    });
    test('when consumers are undefined', () => {
      const state = { entities: { notebooks: {} } };
      expect(getNotebookConsumers(state, 'foo.bar')).toEqual([]);
    });
    test('when consumers for feature table do not exist', () => {
      const state = {
        entities: {
          notebooks: { 1234: 'a notebook' },
          consumersByFeatureTable: {
            'foo.bar': [mockNotebookConsumer(5678, 9999, ['feat1'])],
          },
        },
      };
      expect(getNotebookConsumers(state, 'foo.baz')).toEqual([]);
    });
    test('when notebook name for notebook id does not exist', () => {
      const state = {
        entities: {
          notebooks: { 1234: 'a notebook' },
          consumersByFeatureTable: {
            'foo.bar': [mockNotebookConsumer(5678, 9999, ['feat1'])],
          },
        },
      };
      expect(getNotebookConsumers(state, 'foo.bar')).toEqual([
        mockNotebookConsumer(5678, 9999, ['feat1']),
      ]);
    });
    test('when notebooks and consumers exist', () => {
      const state = {
        entities: {
          notebooks: { 1234: 'notebook 1', 9876: 'notebook 2', 1111: 'notebook 3' },
          consumersByFeatureTable: {
            'foo.bar': [
              mockNotebookConsumer(5678, 9999, ['feat1']),
              mockNotebookConsumer(1234, 9998, ['feat1', 'feat2']),
              mockNotebookConsumer(1111, 9997, ['feat3']),
              // not a notebook
              mockJobConsumer(9876, 9996, ['feat1']),
            ],
            'foo.baz': [
              // wrong feature table
              mockNotebookConsumer(9876, 9995, ['feat1']),
            ],
          },
        },
      };
      const expected = [
        {
          name: 'notebook 1',
          ...mockNotebookConsumer(1234, 9998, ['feat1', 'feat2']),
        },
        mockNotebookConsumer(5678, 9999, ['feat1']),
        {
          name: 'notebook 3',
          ...mockNotebookConsumer(1111, 9997, ['feat3']),
        },
      ];
      const consumers = getNotebookConsumers(state, 'foo.bar');
      expect(consumers.length).toBe(3);
      expect(consumers).toEqual(expect.arrayContaining(expected));
    });
  });

  describe('getJobConsumers', () => {
    test('when jobs are undefined', () => {
      const state = { entities: { consumersByFeatureTable: {} } };
      expect(getJobConsumers(state, 'foo.bar')).toEqual([]);
    });
    test('when consumers are undefined', () => {
      const state = { entities: { jobs: {} } };
      expect(getJobConsumers(state, 'foo.bar')).toEqual([]);
    });
    test('when consumers for feature table do not exist', () => {
      const state = {
        entities: {
          jobs: { 1234: { name: 'a job' } },
          consumersByFeatureTable: {
            'foo.bar': [mockJobConsumer(5678, 9999, ['feat1'])],
          },
        },
      };
      expect(getJobConsumers(state, 'foo.baz')).toEqual([]);
    });
    test('when job name for job id does not exist', () => {
      const state = {
        entities: {
          jobs: { 1234: { name: 'a job' } },
          consumersByFeatureTable: {
            'foo.bar': [mockJobConsumer(5678, 9999, ['feat1'])],
          },
        },
      };
      expect(getJobConsumers(state, 'foo.bar')).toEqual([mockJobConsumer(5678, 9999, ['feat1'])]);
    });
    test('when jobs and consumers exist', () => {
      const state = {
        entities: {
          jobs: { 1234: { name: 'job 1' }, 9876: { name: 'job 2' }, 1111: { name: 'job 3' } },
          consumersByFeatureTable: {
            'foo.bar': [
              mockJobConsumer(5678, 9999, ['feat1']),
              mockJobConsumer(1234, 9998, ['feat1', 'feat2']),
              mockJobConsumer(1111, 9997, ['feat3']),
              // not a job
              mockNotebookConsumer(9876, 9996, ['feat1']),
            ],
            'foo.baz': [
              // wrong feature table
              mockJobConsumer(9876, 9995, ['feat1']),
            ],
          },
        },
      };
      const expected = [
        {
          name: 'job 1',
          ...mockJobConsumer(1234, 9998, ['feat1', 'feat2']),
        },
        mockJobConsumer(5678, 9999, ['feat1']),
        {
          name: 'job 3',
          ...mockJobConsumer(1111, 9997, ['feat3']),
        },
      ];
      const consumers = getJobConsumers(state, 'foo.bar');
      expect(consumers.length).toBe(3);
      expect(consumers).toEqual(expect.arrayContaining(expected));
    });
  });

  describe('getNotebookProducers', () => {
    test('when notebooks are undefined', () => {
      const state = {
        entities: {},
      };
      expect(getNotebookProducers(state, 'foo.bar')).toEqual([]);
    });
    test('when the feature table does not exist', () => {
      const state = {
        entities: {
          notebooks: { 1234: 'notebook 1', 2345: 'notebook 2' },
          featureTablesByName: {},
        },
      };
      expect(getNotebookProducers(state, 'foo.baz')).toEqual([]);
    });
    test('when notebook producers for feature table do not exist', () => {
      const state = {
        entities: {
          notebooks: { 1234: 'notebook 1', 2345: 'notebook 2' },
          featureTablesByName: { 'foo.bar': {} },
        },
      };
      expect(getNotebookProducers(state, 'foo.bar')).toEqual([]);
    });
    test('when notebook names for notebook producers do not exist', () => {
      const state = {
        entities: {
          notebooks: {},
          featureTablesByName: { 'foo.bar': mockFeatureTable() },
        },
      };
      expect(getNotebookProducers(state, 'foo.bar')).toEqual(
        mockFeatureTable().notebook_producers.map((notebook) => ({
          ...notebook,
          type: ProducerTypes.NOTEBOOK,
        })),
      );
    });
    test('when notebook names for notebook producers exist', () => {
      const state = {
        entities: {
          notebooks: { 1234: 'notebook 1', 2345: 'notebook 2', 9999: 'invalid notebook' },
          featureTablesByName: { 'foo.bar': mockFeatureTable() },
        },
      };
      const expected = [
        mockNotebookProducer(1234, 1, 1, 'notebook 1234 creator', 'notebook 1'),
        mockNotebookProducer(2345, 2, 2, 'notebook 2345 creator', 'notebook 2'),
      ];
      const notebooks = getNotebookProducers(state, 'foo.bar');
      expect(notebooks.length).toBe(2);
      expect(notebooks[0]).toMatchObject(expected[0]);
      expect(notebooks[1]).toMatchObject(expected[1]);
    });
  });

  describe('getJobProducers', () => {
    test('when jobs are undefined', () => {
      const state = {
        entities: {},
      };
      expect(getJobProducers(state, 'foo.bar')).toEqual([]);
    });
    test('when the feature table does not exist', () => {
      const state = {
        entities: {
          jobs: { 1234: { name: 'job 1' }, 2345: { name: 'job 2' } },
          latestRunForJobs: {
            1234: mockJobRun({ jobId: 1234 }),
            2345: mockJobRun({ jobId: 2345 }),
          },
          featureTablesByName: {},
        },
      };
      expect(getJobProducers(state, 'foo.baz')).toEqual([]);
    });
    test('when job producers for feature table do not exist', () => {
      const state = {
        entities: {
          jobs: { 1234: { name: 'job 1' }, 2345: { name: 'job 2' } },
          latestRunForJobs: {
            1234: mockJobRun({ jobId: 1234 }),
            2345: mockJobRun({ jobId: 2345 }),
          },
          featureTablesByName: { 'foo.bar': {} },
        },
      };
      expect(getJobProducers(state, 'foo.bar')).toEqual([]);
    });
    test('when jobs for job producers do not exist', () => {
      const state = {
        entities: {
          jobs: {},
          latestRunForJobs: {
            1234: mockJobRun({ jobId: 1234 }),
            2345: mockJobRun({ jobId: 2345 }),
          },
          featureTablesByName: { 'foo.bar': mockFeatureTable() },
        },
      };
      expect(getJobProducers(state, 'foo.bar')).toEqual(
        mockFeatureTable().job_producers.map((job) => ({
          ...job,
          type: ProducerTypes.JOB,
          latest_run: mockJobRun({ jobId: job.job_id }),
        })),
      );
    });
    test('when job latest run do not exist', () => {
      const state = {
        entities: {
          jobs: {
            1234: {
              name: 'job 1',
              schedule: mockSchedule(),
            },
            2345: { name: 'job 2' },
          },
          latestRunForJobs: {},
          featureTablesByName: { 'foo.bar': mockFeatureTable() },
        },
      };
      const expected = [
        mockJobProducer(1234, 1, 1, 'job 1234 creator', 'job 1', undefined, mockSchedule()),
        mockJobProducer(2345, 2, 2, 'job 2345 creator', 'job 2'),
      ];
      const jobs = getJobProducers(state, 'foo.bar');
      expect(jobs.length).toBe(2);
      expect(jobs[0]).toMatchObject(expected[0]);
      expect(jobs[1]).toMatchObject(expected[1]);
    });
    test('when job names and latest run for job producers exist', () => {
      const state = {
        entities: {
          jobs: {
            1234: {
              name: 'job 1',
              schedule: mockSchedule(),
            },
            2345: { name: 'job 2' },
          },
          latestRunForJobs: {
            1234: mockJobRun({ jobId: 1234 }),
            2345: mockJobRun({ jobId: 2345 }),
          },
          featureTablesByName: { 'foo.bar': mockFeatureTable() },
        },
      };
      const expected = [
        mockJobProducer(
          1234,
          1,
          1,
          'job 1234 creator',
          'job 1',
          mockJobRun({ jobId: 1234 }),
          mockSchedule(),
        ),
        mockJobProducer(2345, 2, 2, 'job 2345 creator', 'job 2', mockJobRun({ jobId: 2345 })),
      ];
      const jobs = getJobProducers(state, 'foo.bar');
      expect(jobs.length).toBe(2);
      expect(jobs[0]).toMatchObject(expected[0]);
      expect(jobs[1]).toMatchObject(expected[1]);
    });
  });

  describe('getPipelineProducers', () => {
    test('when pipelines are undefined', () => {
      const state = {
        entities: {},
      };
      expect(getPipelineProducers(state, 'foo.bar')).toEqual([]);
    });
    test('when the feature table does not exist', () => {
      const state = {
        entities: {
          pipelines: { abc123: 'pipeline1', def456: 'pipeline2' },
          featureTablesByName: {},
        },
      };
      expect(getPipelineProducers(state, 'foo.baz')).toEqual([]);
    });
    test('when pipeline producers for feature table do not exist', () => {
      const state = {
        entities: {
          pipelines: { abc123: 'pipeline1', def456: 'pipeline2' },
          featureTablesByName: { 'foo.bar': {} },
        },
      };
      expect(getPipelineProducers(state, 'foo.bar')).toEqual([]);
    });
    test('when pipelines for pipeline producers do not exist', () => {
      const state = {
        entities: {
          pipelines: {},
          featureTablesByName: { 'foo.bar': mockFeatureTable() },
        },
      };
      expect(getPipelineProducers(state, 'foo.bar')).toEqual(
        mockFeatureTable().dlt_pipeline_producers.map((pipeline) => ({
          ...pipeline,
          type: ProducerTypes.PIPELINE,
        })),
      );
    });
    test('when pipeline names for pipeline producers exist', () => {
      const state = {
        entities: {
          pipelines: {
            abc123: 'test pipeline 1',
            def456: 'test pipeline 2',
          },
          featureTablesByName: { 'foo.bar': mockFeatureTable() },
        },
      };
      const expected = [
        mockPipelineProducer('abc123', 'a1', 1, 'pipeline abc123 creator', 'test pipeline 1'),
        mockPipelineProducer('def456', 'd4', 2, 'pipeline def456 creator', 'test pipeline 2'),
      ];
      const pipelines = getPipelineProducers(state, 'foo.bar');
      expect(pipelines.length).toBe(2);
      expect(pipelines[0]).toMatchObject(expected[0]);
      expect(pipelines[1]).toMatchObject(expected[1]);
    });
  });

  describe('getScheduledJobsForFeatureTables', () => {
    test('when state entity is empty', () => {
      const state = {
        entities: {},
      };
      expect(getScheduledJobsForFeatureTables(state)).toEqual({});
    });

    test('when featureTables is defined but jobs is empty', () => {
      const featureTableA = mockFeatureTable({ name: 'feature_Table_A' });
      const featureTableB = mockFeatureTable({ name: 'feature_Table_B' });
      const state = {
        entities: {
          jobs: {},
        },
      };
      expect(getScheduledJobsForFeatureTables(state, [featureTableA, featureTableB])).toEqual({
        feature_table_a: [],
        feature_table_b: [],
      });
    });

    test('when featureTables and jobs are both defined', () => {
      const jobProducer1 = mockJobProducer(1234, 1, 111, 'a@b');
      const jobProducer2 = mockJobProducer(5678, 2, 222, 'a@b');
      const jobProducer3 = mockJobProducer(6666, 3, 333, 'a@b');
      const jobProducer4 = mockJobProducer(9999);
      const featureTableA = mockFeatureTable({
        name: 'feature_Table_A',
        jobProducers: [jobProducer1, jobProducer2],
      });
      const featureTableB = mockFeatureTable({
        name: 'feature_Table_B',
        // one invalid job
        jobProducers: [jobProducer3, jobProducer4],
      });
      // does not have any job producers
      const featureTableC = mockFeatureTable({
        name: 'feature_Table_C',
        jobProducers: null,
      });
      const state = {
        entities: {
          jobs: {
            1234: { name: 'job 1', schedule: mockSchedule() },
            // this job run does not have a schedule
            5678: { name: 'job 2' },
            6666: { name: 'job 3', schedule: mockSchedule() },
          },
        },
      };
      expect(
        getScheduledJobsForFeatureTables(state, [featureTableA, featureTableB, featureTableC]),
      ).toEqual({
        feature_table_a: [{ ...jobProducer1, name: 'job 1', schedule: mockSchedule() }],
        feature_table_b: [{ ...jobProducer3, name: 'job 3', schedule: mockSchedule() }],
        feature_table_c: [],
      });
    });
  });

  describe('getModelVersionsByFeature', () => {
    test('when modelVersionsWithFeaturesByName state entity is empty', () => {
      const state = {
        entities: {},
      };
      expect(getModelVersionsByFeature(state, 'user.all_FEATURES')).toEqual({});
    });

    // test cases for when model serving is NOT enabled in the workspace
    test('when modelVersionsWithFeaturesByName is defined and all features are filled', () => {
      const state = {
        entities: {
          modelVersionsWithFeatures: {
            'user.all_features': [
              mockModelVersionDetailedWithFeatureList({
                name: 'modelA',
                version: 1,
                feature_list: {
                  features: [
                    { feature_table_name: 'user.all_FEATURES', feature_name: 'feature_1' },
                    { feature_table_name: 'user.all_FEATURES', feature_name: 'feature_2' },
                  ],
                },
              }),
              mockModelVersionDetailedWithFeatureList({
                name: 'modelA',
                version: 2,
                feature_list: {
                  features: [
                    { feature_table_name: 'user.all_FEATURES', feature_name: 'feature_2' },
                  ],
                },
              }),
            ],
          },
        },
      };
      expect(getModelVersionsByFeature(state, 'user.all_FEATURES')).toEqual({
        feature_1: [
          mockModelVersionDetailedWithServingStatus({
            name: 'modelA',
            version: 1,
            serving_enabled: false,
          }),
        ],
        feature_2: [
          mockModelVersionDetailedWithServingStatus({
            name: 'modelA',
            version: 1,
            serving_enabled: false,
          }),
          mockModelVersionDetailedWithServingStatus({
            name: 'modelA',
            version: 2,
            serving_enabled: false,
          }),
        ],
      });
    });

    test('only fetch model versions in the given feature table', () => {
      const state = {
        entities: {
          modelVersionsWithFeatures: {
            'user.all_features': [
              mockModelVersionDetailedWithFeatureList({
                name: 'modelA',
                version: 1,
                feature_list: {
                  features: [
                    { feature_table_name: 'user.all_FEATURES', feature_name: 'feature_1' },
                    { feature_table_name: 'user.all_FEATURES', feature_name: 'feature_2' },
                  ],
                },
              }),
            ],
            'user.purchase_features': [
              mockModelVersionDetailedWithFeatureList({
                name: 'modelA',
                version: 2,
                feature_list: {
                  features: [
                    { feature_table_name: 'user.purchase_FEATURES', feature_name: 'feature_2' },
                  ],
                },
              }),
            ],
          },
        },
      };
      expect(getModelVersionsByFeature(state, 'user.all_FEATURES')).toEqual({
        feature_1: [
          mockModelVersionDetailedWithServingStatus({
            name: 'modelA',
            version: 1,
            serving_enabled: false,
          }),
        ],
        feature_2: [
          mockModelVersionDetailedWithServingStatus({
            name: 'modelA',
            version: 1,
            serving_enabled: false,
          }),
        ],
      });
    });

    test('only fetch features from the given feature table', () => {
      const state = {
        entities: {
          modelVersionsWithFeatures: {
            'user.all_features': [
              mockModelVersionDetailedWithFeatureList({
                name: 'modelA',
                version: 1,
                feature_list: {
                  features: [
                    { feature_table_name: 'user.all_FEATURES', feature_name: 'feature_1' },
                    { feature_table_name: 'user.purchase_FEATURES', feature_name: 'feature_2' },
                  ],
                },
              }),
            ],
            'user.purchase_features': [
              mockModelVersionDetailedWithFeatureList({
                name: 'modelA',
                version: 1,
                feature_list: {
                  features: [
                    { feature_table_name: 'user.all_FEATURES', feature_name: 'feature_1' },
                    { feature_table_name: 'user.PURCHASE_FEATURES', feature_name: 'feature_2' },
                  ],
                },
              }),
              mockModelVersionDetailedWithFeatureList({
                name: 'modelA',
                version: 2,
                feature_list: {
                  features: [
                    { feature_table_name: 'user.purchase_FEATURES', feature_name: 'feature_1' },
                  ],
                },
              }),
            ],
          },
        },
      };
      expect(getModelVersionsByFeature(state, 'user.all_FEATURES')).toEqual({
        feature_1: [
          mockModelVersionDetailedWithServingStatus({
            name: 'modelA',
            version: 1,
            serving_enabled: false,
          }),
        ],
      });
      expect(getModelVersionsByFeature(state, 'user.purchase_FEATURES')).toEqual({
        feature_1: [
          mockModelVersionDetailedWithServingStatus({
            name: 'modelA',
            version: 2,
            serving_enabled: false,
          }),
        ],
        feature_2: [
          mockModelVersionDetailedWithServingStatus({
            name: 'modelA',
            version: 1,
            serving_enabled: false,
          }),
        ],
      });
    });

    // test cases for when model serving is enabled in the workspace
    test('when serving is enabled but some models serving status are not READY', () => {
      const state = {
        entities: {
          modelVersionsWithFeatures: {
            'user.all_features': [
              mockModelVersionDetailedWithFeatureList({
                name: 'modelA',
                version: 1,
                feature_list: {
                  features: [
                    { feature_table_name: 'user.all_FEATURES', feature_name: 'feature_1' },
                  ],
                },
              }),
              mockModelVersionDetailedWithFeatureList({
                name: 'modelB',
                version: 1,
                feature_list: {
                  features: [
                    { feature_table_name: 'user.all_FEATURES', feature_name: 'feature_1' },
                  ],
                },
              }),
            ],
          },
          modelEndpointStatus: {
            modelA: mockModelEndpoint({ modelName: 'modelA', state: EndpointState.READY }),
            modelB: mockModelEndpoint({ modelName: 'modelB', state: EndpointState.FAILED }),
          },
        },
      };
      expect(getModelVersionsByFeature(state, 'user.ALL_FEATURES')).toEqual({
        feature_1: [
          mockModelVersionDetailedWithServingStatus({
            name: 'modelA',
            version: 1,
            serving_enabled: true,
          }),
          mockModelVersionDetailedWithServingStatus({
            name: 'modelB',
            version: 1,
            serving_enabled: false,
          }),
        ],
      });
    });

    test('when serving is enabled but some model versions are archived', () => {
      const state = {
        entities: {
          modelVersionsWithFeatures: {
            'user.all_features': [
              mockModelVersionDetailedWithFeatureList({
                name: 'modelA',
                version: 1,
                feature_list: {
                  features: [
                    { feature_table_name: 'user.all_FEATURES', feature_name: 'feature_1' },
                  ],
                },
              }),
              mockModelVersionDetailedWithFeatureList({
                name: 'modelA',
                version: 2,
                stage: Stages.ARCHIVED,
                feature_list: {
                  features: [
                    { feature_table_name: 'user.all_FEATURES', feature_name: 'feature_1' },
                  ],
                },
              }),
            ],
          },
          modelEndpointStatus: {
            modelA: mockModelEndpoint({ modelName: 'modelA', state: EndpointState.READY }),
          },
        },
      };
      expect(getModelVersionsByFeature(state, 'user.ALL_FEATURES')).toEqual({
        feature_1: [
          mockModelVersionDetailedWithServingStatus({
            name: 'modelA',
            version: 1,
            stage: Stages.PRODUCTION,
            serving_enabled: true,
          }),
          mockModelVersionDetailedWithServingStatus({
            name: 'modelA',
            version: 2,
            stage: Stages.ARCHIVED,
            serving_enabled: false,
          }),
        ],
      });
    });
  });

  describe('getFeatureTableTags', () => {
    test('when feature table tags are defined', () => {
      const tags = {
        someKey: { key: 'someKey', value: 'value1' },
        SOMEKEY: { key: 'SOMEKEY', value: 'value2' },
        anotherKey: { key: 'anotherKey', value: 'value3' },
      };
      const state = {
        entities: {
          tagsForFeatureTables: {
            featuretablea: tags,
            featuretableb: {},
          },
        },
      };
      expect(getFeatureTableTags(state, 'featureTableA')).toEqual(tags);
      expect(getFeatureTableTags(state, 'FeaTureTAbleA')).toEqual(tags);
    });

    test('when feature table tags are undefined', () => {
      const state = {
        entities: {},
      };
      expect(getFeatureTableTags(state, 'featureTableA')).toEqual({});
    });
  });

  describe('getFeatureTags', () => {
    test('when feature tags are defined', () => {
      const tags = {
        someKey: { key: 'someKey', value: 'value1' },
        SOMEKEY: { key: 'SOMEKEY', value: 'value2' },
        anotherKey: { key: 'anotherKey', value: 'value3' },
      };
      const state = {
        entities: {
          tagsForFeatures: {
            featuretablea: { featurea: tags, featureb: {} },
            featuretableb: {},
          },
        },
      };
      expect(getFeatureTags(state, 'featureTableA', 'featureA')).toEqual(tags);
      expect(getFeatureTags(state, 'FeaTureTAbleA', 'FeatuRea')).toEqual(tags);
      expect(getFeatureTags(state, 'featureTableB', 'featureA')).toEqual({});
      expect(getFeatureTags(state, 'featureTableC', 'featureA')).toEqual({});
      expect(getFeatureTags(state, 'featureTableA', 'featureC')).toEqual({});
    });

    test('when feature tags are undefined', () => {
      const state = {
        entities: {},
      };
      expect(getFeatureTags(state, 'featureTableA', 'featureA')).toEqual({});
    });
  });

  describe('getFeatureStoreWidePermissionLevel', () => {
    test('when permission level are defined', () => {
      const state = {
        entities: {
          featureStoreWidePermissionLevel: {
            permissionLevel: PermissionLevels.CAN_MANAGE,
          },
        },
      };

      expect(getFeatureStoreWidePermissionLevel(state)).toEqual(PermissionLevels.CAN_MANAGE);
    });

    test('when featureStoreWidePermissionLevel is defined but permission level is undefined', () => {
      const state = {
        entities: {
          featureStoreWidePermissionLevel: {},
        },
      };
      expect(getFeatureStoreWidePermissionLevel(state)).toEqual(undefined);
    });

    test('when permission level is undefined', () => {
      const state = {
        entities: {},
      };

      expect(getFeatureStoreWidePermissionLevel(state)).toEqual(undefined);
    });
  });
});
