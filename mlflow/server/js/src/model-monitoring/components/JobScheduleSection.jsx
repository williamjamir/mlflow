import React from 'react';
import { PropTypes } from 'prop-types';
import _ from 'lodash';
import { useIntl, FormattedMessage } from 'react-intl';
import {
  Button,
  Skeleton,
  Spacer,
  Typography,
  useDesignSystemTheme,
} from '@databricks/design-system';

import CronUtils from '../../feature-store/utils/CronUtils';
import { generateTopHashUrl } from '../utils';
import DatabricksUtils from '../../common/utils/DatabricksUtils';

const { Text, Paragraph } = Typography;

export function JobScheduleSection({
  isLoading,
  schedule,
  jobId,
  dltPipelineId,
  analysisJobNotebookPath,
}) {
  const { theme } = useDesignSystemTheme();
  const intl = useIntl();

  let scheduleStatus = intl.formatMessage({
    defaultMessage: 'None',
    description: 'Empty state text for when job schedule does not exist in monitoring pane',
  });
  if (schedule) {
    const { quartz_cron_expression, timezone_id, pause_status } = schedule;
    const time = CronUtils.getScheduleExpression(quartz_cron_expression);
    scheduleStatus = `${_.capitalize(pause_status)} - ${time} (${timezone_id})`;
  }

  return (
    <div data-testid='job-schedule-section'>
      <div>
        <Text bold>
          <FormattedMessage
            defaultMessage='Schedule'
            description='Title for job schedule section of the monitoring page'
          />
        </Text>
      </div>
      <Spacer size='small' />
      {isLoading ? (
        <Skeleton active paragraph={{ rows: 1 }} title={false} />
      ) : (
        <Paragraph withoutMargins data-testid='schedule-status'>
          {scheduleStatus}
        </Paragraph>
      )}
      <Spacer size='small' />
      <div css={{ display: 'flex', alignItems: 'center', gap: theme.spacing.lg }}>
        <Button
          href={generateTopHashUrl('analysis_job_id', jobId)}
          target='_top'
          size='small'
          onClick={() =>
            DatabricksUtils.logClientSideEvent(
              'modelMonitoringEvent',
              'clickMonitorArtifact-analysis_job_id',
            )
          }
        >
          <FormattedMessage
            defaultMessage='Edit schedule'
            description='Link to jobs edit schedule'
          />
        </Button>
        <a
          href={generateTopHashUrl('analysis_job_notebook_path', analysisJobNotebookPath)}
          target='_top'
          disabled={!analysisJobNotebookPath}
          onClick={() =>
            DatabricksUtils.logClientSideEvent(
              'modelMonitoringEvent',
              'clickMonitorArtifact-analysis_job_notebook_path',
            )
          }
        >
          <FormattedMessage defaultMessage='Job notebook' description='Link to jobs notebook' />
        </a>
        <a
          href={generateTopHashUrl('dlt_pipeline_id', dltPipelineId)}
          target='_top'
          disabled={!dltPipelineId}
          onClick={() =>
            DatabricksUtils.logClientSideEvent(
              'modelMonitoringEvent',
              'clickMonitorArtifact-dlt_pipeline_id',
            )
          }
        >
          <FormattedMessage
            defaultMessage='Delta Live Tables pipeline'
            description='Link to jobs Delta Live Tables pipeline'
          />
        </a>
      </div>
    </div>
  );
}
JobScheduleSection.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  schedule: PropTypes.shape({
    quartz_cron_expression: PropTypes.string.isRequired,
    timezone_id: PropTypes.string.isRequired,
    pause_status: PropTypes.string.isRequired,
  }),
  jobId: PropTypes.string.isRequired,
  dltPipelineId: PropTypes.string.isRequired,
  analysisJobNotebookPath: PropTypes.string.isRequired,
};
