import React from 'react';
import { Button, SyncIcon } from '@databricks/design-system';
// TODO: de-antd-ify Badge as soon as it appears in the design system
import { Badge } from 'antd';
import { FormattedMessage } from 'react-intl';
import { MAX_DETECT_NEW_RUNS_RESULTS } from '../../../../constants';

export interface ExperimentViewRefreshButtonProps {
  count: number;
  onClick: () => void;
}

/**
 * A component that displays "refresh runs" with the relevant number
 * of the new runs.
 */
export const ExperimentViewRefreshButton = ({
  onClick,
  count,
}: React.PropsWithChildren<ExperimentViewRefreshButtonProps>) => (
  <Badge
    count={count}
    offset={[-5, 5]}
    css={(theme) => ({ sup: { backgroundColor: theme.colors.lime, zIndex: 1 } })}
    overflowCount={MAX_DETECT_NEW_RUNS_RESULTS - 1}
  >
    <Button onClick={onClick} data-testid='runs-refresh-button' icon={<SyncIcon />}>
      <FormattedMessage
        defaultMessage='Refresh'
        description='refresh button text to refresh the experiment runs'
      />
    </Button>
  </Badge>
);
