import React from 'react';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import promiseMiddleware from 'redux-promise-middleware';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { Button } from '@databricks/design-system';
import { ConfigureInferenceButtonImpl } from './ConfigureInferenceButton';
import { GenericInputModal } from '../../experiment-tracking/components/modals/GenericInputModal';
import { mountWithIntl } from '../../common/utils/TestUtils';
import { PermissionLevels } from '../constants';
import { shallow } from 'enzyme';

describe('ConfigureInferenceButton', () => {
  let wrapper;
  let minimalProps;
  let minimalStore;
  let mockSearchModelVersionsApi;
  const mockStore = configureStore([thunk, promiseMiddleware()]);

  beforeEach(() => {
    mockSearchModelVersionsApi = jest.fn(() => Promise.resolve({}));
    minimalProps = {
      modelName: 'test_model',
      searchModelVersionsApi: mockSearchModelVersionsApi,
      modelVersions: [],
      permissionLevel: PermissionLevels.CAN_MANAGE,
    };
    minimalStore = mockStore({
      entities: {
        clusterPermissions: {},
        endpointStatus: {},
        endpointStatusV2: {},
        endpointVersionStatus: {},
        endpointVersionStatusV2: {},
        endpointAliases: {},
        inputExampleTypeByModelVersion: {},
      },
      apis: jest.fn((key) => {
        return {};
      }),
    });
    wrapper = mountWithIntl(
      <Provider store={minimalStore}>
        <BrowserRouter>
          <ConfigureInferenceButtonImpl {...minimalProps} />
        </BrowserRouter>
      </Provider>,
    );
  });

  test('should render with minimal props and store without exploding', () => {
    expect(wrapper.find(ConfigureInferenceButtonImpl).length).toBe(1);
    expect(wrapper.find('Button.use-model-btn').prop('disabled')).toBe(false);
    expect(mockSearchModelVersionsApi).toHaveBeenCalledTimes(1);
  });

  test('should hide modal by default', () => {
    expect(wrapper.find(GenericInputModal).prop('isOpen')).toBe(false);
  });

  test('should show modal after button click', () => {
    wrapper.find('Button.use-model-btn').simulate('click');
    expect(wrapper.find(GenericInputModal).prop('isOpen')).toBe(true);
  });

  test('button should be disabled if modelVersions is undefined', () => {
    const props = { ...minimalProps, modelVersions: undefined };
    wrapper = mountWithIntl(
      <Provider store={minimalStore}>
        <BrowserRouter>
          <ConfigureInferenceButtonImpl {...props} />
        </BrowserRouter>
      </Provider>,
    );
    wrapper = shallow(
      <ConfigureInferenceButtonImpl {...{ ...minimalProps, modelVersions: undefined }} />,
    );
    expect(wrapper.find(Button).at(0).prop('disabled')).toBe(true);
  });
});
