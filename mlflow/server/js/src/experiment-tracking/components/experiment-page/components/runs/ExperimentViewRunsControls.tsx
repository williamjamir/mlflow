import React, { useCallback, useMemo } from 'react';
import Utils from '../../../../../common/utils/Utils';
import { UpdateExperimentSearchFacetsFn, UpdateExperimentViewStateFn } from '../../../../types';
import { useRunSortOptions } from '../../hooks/useRunSortOptions';
import { SearchExperimentRunsFacetsState } from '../../models/SearchExperimentRunsFacetsState';
import { SearchExperimentRunsViewState } from '../../models/SearchExperimentRunsViewState';
import {
  getFilteredMetrics,
  getFilteredParams,
  getFilteredTags,
} from '../../utils/experiment-page.utils';
import { ExperimentRunsSelectorResult } from '../../utils/experimentRuns.selector';
import { downloadRunsCsv } from './ExperimentViewRuns.utils';
import { ExperimentViewRunsControlsActions } from './ExperimentViewRunsControlsActions';
import { ExperimentViewRunsControlsFilters } from './ExperimentViewRunsControlsFilters';

type ExperimentViewRunsControlsProps = {
  viewState: SearchExperimentRunsViewState;
  updateViewState: UpdateExperimentViewStateFn;

  searchFacetsState: SearchExperimentRunsFacetsState;
  updateSearchFacets: UpdateExperimentSearchFacetsFn;

  runsData: ExperimentRunsSelectorResult;
};

/**
 * This component houses all controls related to searching runs: sort controls,
 * filters and run related actions (delete, restore, download CSV).
 */
export const ExperimentViewRunsControls = React.memo(
  ({
    runsData,
    viewState,
    updateSearchFacets,
    searchFacetsState,
  }: ExperimentViewRunsControlsProps) => {
    const { categorizedUncheckedKeys } = searchFacetsState;
    const { paramKeyList, metricKeyList, tagsList } = runsData;

    const filteredParamKeys = useMemo(
      () => getFilteredParams(paramKeyList, searchFacetsState),
      [paramKeyList, searchFacetsState],
    );
    const filteredMetricKeys = useMemo(
      () => getFilteredMetrics(metricKeyList, searchFacetsState),
      [metricKeyList, searchFacetsState],
    );
    const filteredTagKeys = useMemo(
      () => getFilteredTags(Utils.getVisibleTagKeyList(tagsList), searchFacetsState),
      [tagsList, searchFacetsState],
    );

    const onDownloadCsv = useCallback(
      () => downloadRunsCsv(runsData, filteredTagKeys, filteredParamKeys, filteredMetricKeys),
      [filteredMetricKeys, filteredParamKeys, filteredTagKeys, runsData],
    );

    const sortOptions = useRunSortOptions(
      categorizedUncheckedKeys,
      filteredMetricKeys,
      filteredParamKeys,
    );

    return (
      <div css={styles.wrapper}>
        <ExperimentViewRunsControlsActions
          onDownloadCsv={onDownloadCsv}
          runsData={runsData}
          updateSearchFacets={updateSearchFacets}
          searchFacetsState={searchFacetsState}
          sortOptions={sortOptions}
          viewState={viewState}
        />
        <ExperimentViewRunsControlsFilters
          updateSearchFacets={updateSearchFacets}
          searchFacetsState={searchFacetsState}
          runsData={runsData}
        />
      </div>
    );
  },
);

const styles = {
  wrapper: { display: 'flex', gap: 8, flexDirection: 'column' as const },
};
