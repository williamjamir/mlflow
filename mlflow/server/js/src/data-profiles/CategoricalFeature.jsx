import React from 'react';
import { PropTypes } from 'prop-types';
import { Spacer, Row, Col, useDesignSystemTheme } from '@databricks/design-system';
import { Container, Header, PropertyValue, ValuesTable } from './sharedComponents';
import { TopValues } from './TopValues';
import { TopValuesList } from './TopValuesList';
import { getTopValuesData, MINIMUM_PERCENTAGE_THRESHOLD } from './utils';

const FeatureProps = PropTypes.shape({
  // Raw data
  count: PropTypes.number.isRequired,
  distinctCount: PropTypes.number.isRequired,
  numNulls: PropTypes.number.isRequired,
  avgLength: PropTypes.number.isRequired,
  maxLength: PropTypes.number.isRequired,
  minLength: PropTypes.number.isRequired,
  profileName: PropTypes.string.isRequired,
  frequentItems: PropTypes.arrayOf(
    PropTypes.shape({ item: PropTypes.string, count: PropTypes.number }),
  ).isRequired,
  // Computed data
  nullPercentage: PropTypes.number.isRequired,
  frequentList: PropTypes.array.isRequired,
  topFrequency: PropTypes.number.isRequired,
});

function CategoricalSmallCard({ name, dataType, feature }) {
  const { count, frequentList, nullPercentage } = feature;
  const warnings = [];
  if (nullPercentage > 0) {
    warnings.push(`${nullPercentage.toFixed(1)}% null`);
  }

  return (
    <Container isCompact>
      <Header name={name} dataType={dataType} count={count} warnings={warnings} />
      <TopValuesList list={frequentList} />
    </Container>
  );
}
CategoricalSmallCard.propTypes = {
  name: PropTypes.string.isRequired,
  dataType: PropTypes.string,
  feature: FeatureProps,
};

function CategoricalTallCard({ name, dataType, feature }) {
  const {
    count,
    distinctCount,
    numNulls,
    avgLength,
    minLength,
    maxLength,
    nullPercentage,
    frequentList,
  } = feature;

  return (
    <Container isCompact>
      <Header name={name} dataType={dataType} />
      <TopValuesList list={frequentList} />
      <PropertyValue property='Count' value={count} />
      <PropertyValue property='Distinct' value={distinctCount} />
      <PropertyValue
        property='Nulls'
        value={`${numNulls}${
          nullPercentage > MINIMUM_PERCENTAGE_THRESHOLD ? ` (${nullPercentage.toFixed(1)}%)` : ''
        }`}
        highlight={nullPercentage > 0 ? 'error' : ''}
      />
      <PropertyValue property='Top frequency' value={frequentList[0].count} />
      <PropertyValue property='Average length' value={avgLength} />
      <PropertyValue property='Min length' value={minLength} />
      <PropertyValue property='Max length' value={maxLength} />
    </Container>
  );
}
CategoricalTallCard.propTypes = {
  name: PropTypes.string.isRequired,
  dataType: PropTypes.string,
  feature: FeatureProps,
};

function CategoricalWideCard({ name, dataType, features }) {
  const { theme } = useDesignSystemTheme();

  const frequentData = getTopValuesData(features);

  return (
    <Container>
      <Header name={name} dataType={dataType} spacer='medium' />
      <hr css={{ margin: 0, border: 0, borderBottom: `1px solid ${theme.colors.grey300}` }} />
      <Spacer size='medium' />
      <Row gutter={48}>
        <Col span={12}>
          <TopValues data={frequentData} width='container' height={240} />
        </Col>
        <Col span={12}>
          <ValuesTable
            features={features}
            featureKeys={[
              ['count', 'distinctCount', 'topFrequency', 'numNulls'],
              ['avgLength', 'minLength', 'maxLength'],
            ]}
          />
        </Col>
      </Row>
    </Container>
  );
}
CategoricalWideCard.propTypes = {
  name: PropTypes.string.isRequired,
  dataType: PropTypes.string,
  features: PropTypes.arrayOf(FeatureProps),
};

export function CategoricalFeature({ data, viewType = 'small' }) {
  const { columnName, dataType, data: featureData } = data;

  if (viewType === 'wide') {
    return <CategoricalWideCard name={columnName} dataType={dataType} features={featureData} />;
  }

  // TODO: Figure out what to do for comparisons
  const feature = featureData[0];
  return viewType === 'small' ? (
    <CategoricalSmallCard name={columnName} dataType={dataType} feature={feature} />
  ) : viewType === 'tall' ? (
    <CategoricalTallCard name={columnName} dataType={dataType} feature={feature} />
  ) : null;
}
CategoricalFeature.propTypes = {
  viewType: PropTypes.oneOf(['wide', 'tall', 'small']),
  data: PropTypes.shape({
    columnName: PropTypes.string.isRequired,
    dataType: PropTypes.string,
    data: PropTypes.arrayOf(FeatureProps),
  }).isRequired,
};
