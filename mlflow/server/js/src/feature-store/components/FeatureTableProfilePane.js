import React, { useState } from 'react';
import { useIntl, FormattedMessage } from 'react-intl';
import { Alert, Skeleton, Spacer } from '@databricks/design-system';
import { ProfileSelector } from '../../data-profiles/ProfileSelector';
import { DataProfiles } from '../../data-profiles/DataProfiles';
import { MonitoringErrorBoundary } from '../../model-monitoring/components/MonitoringErrorBoundary';
import { UpdateDataProfileConfigButton } from './feature-table-profiles/UpdateDataProfileConfigButton';
import { FeatureTableProps } from './feature-table-profiles/FeatureTableProfileProps';
import { useDataProfilesBy } from './feature-table-profiles/hooks/useDataProfiles';
import LinkUtils from '../utils/LinkUtils';

export function FeatureTableProfilePaneContainer({ featureTable }) {
  const intl = useIntl();
  const [configurationChanged, setConfigurationChanged] = useState(false);
  const { activeProfileIds, handleProfileSelect, isInitialLoading, profileList, profileMap } =
    useDataProfilesBy(featureTable);

  const activeProfiles = activeProfileIds.map((id) => profileMap[id]);
  const isAwaitingProfileFetch = activeProfiles.filter(Boolean).length !== activeProfileIds.length;

  return (
    <Skeleton active loading={isInitialLoading} data-testid='profile-pane-skeleton'>
      {configurationChanged && (
        <>
          <Alert
            type='info'
            onClose={() => setConfigurationChanged(false)}
            message={intl.formatMessage({
              defaultMessage: 'Monitor configurations have changed',
              description: 'Alert title for configuration changes in feature table monitoring',
            })}
            description={intl.formatMessage({
              defaultMessage:
                // eslint-disable-next-line max-len
                'To get the most up-to-date profile data for this feature table, make sure to re-run the job which recomputes profiles using the latest configuration',
              description:
                'Alert description for configuration changes in feature table monitoring',
            })}
          />
          <Spacer size='medium' />
        </>
      )}
      {profileList.length > 0 ? (
        <div data-testid='data-profile-container'>
          <div css={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <ProfileSelector
              profiles={profileList}
              activeProfileIds={activeProfileIds}
              onSelectProfile={handleProfileSelect}
            />
            <UpdateDataProfileConfigButton
              featureTable={featureTable}
              onConfigurationChange={setConfigurationChanged}
            />
          </div>
          <Spacer size='medium' />
          <Skeleton active loading={isAwaitingProfileFetch}>
            <DataProfiles activeProfiles={activeProfiles} />
          </Skeleton>
        </div>
      ) : (
        <Alert
          data-testid='no-profiles-alert'
          type='info'
          closable={false}
          message={intl.formatMessage({
            defaultMessage: 'No profiles found for this feature table',
            description: 'Alert title for empty state of feature table monitoring',
          })}
          description={
            <FormattedMessage
              // eslint-disable-next-line max-len
              defaultMessage='To get started, enable profiles for this feature table and run the job to compute profiles with the specified configuration. Learn more <link>here</link>'
              description='Alert description for configuration changes in feature table monitoring'
              values={{
                link: (text) => (
                  <a
                    href={LinkUtils.getScheduleJobLearnMoreLinkUrl()}
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    {text}
                  </a>
                ),
              }}
            />
          }
        />
      )}
    </Skeleton>
  );
}
FeatureTableProfilePaneContainer.propTypes = {
  featureTable: FeatureTableProps.isRequired,
};

export function FeatureTableProfilePane(props) {
  return (
    <MonitoringErrorBoundary>
      <FeatureTableProfilePaneContainer {...props} />
    </MonitoringErrorBoundary>
  );
}
