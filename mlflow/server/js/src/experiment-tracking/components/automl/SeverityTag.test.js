import React from 'react';
import { shallow } from 'enzyme';

import { SEVERITY, severitySorter, SeverityTag } from './SeverityTag';

describe('SeverityTag', () => {
  test('should return empty render given invalid severity', () => {
    const wrapper = shallow(<SeverityTag severity='some invalid severity' />);

    expect(wrapper.isEmptyRender()).toBe(true);
  });

  test('should return empty render given no severity', () => {
    const wrapper = shallow(<SeverityTag />);

    expect(wrapper.isEmptyRender()).toBe(true);
  });
});

describe('severitySorter', () => {
  test('should sort correctly', () => {
    const warnings = [
      { severity: SEVERITY.HIGH },
      { severity: SEVERITY.LOW },
      { severity: SEVERITY.MEDIUM },
    ];

    expect(warnings.sort(severitySorter)).toEqual([
      { severity: SEVERITY.LOW },
      { severity: SEVERITY.MEDIUM },
      { severity: SEVERITY.HIGH },
    ]);
  });
});
