import React from 'react';
import { PropTypes } from 'prop-types';
import { Container, Header, PropertyValue, ValuesTable } from './sharedComponents';
import { NumericEquiWidthHistogram } from './NumericEquiWidthHistogram';
import { MINIMUM_PERCENTAGE_THRESHOLD } from './utils';
import { Col, Row, Spacer, useDesignSystemTheme } from '@databricks/design-system';

const FeatureProps = PropTypes.shape({
  // Raw data
  count: PropTypes.number.isRequired,
  avg: PropTypes.number.isRequired,
  numNulls: PropTypes.number.isRequired,
  numNan: PropTypes.number.isRequired,
  distinctCount: PropTypes.number.isRequired,
  min: PropTypes.number.isRequired,
  max: PropTypes.number.isRequired,
  stddev: PropTypes.number.isRequired,
  frequentItems: PropTypes.array.isRequired,
  // Computed data
  nullPercentage: PropTypes.number.isRequired,
  quantilesData: PropTypes.object.isRequired,
  numBuckets: PropTypes.number.isRequired,
});

function NumericalSmallCard({ name, dataType, feature }) {
  const { count, nullPercentage, quantilesData, numBuckets } = feature;
  const warnings = [];
  if (nullPercentage > MINIMUM_PERCENTAGE_THRESHOLD) {
    warnings.push(`${nullPercentage.toFixed(1)}% null`);
  }

  return (
    <Container isCompact>
      <Header name={name} dataType={dataType} count={count} warnings={warnings} />
      <NumericEquiWidthHistogram
        numBuckets={numBuckets}
        quantilesData={[quantilesData]}
        height={32}
        width='container'
      />
    </Container>
  );
}
NumericalSmallCard.propTypes = {
  name: PropTypes.string.isRequired,
  dataType: PropTypes.string,
  feature: FeatureProps,
};

function NumericalTallCard({ name, dataType, feature }) {
  const {
    count,
    avg,
    numNulls,
    numNan,
    distinctCount,
    min,
    max,
    stddev,
    nullPercentage,
    quantilesData,
    numBuckets,
  } = feature;

  return (
    <Container isCompact>
      <Header name={name} dataType={dataType} />
      <NumericEquiWidthHistogram
        numBuckets={numBuckets}
        quantilesData={[quantilesData]}
        height={128}
        width='container'
      />
      <PropertyValue property='Count' value={count} />
      <PropertyValue property='Unique values' value={distinctCount} />
      <PropertyValue
        property='Nulls'
        value={`${numNulls}${
          nullPercentage > MINIMUM_PERCENTAGE_THRESHOLD ? ` (${nullPercentage.toFixed(1)}%)` : ''
        }`}
        highlight={nullPercentage > 0 ? 'error' : ''}
      />
      <PropertyValue property='Mean' value={avg.toFixed(3)} />
      <PropertyValue property='Standard deviation' value={stddev.toFixed(3)} />
      <PropertyValue property='Min' value={min} />
      <PropertyValue property='Max' value={max} />
      <PropertyValue property='NaNs' value={numNan} />
    </Container>
  );
}
NumericalTallCard.propTypes = {
  name: PropTypes.string.isRequired,
  dataType: PropTypes.string,
  feature: FeatureProps,
};

function NumericalWideCard({ name, dataType, features }) {
  const { theme } = useDesignSystemTheme();
  const quantilesData = features.map((f) => f.quantilesData);
  const { numBuckets } = features[0];

  return (
    <Container>
      <Header name={name} dataType={dataType} spacer='medium' />
      <hr css={{ margin: 0, border: 0, borderBottom: `1px solid ${theme.colors.grey300}` }} />
      <Spacer size='medium' />
      <Row gutter={48}>
        <Col span={12}>
          <NumericEquiWidthHistogram
            numBuckets={numBuckets}
            quantilesData={quantilesData}
            height={128}
            width='container'
          />
        </Col>
        <Col span={12}>
          <ValuesTable
            features={features}
            featureKeys={[
              ['count', 'distinctCount', 'numNulls', 'numNan'],
              ['avg', 'stddev', 'min', 'max'],
            ]}
          />
        </Col>
      </Row>
    </Container>
  );
}
NumericalWideCard.propTypes = {
  name: PropTypes.string.isRequired,
  dataType: PropTypes.string,
  features: PropTypes.arrayOf(FeatureProps),
};

export function NumericalFeature({ data, viewType = 'small' }) {
  const { columnName, dataType, data: featureData } = data;

  if (viewType === 'wide') {
    return <NumericalWideCard name={columnName} dataType={dataType} features={featureData} />;
  }

  const feature = featureData[0];
  return viewType === 'small' ? (
    <NumericalSmallCard name={columnName} dataType={dataType} feature={feature} />
  ) : viewType === 'tall' ? (
    <NumericalTallCard name={columnName} dataType={dataType} feature={feature} />
  ) : null;
}
NumericalFeature.propTypes = {
  viewType: PropTypes.oneOf(['wide', 'tall', 'small']),
  data: PropTypes.shape({
    columnName: PropTypes.string.isRequired,
    dataType: PropTypes.string,
    data: PropTypes.arrayOf(FeatureProps),
  }).isRequired,
};
