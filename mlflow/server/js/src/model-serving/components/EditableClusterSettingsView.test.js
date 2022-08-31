import React from 'react';
import { Provider } from 'react-redux';
import {
  EditableClusterSettingsView,
  EditableClusterSettingsViewImpl,
} from './EditableClusterSettingsView';

import configureStore from 'redux-mock-store';

import { mockActualClusterConfig, mockEndpointStatus, mockValidNodeTypes } from '../test-utils';
import { BrowserRouter } from 'react-router-dom';
import { mountWithIntl } from '../../common/utils/TestUtils';
import { DesignSystemProvider } from '@databricks/design-system';

describe('ClusterSettingsView', () => {
  let wrapper;
  let instance;
  let minimalProps;
  let mockStore;
  let store;
  let createComponentInstance;

  const mockModelName = 'ModelA';

  beforeEach(() => {
    minimalProps = {
      modelName: mockModelName,
      endpoint: mockEndpointStatus({
        registered_model_name: mockModelName,
        state: 'ENDPOINT_STATE_READY',
        actual_cluster_config: {},
      }),
      handleSubmit: jest.fn(),
    };
    mockStore = configureStore();
    store = mockStore({
      entities: {
        supportedClusterNodes: mockValidNodeTypes,
      },
    });

    createComponentInstance = (props) =>
      mountWithIntl(
        <DesignSystemProvider>
          <Provider store={store}>
            <BrowserRouter>
              <EditableClusterSettingsView {...props} />
            </BrowserRouter>
          </Provider>
        </DesignSystemProvider>,
      );
  });

  test('should render with minimal props without exploding', () => {
    wrapper = createComponentInstance(minimalProps);
    expect(wrapper.find(EditableClusterSettingsView).length).toBe(1);
  });

  test('should render if actual_cluster_state is undefined', () => {
    const myProps = {
      ...minimalProps,
      endpoint: mockEndpointStatus({
        registered_model_name: mockModelName,
        state: 'ENDPOINT_STATE_READY',
        actual_cluster_config: undefined,
      }),
    };
    wrapper = createComponentInstance(myProps);
    expect(wrapper.find(EditableClusterSettingsView).length).toBe(1);
  });

  test('should render with tags and nodeType defined without exploding', () => {
    const myProps = {
      ...minimalProps,
      endpoint: mockEndpointStatus({
        registered_model_name: mockModelName,
        state: 'ENDPOINT_STATE_READY',
        actual_cluster_config: mockActualClusterConfig,
      }),
    };
    wrapper = createComponentInstance(myProps);
    expect(wrapper.length).toBe(1);
    expect(wrapper.text()).toContain('dummyKey');
    expect(wrapper.text()).toContain('dummyValue');
  });

  test('should display confirm modal when save is clicked', () => {
    wrapper = createComponentInstance(minimalProps);
    expect(wrapper.find('[data-testid="confirm-modal"]').hostNodes().length).toBe(0);
    // Click on save button
    wrapper.find('[data-test-id="serving-cluster-submit"]').at(0).simulate('click');
    expect(wrapper.find('[data-testid="confirm-modal"]').hostNodes().length).toBe(1);
  });

  test('should display callback', (done) => {
    const mockSubmit = jest.fn(() => Promise.resolve({}));
    const myProps = {
      ...minimalProps,
      handleSubmit: mockSubmit,
    };
    wrapper = createComponentInstance(myProps);

    instance = wrapper.find(EditableClusterSettingsViewImpl).instance();
    const spy = jest.spyOn(instance, 'showSuccessNotification');
    const promise = instance.handleSubmit();
    promise.finally(() => {
      expect(mockSubmit).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledTimes(1);
      done();
    });
  });
});
