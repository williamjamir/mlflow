import React from 'react';

import {
  dataTableUrl,
  LoadForecastPredictionTableView,
  SupportLanguages,
} from './AutoMLExampleView';
import { mountWithIntl } from '../../../common/utils/TestUtils';

describe('dataTableUrl', () => {
  test('should return valid url with regular table', () => {
    const testTable = 'default.test_table';
    expect(dataTableUrl(testTable)).toContain('#table/hive_metastore/default/test_table');
  });

  test('should return valid url with UC table', () => {
    const testTable = 'test_catalog.default.test_table';
    expect(dataTableUrl(testTable)).toContain('#table/test_catalog/default/test_table');
  });
});

describe('LoadForecastPredictionTableView', () => {
  test('should show default as SQL', () => {
    const wrapper = mountWithIntl(
      <LoadForecastPredictionTableView dataPath='default.test_table' />,
    );
    expect(wrapper.find('[data-testid="automl-prediction-example-sql-text"]').get(0)).not.toBe(
      undefined,
    );
    expect(wrapper.find('[data-testid="automl-prediction-example-python-text"]').get(0)).toBe(
      undefined,
    );
    wrapper.setState({ codeLanguage: SupportLanguages.PYTHON });
    expect(wrapper.find('[data-testid="automl-prediction-example-python-text"]').get(0)).not.toBe(
      undefined,
    );
    expect(wrapper.find('[data-testid="automl-prediction-example-sql-text"]').get(0)).toBe(
      undefined,
    );
  });
});
