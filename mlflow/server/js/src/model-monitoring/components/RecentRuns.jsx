import React from 'react';
import { PropTypes } from 'prop-types';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import {
  Row,
  Col,
  Typography,
  useDesignSystemTheme,
  CheckCircleBorderIcon,
  ClockIcon,
  MinusCircleBorderIcon,
  SyncIcon,
  XCircleBorderIcon,
} from '@databricks/design-system';

import Utils from '../../common/utils/Utils';
// @TODO probably want to elevate these states at some point
import { RunLifeCycleState, RunResultState, RunRunningStates } from '../../feature-store/constants';

const { Text, Paragraph } = Typography;

const dateFormat = 'mmm d yyyy, h:MM TT Z';
const IN_PROGRESS = 'IN_PROGRESS';

export const jobRunStatusMessages = defineMessages({
  [RunResultState.SUCCESS]: {
    defaultMessage: 'Succeeded',
    description: 'Job status for most recent run: succeeded',
  },
  [RunResultState.FAILED]: {
    defaultMessage: 'Failed',
    description: 'Job status for most recent run: failed',
  },
  [RunResultState.TIMEDOUT]: {
    defaultMessage: 'Timed out',
    description: 'Job status for most recent run: timed out',
  },
  [RunResultState.CANCELED]: {
    defaultMessage: 'Canceled',
    description: 'Job status for most recent run: cancelled',
  },
  [IN_PROGRESS]: {
    defaultMessage: 'In progress',
    description: 'Job status for most recent run: still in progress',
  },
});

const jobRunStatusGraphics = {
  [RunResultState.SUCCESS]: {
    icon: <CheckCircleBorderIcon />,
    color: 'success',
  },
  [RunResultState.FAILED]: {
    icon: <XCircleBorderIcon />,
    color: 'danger',
  },
  [RunResultState.TIMEDOUT]: {
    icon: <ClockIcon />,
    color: 'danger',
  },
  [RunResultState.CANCELED]: {
    icon: <MinusCircleBorderIcon />,
    color: 'info',
  },
  [IN_PROGRESS]: {
    icon: <SyncIcon />,
    color: 'info',
  },
};

function getRunState(runDetails) {
  const runState = runDetails?.state;

  if (!runState) {
    return RunResultState.FAILED;
  }

  const lifecycleState = runState.life_cycle_state;
  if (RunRunningStates.includes(lifecycleState)) {
    return IN_PROGRESS;
  }

  const resultState = runState.result_state;
  return Object.values(RunResultState).includes(resultState) ? resultState : RunResultState.FAILED;
}

const RunProps = PropTypes.shape({
  start_time: PropTypes.number.isRequired,
  end_time: PropTypes.number,
  state: PropTypes.shape({
    life_cycle_state: PropTypes.oneOf(Object.values(RunLifeCycleState)).isRequired,
    result_state: PropTypes.oneOf(Object.values(RunResultState)),
  }),
});

export function FormattedRunDetails({ runDetails, testIdPrefix }) {
  const intl = useIntl();

  if (!runDetails) {
    return (
      <FormattedMessage
        defaultMessage='None'
        description='Empty state text for when job history does not have any successful runs'
      />
    );
  }

  const runStateKey = getRunState(runDetails);
  // Note: the assumption here is that end_time will not exist for jobs that are currently running,
  // in which case we will use start_time instead.
  const timestamp = RunRunningStates.includes(runDetails.state?.life_cycle_state)
    ? runDetails.start_time
    : runDetails.end_time;

  return (
    <div>
      <Text
        color={jobRunStatusGraphics[runStateKey]['color']}
        data-testid={testIdPrefix && `${testIdPrefix}-run-state`}
      >
        {jobRunStatusGraphics[runStateKey]['icon']}{' '}
        {intl.formatMessage(jobRunStatusMessages[runStateKey])}
      </Text>{' '}
      <Text color='secondary' data-testid={testIdPrefix && `${testIdPrefix}-timestamp`}>
        {Utils.formatTimestamp(timestamp, dateFormat)}
      </Text>
    </div>
  );
}
FormattedRunDetails.propTypes = {
  runDetails: RunProps,
  testIdPrefix: PropTypes.string,
};

export function RecentRuns({ lastRun, lastSuccessfulRun }) {
  return (
    <Row>
      <Col span={12}>
        <Paragraph color='secondary' withoutMargins>
          <FormattedMessage
            defaultMessage='Most recent run:'
            description='Title for the most recent run of the job in the monitoring pane'
          />
        </Paragraph>
        <FormattedRunDetails runDetails={lastRun} testIdPrefix='most-recent' />
      </Col>
      {lastRun && lastRun !== lastSuccessfulRun && (
        <Col span={12} data-testid='last-successful-run-section'>
          <Paragraph color='secondary' withoutMargins>
            <FormattedMessage
              defaultMessage='Last successful run:'
              description='Title for the last successful run of the job in the monitoring pane'
            />
          </Paragraph>
          <FormattedRunDetails runDetails={lastSuccessfulRun} testIdPrefix='last-successful' />
        </Col>
      )}
    </Row>
  );
}
RecentRuns.propTypes = {
  lastRun: RunProps,
  lastSuccessfulRun: RunProps,
};
