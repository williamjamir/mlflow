import { defineMessages } from 'react-intl';

export const monitoringMessages = defineMessages({
  // links
  logging_table_name: {
    defaultMessage: 'Logging table',
    description: 'Link text for the generated logging table for model monitoring',
  },
  analysis_job_notebook_path: {
    defaultMessage: 'Analysis job notebook',
    description: 'Link text for the analysis job notebook for model monitoring',
  },
  analysis_job_id: {
    defaultMessage: 'Analysis job',
    description: 'Link text for the analysis job for model monitoring',
  },
  analysis_metrics_table_name: {
    defaultMessage: 'Analysis metrics table',
    description: 'Link text for the analysis metrics table for model monitoring',
  },
  dlt_pipeline_id: {
    defaultMessage: 'Delta Live Tables pipeline',
    description: 'Link text for the Delta Live Table pipeline for model monitoring',
  },
  drift_metrics_table_name: {
    defaultMessage: 'Drift metrics table',
    description: 'Link text for the drift metrics table for model monitoring',
  },
  // model details
  model_name: {
    defaultMessage: 'Model name',
    description: 'Model monitoring details header text for model name',
  },
  database_name: {
    defaultMessage: 'Database name',
    description: 'Model monitoring details header text for database name',
  },
  model_type: {
    defaultMessage: 'Model type',
    description: 'Model monitoring details header text for model type',
  },
  catalog: {
    defaultMessage: 'Catalog name',
    description: 'Model monitoring details header text for catalog name',
  },
  // Configurations
  granularities: {
    defaultMessage: 'Granularities',
    description: 'Model monitoring configuration text for granularities',
  },
  slicing_exprs: {
    defaultMessage: 'Slicing expressions',
    description: 'Model monitoring configuration text for slice expressions',
  },
  id_cols: {
    defaultMessage: 'ID columns',
    description: 'Model monitoring configuration text for id columns',
  },
  timestamp_col: {
    defaultMessage: 'Timestamp column',
    description: 'Model monitoring configuration text for timestamp column',
  },
  prediction_col: {
    defaultMessage: 'Prediction column',
    description: 'Model monitoring configuration text for the prediction column',
  },
  label_col: {
    defaultMessage: 'Label column',
    description: 'Model monitoring configuration text for the label column',
  },
});
