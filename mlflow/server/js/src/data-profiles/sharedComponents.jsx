import React from 'react';
import { PropTypes } from 'prop-types';
import { Col, Row, Spacer, Typography, useDesignSystemTheme } from '@databricks/design-system';
import { clipValue, featureLabels } from './utils';

const { Text } = Typography;

export function Container({ isCompact, ...props }) {
  const { theme } = useDesignSystemTheme();
  return (
    <div
      css={{
        backgroundColor: theme.colors.grey100,
        borderRadius: theme.borders.borderRadiusMd,
        padding: isCompact ? `${theme.spacing.xs}px ${theme.spacing.sm}px` : theme.spacing.md,
        ...(isCompact && { maxWidth: 300 }),
      }}
      {...props}
    />
  );
}
Container.propTypes = {
  isCompact: PropTypes.bool,
};

export function Header({ name, dataType, count = 0, warnings = [], spacer = 'small' }) {
  const { theme } = useDesignSystemTheme();
  return (
    <>
      <div
        css={{
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <Text bold>{name}</Text>
        <div
          css={{
            display: 'flex',
            gap: theme.spacing.sm,
          }}
        >
          <Text color='secondary'>{dataType}</Text>
          {count > 0 && (
            <>
              <Text color='secondary'>|</Text>
              <Text color='secondary'>{count}</Text>
            </>
          )}
          {warnings.map((error, i) => (
            <Text key={i} color='error'>
              {error}
            </Text>
          ))}
        </div>
      </div>
      {spacer && <Spacer size={spacer} />}
    </>
  );
}
Header.propTypes = {
  name: PropTypes.string.isRequired,
  dataType: PropTypes.string.isRequired,
  count: PropTypes.number,
  warnings: PropTypes.arrayOf(PropTypes.string),
  spacer: PropTypes.oneOf([null, 'small', 'medium', 'large']),
};

export function PropertyValue({ property, value, highlight = undefined }) {
  const { theme } = useDesignSystemTheme();
  const isArray = Array.isArray(value);
  const isComparison = isArray && value.length > 1;

  return (
    <div css={!isComparison && { display: 'flex', justifyContent: 'space-between' }}>
      <Text color='secondary'>{property}</Text>
      {isComparison ? (
        <div
          css={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: theme.spacing.lg,
          }}
        >
          {value.map((v, i) => (
            <Text key={i}>{v.value}</Text>
          ))}
        </div>
      ) : (
        <Text color={highlight}>{isArray ? value[0].value : value}</Text>
      )}
    </div>
  );
}
PropertyValue.propTypes = {
  property: PropTypes.string.isRequired,
  value: PropTypes.any,
  highlight: PropTypes.string,
};

function ValueTableRow({ features, featureKey }) {
  const { theme } = useDesignSystemTheme();
  const rowSpacing = theme.spacing.sm;
  const numFeatures = features.length;

  // If we have more than 2 features, we show results in two rows (header + data points), else
  // we try squeezing it into one row. The default colspan of a row is 24.
  const headerSpan = numFeatures > 2 ? 24 : 24 - numFeatures * DEFAULT_FEATURE_SPAN;
  const featureSpan = numFeatures > 2 ? 24 / numFeatures : DEFAULT_FEATURE_SPAN;
  return (
    <Row
      key={featureKey}
      gutter={16}
      css={{
        paddingTop: rowSpacing,
        paddingBottom: rowSpacing,
      }}
    >
      <Col span={headerSpan}>
        <Text color='secondary'>{featureLabels[featureKey]}</Text>
      </Col>
      {features.map((feature, i) => {
        return (
          <Col key={i} span={featureSpan}>
            <Text>{clipValue(feature[featureKey])}</Text>
          </Col>
        );
      })}
    </Row>
  );
}
ValueTableRow.propTypes = {
  features: PropTypes.arrayOf(PropTypes.any).isRequired,
  featureKey: PropTypes.string.isRequired,
};

const DEFAULT_FEATURE_SPAN = 5;
export function ValuesTable({ features, featureKeys = [] }) {
  return (
    <Row gutter={48}>
      {featureKeys.map((featureKeysRow, k) => {
        return (
          <Col key={k} span={12}>
            {featureKeysRow.map((featureKey) => (
              <ValueTableRow key={featureKey} featureKey={featureKey} features={features} />
            ))}
          </Col>
        );
      })}
    </Row>
  );
}
ValuesTable.propTypes = {
  features: PropTypes.arrayOf(PropTypes.any).isRequired,
  featureKeys: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)).isRequired,
};
