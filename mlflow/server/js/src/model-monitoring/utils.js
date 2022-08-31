import { DatabricksModelMonitoringDocUrl } from '../common/constants-databricks';
import DatabricksUtils from '../common/utils/DatabricksUtils';

export const MONITORING_TAG_REGEX = /^mlflow\.model_monitoring\..*/;

export const getActiveModelMonitoringTags = (tags = []) =>
  tags
    .filter((tag) => tag.key && tag.key.match(MONITORING_TAG_REGEX))
    .map(({ key, value }) => {
      try {
        return {
          key,
          ...JSON.parse(value).info,
        };
      } catch {
        return false;
      }
    })
    .filter((tag) => tag && tag.status === 'active');

export function generateTopHashUrl(key, value) {
  const urlBase = `${window.location.origin}/${window.location.search}`;

  if (!value) return null;

  switch (key) {
    case 'logging_table_name':
    case 'baseline_data_table_name':
    case 'scored_data_table_name':
    case 'analysis_metrics_table_name':
    case 'drift_metrics_table_name':
      return `${urlBase}#table/${value.replace('.', '/')}`;
    case 'dashboard_notebook_path':
    case 'analysis_job_notebook_path':
      return `${urlBase}#workspace${value}`;
    case 'analysis_job_id':
      return `${urlBase}#job/${value}`;
    case 'analysis_job_id_history':
      return `${urlBase}#job/${value}?tab=matrix`;
    case 'dlt_pipeline_id':
      return `${urlBase}#joblist/pipelines/${value}`;
    default:
      return null;
  }
}

export function formatConfigValue(key, value) {
  switch (key) {
    case 'granularities':
    case 'slicing_exprs': {
      if (typeof value === 'string') {
        return value;
      } else if (Array.isArray(value)) {
        if (value.length === 0) return '--';

        return value.join(', ');
      }

      return '--';
    }
    default:
      return value || '--';
  }
}

export function getMonitoringDocsUrl() {
  const cloudProvider = DatabricksUtils.getCloudProvider();
  return DatabricksModelMonitoringDocUrl[cloudProvider];
}
