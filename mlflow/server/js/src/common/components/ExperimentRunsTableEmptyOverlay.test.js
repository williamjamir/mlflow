import React from 'react';
import { ExperimentRunsTableEmptyOverlay } from './ExperimentRunsTableEmptyOverlay';
// BEGIN-EDGE
import { DatabricksLoggingRunsDocUrl } from '../constants-databricks';
import { oss_test } from '../../common/utils/DatabricksTestUtils';
import DatabricksUtils from '../utils/DatabricksUtils';
import { CloudProvider } from '../../shared/constants-databricks';
// END-EDGE
import { LoggingRunsDocUrl } from '../constants';
import { mountWithIntl } from '../../common/utils/TestUtils';

describe('ExperimentRunsTableEmptyOverlay', () => {
  let wrapper;
  // BEGIN-EDGE
  test('should render correct link', () => {
    [CloudProvider.AWS, CloudProvider.Azure].forEach((provider) => {
      DatabricksUtils.getCloudProvider = jest.fn().mockReturnValue(provider);
      wrapper = mountWithIntl(<ExperimentRunsTableEmptyOverlay />);
      expect(wrapper.find(`a[href="${DatabricksLoggingRunsDocUrl[provider]}"]`)).toHaveLength(1);
    });
  });
  // END-EDGE

  oss_test('should render correct link', () => {
    wrapper = mountWithIntl(<ExperimentRunsTableEmptyOverlay />);
    expect(wrapper.find(`a[href="${LoggingRunsDocUrl}"]`)).toHaveLength(1);
  });
});
