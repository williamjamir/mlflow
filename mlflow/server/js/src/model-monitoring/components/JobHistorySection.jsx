import React from 'react';
import { PropTypes } from 'prop-types';
import { FormattedMessage, useIntl } from 'react-intl';
import {
  Button,
  Skeleton,
  Spacer,
  Typography,
  useDesignSystemTheme,
} from '@databricks/design-system';
import DatabricksUtils from '../../common/utils/DatabricksUtils';
import { generateTopHashUrl } from '../utils';
import { JOB_FETCH_LIMIT } from '../hooks/useJobFetch';
import { RecentRuns, jobRunStatusMessages } from './RecentRuns';

const { Text } = Typography;

function CopyableTableLink({ tableTitleSnakeCase, tableName, shouldShowArtifactLinks, children }) {
  const intl = useIntl();
  const tableTitleKebabCase = tableTitleSnakeCase.replace(/_/g, '-');

  return (
    <Text
      data-testid={`artifact-link-${tableTitleKebabCase}-name`}
      dangerouslySetAntdProps={{
        copyable: shouldShowArtifactLinks && {
          text: tableName,
          tooltips: [
            intl.formatMessage({
              defaultMessage: 'Copy',
              description: 'Copy tooltip in model monitoring pane',
            }),
          ],
        },
      }}
    >
      <a
        href={
          shouldShowArtifactLinks
            ? generateTopHashUrl(`${tableTitleSnakeCase}_name`, tableName)
            : ''
        }
        target='_top'
        onClick={() =>
          DatabricksUtils.logClientSideEvent(
            'modelMonitoringEvent',
            `clickMonitorArtifact-${tableTitleSnakeCase}_name`,
          )
        }
        disabled={!shouldShowArtifactLinks || !tableName}
      >
        {children}
      </a>
    </Text>
  );
}
CopyableTableLink.propTypes = {
  tableTitleSnakeCase: PropTypes.string.isRequired,
  tableName: PropTypes.string,
  shouldShowArtifactLinks: PropTypes.bool.isRequired,
  children: PropTypes.node.isRequired,
};

export function JobHistorySection({
  isLoading,
  runHistory = [],
  jobId,
  loggingTableName,
  baselineDataTableName,
  scoredDataTableName,
  analysisMetricsTableName,
  driftMetricsTableName,
}) {
  const { theme } = useDesignSystemTheme();

  const lastRun = runHistory[0];
  const lastSuccessfulRun = runHistory.find((run) => run.state?.result_state === 'SUCCESS');
  const shouldShowArtifactLinks = Boolean(
    !isLoading && (lastSuccessfulRun || runHistory.length === JOB_FETCH_LIMIT),
  );

  return (
    <div data-testid='job-history-section'>
      <div>
        <Text bold>
          <FormattedMessage
            defaultMessage='History'
            description='Title for job history section of the monitoring page'
          />
        </Text>
      </div>
      <Spacer size='small' />
      {isLoading ? (
        <Skeleton active paragraph={{ rows: 1 }} title={false} />
      ) : (
        <div data-testid='recent-runs'>
          {runHistory.length > 0 ? (
            <RecentRuns lastRun={lastRun} lastSuccessfulRun={lastSuccessfulRun} />
          ) : (
            <FormattedMessage
              defaultMessage='None'
              description='Empty state text for when job history does not have any runs'
            />
          )}
        </div>
      )}
      <Spacer size='small' />
      <Button
        href={generateTopHashUrl('analysis_job_id_history', jobId)}
        target='_top'
        size='small'
        disabled={!runHistory}
      >
        <FormattedMessage defaultMessage='View history' description='Link to job history' />
      </Button>
      <Spacer size='large' />
      <hr css={{ margin: 0, border: 0, borderTop: `1px solid ${theme.colors.border}` }} />
      <Spacer size='large' />
      <div css={{ display: 'flex', alignItems: 'center', gap: theme.spacing.lg }}>
        {loggingTableName ? (
          <CopyableTableLink
            tableTitleSnakeCase={'logging_table'}
            tableName={loggingTableName}
            shouldShowArtifactLinks={!!loggingTableName}
          >
            <FormattedMessage defaultMessage='Logging table' description='Link to logging table' />
          </CopyableTableLink>
        ) : (
          <>
            <CopyableTableLink
              tableTitleSnakeCase={'baseline_data_table'}
              tableName={baselineDataTableName}
              shouldShowArtifactLinks={!!baselineDataTableName}
            >
              <FormattedMessage
                defaultMessage='Baseline data table'
                description='Link to baseline data table'
              />
            </CopyableTableLink>
            <CopyableTableLink
              tableTitleSnakeCase={'scored_data_table'}
              tableName={scoredDataTableName}
              shouldShowArtifactLinks={!!scoredDataTableName}
            >
              <FormattedMessage
                defaultMessage='Scored data table'
                description='Link to scored data table'
              />
            </CopyableTableLink>
          </>
        )}
        <CopyableTableLink
          tableTitleSnakeCase={'analysis_metrics_table'}
          tableName={analysisMetricsTableName}
          shouldShowArtifactLinks={shouldShowArtifactLinks && !!analysisMetricsTableName}
        >
          <FormattedMessage
            defaultMessage='Analysis metrics table'
            description='Link to analysis metrics table'
          />
        </CopyableTableLink>
        <CopyableTableLink
          tableTitleSnakeCase={'drift_metrics_table'}
          tableName={driftMetricsTableName}
          shouldShowArtifactLinks={shouldShowArtifactLinks && !!driftMetricsTableName}
        >
          <FormattedMessage
            defaultMessage='Drift metrics table'
            description='Link to the drift metrics table'
          />
        </CopyableTableLink>
      </div>
    </div>
  );
}
JobHistorySection.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  runHistory: PropTypes.arrayOf(
    PropTypes.shape({
      end_time: PropTypes.number.isRequired,
      state: PropTypes.shape({
        result_state: PropTypes.oneOf(Object.keys(jobRunStatusMessages)),
      }),
    }),
  ),
  jobId: PropTypes.string.isRequired,
  loggingTableName: PropTypes.string,
  baselineDataTableName: PropTypes.string,
  scoredDataTableName: PropTypes.string,
  analysisMetricsTableName: PropTypes.string,
  driftMetricsTableName: PropTypes.string,
};
