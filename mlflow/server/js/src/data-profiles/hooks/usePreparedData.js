import { useEffect, useState } from 'react';
import { extractData, getProfileLabel } from '../utils';

export function usePreparedData(activeProfiles = []) {
  const [isLoading, setIsLoading] = useState(true);
  const [features, setFeatures] = useState({});
  const [profiles, setProfiles] = useState([]);

  const prepareData = async (profileData) => {
    setIsLoading(true);
    await setFeatures(extractData(profileData));
    await setProfiles(
      profileData.map((profile) => {
        const { table_stats } = profile;
        return {
          profileName: getProfileLabel(profile),
          count: table_stats.num_rows,
        };
      }),
    );
    setIsLoading(false);
  };

  useEffect(() => {
    prepareData(activeProfiles);
  }, [activeProfiles]);

  return { isLoading, features, profiles };
}
