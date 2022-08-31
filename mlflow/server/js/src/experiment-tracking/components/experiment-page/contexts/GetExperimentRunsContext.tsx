import { isEqual } from 'lodash';
import React, { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import RequestStateWrapper from '../../../../common/components/RequestStateWrapper';
import { loadMoreRunsApi, searchRunsApi, searchRunsPayload } from '../../../actions';
import { useExperimentIds } from '../hooks/useExperimentIds';
import { SearchExperimentRunsFacetsState } from '../models/SearchExperimentRunsFacetsState';
// BEGIN-EDGE
// eslint-disable-next-line import/extensions
import { LoadingDescription } from '../../../../__generated__/web-shared-bundle/metrics';
// END-EDGE
import { useAsyncDispatch } from '../hooks/useAsyncDispatch';
import Utils from '../../../../common/utils/Utils';
import { UpdateExperimentSearchFacetsFn } from '../../../types';
import { createSearchRunsParams, shouldRefetchRuns } from '../utils/fetchRuns.utils';

export interface GetExperimentRunsContextActions {
  searchRunsApi: typeof searchRunsApi;
  loadMoreRunsApi: typeof loadMoreRunsApi;
  searchRunsPayload: typeof searchRunsPayload;
}

export interface GetExperimentRunsContextType {
  /**
   * Represents the currently used filter/sort model
   */
  searchFacetsState: SearchExperimentRunsFacetsState;

  /**
   * Indicates if runs are being loaded at the moment
   */
  isLoadingRuns: boolean;

  /**
   * Function used to (re)fetch runs with the currently used filter set.
   * Use scenarios: initial fetch, refreshing the list.
   */
  fetchExperimentRuns: () => void;

  /**
   * Function used to update the filter set and fetch new set of runs.
   * First parameter is the subset of fields that the current sort/filter model will be merged with.
   * If the second parameter is set to true, it will force re-fetching even if there
   * are no sufficient changes to the model.
   */
  updateSearchFacets: UpdateExperimentSearchFacetsFn;

  /**
   * Function used to load more runs (if available) using currently used filters
   */
  loadMoreRuns: () => void;

  /**
   * Contains error descriptor if fetching runs failed
   */
  requestError: any;

  /**
   * All run-related actions creators
   */
  actions: GetExperimentRunsContextActions;
}

/**
 * Wrapper context that serves two purposes:
 * - aggregates concrete redux actions necessary to perform experiments run search
 * - holds currently used state with sort and filter options, also is responsible for persisting it
 */
export const GetExperimentRunsContext = createContext<GetExperimentRunsContextType | null>(null);

/**
 * Provider component for SearchExperimentRunsContext.
 * Accepts concrete redux actions for searching runs.
 */
export const GetExperimentRunsContextProvider = ({
  children,
  actions,
}: React.PropsWithChildren<{
  actions: GetExperimentRunsContextActions;
}>) => {
  const experimentIds = useExperimentIds();
  const dispatch = useAsyncDispatch();

  const [searchRunsRequestId, setSearchRunsRequestId] = useState<string>('');
  const [isLoadingRuns, setIsLoadingRuns] = useState(false);
  const [requestError, setRequestError] = useState<any>(null);

  const [searchFacetsState, setSearchFacetsState] = useState<SearchExperimentRunsFacetsState>(
    SearchExperimentRunsFacetsState.restore(),
  );

  // Next page token is not a stateful field and can be mutable.
  const nextPageToken = useRef<string>('');

  // Indicates reference time for fetching subsuquent pages which
  // requires us to keep the same startTime parameter value.
  // Not a stateful field.
  const referenceTime = useRef<string>('');

  const internalFetchExperimentRuns = useCallback(
    (
      requestSearchFacetsState: SearchExperimentRunsFacetsState,
      requestExperimentIds: string[],
      requestReferenceTime = Date.now(),
      requestNextPageToken?: string,
    ) => {
      const loadMore = Boolean(requestNextPageToken);
      if (!loadMore) {
        referenceTime.current = requestReferenceTime;
      }

      const actionToUse = loadMore ? actions.loadMoreRunsApi : actions.searchRunsApi;

      const action = actionToUse(
        createSearchRunsParams(
          requestExperimentIds,
          requestSearchFacetsState,
          requestReferenceTime,
          requestNextPageToken || undefined,
        ),
      );

      dispatch(action)
        .then(({ value }) => {
          nextPageToken.current = value.next_page_token;
        })
        .catch((e) => {
          // BEGIN-EDGE
          /**
           * TODO (decision):
           * If there is no experiment loaded yet, we probably shouldn't
           * display an error here. Root cause of this inconsistency
           * is that experiments endpoint doesn't respond with 404 when
           * no experiment can be found, but runs endpoint does.
           */
          // END-EDGE
          Utils.logErrorAndNotifyUser(e);
        });

      setSearchRunsRequestId(action.meta.id);
    },
    [dispatch, actions],
  );

  const loadMoreRuns = useCallback(() => {
    internalFetchExperimentRuns(
      searchFacetsState,
      experimentIds,
      referenceTime.current || undefined,
      nextPageToken.current || undefined,
    );
  }, [internalFetchExperimentRuns, searchFacetsState, experimentIds]);

  /**
   * Fetches fresh batch of runs using current sort model
   */
  const fetchExperimentRuns = useCallback(() => {
    internalFetchExperimentRuns(searchFacetsState, experimentIds);
  }, [experimentIds, internalFetchExperimentRuns, searchFacetsState]);

  /**
   * Fetches fresh batch of runs using current sort model
   */
  const updateSearchFacets = useCallback(
    (newFilterModel: Partial<SearchExperimentRunsFacetsState>, refresh = false) => {
      // While dispatching new state, append new filter model
      // and fetch new runs using it
      setSearchFacetsState((oldModel) => {
        const newModel = { ...oldModel, ...newFilterModel };
        if (refresh || shouldRefetchRuns(oldModel, newModel)) {
          internalFetchExperimentRuns(newModel, experimentIds);
        }
        return newModel;
      });
    },
    [experimentIds, internalFetchExperimentRuns],
  );

  const contextValue = useMemo(
    () => ({
      actions,
      searchFacetsState,
      fetchExperimentRuns,
      updateSearchFacets,
      loadMoreRuns,
      requestError,
      isLoadingRuns,
    }),
    [
      actions,
      searchFacetsState,
      fetchExperimentRuns,
      loadMoreRuns,
      requestError,
      isLoadingRuns,
      updateSearchFacets,
    ],
  );

  const renderFn = (_isLoading: false, _renderError: any, requests: any[]) => {
    /**
     * TODO:
     * Defer setting this state because currently it might happen inside
     * RequestStateWrapper's render function which causes React to act up.
     * Either rebuild RequestStateWrapper or introduce some workaround.
     */
    setIsLoadingRuns(requests.some((r) => r.id === searchRunsRequestId && r.active));

    requests.forEach((request) => {
      if (request.error) {
        setRequestError(request.error);
      }
    });
    return children;
  };

  /**
   * We're peristing the sort+filter (persisted state) model each time it's being changed
   *
   * TODO: create tests
   */
  useEffect(() => {
    SearchExperimentRunsFacetsState.persist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchFacetsState]);

  /**
   * Restore the persisted state each time our key (experiment ids) gets changed
   *
   * TODO: create tests
   */
  useEffect(() => {
    const restoredModel = SearchExperimentRunsFacetsState.restore();
    setSearchFacetsState((existingModel) =>
      isEqual(restoredModel, existingModel) ? existingModel : restoredModel,
    );
  }, [experimentIds]);

  return (
    <GetExperimentRunsContext.Provider value={contextValue}>
      <RequestStateWrapper
        shouldOptimisticallyRender
        // eslint-disable-next-line no-trailing-spaces
        // BEGIN-EDGE
        description={LoadingDescription.MLFLOW_EXPERIMENT_PAGE_EXPERIMENT_RUNS}
        // END-EDGE
        requestIds={searchRunsRequestId ? [searchRunsRequestId] : []}
      >
        {renderFn}
      </RequestStateWrapper>
    </GetExperimentRunsContext.Provider>
  );
};
