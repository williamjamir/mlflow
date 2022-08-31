import { CheckCircleBorderIcon, Clock1Icon, XCircleBorderIcon } from '@databricks/design-system';
import React from 'react';
import { Link } from 'react-router-dom';
import Utils from '../../../../../../common/utils/Utils';
import Routes from '../../../../../routes';
import { RunRowDateAndNestInfo } from '../ExperimentViewRuns.types';

const ErrorIcon = () => (
  <XCircleBorderIcon css={(theme) => ({ color: theme.colors.textValidationDanger })} />
);

const FinishedIcon = () => (
  <CheckCircleBorderIcon css={(theme) => ({ color: theme.colors.textValidationSuccess })} />
);

const getRunStatusIcon = (status: string) => {
  switch (status) {
    case 'FAILED':
    case 'KILLED':
      return <ErrorIcon />;
    case 'FINISHED':
      return <FinishedIcon />;
    case 'SCHEDULED':
      return <Clock1Icon />; // This one is the same color as the link
    default:
      return <i />;
  }
};

export interface DateCellRendererProps {
  value: RunRowDateAndNestInfo;
  onExpand: (runUuid: string, childrenIds?: string[]) => void;
}

const INDENT_PER_LEVEL = 18; // Pixels
const BASIC_INDENT = 12; // Pixels

export const DateCellRenderer = React.memo(
  ({
    value: {
      startTime,
      referenceTime,
      experimentId,
      runUuid,
      runStatus,
      isParent,
      hasExpander,
      expanderOpen,
      childrenIds,
      level,
    },
    onExpand,
  }: DateCellRendererProps) => (
    <div>
      {hasExpander ? (
        // eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events
        <div
          onClick={() => {
            onExpand(runUuid, childrenIds);
          }}
          key={'Expander-' + runUuid}
          css={(theme) => ({ paddingRight: theme.spacing.sm, display: 'inline' })}
        >
          <span style={{ paddingLeft: INDENT_PER_LEVEL * level }} />
          <i
            className={`ExperimentView-expander far fa-${expanderOpen ? 'minus' : 'plus'}-square`}
            css={{ width: BASIC_INDENT }}
          />
        </div>
      ) : (
        <span
          style={{
            paddingLeft: INDENT_PER_LEVEL * level + BASIC_INDENT,
          }}
        />
      )}
      <Link
        to={Routes.getRunPageRoute(experimentId, runUuid)}
        style={{ paddingLeft: isParent ? 0 : 8 }}
        title={Utils.formatTimestamp(startTime)}
      >
        {getRunStatusIcon(runStatus)} {Utils.timeSinceStr(startTime, referenceTime)}
      </Link>
    </div>
  ),
);
