import { useCallback, useEffect, useState } from 'react';
import { Services } from '../../../services';
import Utils from '../../../../common/utils/Utils';

// Code for stubbing profile services
function stubProfileList(profiles) {
  const firstProfile = profiles[0];
  const date = Date.now();
  const stubbedData = [1, 2, 3, 4, 5].map((i) => ({
    ...firstProfile,
    profile_id: (firstProfile.profile_id + i).slice(1), // id needs to be 32 chars
    window_granularity: '1 day',
    window_start_timestamp: date - 60 * 60 * 24 * 1000 * i,
  }));
  return [...profiles, ...stubbedData];
}
// End-stubbing-code

export function useDataProfilesBy(featureTable) {
  const [activeProfileIds, setActiveProfileIds] = useState([]);
  // List of profile ids populated from the profiles/list endpoint. Contains id and windows
  const [profileList, setProfileList] = useState([]);
  // Map of all fetched profiles from the profile/get endpoint; contains actual data used to
  // populate data profile components
  const [profileMap, setProfileMap] = useState({});
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const handleLoadNewProfile = useCallback(
    async (id) => {
      const { profile } = await Services.getMockProfile({
        feature_table: featureTable.name,
        profile_id: id,
      });
      await setProfileMap((prev) => ({ ...prev, [id]: profile }));
    },
    [featureTable],
  );

  const loadProfileList = useCallback(async () => {
    const { name } = featureTable;
    try {
      const { profiles } = await Services.listProfiles({ feature_table: name });
      if (profiles.length > 0) {
        setProfileList(stubProfileList(profiles));
        const firstProfileId = profiles[0].profile_id;
        setActiveProfileIds([firstProfileId]);
        await handleLoadNewProfile(firstProfileId);
      }
    } catch (e) {
      Utils.logErrorAndNotifyUser(e);
    } finally {
      setIsInitialLoading(false);
    }
  }, [featureTable, handleLoadNewProfile]);

  const handleProfileSelect = async (newActiveIds) => {
    const delta = newActiveIds.filter((id) => !Object.keys(profileMap).includes(id));
    setActiveProfileIds(newActiveIds);
    try {
      // Try to fetch all missing profiles simultaneously. In practice this should always be one
      // additional fetch, but included the .all just in case.
      await Promise.all(delta.map(handleLoadNewProfile));
    } catch (e) {
      Utils.logErrorAndNotifyUser(e);
    }
  };

  useEffect(() => {
    loadProfileList();
  }, [loadProfileList]);

  return {
    activeProfileIds,
    handleProfileSelect,
    isInitialLoading,
    profileList,
    profileMap,
  };
}
