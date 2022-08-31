import PropTypes from 'prop-types';
import React from 'react';
import { Table, Tag } from 'antd';
import { Typography } from '@databricks/design-system';
import { FormattedMessage } from 'react-intl';

import { SeverityTag, severitySorter } from './SeverityTag';
import { getCellTextFromWarning } from './AutoMLWarningText';

import _ from 'lodash';

const { Text } = Typography;

export const AUTOML_WARNING_PREFIX_DEPRECATED = `_databricks_automl.alerts`;
export const AUTOML_WARNING_PREFIX = `_databricks_automl.warnings`;

// Tag names from automl/python/databricks/automl/tags.py with _.camelCase applied to them
// Tag names should be in alphabetical order
export const WARNING_NAMES = {
  allRowsInvalid: 'allRowsInvalid',
  arrayNotNumerical: 'arrayNotNumerical',
  arrayNotSameLength: 'arrayNotSameLength',
  constCols: 'constCols',
  dataExplorationFail: 'dataExplorationFail',
  dataExplorationTruncateColumns: 'dataExplorationTruncateColumns',
  dataExplorationTruncateRows: 'dataExplorationTruncateRows',
  datasetEmpty: 'datasetEmpty',
  datasetTooLarge: 'datasetTooLarge',
  datasetTruncated: 'datasetTruncated',
  duplicateColumnNames: 'duplicateColNames',
  executionTimeout: 'executionTimeout',
  extraTimeStepsInTimeSeries: 'extraTimeStepsInTimeSeries',
  extremeCardinalityCols: 'extremeCardinalityCols',
  highCardinalityCols: 'highCardinalityCols',
  highCorrelationCols: 'highCorrelationCols',
  inappropriateMetricForImbalance: 'inappropriateMetricForImbalance',
  incompatibleAnnotation: 'incompatibleAnnotation',
  inferredPosLabel: 'inferredPosLabel',
  largeNullsCols: 'largeNullsCols',
  lowCardinalityTargetCol: 'lowCardinalityTargetCol',
  missingTimeStepsInTimeSeries: 'missingTimeStepsInTimeSeries',
  noFeatureCols: 'noFeatureCols',
  notEnoughHistoricalData: 'notEnoughHistoricalData',
  nullsInTargetCol: 'nullsInTargetCol',
  nullsInTimeCol: 'nullsInTimeCol',
  skewedCols: 'skewedCols',
  smallNullsCols: 'smallNullsCols',
  strongCategoricalTypeDetection: 'strongCategoricalTypeDetection',
  strongDatetimeTypeDetection: 'strongDatetimeTypeDetection',
  strongNumericTypeDetection: 'strongNumericTypeDetection',
  strongTextTypeDetection: 'strongTextTypeDetection',
  targetColAllNulls: 'targetColAllNulls', // deprecated in MLR 10.4
  targetLabelImbalance: 'targetLabelImbalance',
  targetLabelInsufficientData: 'targetLabelInsufficientData',
  targetLabelRatio: 'targetLabelRatio',
  timeSeriesFrequencyInconsistent: 'timeSeriesFrequencyInconsistent', // deprecated in MLR 10.4
  timeSeriesIdentitiesTooShort: 'timeSeriesIdentitiesTooShort',
  trainingEarlyStopped: 'trainingEarlyStopped',
  truncateHorizon: 'truncateHorizon',
  unableToSampleWithoutSkew: 'unableToSampleWithoutSkew',
  uniformCols: 'uniformCols',
  uniqueCols: 'uniqueCols',
  uniqueStringCols: 'uniqueStringCols',
  unmatchedFrequencyInTimeSeries: 'unmatchedFrequencyInTimeSeries',
  unsupportedFeatureCols: 'unsupportedFeatureCols',
  unsupportedTargetType: 'unsupportedTargetType',
  unsupportedTimeType: 'unsupportedTimeType',
};

const AutoMLWarningDescription = ({ explorationNotebookUrl }) => (
  <div css={styles.container}>
    <div>
      <Text strong>
        <FormattedMessage
          defaultMessage='Warnings'
          description='Header/title of AutoML warnings dashboard'
        />
      </Text>
    </div>
    <div>
      <FormattedMessage
        defaultMessage='Possible data issues identified by AutoML are shown below.'
        description='Informational description of AutoML warnings shown in the warnings dashboard'
      />
      {explorationNotebookUrl && (
        <>
          {' '}
          <FormattedMessage
            defaultMessage='For more details, see the <link>data exploration notebook</link>.'
            description={
              'Informational text directing users to the data exploration notebook for more ' +
              'AutoML warnings'
            }
            values={{
              link: (text) => (
                <a href={explorationNotebookUrl} target='_blank' rel='noopener noreferrer'>
                  {text}
                </a>
              ),
            }}
          />
        </>
      )}
    </div>
  </div>
);

AutoMLWarningDescription.propTypes = {
  explorationNotebookUrl: PropTypes.string,
};

// getCellTextFromWarning parameterized to mock in tests
export const getTableDataFromWarnings = (warnings, getCellText = getCellTextFromWarning) => {
  // creates data in the dataSource format specified at https://ant.design/components/table/
  const dataSource = [];
  warnings.forEach((warning, i) => {
    const cellText = getCellText(warning);
    if (cellText) {
      dataSource.push({
        key: i,
        severity: warning.severity,
        affectedData: warning.affected,
        ...cellText,
      });
    }
  });

  return dataSource;
};

// helper function to convert additional_info to object
export const getAdditionalInfo = (warning) => {
  if (!warning || !warning.additional_info) {
    return {};
  }
  const result = {};
  for (const { key, value } of warning.additional_info) {
    const camelCaseKey = _.camelCase(key);
    result[camelCaseKey] = value;
  }
  return result;
};

/*
Affected data should be of the format:
{
  values: [
    {
      id: string to be rendered in a <Tag/>
      type: optional, type of id
    },
  ],
  others: number of values truncated, since we only store a max of 5
}
 */
// Reported during ESLint upgrade
// eslint-disable-next-line react/prop-types
export const AffectedDataCell = ({ data }) => {
  if (!data) return null;
  // Reported during ESLint upgrade
  // eslint-disable-next-line react/prop-types
  const { values, others } = data;
  if (!values && !others) return null;
  return (
    <>
      {values &&
        // Reported during ESLint upgrade
        // eslint-disable-next-line react/prop-types
        values.map((d, i) => (
          <Tag key={i} data-testid='affected-data-tag'>
            {d.id}
          </Tag>
        ))}
      {others && (
        <FormattedMessage
          defaultMessage={'+{count} more'}
          description='Indicates how many additional columns an autoML warning applies to'
          // Reported during ESLint upgrade
          // eslint-disable-next-line react/prop-types
          values={{ count: data.others }}
          data-testid='affected-data-others'
        />
      )}
    </>
  );
};

AffectedDataCell.propTypes = {
  affectedColumns: PropTypes.object,
};

/*
Table data is of format:
severity,
type: string representing the type of warning, e.g. Dataset too large,
affectedData (optional): array of objects containing at least an id, which will be rendered
                         directly as a <Tag/>
action: string describing the action AutoML took or the recommended action to the user
 */
export const AutoMLWarningDashboard = ({
  warnings = [],
  dataExplorationButton,
  explorationNotebookUrl,
}) => (
  <>
    <AutoMLWarningDescription explorationNotebookUrl={explorationNotebookUrl} />
    <div css={styles.container}>{dataExplorationButton}</div>
    <Table
      columns={[
        {
          title: (
            <FormattedMessage
              defaultMessage='Severity'
              description='Column header of AutoML warnings table. Describes priority of warning.'
            />
          ),
          dataIndex: 'severity',
          key: 'severity',
          sorter: severitySorter,
          defaultSortOrder: 'descend',
          sortDirections: ['ascend', 'descend', 'ascend'], // this prevents an unsorted column
          render: (severity) => <SeverityTag severity={severity} />,
        },
        {
          title: (
            <FormattedMessage
              defaultMessage='Type'
              description='Column header of AutoML warnings table. Describes type of warning.'
            />
          ),
          dataIndex: 'type',
          key: 'type',
        },
        {
          title: (
            <FormattedMessage
              defaultMessage='Affected Data'
              description={
                'Column header of AutoML warnings table. Describes what data of a ' +
                'dataset that a warning applies to.'
              }
            />
          ),
          dataIndex: 'affectedData',
          key: 'affectedData',
          render: (affectedData) => <AffectedDataCell data={affectedData} />,
        },
        {
          title: (
            <FormattedMessage
              defaultMessage='Action'
              description={
                'Column header of AutoML warnings table. Describes what actions AutoML took as a ' +
                'result of a warning, as well as what actions we recommend that the user take.'
              }
            />
          ),
          dataIndex: 'action',
          key: 'action',
        },
      ]}
      dataSource={getTableDataFromWarnings(warnings)}
      pagination={false}
      bordered
      css={styles.container}
    />
  </>
);

AutoMLWarningDashboard.propTypes = {
  warnings: PropTypes.array,
  dataExplorationButton: PropTypes.element.isRequired,
  explorationNotebookUrl: PropTypes.string,
};

const styles = {
  container: {
    marginTop: 20,
  },
};
