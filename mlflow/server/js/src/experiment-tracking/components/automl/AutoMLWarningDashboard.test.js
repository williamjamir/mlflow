import { FormattedMessage } from 'react-intl';
import React from 'react';
import { shallow } from 'enzyme';

import {
  AffectedDataCell,
  getTableDataFromWarnings,
  getAdditionalInfo,
  WARNING_NAMES,
} from './AutoMLWarningDashboard';
import { SEVERITY } from './SeverityTag';

describe('AutoMLWarningDashboard', () => {
  describe('getTableDataFromWarnings', () => {
    const mockGetCellText = jest.fn(() => ({
      type: 'mock type',
      action: 'mock action',
    }));

    test('should return empty array given empty warnings array', () => {
      expect(getTableDataFromWarnings([], mockGetCellText)).toEqual([]);
    });

    test('should correctly format warnings', () => {
      const warnings = [
        {
          name: WARNING_NAMES.timeSeriesIdentitiesTooShort,
          severity: SEVERITY.MEDIUM,
          affected: {
            values: [{ id: 'col_a' }, { id: 'col_b' }, { id: 'col_c' }, { id: 'col_d' }],
            others: 100,
          },
          version: 1,
        },
        {
          name: WARNING_NAMES.timeSeriesIdentitiesTooShort,
          severity: SEVERITY.MEDIUM,
          affected: {
            values: [{ id: 'col_a' }, { id: 'col_b' }, { id: 'col_c' }, { id: 'col_d' }],
            others: 100,
          },
          version: 1,
        },
      ];

      const res = getTableDataFromWarnings(warnings, mockGetCellText);

      expect(res).toEqual([
        {
          key: 0,
          severity: SEVERITY.MEDIUM,
          affectedData: {
            values: [{ id: 'col_a' }, { id: 'col_b' }, { id: 'col_c' }, { id: 'col_d' }],
            others: 100,
          },
          type: 'mock type',
          action: 'mock action',
        },
        {
          key: 1,
          severity: SEVERITY.MEDIUM,
          affectedData: {
            values: [{ id: 'col_a' }, { id: 'col_b' }, { id: 'col_c' }, { id: 'col_d' }],
            others: 100,
          },
          type: 'mock type',
          action: 'mock action',
        },
      ]);
    });

    test('should not make data from invalid warning', () => {
      const warnings = [
        {
          name: 'not a legit warning',
          some: 'other',
          invalid: 'stuff',
        },
      ];

      expect(getTableDataFromWarnings(warnings)).toEqual([]);
    });

    test('warning version affects returned cell text', () => {
      const warnings1 = [
        {
          name: WARNING_NAMES.nullsInTargetCol,
          severity: SEVERITY.HIGH,
          affected: {
            values: [{ id: 'col_a' }],
          },
          version: 1,
        },
      ];
      const res1 = getTableDataFromWarnings(warnings1);
      expect(res1).toEqual([
        {
          key: 0,
          severity: SEVERITY.HIGH,
          affectedData: {
            values: [{ id: 'col_a' }],
          },
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
        },
      ]);

      const warnings2 = [
        {
          name: WARNING_NAMES.nullsInTargetCol,
          severity: SEVERITY.MEDIUM,
          affected: {
            values: [{ id: 'col_a' }],
          },
          version: 2,
        },
      ];
      const res2 = getTableDataFromWarnings(warnings2);
      expect(res2).toEqual([
        {
          key: 0,
          severity: SEVERITY.MEDIUM,
          affectedData: {
            values: [{ id: 'col_a' }],
          },
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
        },
      ]);
    });

    test('invalid warning version yields no cell text', () => {
      const warnings = [
        {
          name: WARNING_NAMES.nullsInTargetCol,
          severity: SEVERITY.HIGH,
          affected: {
            values: [{ id: 'col_a' }],
          },
          version: -123,
        },
      ];
      const res = getTableDataFromWarnings(warnings);
      expect(res).toEqual([]);
    });
  });

  describe('getAdditionalInfo', () => {
    test('should correctly retrieve additional_info', () => {
      const warning = {
        additional_info: [
          {
            key: 'key_a',
            value: 'valueA',
          },
          {
            key: 'key_b',
            value: 'valueB',
          },
        ],
      };
      const res = getAdditionalInfo(warning);
      expect(res).toEqual({
        keyA: 'valueA',
        keyB: 'valueB',
      });
    });

    test('should return empty object additional_info is missing', () => {
      expect(getAdditionalInfo({})).toEqual({});
    });
  });

  describe('AffectedDataCell', () => {
    test('should not explode given undefined params', () => {
      expect(shallow(<AffectedDataCell />).isEmptyRender()).toBe(true);
      expect(shallow(<AffectedDataCell data={{}} />).isEmptyRender()).toBe(true);
    });

    test('should not render tags if no columns', () => {
      const wrapper = shallow(<AffectedDataCell data={{ others: 1 }} />);

      expect(wrapper.exists('[data-testid="affected-data-tag"]')).toBe(false);
      expect(wrapper.exists('[data-testid="affected-data-others"]')).toBe(true);
    });

    test('should not render others message if no others', () => {
      const wrapper = shallow(<AffectedDataCell data={{ values: [{ id: 'col_a' }] }} />);

      expect(wrapper.exists('[data-testid="affected-data-tag"]')).toBe(true);
      expect(wrapper.exists('[data-testid="affected-data-others"]')).toBe(false);
    });
  });
});
