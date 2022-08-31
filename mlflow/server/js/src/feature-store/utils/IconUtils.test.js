import React from 'react';
import IconUtils from './IconUtils';
import { shallow } from 'enzyme';

describe('IconUtils', () => {
  test('getJobRunStatusIcon', () => {
    // failed cases
    const failedRunStatuses = ['Internal_ERROR', 'Skipped', 'CanCelED', 'FAILED', 'timedout'];
    // success case
    const successRunStatuses = ['success'];
    // running case
    const runningRunStatuses = ['Terminating', 'RUNNING', 'PeNdIng'];
    // unexpected cases
    const unexpectedStatuses = ['error', 'succeed', 'exception', 'Loading'];

    failedRunStatuses.forEach((status) => {
      expect(
        shallow(IconUtils.getJobRunStatusIcon(status)).find('[data-test-id="job-run-error-icon"]')
          .length,
      ).toEqual(1);
    });
    successRunStatuses.forEach((status) => {
      expect(
        shallow(IconUtils.getJobRunStatusIcon(status)).find('[data-test-id="job-run-success-icon"]')
          .length,
      ).toEqual(1);
    });
    runningRunStatuses.forEach((status) => {
      expect(
        shallow(IconUtils.getJobRunStatusIcon(status)).find('[data-test-id="job-run-loading-icon"]')
          .length,
      ).toEqual(1);
    });
    unexpectedStatuses.forEach((status) => {
      expect(IconUtils.getJobRunStatusIcon(status)).toEqual(<i />);
    });
  });
});
