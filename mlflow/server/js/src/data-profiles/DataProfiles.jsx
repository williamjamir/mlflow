import React, { useCallback, useMemo, useRef, useState } from 'react';
import _ from 'lodash';
import { PropTypes } from 'prop-types';
import { DataProfileGrid } from './DataProfileGrid';
import {
  Input,
  SearchIcon,
  Select,
  Skeleton,
  Spacer,
  Typography,
  useDesignSystemTheme,
} from '@databricks/design-system';
import { ProfileProps } from './ProfileProps';
import { usePreparedData } from './hooks';

const { Text, Paragraph } = Typography;

const SORT_TYPES = {
  ALPHABETICAL: 'alphabetical',
  DEFAULT: 'default',
  DATA_TYPE: 'dataType',
};

const SORT_COMPARATORS = {
  [SORT_TYPES.ALPHABETICAL]: (a, b) => {
    return a.columnName.localeCompare(b.columnName);
  },
  [SORT_TYPES.DATA_TYPE]: (a, b) => {
    return a.dataType.localeCompare(b.dataType);
  },
};

export function DataProfiles({ activeProfiles = [], includeFeatureOrder = false }) {
  const scrollRef = useRef(null);
  const { isLoading, features, profiles } = usePreparedData(activeProfiles);
  const { theme } = useDesignSystemTheme();
  const [query, setQuery] = useState('');
  const [type, setType] = useState('');
  const [sortOrder, setSortOrder] = useState(
    includeFeatureOrder ? SORT_TYPES.DEFAULT : SORT_TYPES.ALPHABETICAL,
  );

  // TODO: Consider using a hardcoded list vs a dynamic one as shown here.
  const dataTypes = useMemo(() => {
    return _.uniq(
      Object.values(features)
        .map((feature) => feature.dataType)
        .sort(),
    );
  }, [features]);

  const eligibleFeatures = useMemo(() => {
    let filteredFeatures = Object.values(features);
    if (query || type) {
      filteredFeatures = filteredFeatures.filter(({ columnName, dataType }) => {
        return (
          (!query || columnName.toLowerCase().includes(query.toLowerCase())) &&
          (!type || dataType === type)
        );
      });
    }
    if (sortOrder !== SORT_TYPES.DEFAULT) {
      filteredFeatures = filteredFeatures.sort(SORT_COMPARATORS[sortOrder]);
    }

    return filteredFeatures;
  }, [features, query, type, sortOrder]);

  const handlePageChange = useCallback(() => (scrollRef.current.scrollTop = 0), [scrollRef]);

  return (
    <Skeleton active loading={isLoading}>
      <div css={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div
          css={{
            display: 'flex',
            gap: theme.spacing.sm,
            alignItems: 'flex-end',
            marginBottom: theme.spacing.md,
          }}
        >
          <div>
            <div>
              <Text bold size='sm'>
                Data type
              </Text>
            </div>
            <Spacer size='small' />
            <Select css={{ width: 160 }} onChange={(t) => setType(t)} value={type}>
              <Select.Option value=''>all</Select.Option>
              {dataTypes.map((dataType, i) => {
                return (
                  <Select.Option key={i} value={dataType}>
                    {dataType}
                  </Select.Option>
                );
              })}
            </Select>
          </div>
          <div>
            <div>
              <Text bold size='sm'>
                Sort by
              </Text>
            </div>
            <Spacer size='small' />
            <Select
              css={{ width: 160 }}
              onChange={(order) => setSortOrder(order)}
              value={sortOrder}
            >
              {includeFeatureOrder && (
                <Select.Option value={SORT_TYPES.DEFAULT}>Feature order</Select.Option>
              )}
              <Select.Option value={SORT_TYPES.ALPHABETICAL}>Alphabetical</Select.Option>
              <Select.Option value={SORT_TYPES.DATA_TYPE}>Type</Select.Option>
            </Select>
          </div>
          <div>
            <Input
              css={{ width: 240 }}
              prefix={<SearchIcon />}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder='Search by feature name'
            />
          </div>
        </div>
        <div css={{ display: 'flex', gap: theme.spacing.md, marginBottom: theme.spacing.sm }}>
          <Paragraph withoutMargins>
            <Text bold>{eligibleFeatures.length}</Text> Features
          </Paragraph>
          {profiles.map(({ profileName, count }) => (
            <Paragraph key={profileName} withoutMargins>
              <Text bold>{count}</Text> rows ({profileName})
            </Paragraph>
          ))}
        </div>
        <div ref={scrollRef} css={{ flex: '1 1 100%', overflow: 'auto' }}>
          {eligibleFeatures.length > 0 ? (
            <DataProfileGrid features={eligibleFeatures} onChange={handlePageChange} />
          ) : (
            <div>No matching features</div>
          )}
        </div>
      </div>
    </Skeleton>
  );
}
DataProfiles.propTypes = {
  activeProfiles: PropTypes.arrayOf(ProfileProps),
  includeFeatureOrder: PropTypes.bool,
};
