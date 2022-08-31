import React from 'react';
// eslint-disable-next-line import/no-namespace
import * as Hook from './feature-table-profiles/hooks/useDataProfiles';
// eslint-disable-next-line import/no-namespace
import * as DataProfileHook from '../../data-profiles/hooks/usePreparedData';
import { mountWithIntl } from '../../common/utils/TestUtils';
import { FeatureTableProfilePaneContainer } from './FeatureTableProfilePane';

jest.mock('./feature-table-profiles/UpdateDataProfileConfigButton', () => ({
  UpdateDataProfileConfigButton: () => <div />,
}));

const sampleProfileList = [
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
];

describe('FeatureTableProfilePane', () => {
  const paneWrapper = (props) => mountWithIntl(<FeatureTableProfilePaneContainer {...props} />);
  const featureTableProps = {
    name: 'my favorite feature table',
  };
  const defaultDataProfileProps = {
    activeProfileIds: [],
    handleProfileSelect: jest.fn(),
    isInitialLoading: false,
    profileList: [],
    profileMap: {},
  };

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders the empty state when no profiles are returned', () => {
    jest.spyOn(Hook, 'useDataProfilesBy').mockImplementation(() => defaultDataProfileProps);
    const wrapper = paneWrapper({ featureTable: featureTableProps });
    expect(wrapper.find("div[data-testid='no-profiles-alert']")).toHaveLength(1);
  });

  it('shows a loading state when the profiles are initially loading', () => {
    jest.spyOn(Hook, 'useDataProfilesBy').mockImplementation(() => ({
      ...defaultDataProfileProps,
      isInitialLoading: true,
    }));
    const wrapper = paneWrapper({ featureTable: featureTableProps });
    // Skeleton returns twice for some reason.
    expect(wrapper.find('[data-testid="profile-pane-skeleton"]')).toBeDefined();
  });

  it('renders data profiles and the profile selector without exploding', () => {
    jest.spyOn(DataProfileHook, 'usePreparedData').mockImplementation(() => ({
      isLoading: true,
      features: {},
      profiles: [],
    }));
    jest.spyOn(Hook, 'useDataProfilesBy').mockImplementation(() => ({
      ...defaultDataProfileProps,
      profileList: sampleProfileList,
    }));
    const wrapper = paneWrapper({ featureTable: featureTableProps });
    expect(wrapper.find("div[data-testid='data-profile-container']")).toHaveLength(1);
  });
});
