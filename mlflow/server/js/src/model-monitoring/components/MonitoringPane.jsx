import React, { useEffect } from 'react';
import { PropTypes } from 'prop-types';
import _ from 'lodash';
import { FormattedMessage, useIntl } from 'react-intl';
import {
  Alert,
  Button,
  Select,
  NewWindowIcon,
  Spacer,
  Typography,
  useDesignSystemTheme,
} from '@databricks/design-system';
import { monitoringMessages } from '../monitoringStrings';
import { formatConfigValue, generateTopHashUrl, getMonitoringDocsUrl } from '../utils';
import DatabricksUtils from '../../common/utils/DatabricksUtils';
import { JobSection } from './JobSection';
import { MonitoringErrorBoundary } from './MonitoringErrorBoundary';
import { useActiveMonitor } from '../hooks/useActiveMonitor';
import { FeedbackLink } from 'src/shared/databricks_edge/FeedbackLink';

const { Text, Paragraph } = Typography;

function Container(props) {
  const { theme } = useDesignSystemTheme();

  return (
    <div
      css={{
        border: `1px solid ${theme.colors.border}`,
        borderRadius: 8,
        width: 660,
        marginTop: theme.spacing.sm,
        padding: 24,
      }}
      {...props}
    />
  );
}

function MonitoringSection(props) {
  const { theme } = useDesignSystemTheme();

  return (
    <div
      css={{
        backgroundColor: theme.colors.backgroundSecondary,
        borderRadius: theme.borders.borderRadiusMd,
        padding: theme.spacing.lg,
      }}
      {...props}
    />
  );
}

function ValueLabel({ labelKey, includeSpacer, children }) {
  const intl = useIntl();

  if (!_.has(monitoringMessages, labelKey)) {
    return null;
  }

  return (
    <>
      {includeSpacer && <Spacer size='small' />}
      <Paragraph withoutMargins>
        {intl.formatMessage(monitoringMessages[labelKey])}:{' '}
        <span data-testid={labelKey}>{children}</span>
      </Paragraph>
    </>
  );
}
ValueLabel.propTypes = {
  labelKey: PropTypes.string.isRequired,
  includeSpacer: PropTypes.bool,
  children: PropTypes.node,
};

export const modelDetails = [
  'model_name',
  'catalog',
  'database_name',
  'model_type',
  'granularities',
  'slicing_exprs',
  'timestamp_col',
  'prediction_col',
  'label_col',
];

function MonitorDetails({ activeMonitor }) {
  const { config, ...links } = activeMonitor;

  return (
    <>
      <JobSection artifactLinks={links} />
      <Spacer size='large' />

      <MonitoringSection>
        <Text bold>
          <FormattedMessage
            defaultMessage='Monitor details'
            description='Title for model monitoring panel'
          />
        </Text>
        <Spacer size='small' />
        {modelDetails.map((key) => {
          return (
            <ValueLabel key={key} includeSpacer labelKey={key}>
              {formatConfigValue(key, config[key])}
            </ValueLabel>
          );
        })}
        <ValueLabel includeSpacer labelKey='id_cols'>
          {formatConfigValue('id_cols', config['id_cols'])}
        </ValueLabel>
      </MonitoringSection>
    </>
  );
}
MonitorDetails.propTypes = {
  activeMonitor: PropTypes.shape({
    config: PropTypes.shape({ id_cols: PropTypes.arrayOf(PropTypes.string) }),
  }),
};

function MonitoringView({ monitors = [] }) {
  const { activeMonitor, activeKey, setActiveKey, monitorName } = useActiveMonitor(monitors);

  useEffect(() => {
    DatabricksUtils.logClientSideEvent('modelMonitoringEvent', 'viewMonitor');
  }, []);

  return (
    <MonitoringErrorBoundary>
      <div data-testid='model-monitoring-pane'>
        <Container>
          {DatabricksUtils.getConf('enableModelMonitoringPublicPreview') && (
            <>
              <Alert
                type='info'
                closable={false}
                message={
                  <>
                    <FormattedMessage
                      description='Feedback back link for model monitoring'
                      defaultMessage='Model monitoring is in public preview.'
                    />{' '}
                    {/* eslint-disable-next-line max-len */}
                    <FeedbackLink link='https://databricks.sjc1.qualtrics.com/jfe/form/SV_d0wjZM95QlzrYFg' />
                  </>
                }
              />
              <Spacer size='small' />
            </>
          )}

          {!activeMonitor && (
            <>
              <Alert
                closable={false}
                type='error'
                message={
                  monitorName ? (
                    <FormattedMessage
                      defaultMessage='Cannot find monitor: {name}'
                      description='Alert header text for when monitor with a name cannot be found'
                      values={{ name: monitorName }}
                    />
                  ) : (
                    <FormattedMessage
                      defaultMessage='Cannot find monitor'
                      description='Alert header text for when monitor is not available'
                    />
                  )
                }
                description={
                  <FormattedMessage
                    // eslint-disable-next-line max-len
                    defaultMessage='It may not exist or may have been deleted. Please select a different monitor from the dropdown.'
                    description='Alert description text for when monitor is not available'
                  />
                }
              />
              <Spacer size='small' />
            </>
          )}

          {/* Header */}
          <div css={styles.headerWrapper}>
            <div css={styles.header}>
              <Text bold>
                <FormattedMessage
                  defaultMessage='Monitor'
                  description='Title for model monitoring page'
                />
              </Text>
              <Spacer size='small' />
              <Select
                disabled={monitors.length <= 1}
                value={activeKey}
                onChange={(k) => {
                  setActiveKey(k);
                  DatabricksUtils.logClientSideEvent('modelMonitoringEvent', 'switchMonitor');
                }}
                style={{ width: '100%' }}
                dropdownMatchSelectWidth={false}
              >
                {monitors.map((monitor) => (
                  <Select.Option key={monitor.key}>{monitor.config.monitor_name}</Select.Option>
                ))}
              </Select>
            </div>
            <Button
              type='primary'
              size='medium'
              href={generateTopHashUrl(
                'dashboard_notebook_path',
                activeMonitor?.dashboard_notebook_path,
              )}
              target='_blank'
              icon={<NewWindowIcon />}
              disabled={!activeMonitor?.dashboard_notebook_path}
              data-testid='monitor-dashboard-button'
              onClick={() =>
                DatabricksUtils.logClientSideEvent(
                  'modelMonitoringEvent',
                  'clickMonitoringDashboard',
                )
              }
            >
              <span>
                <FormattedMessage
                  defaultMessage='View dashboard'
                  description='Link text for the generated model monitoring dashboard'
                />
              </span>
            </Button>
          </div>

          {/* Jobs sections */}
          {activeMonitor && (
            <>
              <Spacer size='large' />
              <MonitorDetails activeMonitor={activeMonitor} />
            </>
          )}
        </Container>
      </div>
    </MonitoringErrorBoundary>
  );
}

const styles = {
  headerWrapper: {
    display: 'flex',
    alignItems: 'end',
  },
  header: { marginRight: 16, flexGrow: 1 },
};

MonitoringView.propTypes = {
  monitors: PropTypes.arrayOf(PropTypes.object).isRequired,
};

function MonitoringEmptyState() {
  const { theme } = useDesignSystemTheme();
  return (
    <div
      css={{
        width: '100%',
        backgroundColor: theme.colors.grey100,
        textAlign: 'center',
        padding: 32,
        borderRadius: theme.borders.borderRadiusMd,
      }}
    >
      <Text size='md' withoutMargins>
        <FormattedMessage
          // eslint-disable-next-line max-len
          defaultMessage='Enable model monitoring to track drift and performance metrics on your batch inference workloads. Learn how to create a monitor <link>here</link>.'
          description='Empty state text for the monitor tab'
          values={{
            link: (chunks) => (
              <a
                data-testid='monitoring-docs-link'
                target='_blank'
                rel='noreferrer'
                href={getMonitoringDocsUrl()}
              >
                {chunks}
              </a>
            ),
          }}
        />
      </Text>
    </div>
  );
}

export function MonitoringPane({ monitors = [] }) {
  if (monitors.length === 0) {
    return <MonitoringEmptyState />;
  }

  return <MonitoringView monitors={monitors} />;
}
MonitoringPane.propTypes = {
  monitors: PropTypes.arrayOf(PropTypes.object).isRequired,
};
