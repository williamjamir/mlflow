import { isEqual } from 'lodash';
import React, { createContext, useCallback, useMemo, useState } from 'react';
import RequestStateWrapper from '../../../../common/components/RequestStateWrapper';
import { ErrorCodes } from '../../../../common/constants';
import { ErrorWrapper } from '../../../../common/utils/ErrorWrapper';
import Utils from '../../../../common/utils/Utils';
// BEGIN-EDGE
// eslint-disable-next-line import/extensions
import { LoadingDescription } from '../../../../__generated__/web-shared-bundle/metrics';
// END-EDGE

import type {
  batchGetExperimentsApi,
  getExperimentApi,
  setCompareExperiments,
  setExperimentTagApi,
} from '../../../actions';
import { useAsyncDispatch } from '../hooks/useAsyncDispatch';

export interface GetExperimentsContextActions {
  setExperimentTagApi: typeof setExperimentTagApi;
  getExperimentApi: typeof getExperimentApi;
  setCompareExperiments: typeof setCompareExperiments;
  batchGetExperimentsApi: typeof batchGetExperimentsApi;
}

export interface GetExperimentsContextType {
  /**
   * Function used to (re)fetch experiments using their IDs.
   */
  fetchExperiments: (experimentIds: string[]) => void;

  /**
   * Indicates if experiments are being loaded at the moment
   */
  isLoadingExperiment: boolean;

  /**
   * Contains error descriptor if fetching runs failed
   */
  requestError: any;

  /**
   * All experiment-related actions creators
   */
  actions: GetExperimentsContextActions;
}

/**
 * Wrapper context that aggregates concrete redux actions necessary to fetch experiments.
 */
export const GetExperimentsContext = createContext<GetExperimentsContextType | null>(null);

/**
 * Provider component for GetExperimentsContext.
 * Accepts concrete redux actions for searching experiments.
 */
export const GetExperimentsContextProvider = ({
  children,
  actions,
}: React.PropsWithChildren<{
  actions: GetExperimentsContextActions;
}>) => {
  const [fetchExperimentsRequestIds, setFetchExperimentsRequestIds] = useState<string[]>([]);
  const [isLoadingExperiment, setIsLoadingExperiment] = useState(false);

  const [requestError, setRequestError] = useState<any>(null);

  const dispatch = useAsyncDispatch();

  const fetchExperiments = useCallback(
    (experimentIds: string[]) => {
      // BEGIN-EDGE
      const fetchFn = () => {
        const requestAction = actions.batchGetExperimentsApi(experimentIds);
        dispatch(requestAction).catch((e) => {
          Utils.logErrorAndNotifyUser(e);
        });
        const newRequestIds = [requestAction.meta.id];

        setFetchExperimentsRequestIds((requestIds) =>
          isEqual(newRequestIds, requestIds) ? requestIds : newRequestIds,
        );
        return requestAction.meta.id;
      };
      const oss_fetchFn = () => {
        const newRequestIds = experimentIds.map((experimentId) => {
          const requestAction = actions.getExperimentApi(experimentId);
          dispatch(requestAction).catch((e) => {
            Utils.logErrorAndNotifyUser(e);
          });
          return requestAction.meta.id;
        });
        setFetchExperimentsRequestIds((requestIds) =>
          isEqual(newRequestIds, requestIds) ? requestIds : newRequestIds,
        );
      };

      setRequestError(null);
      fetchFn();
    },
    [actions, dispatch],
  );

  const contextValue = useMemo(
    () => ({
      fetchExperiments,
      isLoadingExperiment,
      requestError: requestError,
      actions,
    }),
    [actions, fetchExperiments, isLoadingExperiment, requestError],
  );

  const renderFn = (_isLoading: false, _renderError: any, requests: any[]) => {
    /**
     * TODO:
     * Defer setting this state because currently it might happen inside
     * RequestStateWrapper's render function which causes React to act up.
     * Either rebuild RequestStateWrapper or introduce some workaround.
     */
    setIsLoadingExperiment(
      requests.some((r) => fetchExperimentsRequestIds.includes(r.id) && r.active),
    );

    if (!requestError) {
      requests.forEach((request) => {
        if (request.error) {
          setRequestError(request.error);
        }
        // BEGIN-EDGE
        if (request.data && !request.data.experiments_databricks) {
          /*
           * We don't get error from API if there are
           * no experiments so we need to induce one
           */
          setRequestError(
            new ErrorWrapper({ error_code: ErrorCodes.RESOURCE_DOES_NOT_EXIST }, 404),
          );
        }
        // END-EDGE
      });
    }

    return children;
  };

  return (
    <GetExperimentsContext.Provider value={contextValue}>
      <RequestStateWrapper
        shouldOptimisticallyRender
        // eslint-disable-next-line no-trailing-spaces
        // BEGIN-EDGE
        description={LoadingDescription.MLFLOW_EXPERIMENT_DETAILS_PAGE}
        // END-EDGE
        requestIds={fetchExperimentsRequestIds}
      >
        {renderFn}
      </RequestStateWrapper>
    </GetExperimentsContext.Provider>
  );
};
