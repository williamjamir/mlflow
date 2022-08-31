import { extractAutoMLData } from './extractAutoMLData';

const MOCK_EXPERIMENT_WITH_AUTOML_TAGS = {
  tags: [
    { key: '_databricks_automl', value: 'True' },
    { key: '_databricks_automl.exploration_notebook_id', value: '1234' },
    { key: '_databricks_automl.job_run_id', value: '100' },
    { key: '_databricks_automl.max_trials', value: '10000' },
    { key: '_databricks_automl.problem_type', value: 'regression' },
    { key: '_databricks_automl.source_gui', value: 'true' },
    { key: '_databricks_automl.start_time', value: '1000' },
    { key: '_databricks_automl.state', value: 'SUCCESS' },
    { key: '_databricks_automl.target_col', value: 'target_column_name' },
    { key: '_databricks_automl.timeout_minutes', value: '60' },
    {
      key: '_databricks_automl.alerts.high_correlation_cols',
      value:
        '{"version": 1, "severity": "low", "affected": {"values": [{"id": "m1", "type": null}, {"id": "m2", "type": null}, {"id": "m3", "type": null}], "others": 15}}',
    },
    {
      key: '_databricks_automl.alerts.strong_categorical_type_detection',
      value:
        '{"version": 1, "severity": "medium", "affected": {"values": [{"id": "m1", "type": null}]}}',
    },
    {
      key: '_databricks_automl.warnings.training_early_stopped',
      value: '{"version": 1, "severity": "high"}',
    },
    {
      key: '_databricks_automl.alerts.unique_cols',
      value:
        '{"version": 1, "severity": "low", "affected": {"values": [{"id": "id", "type": null}]}}',
    },
    {
      key: '_databricks_automl.warnings.unable_to_sample_without_skew',
      value: '{"version": 1, "severity": "medium", "affected": {"values": [{"id": "id"}]}}',
    },
    // The one below has deliberately broken JSON value
    {
      key: '_databricks_automl.warnings.strong_text_type_detection',
      value: 'this-is-broken-json[',
    },
  ],
} as any;

describe('extractAutoMLData', () => {
  test('it should return empty result if there is no automl data', () => {
    const data = extractAutoMLData({ tags: [] } as any);
    expect(data).toEqual({ warnings: [] });
  });

  test('it should extract values properly', () => {
    const data = extractAutoMLData(MOCK_EXPERIMENT_WITH_AUTOML_TAGS as any);
    expect(data).toEqual(
      expect.objectContaining({
        automl: 'True',
        explorationNotebookId: '1234',
        jobRunId: '100',
        maxTrials: '10000',
        problemType: 'REGRESSION',
        sourceGui: 'true',
        startTimeSeconds: '1000',
        state: 'SUCCESS',
        targetCol: 'target_column_name',
        timeoutMinutes: '60',
      }),
    );
  });

  test('it should extract warnings properly', () => {
    const data = extractAutoMLData(MOCK_EXPERIMENT_WITH_AUTOML_TAGS as any);
    expect(data.warnings).toEqual(
      expect.arrayContaining([
        {
          affected: {
            others: 15,
            values: [
              { id: 'm1', type: null },
              { id: 'm2', type: null },
              { id: 'm3', type: null },
            ],
          },
          name: 'highCorrelationCols',
          severity: 'LOW',
          version: 1,
        },
        {
          affected: { values: [{ id: 'm1', type: null }] },
          name: 'strongCategoricalTypeDetection',
          severity: 'MEDIUM',
          version: 1,
        },
        { name: 'trainingEarlyStopped', severity: 'HIGH', version: 1 },
        {
          affected: { values: [{ id: 'id', type: null }] },
          name: 'uniqueCols',
          severity: 'LOW',
          version: 1,
        },
        {
          name: 'unableToSampleWithoutSkew',
          severity: 'MEDIUM',
          version: 1,
          affected: { values: [{ id: 'id' }] },
        },
      ]),
    );

    // We assert *not* including the warning with an erroneous JSON value
    expect(data.warnings).toEqual(
      expect.not.arrayContaining([
        expect.objectContaining({
          name: 'strongTextTypeDetection',
        }),
      ]),
    );
  });
});
