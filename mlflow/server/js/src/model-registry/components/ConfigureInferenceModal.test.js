import React from 'react';
import { GenericInputModal } from '../../experiment-tracking/components/modals/GenericInputModal';
import {
  ConfigureInferenceModalWithIntl,
  ConfigureInferenceModalImpl,
} from './ConfigureInferenceModal';
import { ConfigureInferenceTabs } from './ConfigureInferenceForm';
import { mountWithIntl, shallowWithInjectIntl } from '../../common/utils/TestUtils';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import promiseMiddleware from 'redux-promise-middleware';
import { Provider } from 'react-redux';
import { EnableServingButton } from '../../model-serving/components/EnableServingButton';
import { PermissionLevels } from '../constants';

describe('ConfigureInferenceModal', () => {
  let wrapper;
  let minimalProps;
  let mockGenerateBatchInferenceNotebookApi;
  let pushSpy;
  let minimalStore;
  const mockStore = configureStore([thunk, promiseMiddleware()]);
  const viewEndpointsButtonText = 'View existing real-time inference';

  beforeEach(() => {
    minimalStore = mockStore({ entities: { clusterPermissions: {} } });
    pushSpy = jest.fn();
    const history = {
      location: {
        pathName: '/models',
        search: '',
      },
      push: pushSpy,
    };
    mockGenerateBatchInferenceNotebookApi = jest.fn(() => Promise.resolve({}));
    minimalProps = {
      permissionLevel: PermissionLevels.CAN_MANAGE,
      modelVersions: [],
      modalVisible: true,
      modelName: 'testName',
      hideModal: jest.fn(),
      handleEnableServing: jest.fn(),
      handleEnableServingV2: jest.fn(),
      history,
      generateBatchInferenceNotebookApi: mockGenerateBatchInferenceNotebookApi,
    };
    /* eslint-disable no-restricted-globals */
    top.settings = {
      isModelServingEnabledInCurrentWorkspace: true,
    };
    wrapper = shallowWithInjectIntl(<ConfigureInferenceModalWithIntl {...minimalProps} />);
  });

  test('should render with minimal props without exploding', () => {
    expect(wrapper.length).toBe(1);
    expect(wrapper.find(GenericInputModal).length).toBe(1);
  });

  test('real-time tab should render enable serving button if no endpoint exists', () => {
    const props = { ...minimalProps, endpoint: undefined };
    wrapper = mountWithIntl(
      <Provider store={minimalStore}>
        <ConfigureInferenceModalWithIntl {...props} />
      </Provider>,
    );
    wrapper
      .find(ConfigureInferenceModalImpl)
      .setState({ activeKey: ConfigureInferenceTabs.REAL_TIME });
    expect(wrapper.find(EnableServingButton).length).toBe(1);
  });

  test('real-time tab should not render enable serving button if endpoint exists', () => {
    const props = { ...minimalProps, endpoint: {} };
    wrapper = mountWithIntl(
      <Provider store={minimalStore}>
        <ConfigureInferenceModalWithIntl {...props} />
      </Provider>,
    );
    wrapper
      .find(ConfigureInferenceModalImpl)
      .setState({ activeKey: ConfigureInferenceTabs.REAL_TIME });
    expect(wrapper.find(EnableServingButton).length).toBe(0);
  });

  test('real-time tab should render view endpoints button if endpoint exists', () => {
    const props = { ...minimalProps, endpoint: {} };
    wrapper = mountWithIntl(
      <Provider store={minimalStore}>
        <ConfigureInferenceModalWithIntl {...props} />
      </Provider>,
    );
    wrapper
      .find(ConfigureInferenceModalImpl)
      .setState({ activeKey: ConfigureInferenceTabs.REAL_TIME });
    expect(wrapper.find('button[data-test-id="view-real-time-endpoints-btn"]').length).toBe(1);
    expect(wrapper.find('button[data-test-id="view-real-time-endpoints-btn"]').text()).toBe(
      viewEndpointsButtonText,
    );
  });

  test('real-time tab should render view endpoints button if fetch endpoints is loading', () => {
    const props = { ...minimalProps, loading: true };
    wrapper = mountWithIntl(
      <Provider store={minimalStore}>
        <ConfigureInferenceModalWithIntl {...props} />
      </Provider>,
    );
    wrapper
      .find(ConfigureInferenceModalImpl)
      .setState({ activeKey: ConfigureInferenceTabs.REAL_TIME });
    expect(wrapper.find('button[data-test-id="view-real-time-endpoints-btn"]').text()).toBe(
      viewEndpointsButtonText,
    );
  });

  test('batch-inference tab should render button with proper text', () => {
    const props = { ...minimalProps, loading: true };
    wrapper = mountWithIntl(
      <Provider store={minimalStore}>
        <ConfigureInferenceModalWithIntl {...props} />
      </Provider>,
    );
    wrapper
      .find(ConfigureInferenceModalImpl)
      .setState({ activeKey: ConfigureInferenceTabs.BATCH_INFERENCE });
    expect(wrapper.find('.ant-modal-footer .ant-btn-primary').text()).toBe(
      'Use model for batch inference',
    );
  });

  test('batch-inference tab should not render enable serving button', () => {
    const props = { ...minimalProps, endpoint: {} };
    wrapper = mountWithIntl(
      <Provider store={minimalStore}>
        <ConfigureInferenceModalWithIntl {...props} />
      </Provider>,
    );
    wrapper
      .find(ConfigureInferenceModalImpl)
      .setState({ activeKey: ConfigureInferenceTabs.BATCH_INFERENCE });
    expect(wrapper.find(EnableServingButton).length).toBe(0);
  });

  test('form submission on batch tab should result in generateBatchInferenceNotebookApi call', (done) => {
    wrapper.setState({ activeKey: ConfigureInferenceTabs.BATCH_INFERENCE });
    const promise = wrapper.find(GenericInputModal).prop('handleSubmit')({ 'Model Version': '1' });
    promise.finally(() => {
      expect(mockGenerateBatchInferenceNotebookApi).toHaveBeenCalledTimes(1);
      // only form submissions on the real-time tab should push to history
      expect(pushSpy).toHaveBeenCalledTimes(0);
      done();
    });
  });

  test('button click on real-time tab should result in history push', () => {
    const props = { ...minimalProps, endpoint: {} };
    wrapper = mountWithIntl(<ConfigureInferenceModalWithIntl {...props} />);
    wrapper
      .find(ConfigureInferenceModalImpl)
      .setState({ activeKey: ConfigureInferenceTabs.REAL_TIME });
    expect(wrapper.find('button[data-test-id="view-real-time-endpoints-btn"]').length).toBe(1);
    wrapper.find('button[data-test-id="view-real-time-endpoints-btn"]').simulate('click');
    expect(mockGenerateBatchInferenceNotebookApi).toHaveBeenCalledTimes(0);
    expect(pushSpy).toHaveBeenCalledTimes(1);
  });
});
