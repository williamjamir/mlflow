import { getUUID } from '../../common/utils/ActionUtils';
import {
  PermissionLevels,
  ProducerActions,
  ProducerTypes,
  RunLifeCycleState,
  SchedulePauseStatus,
} from '../constants';
import { mockModelVersionDetailed } from '../../model-registry/test-utils';
import { Stages } from '../../model-registry/constants';
import { EndpointState } from '../../model-serving/utils';
import { ErrorWrapper } from '../../common/utils/ErrorWrapper';

export const error404 = new ErrorWrapper('{"error_code": "RESOURCE_DOES_NOT_EXIST"}', 404);
export const error500 = new ErrorWrapper('{"error_code": "INTERNAL_ERROR"}', 500);

export const mockFeatureTable = ({
  name = 'prod.user_activity_features',
  description = 'User Features related to online activity.',
  id = getUUID(),
  creator = 'jane@doe.ml',
  features = ['count_items_7d', 'total_purchases_14d', 'count_items_14d'],
  onlineStores = [
    mockOnlineStore({
      name: 'DynamoDB_1',
      store_type: 'DynamoDB',
      cloud: 'AWS',
      last_updated_timestamp: 1000,
      last_update_user_id: 'foo.bar@databricks.com',
      dynamodb_metadata: { region: 'us-west-2', table_arn: '123abcd' },
    }),
    mockOnlineStore({
      name: 'MySQL_1',
      store_type: 'MySQL',
      cloud: 'GCP',
      last_updated_timestamp: 2000,
      last_update_user_id: 'foo.baz@databricks.com',
      mysql_metadata: { host: 'http://example.com', port: 2001 },
    }),
    mockOnlineStore({
      name: 'CosmosDB_1',
      store_type: 'CosmosDB',
      cloud: 'Azure',
      last_updated_timestamp: 2000,
      last_update_user_id: 'foo.baz@databricks.com',
      cosmosdb_metadata: {
        account_uri: 'http://account.com',
        container_uri: 'http://account.com/db/db_name/colls/container',
      },
    }),
  ],
  notebookProducers = [
    {
      notebook_id: 1234,
      revision_id: 1,
      creation_timestamp: 1,
      creator_id: 'notebook 1234 creator',
      workspace_path: 'PATH DEPRECATED',
      producer_action: ProducerActions.WRITE,
    },
    {
      notebook_id: 2345,
      revision_id: 2,
      creation_timestamp: 2,
      creator_id: 'notebook 2345 creator',
      workspace_path: 'PATH DEPRECATED',
      producer_action: ProducerActions.WRITE,
    },
  ],
  jobProducers = [
    {
      job_id: 1234,
      run_id: 1,
      creation_timestamp: 1,
      creator_id: 'job 1234 creator',
      job_name: 'JOB NAME DEPRECATED',
      producer_action: ProducerActions.WRITE,
    },
    {
      job_id: 2345,
      run_id: 2,
      creation_timestamp: 2,
      creator_id: 'job 2345 creator',
      job_name: 'JOB NAME DEPRECATED',
      producer_action: ProducerActions.WRITE,
    },
  ],
  pipelineProducers = [
    {
      pipeline_id: 'abc123',
      update_id: 'a1',
      creation_timestamp: 1,
      creator_id: 'pipeline abc123 creator',
      producer_action: ProducerActions.WRITE,
    },
    {
      pipeline_id: 'def456',
      update_id: 'd4',
      creation_timestamp: 2,
      creator_id: 'pipeline def456 creator',
      producer_action: ProducerActions.WRITE,
    },
  ],
  dataSources = [{ table: 'table_8881' }, { table: 'table_8798' }],
  permissionLevel = PermissionLevels.CAN_EDIT_METADATA,
  timestampKeys = ['ts'],
  isImported = false,
} = {}) => ({
  id,
  name,
  description,
  features,
  creator_id: creator,
  online_stores: onlineStores,
  data_sources: dataSources,
  job_producers: jobProducers,
  notebook_producers: notebookProducers,
  dlt_pipeline_producers: pipelineProducers,
  table_path: 'dbfs://...',
  primary_keys: ['user_id'],
  partition_keys: ['user_type', 'YYYY_MM_DD'],
  workspace: 1,
  creation_timestamp: 1611899140618,
  last_updated_timestamp: 1611899188908,
  last_update_user_id: 'john@doe.ml',
  permission_level: permissionLevel,
  timestamp_keys: timestampKeys,
  is_imported: isImported,
});

export const mockFeature = ({
  table = 'prod.user_activity_features',
  name = 'feat1',
  data_type = 'INTEGER',
  description = '',
  creator = 'jane@doe.ml',
  id = '123456',
} = {}) => ({
  table,
  name,
  data_type,
  description,
  id,
  creator_id: creator,
  creation_timestamp: 1611899140618,
  last_updated_timestamp: 1656627901418,
  last_update_user_id: 'john@doe.ml',
});

export const mockFeatures = () => [
  {
    table: 'prod.user_activity_features',
    name: 'count_items_7d',
    data_type: 'INTEGER',
    description: 'This is feature 1',
  },
  {
    table: 'prod.user_activity_features',
    name: 'total_purchase_value_14d',
    data_type: 'FLOAT',
    description: 'This is feature 2',
  },
  {
    table: 'prod.user_activity_features',
    name: 'count_items_14d',
    data_type: 'INTEGER',
    description: 'This is feature 3',
  },
];

export const mockFeaturesForKeys = () => [
  {
    table: 'prod.user_activity_features',
    name: 'user_id',
    data_type: 'INTEGER',
    description: 'This is primary key',
  },
  {
    table: 'prod.user_activity_features',
    name: 'user_type',
    data_type: 'INTEGER',
    description: 'This is user type',
  },
  {
    table: 'prod.user_activity_features',
    name: 'YYYY_MM_DD',
    data_type: 'TIMESTAMP',
    description: 'This is date',
  },
  {
    table: 'prod.user_activity_features',
    name: 'ts',
    data_type: 'TIMESTAMP',
    description: 'This is timestamp key',
  },
];

export const mockModelVersionsByFeature = () => {
  return {
    count_items_7d: [
      {
        name: 'modelA',
        version: 1,
        current_stage: Stages.ARCHIVED,
        serving_enabled: false,
      },
      {
        name: 'modelB',
        version: 1,
        current_stage: Stages.PRODUCTION,
        serving_enabled: false,
      },
    ],
    total_purchase_value_14d: [
      {
        name: 'modelA',
        version: 2,
        current_stage: Stages.NONE,
        serving_enabled: true,
      },
      {
        name: 'modelB',
        version: 1,
        current_stage: Stages.PRODUCTION,
        serving_enabled: false,
      },
    ],
    count_items_14d: [
      {
        name: 'modelA',
        version: 1,
        current_stage: Stages.ARCHIVED,
        serving_enabled: false,
      },
      {
        name: 'modelB',
        version: 2,
        current_stage: Stages.STAGING,
        serving_enabled: false,
      },
    ],
  };
};

export const mockOnlineStore = ({
  name,
  store_type,
  cloud,
  creation_timestamp = 1,
  creator_id = 'jane@doe.ml',
  last_updated_timestamp = 1611899188908,
  last_update_user_id = 'john@doe.ml',
  features = [],
  mysql_metadata = undefined,
  sql_server_metadata = undefined,
  dynamodb_metadata = undefined,
  cosmosdb_metadata = undefined,
} = {}) => {
  return {
    name,
    store_type,
    cloud,
    creation_timestamp,
    creator_id,
    last_updated_timestamp,
    last_update_user_id,
    features,
    ...(mysql_metadata && { mysql_metadata }),
    ...(dynamodb_metadata && { dynamodb_metadata }),
    ...(sql_server_metadata && { sql_server_metadata }),
    ...(cosmosdb_metadata && { cosmosdb_metadata }),
  };
};

export const mockSchedule = ({
  cronExpression = '0 15 22 ? * *',
  timezone = 'America/Los_Angeles',
  pauseStatus = SchedulePauseStatus.UNPAUSED,
} = {}) => ({
  quartz_cron_expression: cronExpression,
  timezone_id: timezone,
  pause_status: pauseStatus,
});

export const mockJob = ({ jobId = 123, name = 'test job', schedule = mockSchedule() } = {}) => ({
  job_id: jobId,
  settings: {
    name,
    schedule,
  },
});

export const mockJobRun = ({
  jobId = 123,
  numberInJob = 456,
  state = {
    life_cycle_state: RunLifeCycleState.RUNNING,
  },
  startTime = 111111,
  schedule = {
    quartz_cron_expression: '0 15 22 ? * *',
    timezone_id: 'America/Los_Angeles',
    pause_status: SchedulePauseStatus.UNPAUSED,
  },
} = {}) => ({
  job_id: jobId,
  number_in_job: numberInJob,
  state,
  start_time: startTime,
  schedule,
});

export const mockJobConsumer = (
  job_id,
  run_id,
  features,
  name = undefined,
  job_workspace_id = undefined,
  job_workspace_url = undefined,
) => ({
  job_run: {
    job_id,
    run_id,
    ...(job_workspace_id && { job_workspace_id }),
    ...(job_workspace_url && { job_workspace_url }),
  },
  features,
  ...(name && { name }),
});

export const mockNotebookConsumer = (
  notebook_id,
  revision_id,
  features,
  name = undefined,
  notebook_workspace_id = undefined,
  notebook_workspace_url = undefined,
) => ({
  notebook: {
    notebook_id,
    revision_id,
    ...(notebook_workspace_id && { notebook_workspace_id }),
    ...(notebook_workspace_url && { notebook_workspace_url }),
  },
  features,
  ...(name && { name }),
});

export const mockJobProducer = (
  job_id,
  run_id,
  creation_timestamp,
  creator_id,
  name = undefined,
  latest_run = undefined,
  schedule = undefined,
  job_workspace_id = undefined,
  job_workspace_url = undefined,
  producer_action = ProducerActions.WRITE,
) => ({
  job_id,
  run_id,
  creation_timestamp,
  creator_id,
  ...(name && { name }),
  ...(latest_run && { latest_run }),
  ...(schedule && { schedule }),
  ...(job_workspace_id && { job_workspace_id }),
  ...(job_workspace_url && { job_workspace_url }),
  type: ProducerTypes.JOB,
  producer_action,
});

export const mockPipelineProducer = (
  pipeline_id,
  update_id,
  creation_timestamp,
  creator_id,
  name = undefined,
  producer_action = ProducerActions.WRITE,
) => ({
  pipeline_id,
  update_id,
  creation_timestamp,
  creator_id,
  ...(name && { name }),
  type: ProducerTypes.PIPELINE,
  producer_action,
});

export const mockNotebookProducer = (
  notebook_id,
  revision_id,
  creation_timestamp,
  creator_id,
  name = undefined,
  notebook_workspace_id = undefined,
  notebook_workspace_url = undefined,
  producer_action = ProducerActions.WRITE,
) => ({
  notebook_id,
  revision_id,
  creation_timestamp,
  creator_id,
  ...(name && { name }),
  ...(notebook_workspace_id && { notebook_workspace_id }),
  ...(notebook_workspace_url && { notebook_workspace_url }),
  type: ProducerTypes.NOTEBOOK,
  producer_action,
});

export const mockModelVersionDetailedWithFeatureList = ({
  name = 'modelA',
  version = 1,
  stage = 'Production',
  status = 'READY',
  tags = [],
  open_requests = [],
  permissionLevel = 'CAN_MANAGE',
  run_link = undefined,
  run_id = 'b99a0fc567ae4d32994392c800c0b6ce',
  feature_list = {
    features: [],
  },
} = {}) => {
  return {
    ...mockModelVersionDetailed(
      name,
      version,
      stage,
      status,
      tags,
      open_requests,
      permissionLevel,
      run_link,
      run_id,
    ),
    feature_list: feature_list,
  };
};

export const mockModelEndpoint = ({
  modelName = 'modelA',
  servingVersion = 'V1',
  state = EndpointState.READY,
  clusterConfig = {},
} = {}) => ({
  registered_model_name: modelName,
  serving_version: servingVersion,
  state,
  actual_cluster_config: clusterConfig,
});

export const mockModelVersionDetailedWithServingStatus = ({
  name = 'modelA',
  version = 1,
  stage = 'Production',
  status = 'READY',
  tags = [],
  open_requests = [],
  permissionLevel = 'CAN_MANAGE',
  run_link = undefined,
  run_id = 'b99a0fc567ae4d32994392c800c0b6ce',
  serving_enabled = false,
} = {}) => {
  return {
    ...mockModelVersionDetailed(
      name,
      version,
      stage,
      status,
      tags,
      open_requests,
      permissionLevel,
      run_link,
      run_id,
    ),
    serving_enabled: serving_enabled,
  };
};

export const mockPipeline = ({ pipelineId = 'abc123', pipelineName = 'test pipeline' } = {}) => ({
  pipeline_id: pipelineId,
  spec: {
    name: pipelineName,
  },
});
