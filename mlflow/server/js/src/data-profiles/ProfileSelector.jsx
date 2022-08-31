import React, { useCallback, useState } from 'react';
import { Select, Spacer, Tag, Typography } from '@databricks/design-system';
import { PropTypes } from 'prop-types';
import { getProfileLabel } from './utils';
import { ProfileProps } from './ProfileProps';

const { Text } = Typography;

const COLOR_OPTIONS = ['turquoise', 'coral', 'lemon', 'lime'];

export function getColor(activeProfileIds, profileId) {
  const index = activeProfileIds.findIndex((e) => e === profileId);
  if (activeProfileIds.length < 2 || index < 0) return 'charcoal';
  return COLOR_OPTIONS[index];
}

export function ProfileSelector({
  profiles = [],
  activeProfileIds,
  onSelectProfile,
  minProfiles = 1,
  maxProfiles = 4,
}) {
  const [errorState, setErrorState] = useState('');
  const tagRender = useCallback(
    (activeProfile) => {
      const { label, value, onClose } = activeProfile;
      const onPreventMouseDown = (e) => {
        e.preventDefault();
        e.stopPropagation();
      };

      return (
        <Tag
          color={getColor(activeProfileIds, value)}
          onMouseDown={onPreventMouseDown}
          closable={activeProfileIds.length > 1}
          onClose={onClose}
          style={{ marginRight: 4 }}
        >
          {label}
        </Tag>
      );
    },
    [activeProfileIds],
  );

  function onChange(p) {
    if (p.length >= minProfiles && p.length <= maxProfiles) {
      setErrorState('');
      onSelectProfile(p);
    } else if (p.length < minProfiles) {
      setErrorState('Must select at least 1 profile.');
    } else if (p.length > maxProfiles) {
      setErrorState(`Cannot select more than least ${maxProfiles} profiles.`);
    }
  }

  return (
    <div>
      <div>
        <Text bold size='sm'>
          Profiles
        </Text>
      </div>
      <Spacer size='small' />
      <Select
        css={{
          minWidth: 240,
          // eslint-disable-next-line max-len
          '.du-bois-light-select-selection-overflow-item:not(.du-bois-light-select-selection-overflow-item-suffix)':
            {
              display: 'flex',
              alignItems: 'center',
            },
        }}
        mode='multiple'
        onChange={onChange}
        value={activeProfileIds}
        options={profiles.map((profile) => {
          return {
            label: getProfileLabel(profile),
            value: profile.profile_id,
            disabled:
              activeProfileIds.length >= maxProfiles &&
              !activeProfileIds.includes(profile.profile_id),
          };
        })}
        dangerouslySetAntdProps={{
          tagRender,
        }}
      />
      {errorState && (
        <>
          {' '}
          <Text withoutMargins color='warning'>
            {errorState}
          </Text>
        </>
      )}
    </div>
  );
}
ProfileSelector.propTypes = {
  profiles: PropTypes.arrayOf(ProfileProps),
  activeProfileIds: PropTypes.arrayOf(PropTypes.string),
  onSelectProfile: PropTypes.func.isRequired,
  minProfiles: PropTypes.number,
  maxProfiles: PropTypes.number,
};
