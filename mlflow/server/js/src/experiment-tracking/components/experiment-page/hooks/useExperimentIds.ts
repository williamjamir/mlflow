import qs from 'qs';
import { useMemo } from 'react';
import { useLocation, useRouteMatch } from 'react-router';
import Utils from '../../../../common/utils/Utils';

export type UseExperimentIdsResult = string[];

/**
 * Hook that returns requested experiment IDs basing on the URL.
 * It extracts ids basing on either route match (in case of a single experiment)
 * or query params (in case of comparing experiments.).
 *
 * @returns array of strings with experiment IDs
 */

export const useExperimentIds = (): UseExperimentIdsResult => {
  const match = useRouteMatch<{ experimentId?: string }>();
  const location = useLocation();

  const normalizedLocationSearch = useMemo(
    () => decodeURIComponent(location.search),
    [location.search],
  );

  return useMemo(() => {
    // Case #1: single experiment
    if (match.params?.experimentId) {
      return [match.params?.experimentId];
    }

    // Case #2: multiple (compare) experiments
    try {
      const queryParams = qs.parse(normalizedLocationSearch.substring(1));
      if (queryParams['experiments']) {
        const experimentIdsRaw = queryParams['experiments'];
        return JSON.parse(experimentIdsRaw as string);
      }
    } catch {
      // Apparently URL is malformed
      Utils.logErrorAndNotifyUser(
        `Could not parse experiment query parameter ${normalizedLocationSearch}`,
      );
    }

    return [];
  }, [normalizedLocationSearch, match.params?.experimentId]);
};
