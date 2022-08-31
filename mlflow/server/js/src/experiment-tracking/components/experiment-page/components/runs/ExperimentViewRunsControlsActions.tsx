import {
  ArrowDownIcon,
  ArrowUpIcon,
  Button,
  Option,
  Select,
  Tooltip,
} from '@databricks/design-system';
import React, { useCallback, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';
import { middleTruncateStr } from '../../../../../common/utils/StringUtils';
import {
  COLUMN_SORT_BY_ASC,
  COLUMN_SORT_BY_DESC,
  LIFECYCLE_FILTER,
  SORT_DELIMITER_SYMBOL,
} from '../../../../constants';
import Routes from '../../../../routes';
import { UpdateExperimentSearchFacetsFn } from '../../../../types';
import { ExperimentRunSortOption } from '../../hooks/useRunSortOptions';
import { SearchExperimentRunsFacetsState } from '../../models/SearchExperimentRunsFacetsState';
import { SearchExperimentRunsViewState } from '../../models/SearchExperimentRunsViewState';
import { ExperimentRunsSelectorResult } from '../../utils/experimentRuns.selector';
import { ExperimentViewRefreshButton } from './ExperimentViewRefreshButton';
import { ExperimentViewRunModals } from './ExperimentViewRunModals';
import { getStartTimeColumnDisplayName } from './ExperimentViewRuns.utils';

export type ExperimentViewRunsControlsActionsProps = {
  viewState: SearchExperimentRunsViewState;

  searchFacetsState: SearchExperimentRunsFacetsState;
  updateSearchFacets: UpdateExperimentSearchFacetsFn;
  runsData: ExperimentRunsSelectorResult;

  onDownloadCsv: () => void;
  sortOptions: ExperimentRunSortOption[];
};

export const ExperimentViewRunsControlsActions = React.memo(
  ({
    viewState,
    runsData,
    searchFacetsState,
    updateSearchFacets,
    onDownloadCsv,
    sortOptions,
  }: ExperimentViewRunsControlsActionsProps) => {
    const { runsSelected } = viewState;
    const { runInfos } = runsData;
    const { lifecycleFilter, orderByKey, orderByAsc, startTime } = searchFacetsState;

    const history = useHistory();
    const intl = useIntl();

    const [showDeleteRunModal, setShowDeleteRunModal] = useState(false);
    const [showRestoreRunModal, setShowRestoreRunModal] = useState(false);

    const startTimeColumnLabels = useMemo(() => getStartTimeColumnDisplayName(intl), [intl]);

    const compareButtonClicked = useCallback(() => {
      const runsSelectedList = Object.keys(runsSelected);
      const experimentIds = runInfos
        .filter(({ run_uuid }: any) => runsSelectedList.includes(run_uuid))
        .map(({ experiment_id }: any) => experiment_id);
      history.push(
        Routes.getCompareRunPageRoute(runsSelectedList, [...new Set(experimentIds)].sort()),
      );
    }, [history, runInfos, runsSelected]);

    const sortKeyChanged = useCallback(
      (compiledOrderByKey) => {
        const [newOrderBy, newOrderAscending] = compiledOrderByKey.split(SORT_DELIMITER_SYMBOL);
        const isOrderAscending = newOrderAscending === COLUMN_SORT_BY_ASC;
        updateSearchFacets({ orderByKey: newOrderBy, orderByAsc: isOrderAscending });
      },
      [updateSearchFacets],
    );

    const onDeleteRun = useCallback(() => setShowDeleteRunModal(true), []);
    const onRestoreRun = useCallback(() => setShowRestoreRunModal(true), []);
    const onCloseDeleteRunModal = useCallback(() => setShowDeleteRunModal(false), []);
    const onCloseRestoreRunModal = useCallback(() => setShowRestoreRunModal(false), []);

    const selectedRunsCount = Object.values(viewState.runsSelected).filter(Boolean).length;
    const canRestoreRuns = selectedRunsCount > 0;
    const canCompareRuns = selectedRunsCount > 1;

    return (
      <div css={styles.controlBar}>
        <ExperimentViewRunModals
          runsSelected={runsSelected}
          onCloseDeleteRunModal={onCloseDeleteRunModal}
          onCloseRestoreRunModal={onCloseRestoreRunModal}
          showDeleteRunModal={showDeleteRunModal}
          showRestoreRunModal={showRestoreRunModal}
        />
        <ExperimentViewRefreshButton count={0} onClick={() => updateSearchFacets({}, true)} />
        <Button
          data-testid='runs-compare-button'
          disabled={!canCompareRuns}
          onClick={compareButtonClicked}
        >
          <FormattedMessage
            defaultMessage='Compare'
            // eslint-disable-next-line max-len
            description='String for the compare button to compare experiment runs to find an ideal model'
          />
        </Button>
        {lifecycleFilter === LIFECYCLE_FILTER.ACTIVE ? (
          <Button data-testid='runs-delete-button' disabled={!canRestoreRuns} onClick={onDeleteRun}>
            <FormattedMessage
              defaultMessage='Delete'
              // eslint-disable-next-line max-len
              description='String for the delete button to delete a particular experiment run'
            />
          </Button>
        ) : null}
        {lifecycleFilter === LIFECYCLE_FILTER.DELETED ? (
          <Button
            data-testid='runs-restore-button'
            disabled={!canRestoreRuns}
            onClick={onRestoreRun}
          >
            <FormattedMessage
              defaultMessage='Restore'
              // eslint-disable-next-line max-len
              description='String for the restore button to undo the experiments that were deleted'
            />
          </Button>
        ) : null}
        <Button className='csv-button' onClick={onDownloadCsv}>
          <FormattedMessage
            defaultMessage='Download CSV'
            // eslint-disable-next-line max-len
            description='String for the download csv button to download experiments offline in a CSV format'
          />
          <i css={(theme) => ({ marginLeft: theme.spacing.xs })} className='fas fa-download' />
        </Button>
        <Tooltip
          title={intl.formatMessage({
            defaultMessage: 'Sort by',
            description: 'Sort label for the sort select dropdown for experiment runs view',
          })}
        >
          <Select
            className='sort-select'
            value={
              orderByKey
                ? `${orderByKey}${SORT_DELIMITER_SYMBOL}${
                    orderByAsc ? COLUMN_SORT_BY_ASC : COLUMN_SORT_BY_DESC
                  }`
                : intl.formatMessage({
                    defaultMessage: 'Sort by',
                    description:
                      // eslint-disable-next-line max-len
                      'Sort by default option for sort by select dropdown for experiment runs',
                  })
            }
            // Temporarily we're disabling virtualized list to maintain
            // backwards compatiblity. Functional unit tests rely heavily
            // on non-virtualized values.
            dangerouslySetAntdProps={{ virtual: false } as any}
            onChange={sortKeyChanged}
            data-test-id='sort-select-dropdown'
          >
            {sortOptions.map((sortOption) => (
              <Option
                key={sortOption.value}
                title={sortOption.label}
                data-test-id={`sort-select-${sortOption.label}-${sortOption.order}`}
                value={sortOption.value}
              >
                {sortOption.order === COLUMN_SORT_BY_ASC ? <ArrowUpIcon /> : <ArrowDownIcon />}{' '}
                {middleTruncateStr(sortOption.label, 50)}
              </Option>
            ))}
          </Select>
        </Tooltip>
        <Tooltip
          title={intl.formatMessage({
            defaultMessage: 'Started during',
            description: 'Label for the start time select dropdown for experiment runs view',
          })}
        >
          <Select
            className='start-time-select'
            value={startTime}
            onChange={(newStartTime) => {
              updateSearchFacets({ startTime: newStartTime });
            }}
            data-test-id='start-time-select-dropdown'
            // Temporarily we're disabling virtualized list to maintain
            // backwards compatiblity. Functional unit tests rely heavily
            // on non-virtualized values.
            dangerouslySetAntdProps={{ virtual: false } as any}
          >
            {Object.keys(startTimeColumnLabels).map((startTimeKey) => (
              <Option
                key={startTimeKey}
                title={startTimeColumnLabels[startTimeKey as keyof typeof startTimeColumnLabels]}
                data-test-id={`start-time-select-${startTimeKey}`}
                value={startTimeKey}
              >
                {startTimeColumnLabels[startTimeKey as keyof typeof startTimeColumnLabels]}
              </Option>
            ))}
          </Select>
        </Tooltip>
      </div>
    );
  },
);

const styles = {
  controlBar: { display: 'flex', gap: 8, alignItems: 'center' },
};
