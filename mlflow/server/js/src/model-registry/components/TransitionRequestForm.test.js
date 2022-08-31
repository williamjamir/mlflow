import React from 'react';
import { TransitionRequestForm } from './TransitionRequestForm';
import { ACTIVE_STAGES, Stages } from '../constants';
import { Checkbox } from 'antd';
import _ from 'lodash';
import { mountWithIntl } from '../../common/utils/TestUtils';

describe('TransitionRequestForm', () => {
  let wrapper;
  let minimalProps;

  beforeEach(() => {
    minimalProps = {
      form: { getFieldDecorator: jest.fn(() => (c) => c) },
    };
  });

  test('should render with minimal props without exploding', () => {
    wrapper = mountWithIntl(<TransitionRequestForm {...minimalProps} />);
    expect(wrapper.length).toBe(1);

    // checkbox should not exist if toStage is not specified
    expect(wrapper.find(Checkbox).length).toBe(0);
  });

  test('should render checkbox only for active stage', () => {
    const [activeStages, nonActiveStages] = _.partition(Stages, (s) => ACTIVE_STAGES.includes(s));

    let isApproval = true;
    activeStages.forEach((toStage) => {
      const props = { ...minimalProps, toStage, isApproval };
      wrapper = mountWithIntl(<TransitionRequestForm {...props} />);
      expect(wrapper.find(Checkbox).length).toBe(1);
    });

    nonActiveStages.forEach((toStage) => {
      const props = { ...minimalProps, toStage, isApproval };
      wrapper = mountWithIntl(<TransitionRequestForm {...props} />);
      expect(wrapper.find(Checkbox).length).toBe(0);
    });

    isApproval = false;
    activeStages.forEach((toStage) => {
      const props = { ...minimalProps, toStage, isApproval };
      wrapper = mountWithIntl(<TransitionRequestForm {...props} />);
      expect(wrapper.find(Checkbox).length).toBe(0);
    });

    nonActiveStages.forEach((toStage) => {
      const props = { ...minimalProps, toStage, isApproval };
      wrapper = mountWithIntl(<TransitionRequestForm {...props} />);
      expect(wrapper.find(Checkbox).length).toBe(0);
    });
  });
});
