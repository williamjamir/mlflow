import { Skeleton } from '@databricks/design-system';
import React, { useCallback, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { ExperimentEntity, UpdateExperimentViewStateFn } from '../../../../types';
import {
  experimentRunsSelector,
  ExperimentRunsSelectorResult,
} from '../../utils/experimentRuns.selector';
import { ExperimentViewRunsControls } from './ExperimentViewRunsControls';
import { ExperimentViewRunsTable } from './ExperimentViewRunsTable';

import { loadMoreRunsApi, searchRunsApi, searchRunsPayload } from '../../../../actions';
import { GetExperimentRunsContextProvider } from '../../contexts/GetExperimentRunsContext';
import { useFetchExperimentRuns } from '../../hooks/useFetchExperimentRuns';
import { SearchExperimentRunsViewState } from '../../models/SearchExperimentRunsViewState';

export interface ExperimentViewRunsOwnProps {
  experiments: ExperimentEntity[];
}

export type ExperimentViewRunsProps = ExperimentViewRunsOwnProps & ExperimentRunsSelectorResult;

export const ExperimentViewRunsImpl = React.memo((props: ExperimentViewRunsProps) => {
  const { experiments, ...runsData } = props;

  // Persistable sort/filter model state is taken from the context
  const { searchFacetsState, updateSearchFacets, fetchExperimentRuns, isLoadingRuns } =
    useFetchExperimentRuns();

  // Non-persistable view model state is being created locally
  const [viewState, setViewState] = useState(new SearchExperimentRunsViewState());

  // Initial fetch of runs after mounting
  useEffect(() => {
    fetchExperimentRuns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [experiments]);

  const updateViewState = useCallback<UpdateExperimentViewStateFn>(
    (newPartialViewState) =>
      setViewState((currentViewState) => ({ ...currentViewState, ...newPartialViewState })),
    [],
  );

  return (
    <>
      <div css={{ margin: 5, padding: 20, backgroundColor: 'rgba(0,0,0,0.1)' }}>
        {/* TODO: remove this debug info after table is implemented */}
        Debug: {runsData.runInfos.length} runs available
      </div>
      <ExperimentViewRunsControls
        viewState={viewState}
        updateViewState={updateViewState}
        runsData={runsData}
        searchFacetsState={searchFacetsState}
        updateSearchFacets={updateSearchFacets}
      />
      {isLoadingRuns ? <Skeleton active /> : <ExperimentViewRunsTable />}
    </>
  );
});

/**
 * Concrete actions for GetExperimentRuns context provider
 */
const getExperimentRunsActions = {
  searchRunsApi,
  loadMoreRunsApi,
  searchRunsPayload,
};

/**
 * This component serves as a layer for creating context for searching runs
 * and provides implementations of necessary redux actions.
 */
export const ExperimentViewRunsContextInjector = (props: ExperimentViewRunsProps) => (
  <GetExperimentRunsContextProvider actions={getExperimentRunsActions}>
    <ExperimentViewRunsImpl {...props} />
  </GetExperimentRunsContextProvider>
);

/**
 * Component responsible for displaying runs table with its set of
 * respective sort and filter controls on the experiment page.
 */
export const ExperimentViewRuns: React.ComponentType<ExperimentViewRunsOwnProps> = connect(
  experimentRunsSelector,
)(ExperimentViewRunsContextInjector);
