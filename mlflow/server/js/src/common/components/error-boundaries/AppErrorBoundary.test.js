import React from 'react';
import { shallow } from 'enzyme';
import AppErrorBoundary from './AppErrorBoundary';
import { SupportPageUrl } from '../../constants';

describe('AppErrorBoundary', () => {
  let wrapper;
  let minimalProps;

  beforeEach(() => {
    minimalProps = {
      // BEGIN-EDGE
      service: 'mlflow',
      // END-EDGE
      children: 'testChild',
    };
    wrapper = shallow(<AppErrorBoundary {...minimalProps} />);
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should render with minimal props without exploding', () => {
    expect(wrapper.text()).toEqual('testChild');
    expect(wrapper.find('.error-image').length).toBe(0);
  });

  test('test componentDidCatch causes error message to render', () => {
    const instance = wrapper.instance();
    instance.componentDidCatch('testError', 'testInfo');
    instance.forceUpdate();
    expect(wrapper.find('.error-image').length).toBe(1);
    expect(wrapper.text()).not.toMatch('testChild');
    expect(wrapper.find({ href: SupportPageUrl }).length).toBe(1);
  });
  // BEGIN-EDGE
  test('test componentDidCatch calls parent error handler', () => {
    const mockOnError = jest.fn();
    window.top.onerror = mockOnError;
    const instance = wrapper.instance();
    const errorObj = new Error('test error');
    instance.componentDidCatch(errorObj, 'testInfo');
    instance.forceUpdate();
    expect(mockOnError).toHaveBeenCalled();
    expect(mockOnError).toHaveBeenCalledWith(
      'MLflow UI Error: test error',
      null,
      null,
      null,
      errorObj,
      {
        showErrorToUser: false,
        jsExceptionService: 'mlflow',
      },
    );
  });
  // END-EDGE
});
