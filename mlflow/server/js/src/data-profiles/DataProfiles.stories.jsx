import React, { useEffect, useState } from 'react';
import { Skeleton } from '@databricks/design-system';
import { DataProfiles } from './DataProfiles';

export default {
  title: 'Data Profiles/Profile',
  component: DataProfiles,
};

function DataProfileContainer() {
  const [activeProfiles, setActiveProfiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    // Mimic endpoint call
    const allData = await Promise.all([
      import('./sample-data/airbnb.json').then((module) => module.default),
      import('./sample-data/airbnb2.json').then((module) => module.default),
    ]);
    // From the API doc:
    const response = allData.map((d, i) => ({
      profile_id: `Profile_xyz${i + 1}`,
      window_start_timestamp: 1652641200000 - i * 1000 * 60 * 60 * 24,
      window_granularity: '1 day',
      creation_timestamp: 132342424 + i,
      table_stats: {
        num_rows: d[0].count,
      },
      column_profiles: d.map((j) => JSON.stringify(j)),
    }));
    setActiveProfiles(response);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <Skeleton active loading={isLoading}>
      <DataProfiles activeProfiles={activeProfiles} />
    </Skeleton>
  );
}

const Template = (args) => <DataProfileContainer {...args} />;
export const Profile = Template.bind({});
