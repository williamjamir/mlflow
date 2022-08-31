const monitoringTagSpecValue = (overrides = {}) => {
  const { config, ...nonConfigOverrides } = overrides;
  // eslint-disable-next-line max-len
  return JSON.stringify({
    info: {
      config: {
        catalog: 'spark_catalog',
        database_name: 'mldata_adult_census',
        extra_logging_fields: [
          '{"metadata":{},"name":"example_id","nullable":false,"type":"string"}',
        ],
        granularities: ['1 day'],
        id_cols: ['example_id'],
        label_col: 'income',
        model_name: 'mldata_adult_census_classify',
        model_type: 'classifier',
        monitor_name: 'ML_20540',
        prediction_col: 'income_predicted',
        slicing_exprs: ['age > 2'],
        timestamp_col: 'dt',
        _METADATA_CLASS_TAG: 'Config',
        ...config,
      },
      aggregates_base_table_name:
        'mldata_adult_census.mldata_adult_census_classify_ml_20540_aggregates_base',
      analysis_job_id: '655897406375123',
      analysis_job_notebook_path:
        // Reported during ESLint upgrade
        // eslint-disable-next-line max-len
        '/Users/viswesh.periyasamy@databricks.com/Model Monitoring/mldata_adult_census_classify/ML_20540/mldata_adult_census_classify Analysis Notebook',
      analysis_metrics_table_name:
        'mldata_adult_census.mldata_adult_census_classify_ml_20540_analysis_metrics',
      dashboard_id: 'dashboard_id',
      dashboard_notebook_path:
        // Reported during ESLint upgrade
        // eslint-disable-next-line max-len
        '/Users/viswesh.periyasamy@databricks.com/Model Monitoring/mldata_adult_census_classify/ML_20540/Dashboard',
      dlt_pipeline_id: 'ed15c702-669f-4a01-acf3-7b38b282e673',
      drift_metrics_table_name:
        'mldata_adult_census.mldata_adult_census_classify_ml_20540_drift_metrics',
      logging_table_name: 'mldata_adult_census.mldata_adult_census_classify_ml_20540_logging',
      status: 'active',
      _METADATA_CLASS_TAG: 'MonitorInfo',
      ...nonConfigOverrides,
    },
  });
};

export const monitoringTagMock = {
  key: 'mlflow.model_monitoring.path/to/ML-19529-mm',
  value: monitoringTagSpecValue(),
};

export const customMonitoringTagMock = ({ key = '', value = '', ...customProperties } = {}) => ({
  key: `mlflow.model_monitoring.${key}`,
  value: value || monitoringTagSpecValue(customProperties),
});
