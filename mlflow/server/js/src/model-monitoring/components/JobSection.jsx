import React from 'react';
import { PropTypes } from 'prop-types';
import { Spacer } from '@databricks/design-system';

import { useJobFetch } from '../hooks/useJobFetch';
import { JobHistorySection } from './JobHistorySection';
import { JobScheduleSection } from './JobScheduleSection';

export function JobSection({ artifactLinks }) {
  const { analysis_job_id: jobId } = artifactLinks;
  const { isLoading, schedule, runHistory } = useJobFetch(jobId);

  return (
    <>
      <JobScheduleSection
        isLoading={isLoading}
        schedule={schedule}
        jobId={jobId}
        dltPipelineId={artifactLinks.dlt_pipeline_id}
        analysisJobNotebookPath={artifactLinks.analysis_job_notebook_path}
      />
      <Spacer />
      <JobHistorySection
        isLoading={isLoading}
        runHistory={runHistory}
        jobId={jobId}
        loggingTableName={artifactLinks.logging_table_name}
        baselineDataTableName={artifactLinks.baseline_data_table_name}
        scoredDataTableName={artifactLinks.scored_data_table_name}
        analysisMetricsTableName={artifactLinks.analysis_metrics_table_name}
        driftMetricsTableName={artifactLinks.drift_metrics_table_name}
      />
    </>
  );
}
JobSection.propTypes = {
  artifactLinks: PropTypes.shape({
    logging_table_name: PropTypes.string,
    baseline_data_table_name: PropTypes.string,
    scored_data_table_name: PropTypes.string,
    analysis_job_notebook_path: PropTypes.string,
    analysis_job_id: PropTypes.string,
    dlt_pipeline_id: PropTypes.string,
    analysis_metrics_table_name: PropTypes.string,
    drift_metrics_table_name: PropTypes.string,
  }).isRequired,
};
