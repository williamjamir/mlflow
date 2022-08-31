import { FormattedMessage } from 'react-intl';
import { Tag } from 'antd';
import React from 'react';
import { WARNING_NAMES, getAdditionalInfo } from './AutoMLWarningDashboard';

/*
--------------------------------------- IMPORTANT ---------------------------------------
Please update the go/automlwarnings spreadsheet when you update the text in this file!
It will help stakeholders get a quick overview on the current status of AutoML Warnings. Thanks!
--------------------------------------- IMPORTANT ---------------------------------------
 */

/*
Specific messages for each AutoML Warning. Returns text to be shown in the type and action columns.
Placed in a separate file as there are quite a few.
 */

// eslint-disable-next-line complexity
export const getCellTextFromWarning = (warning) => {
  if (warning.name === WARNING_NAMES.allRowsInvalid && warning.version === 1) {
    return {
      type: (
        <FormattedMessage
          defaultMessage='All rows have invalid data'
          description='AutoML warning shown when all rows have invalid data'
        />
      ),
      action: (
        <FormattedMessage
          defaultMessage='Rerun AutoML with a dataset that has atleast 5 rows per target label'
          description='Recommended action when AutoML is run with dataset with all invalid rows'
        />
      ),
    };
  }
  if (warning.name === WARNING_NAMES.arrayNotNumerical && warning.version === 1) {
    return {
      type: (
        <FormattedMessage
          defaultMessage='Array columns not of numerical type'
          description='AutoML warning shown when array columns are not of numerical type'
        />
      ),
      action: (
        <FormattedMessage
          defaultMessage='AutoML do not support such columns and dropped them.'
          description='Text shown when AutoML drops a column'
        />
      ),
    };
  }
  if (warning.name === WARNING_NAMES.arrayNotSameLength && warning.version === 1) {
    return {
      type: (
        <FormattedMessage
          defaultMessage='The rows of array columns are not of same length'
          description='AutoML warning shown when rows of array columns are not of the same length'
        />
      ),
      action: (
        <FormattedMessage
          defaultMessage='AutoML do not support such columns and dropped them.'
          description='Text shown when AutoML drops a column'
        />
      ),
    };
  }
  if (warning.name === WARNING_NAMES.constCols && warning.version === 1) {
    return {
      type: (
        <FormattedMessage
          defaultMessage='Constant values in columns'
          description='AutoML warning shown when constant columns are detected, version 1'
        />
      ),
    };
  }
  if (warning.name === WARNING_NAMES.constCols && warning.version === 2) {
    return {
      type: (
        <FormattedMessage
          defaultMessage='Constant values in columns'
          description='AutoML warning shown when constant columns are detected, version 2'
        />
      ),
      action: (
        <FormattedMessage
          defaultMessage='AutoML dropped the columns.'
          description='Text shown when AutoML drops a column'
        />
      ),
    };
  }
  if (warning.name === WARNING_NAMES.dataExplorationFail && warning.version === 1) {
    return {
      type: (
        <FormattedMessage
          defaultMessage='Data exploration notebook failed'
          description='AutoML warning shown when data exploration notebook fails'
        />
      ),
      action: (
        <FormattedMessage
          defaultMessage='AutoML ignored the failure and continued.'
          description='Text shown when AutoML ignores data exploration failures'
        />
      ),
    };
  }
  if (warning.name === WARNING_NAMES.dataExplorationTruncateColumns && warning.version === 1) {
    return {
      type: (
        <FormattedMessage
          defaultMessage={
            'Data exploration notebook ran on a subset of columns because dataset is too big'
          }
          description='AutoML warning data exploration notebook ran on a subset of columns'
        />
      ),
      action: (
        <FormattedMessage
          defaultMessage={
            'Modify the data exploration notebook and rerun it to profile the entire dataset.'
          }
          description='Recommended action when data exploration notebook truncate columns.'
        />
      ),
    };
  }
  if (warning.name === WARNING_NAMES.dataExplorationTruncateRows && warning.version === 1) {
    return {
      type: (
        <FormattedMessage
          defaultMessage={
            'Data exploration notebook ran on a subset of rows because dataset is too big'
          }
          description='AutoML warning data exploration notebook ran on a subset of rows'
        />
      ),
      action: (
        <FormattedMessage
          defaultMessage={
            'Modify the data exploration notebook and rerun it to profile the entire dataset.'
          }
          description='Recommended action when data exploration notebook truncate rows.'
        />
      ),
    };
  }
  if (warning.name === WARNING_NAMES.datasetEmpty && warning.version === 1) {
    return {
      type: (
        <FormattedMessage
          defaultMessage='Dataset empty'
          description='AutoML warning shown when the input dataset is empty'
        />
      ),
      action: (
        <FormattedMessage
          defaultMessage='Rerun AutoML on a non-empty dataset.'
          description='Recommended action for user when AutoML is given an empty dataset'
        />
      ),
    };
  }
  if (warning.name === WARNING_NAMES.datasetTooLarge && warning.version === 1) {
    return {
      type: (
        <FormattedMessage
          defaultMessage='Dataset too large'
          description='AutoML warning shown when the input dataset too large'
        />
      ),
      action: (
        <FormattedMessage
          defaultMessage={
            'AutoML sampled the dataset. If they exist, try dropping columns with high ' +
            'cardinality (eg: string columns with many different values) to increase ' +
            'the sample size.'
          }
          description='Action that AutoML took given a dataset that was too large'
        />
      ),
    };
  }
  if (warning.name === WARNING_NAMES.datasetTooLarge && warning.version === 2) {
    return {
      type: (
        <FormattedMessage
          defaultMessage='Dataset too large'
          description='AutoML warning shown when the input dataset too large'
        />
      ),
      action: (
        <FormattedMessage
          defaultMessage={
            'AutoML sampled the dataset. ' +
            'Try a cluster with memory-optimized instance types to increase the sample size.'
          }
          description={
            'Action that AutoML took given a dataset that was too large, ' +
            'and give users a suggestion on what to do.'
          }
        />
      ),
    };
  }
  if (warning.name === WARNING_NAMES.datasetTruncated && warning.version === 1) {
    return {
      type: (
        <FormattedMessage
          defaultMessage='Dataset contains long time series'
          description='AutoML warning shown when AutoML truncate the dateset for forecasting'
        />
      ),
      action: (
        <FormattedMessage
          defaultMessage='AutoML truncates the dataset.'
          description='Action that AutoML took given a dataset that contains long time series'
        />
      ),
    };
  }
  if (warning.name === WARNING_NAMES.duplicateColumnNames && warning.version === 1) {
    return {
      type: (
        <FormattedMessage
          defaultMessage='Duplicate Column Names'
          description='AutoML warning shown when the there are multiple columns with the same name'
        />
      ),
      action: (
        <FormattedMessage
          defaultMessage='Rerun AutoML with a dataset that has unique column names.'
          description='Action that AutoML took given a dataset with duplicate column names'
        />
      ),
    };
  }
  if (warning.name === WARNING_NAMES.executionTimeout && warning.version === 1) {
    return {
      type: (
        <FormattedMessage
          defaultMessage='AutoML Timed Out'
          description='AutoML warning shown when AutoML times before any trials are completed'
        />
      ),
      action: (
        <FormattedMessage
          defaultMessage={
            'AutoML stopped running. Increase the timeout so that AutoML has time to ' +
            'train a model.'
          }
          description='Action that AutoML took when it timed out'
        />
      ),
    };
  }
  if (warning.name === WARNING_NAMES.extraTimeStepsInTimeSeries && warning.version === 1) {
    return {
      type: (
        <FormattedMessage
          defaultMessage={
            'The time series includes extra time steps compared to given ' +
            '<code>{frequency}</code>'
          }
          description={
            'AutoML warning shown when the time series includes extra time steps compared to ' +
            'specified frequency in forecasting'
          }
          values={{
            frequency: 'frequency',
            code: (chunks) => <code>{chunks}</code>,
          }}
        />
      ),
      action: (
        <FormattedMessage
          defaultMessage={
            'AutoML did not train ARIMA models. To include ARIMA, preprocess the data to have ' +
            'the desired frequency.'
          }
          description={
            'Action that AutoML took when there are extra time steps in a forecasting problem.'
          }
        />
      ),
    };
  }
  if (warning.name === WARNING_NAMES.extremeCardinalityCols && warning.version === 1) {
    return {
      type: (
        <FormattedMessage
          defaultMessage='More than 65535 different values in categorical columns'
          description='AutoML warning shown when columns with very high cardinalty are detected'
        />
      ),
      action: (
        <FormattedMessage
          defaultMessage='AutoML dropped the columns.'
          description='Action that AutoML took for large categories'
        />
      ),
    };
  }
  if (warning.name === WARNING_NAMES.highCardinalityCols && warning.version === 1) {
    return {
      type: (
        <FormattedMessage
          defaultMessage='Between 1024 and 65536 different values in categorical columns'
          description='AutoML warning shown when columns with very high cardinalty are detected'
        />
      ),
      action: (
        <FormattedMessage
          defaultMessage='AutoML used feature hashing.'
          description='Action that AutoML took for extreme category column'
        />
      ),
    };
  }
  if (warning.name === WARNING_NAMES.highCorrelationCols && warning.version === 1) {
    return {
      type: (
        <FormattedMessage
          defaultMessage='High correlation columns'
          description='AutoML warning shown when high correlation is detected'
        />
      ),
      action: (
        <FormattedMessage
          defaultMessage={
            'Correlations found. Refer to data exploration notebook for more details.'
          }
          description='Action that AutoML took for correlation columns'
        />
      ),
    };
  }
  if (warning.name === WARNING_NAMES.inappropriateMetricForImbalance && warning.version === 1) {
    const additional = getAdditionalInfo(warning);
    return {
      type: (
        <FormattedMessage
          defaultMessage={
            'Ratio of the least frequent label (<code>{leastFrequentLabel}</code>) to the ' +
            'most frequent label (<code>{mostFrequentLabel}</code>) is <code>{ratio}</code>, ' +
            'but the specified metric <code>{metric}</code> is not appropriate for an imbalanced ' +
            'dataset'
          }
          description={
            'AutoML warning shown when an inappropriate metric is used for an imbalanced dataset'
          }
          values={{
            mostFrequentLabel: additional.mostFrequentLabel || 'undefined',
            leastFrequentLabel: additional.leastFrequentLabel || 'undefined',
            ratio: additional.ratio || 'undefined',
            metric: additional.metric || 'undefined',
            code: (chunks) => <code>{chunks}</code>,
          }}
        />
      ),
      action: (
        <FormattedMessage
          defaultMessage={
            'AutoML will not balance the dataset. We recommend that you choose a ' +
            'different metric such as <code>{appropriateMetric}</code>.'
          }
          description='Text shown when AutoML does not balance the data with an unsupported metric'
          values={{
            appropriateMetric: additional.appropriateMetric || 'undefined',
            code: (chunks) => <code>{chunks}</code>,
          }}
        />
      ),
    };
  }
  if (warning.name === WARNING_NAMES.incompatibleAnnotation && warning.version === 1) {
    return {
      type: (
        <FormattedMessage
          defaultMessage='Columns with incompatible semantic type annotations'
          description='AutoML warning shown for columns with incompatible semantic type annotations'
        />
      ),
      action: (
        <FormattedMessage
          defaultMessage='AutoML ignored incompatible semantic type annotations.'
          description='Action that AutoML took for columns with incompatible annotations'
        />
      ),
    };
  }
  if (warning.name === WARNING_NAMES.inferredPosLabel && warning.version === 1) {
    return {
      type: (
        <FormattedMessage
          defaultMessage='Binary classification detected but positive label is not specified'
          description={
            'AutoML warning shown when no positive label is specified for ' +
            'binary classification'
          }
        />
      ),
      action: (
        <FormattedMessage
          defaultMessage={
            'AutoML inferred a positive label from the data. See affected data for the ' +
            'inferred label. Use the parameter <code>{posLabel}</code> to use a different ' +
            'positive label.'
          }
          description='Action that AutoML took for binary classification'
          values={{
            posLabel: 'pos_label',
            code: (chunks) => <code>{chunks}</code>,
          }}
        />
      ),
    };
  }
  if (warning.name === WARNING_NAMES.largeNullsCols && warning.version === 1) {
    return {
      type: (
        <FormattedMessage
          defaultMessage='More than 5% of values are null.'
          description='AutoML warning shown when >5% nulls are found in columns'
        />
      ),
      action: (
        <FormattedMessage
          defaultMessage='AutoML imputed the null values.'
          description='Action that AutoML took for null values of large null columns'
        />
      ),
    };
  }
  if (warning.name === WARNING_NAMES.lowCardinalityTargetCol && warning.version === 1) {
    return {
      type: (
        <FormattedMessage
          defaultMessage='Only 1 category in target column'
          description='AutoML warning shown when the target column only has 1 category'
        />
      ),
      action: (
        <FormattedMessage
          defaultMessage={
            'Rerun AutoML on a dataset with multiple categories in the target column.'
          }
          description='Recommended action when AutoML is given a target column with 1 category'
        />
      ),
    };
  }
  if (warning.name === WARNING_NAMES.missingTimeStepsInTimeSeries && warning.version === 1) {
    return {
      type: (
        <FormattedMessage
          defaultMessage='Missing time steps in the time series'
          description={
            'AutoML warning shown when there are missing time steps in a forecasting problem.'
          }
        />
      ),
      action: (
        <FormattedMessage
          defaultMessage='Missing values in time series imputed for ARIMA.'
          description={
            'Action that AutoML took when there are missing time steps in a ' +
            'forecasting problem.'
          }
        />
      ),
    };
  }
  if (warning.name === WARNING_NAMES.noFeatureCols && warning.version === 1) {
    return {
      type: (
        <FormattedMessage
          defaultMessage='No feature columns'
          description='AutoML warning shown when the input dataset has no feature columns'
        />
      ),
      action: (
        <FormattedMessage
          defaultMessage='Rerun AutoML on a dataset with supported feature columns.'
          description='Recommended action for user when AutoML finds no supported feature columns'
        />
      ),
    };
  }
  if (warning.name === WARNING_NAMES.notEnoughHistoricalData && warning.version === 1) {
    return {
      type: (
        <FormattedMessage
          defaultMessage='Not enough historical data'
          description={
            'AutoML warning shown when the dataset does not have enough historical ' +
            'data for forecasting'
          }
        />
      ),
      action: (
        <FormattedMessage
          defaultMessage='Rerun AutoML with a shorter forecast horizon.'
          description='Recommended action for user when AutoML finds not enough historical data'
        />
      ),
    };
  }
  if (warning.name === WARNING_NAMES.notEnoughHistoricalData && warning.version === 2) {
    return {
      type: (
        <FormattedMessage
          defaultMessage='Not enough historical data'
          description={
            'AutoML warning shown when the dataset does not have enough historical ' +
            'data for forecasting'
          }
        />
      ),
      action: (
        <FormattedMessage
          defaultMessage='Rerun AutoML with longer time series data.'
          description='Recommended action for user when AutoML finds not enough historical data'
        />
      ),
    };
  }
  if (warning.name === WARNING_NAMES.nullsInTargetCol && warning.version === 1) {
    return {
      type: (
        <FormattedMessage
          defaultMessage='Nulls in target column'
          description='AutoML warning shown when the target column has null values'
        />
      ),
      action: (
        <FormattedMessage
          defaultMessage='Rerun AutoML on a dataset with no nulls in target column.'
          description='Error message shown when AutoML is given target column with nulls'
        />
      ),
    };
  }
  if (warning.name === WARNING_NAMES.nullsInTargetCol && warning.version === 2) {
    return {
      type: (
        <FormattedMessage
          defaultMessage='Nulls in target column'
          description='AutoML warning shown when the target column has null values'
        />
      ),
      action: (
        <FormattedMessage
          defaultMessage='AutoML dropped rows with a null value in the target column'
          description='Action that AutoML took for rows with null target column'
        />
      ),
    };
  }
  if (warning.name === WARNING_NAMES.nullsInTimeCol && warning.version === 1) {
    return {
      type: (
        <FormattedMessage
          defaultMessage='Nulls in time column'
          description='AutoML warning shown when the time column has null values'
        />
      ),
      action: (
        <FormattedMessage
          defaultMessage='AutoML dropped rows with a null value in the time column'
          description='Action that AutoML took for rows with null time column'
        />
      ),
    };
  }
  if (warning.name === WARNING_NAMES.skewedCols && warning.version === 1) {
    return {
      type: (
        <FormattedMessage
          defaultMessage='Highly skewed values'
          description='AutoML warning shown when columns are highly skewed'
        />
      ),
    };
  }
  if (warning.name === WARNING_NAMES.smallNullsCols && warning.version === 1) {
    return {
      type: (
        <FormattedMessage
          defaultMessage='Some values (less than 5%) are null.'
          description='AutoML warning shown when <5% nulls are found in columns'
        />
      ),
      action: (
        <FormattedMessage
          defaultMessage='AutoML imputed the null values.'
          description='Action that AutoML took for null values of small null columns'
        />
      ),
    };
  }
  // For type detection warnings, keep the text consistent with
  // create_semantic_type_message in automl/python/databricks/automl/alerts/feature_alert.py
  if (warning.name === WARNING_NAMES.strongCategoricalTypeDetection && warning.version === 1) {
    return {
      type: (
        <FormattedMessage
          defaultMessage='Categorical semantic type detected for columns'
          description='AutoML warning shown when columns have categorical semantic type'
        />
      ),
      action: (
        <FormattedMessage
          defaultMessage='Training notebooks encoded features based on categorical transformations.'
          description='Action that AutoML took for columns that have categorical semantic type'
        />
      ),
    };
  }
  if (warning.name === WARNING_NAMES.strongDatetimeTypeDetection && warning.version === 1) {
    return {
      type: (
        <FormattedMessage
          defaultMessage='Datetime semantic type detected for columns'
          description='AutoML warning shown when columns have datetime semantic type'
        />
      ),
      action: (
        <FormattedMessage
          defaultMessage={
            'Training notebooks converted each column to a datetime type and encoded features ' +
            'based on temporal transformations.'
          }
          description='Action that AutoML took for columns that have datetime semantic type'
        />
      ),
    };
  }
  if (warning.name === WARNING_NAMES.strongNumericTypeDetection && warning.version === 1) {
    return {
      type: (
        <FormattedMessage
          defaultMessage='Numeric semantic type detected for columns'
          description='AutoML warning shown when columns have numeric semantic type'
        />
      ),
      action: (
        <FormattedMessage
          defaultMessage={
            'Training notebooks converted each column to a numeric type and encoded features ' +
            'based on numerical transformations.'
          }
          description='Action that AutoML took for columns that have numeric semantic type'
        />
      ),
    };
  }
  if (warning.name === WARNING_NAMES.strongTextTypeDetection && warning.version === 1) {
    return {
      type: (
        <FormattedMessage
          defaultMessage='Text semantic type detected for columns'
          description='AutoML warning shown when columns have text semantic type'
        />
      ),
      action: (
        <FormattedMessage
          defaultMessage={
            'Training notebooks converted each column into a fixed-length feature vector.'
          }
          description='Action that AutoML took for columns that have text semantic type'
        />
      ),
    };
  }
  if (warning.name === WARNING_NAMES.targetColAllNulls && warning.version === 1) {
    return {
      type: (
        <FormattedMessage
          defaultMessage='Target column contains only null values'
          description={'AutoML warning shown when the target column contains only null values'}
        />
      ),
      action: (
        <FormattedMessage
          defaultMessage='Rerun AutoML with some non-null values in the target column'
          description='Action message for when all target column values are null values'
        />
      ),
    };
  }
  if (warning.name === WARNING_NAMES.targetLabelImbalance && warning.version === 1) {
    const additional = getAdditionalInfo(warning);
    return {
      type: (
        <FormattedMessage
          defaultMessage={
            'Ratio of the least frequent label (<code>{leastFrequentLabel}</code>) to the ' +
            'most frequent label (<code>{mostFrequentLabel}</code>) is <code>{ratio}</code>'
          }
          description={
            'AutoML warning shown for classification problem when the labels have ' +
            'an imbalanced ratio'
          }
          values={{
            mostFrequentLabel: additional.mostFrequentLabel || 'undefined',
            leastFrequentLabel: additional.leastFrequentLabel || 'undefined',
            ratio: additional.ratio || 'undefined',
            code: (chunks) => <code>{chunks}</code>,
          }}
        />
      ),
      action: (
        <FormattedMessage
          defaultMessage='AutoML will try to balance the target labels before training models'
          description='Action that AutoML took for imbalanced dataset'
        />
      ),
    };
  }
  if (warning.name === WARNING_NAMES.targetLabelInsufficientData && warning.version === 1) {
    return {
      type: (
        <FormattedMessage
          defaultMessage='Target labels have insufficient data'
          description='AutoML warning shown when some target labels have insufficient data'
        />
      ),
      action: (
        <FormattedMessage
          defaultMessage='AutoML dropped the rows that had less than 5 rows per target label'
          description='Action that AutoML took when there is insufficient data per target label'
        />
      ),
    };
  }
  if (warning.name === WARNING_NAMES.targetLabelRatio && warning.version === 1) {
    const additional = getAdditionalInfo(warning);
    return {
      type: (
        <FormattedMessage
          defaultMessage={
            'Ratio of the least frequent label (<code>{leastFrequentLabel}</code>) to the ' +
            'most frequent label (<code>{mostFrequentLabel}</code>) is <code>{ratio}</code>'
          }
          description='AutoML warning that is shown for classification problems as information'
          values={{
            mostFrequentLabel: additional.mostFrequentLabel || 'undefined',
            leastFrequentLabel: additional.leastFrequentLabel || 'undefined',
            ratio: additional.ratio || 'undefined',
            code: (chunks) => <code>{chunks}</code>,
          }}
        />
      ),
    };
  }
  if (warning.name === WARNING_NAMES.timeSeriesFrequencyInconsistent && warning.version === 1) {
    return {
      type: (
        <FormattedMessage
          defaultMessage='The time series frequency does not match the given frequency unit'
          description={
            'AutoML warning shown when the time series does not match the given ' +
            'frequency unit in forecasting'
          }
        />
      ),
      action: (
        <FormattedMessage
          defaultMessage={
            'AutoML excluded ARIMA model from training. ARIMA does not work for ' +
            'inconsistent time series frequency'
          }
          description={
            'Action that AutoML took when there is inconsistent frequency in a ' +
            'forecasting problem'
          }
        />
      ),
    };
  }
  if (warning.name === WARNING_NAMES.timeSeriesIdentitiesTooShort && warning.version === 1) {
    return {
      type: (
        <FormattedMessage
          defaultMessage='Time series too short'
          description={
            'AutoML warning shown when the input time series identities are too short for ' +
            'forecasting'
          }
        />
      ),
      action: (
        <FormattedMessage
          defaultMessage={
            'Some models may not have been trained.' +
            ' Rerun AutoML with a shorter forecast horizon.'
          }
          description='Recommended action for user when AutoML is given time series that are too
          short'
        />
      ),
    };
  }
  if (warning.name === WARNING_NAMES.timeSeriesIdentitiesTooShort && warning.version === 2) {
    return {
      type: (
        <FormattedMessage
          defaultMessage='Time series too short'
          description={
            'AutoML warning shown when the input time series identities are too short for ' +
            'forecasting'
          }
        />
      ),
      action: (
        <FormattedMessage
          defaultMessage={
            'Some models may not have been trained. Rerun AutoML with longer time series data.'
          }
          description='Recommended action for user when AutoML is given time series that are too
          short'
        />
      ),
    };
  }
  if (warning.name === WARNING_NAMES.truncateHorizon && warning.version === 1) {
    return {
      type: (
        <FormattedMessage
          defaultMessage='Horizon truncated for training and validation'
          description={
            'AutoML warning shown when the horizon is truncated for training and validation'
          }
        />
      ),
      action: (
        <FormattedMessage
          defaultMessage={
            'The horizon you provided is too long for one or more time series. AutoML used a' +
            ' shorter horizon for training and validation on those time series.'
          }
          description='Action that AutoML took when user-provided horizon is too long for
          one or more time series'
        />
      ),
    };
  }
  if (warning.name === WARNING_NAMES.trainingEarlyStopped && warning.version === 1) {
    return {
      type: (
        <FormattedMessage
          defaultMessage='AutoML training is stopped early'
          description='AutoML warning shown that the training is stopped early'
        />
      ),
      action: (
        <FormattedMessage
          defaultMessage={
            'AutoML stopped training early as the evaluation metric was not improving.'
          }
          description='Action that AutoML took when training is stopped early'
        />
      ),
    };
  }
  if (warning.name === WARNING_NAMES.unableToSampleWithoutSkew && warning.version === 1) {
    return {
      type: (
        <FormattedMessage
          defaultMessage='Unable to sample data without skewing the target label distribution'
          description={
            'AutoML warning shown when data cannot be sampled without skewing ' +
            'the target label distribution'
          }
        />
      ),
      action: (
        <FormattedMessage
          defaultMessage={
            'Rerun AutoML with a dataset that has enough rows per target ' +
            'label or reduce the number of target labels'
          }
          description='Action that AutoML took when there is insufficient data per target label'
        />
      ),
    };
  }
  if (warning.name === WARNING_NAMES.uniformCols && warning.version === 1) {
    return {
      type: (
        <FormattedMessage
          defaultMessage='Uniformly distributed values in categorical columns'
          description='AutoML warning shown when categorical columns are uniformly distributed'
        />
      ),
    };
  }
  if (warning.name === WARNING_NAMES.uniqueCols && warning.version === 1) {
    return {
      type: (
        <FormattedMessage
          defaultMessage='Unique values in categorical columns'
          description='AutoML warning shown when categorical columns have unique values'
        />
      ),
    };
  }
  if (warning.name === WARNING_NAMES.uniqueStringCols && warning.version === 1) {
    return {
      type: (
        <FormattedMessage
          defaultMessage='Unique values in string columns'
          description='AutoML warning shown when string columns have unique values'
        />
      ),
      action: (
        <FormattedMessage
          defaultMessage='AutoML dropped the columns.'
          description='Action that AutoML took'
        />
      ),
    };
  }
  if (warning.name === WARNING_NAMES.unmatchedFrequencyInTimeSeries && warning.version === 1) {
    return {
      type: (
        <FormattedMessage
          defaultMessage='Detected frequency does not match specified <code>{frequency}</code>'
          description={
            'AutoML warning shown when the time series frequency is different from ' +
            'the specified one.'
          }
          values={{
            frequency: 'frequency',
            code: (chunks) => <code>{chunks}</code>,
          }}
        />
      ),
      action: (
        <FormattedMessage
          defaultMessage={
            'AutoML did not train ARIMA models. To include ARIMA, set ' +
            '<code>{frequency}</code> to match the frequency in data ' +
            'or preprocess data to have the desired frequency.'
          }
          description={
            'Action that AutoML took when the time series frequency is different from ' +
            'the specified one.'
          }
          values={{
            frequency: 'frequency',
            code: (chunks) => <code>{chunks}</code>,
          }}
        />
      ),
    };
  }
  if (warning.name === WARNING_NAMES.unsupportedFeatureCols && warning.version === 1) {
    return {
      type: (
        <FormattedMessage
          defaultMessage='Unsupported column types'
          description='AutoML warning shown when columns are unsupported'
        />
      ),
      action: (
        <FormattedMessage
          defaultMessage='AutoML dropped the columns.'
          description='Text shown when AutoML drops a column'
        />
      ),
    };
  }
  if (
    (warning.name === WARNING_NAMES.unsupportedTargetType && warning.version === 1) ||
    (warning.name === WARNING_NAMES.unsupportedTimeType && warning.version === 1)
  ) {
    const { type } = warning.affected.values[0];
    return {
      type: (
        <>
          <FormattedMessage
            defaultMessage='Unsupported {t} type'
            description={
              'AutoML warning text shown when the user selects a target or time column with an ' +
              'unsupported type'
            }
            values={{ t: warning.name === WARNING_NAMES.unsupportedTargetType ? 'target' : 'time' }}
          />
          {': '}
          <Tag>{type}</Tag>
        </>
      ),
      action: (
        <FormattedMessage
          defaultMessage='Rerun AutoML with a {t} column of a supported type.'
          description='Action message for unsupported target or time type warning'
          values={{ t: warning.name === WARNING_NAMES.unsupportedTargetType ? 'target' : 'time' }}
        />
      ),
    };
  }
  return null;
};
