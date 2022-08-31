import { saveAs } from 'file-saver';
import { IntlShape } from 'react-intl';
import ExperimentViewUtil from '../../../ExperimentViewUtil';
import { ExperimentRunsSelectorResult } from '../../utils/experimentRuns.selector';

/**
 * Function used for preparing values for "created" (start time) runs filter.
 */
export const getStartTimeColumnDisplayName = (intl: IntlShape) => ({
  ALL: intl.formatMessage({
    defaultMessage: 'All time',
    description: 'Option for the start select dropdown to render all runs',
  }),
  LAST_HOUR: intl.formatMessage({
    defaultMessage: 'Last hour',
    description: 'Option for the start select dropdown to filter runs from the last hour',
  }),
  LAST_24_HOURS: intl.formatMessage({
    defaultMessage: 'Last 24 hours',
    description: 'Option for the start select dropdown to filter runs from the last 24 hours',
  }),
  LAST_7_DAYS: intl.formatMessage({
    defaultMessage: 'Last 7 days',
    description: 'Option for the start select dropdown to filter runs from the last 7 days',
  }),
  LAST_30_DAYS: intl.formatMessage({
    defaultMessage: 'Last 30 days',
    description: 'Option for the start select dropdown to filter runs from the last 30 days',
  }),
  LAST_YEAR: intl.formatMessage({
    defaultMessage: 'Last year',
    description: 'Option for the start select dropdown to filter runs since the last 1 year',
  }),
});

/**
 * Function used for downloading run data in CSV form.
 */
export const downloadRunsCsv = (
  runsData: ExperimentRunsSelectorResult,
  filteredTagKeys: string[],
  filteredParamKeys: string[],
  filteredMetricKeys: string[],
) => {
  const { runInfos, paramsList, metricsList, tagsList } = runsData;

  // TODO: refactor runInfosToCsv() logic out of ExperimentViewUtil
  const csv = ExperimentViewUtil.runInfosToCsv(
    runInfos,
    filteredParamKeys,
    filteredMetricKeys,
    filteredTagKeys,
    paramsList,
    metricsList,
    tagsList,
  );
  const blob = new Blob([csv], { type: 'application/csv;charset=utf-8' });
  saveAs(blob, 'runs.csv');
};
