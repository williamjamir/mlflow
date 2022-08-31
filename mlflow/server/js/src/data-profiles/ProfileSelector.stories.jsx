import React, { useState } from 'react';
import { ProfileSelector } from './ProfileSelector';

const PROFILES_LIST = [
  {
    profile_id: '13lkj15x',
    window_granularity: 'Global',
    window_start_timestamp: 0,
    creation_timestamp: 1656015282000,
  },
  {
    profile_id: '13lkj133',
    window_granularity: '1 day',
    window_start_timestamp: 1655954081000,
    creation_timestamp: 1656015282000,
  },
  {
    profile_id: '13lkj132',
    window_granularity: '1 day',
    window_start_timestamp: 1655867681000,
    creation_timestamp: 1656015282000,
  },
  {
    profile_id: '13lkj137',
    window_granularity: '1 day',
    window_start_timestamp: 1655781281000,
    creation_timestamp: 1656015282000,
  },
  {
    profile_id: '13lkj13g',
    window_granularity: '1 day',
    window_start_timestamp: 1655694881000,
    creation_timestamp: 1656015282000,
  },
];

function ProfileSelectorContainer() {
  const profiles = [...PROFILES_LIST];
  const profile = profiles.map((p) => p.profile_id).slice(0, 1);
  const [activeProfileIds, setActiveProfileIds] = useState(profile);

  const handleProfileChange = (p) => {
    setActiveProfileIds(p);
  };

  return (
    <ProfileSelector
      profiles={profiles}
      activeProfileIds={activeProfileIds}
      onSelectProfile={handleProfileChange}
    />
  );
}

export default {
  title: 'Data Profiles/Components',
  component: ProfileSelectorContainer,
};

const Template = (args) => <ProfileSelectorContainer {...args} />;
export const ProfileSelectorComponent = Template.bind({});
ProfileSelectorComponent.args = {};
