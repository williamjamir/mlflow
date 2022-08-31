import React, { useEffect, useMemo, useState } from 'react';
import { PropTypes } from 'prop-types';
import { Pagination, Spacer, useDesignSystemTheme } from '@databricks/design-system';
import { CATEGORICAL_TYPES, NUMERIC_TYPES } from './utils';
import { CategoricalFeature } from './CategoricalFeature';
import { NumericalFeature } from './NumericalFeature';

const FEATURES_PER_PAGE = 10;

export function DataProfileGrid({
  features,
  featuresPerPage = FEATURES_PER_PAGE,
  onChange,
  viewType = 'wide',
}) {
  const [page, setPage] = useState(0);
  const { theme } = useDesignSystemTheme();

  useEffect(() => {
    setPage(0);
    onChange();
  }, [features, onChange]);

  const visibleFeatures = useMemo(() => {
    return features.slice(page * featuresPerPage, (page + 1) * featuresPerPage);
  }, [features, featuresPerPage, page]);

  return (
    <>
      <div css={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
        {visibleFeatures.map((feature, i) => {
          const { dataType } = feature;
          return CATEGORICAL_TYPES.includes(dataType) ? (
            <CategoricalFeature key={i} data={feature} viewType={viewType} />
          ) : NUMERIC_TYPES.includes(dataType) ? (
            <NumericalFeature key={i} data={feature} viewType={viewType} />
          ) : null;
        })}
      </div>
      <Spacer size='medium' />
      {features.length > featuresPerPage && (
        <div css={{ display: 'flex', gap: theme.spacing.sm, justifyContent: 'right' }}>
          <Pagination
            onChange={(pageIndex) => {
              setPage(pageIndex - 1); // antd pagination is indexed at 1
              onChange();
            }}
            numTotal={features.length}
            pageSize={featuresPerPage}
            currentPageIndex={page + 1} // indexed at 1
          />
        </div>
      )}
      <Spacer size='medium' />
    </>
  );
}
DataProfileGrid.propTypes = {
  features: PropTypes.array.isRequired,
  featuresPerPage: PropTypes.number,
  onChange: PropTypes.any,
  viewType: PropTypes.oneOf(['wide', 'tall', 'small']),
};
