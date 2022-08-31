import {
  awaitComponentPromises,
  mockStoreV1,
  mockStoreV2,
  mockVersions,
  mockVersionsV2,
  rawCallModelViewWrapper,
} from '../test-utils';
import { CallModelViewImpl } from './CallModelView';
import { ENDPOINT_VERSIONS } from '../utils';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import promiseMiddleware from 'redux-promise-middleware';
import { ErrorWrapper } from '../../common/utils/ErrorWrapper';

describe('CallModelView', () => {
  let wrapper;
  let minimalPropsV1;
  let minimalStoreV1;
  let minimalPropsV2;
  let minimalStoreV2;
  const mockModelName = 'ModelA';
  const mockStore = configureStore([thunk, promiseMiddleware()]);

  beforeEach(() => {
    minimalPropsV1 = {
      modelName: mockModelName,
      servingVersion: ENDPOINT_VERSIONS.V1,
      endpointVersionName: mockVersions[0].endpoint_version_name,
      invocationPathPrefix: 'some-path',
      isModelVersionReady: true,

      // redux state
      endpointVersionExampleTypes: {},
      submitServingRequestApi: jest.fn(),
      submitServingRequestV2Api: jest.fn(),
    };
    minimalPropsV2 = {
      modelName: mockModelName,
      servingVersion: ENDPOINT_VERSIONS.V2,
      endpointVersionName: mockVersionsV2[0].endpoint_version_name,
      invocationPathPrefix: 'some-path',
      isModelVersionReady: true,

      // redux state
      endpointVersionExampleTypes: {},
      submitServingRequestApi: jest.fn(),
      submitServingRequestV2Api: jest.fn(),
    };
    minimalStoreV1 = mockStore(mockStoreV1);
    minimalStoreV2 = mockStore(mockStoreV2);
  });

  test('should handle successful serving requests', async () => {
    const expectedVersion = minimalPropsV1.endpointVersionName;
    const expectedRequest = '{"request": "body"}';
    const expectedResponse = [{ 0: 2426.6474609375 }];
    const expectedResponseText = '[{"0":2426.6474609375}]';
    const handleServingRequest = jest
      .fn()
      .mockReturnValue(Promise.resolve({ value: expectedResponse }));
    const myProps = {
      ...minimalPropsV1,
      submitServingRequestApi: handleServingRequest,
    };

    wrapper = rawCallModelViewWrapper(minimalStoreV1, myProps);
    const callModelViewInstance = wrapper.find(CallModelViewImpl).instance();

    callModelViewInstance.setState({ requestBody: expectedRequest });
    expect(wrapper.find('.submit-request-button button').prop('disabled')).toBe(false);

    wrapper.find('.submit-request-button').at(0).simulate('click');

    // Ensure the request button is disabled while the request is in progress.
    expect(wrapper.find('.submit-request-button button').prop('disabled')).toBe(true);
    await expect(handleServingRequest).toBeCalledWith(
      minimalPropsV1.modelName,
      expectedVersion,
      expectedRequest,
      expect.anything(),
      expect.anything(),
    );
    await awaitComponentPromises(() => {
      wrapper.update();
      expect(wrapper.find('.serving-response-textarea').at(0).text()).toBe(expectedResponseText);
      expect(wrapper.find('.submit-request-button button').prop('disabled')).toBe(false);
    });
  });

  test('should handle failed serving requests', async () => {
    const expectedVersion = minimalPropsV1.endpointVersionName;
    const expectedRequest = '{"request": "body"}';
    const expectedError = 'Everything went horribly!';
    const myError = new ErrorWrapper(expectedError, 500);
    const handleServingRequest = jest.fn().mockReturnValue(Promise.reject(myError));
    const myProps = {
      ...minimalPropsV1,
      submitServingRequestApi: handleServingRequest,
    };

    wrapper = rawCallModelViewWrapper(minimalStoreV1, myProps);
    const callModelViewInstance = wrapper.find(CallModelViewImpl).instance();

    callModelViewInstance.setState({ requestBody: expectedRequest });
    expect(wrapper.find('.submit-request-button button').prop('disabled')).toBe(false);

    wrapper.find('.submit-request-button').at(0).simulate('click');
    // Ensure the request button is disabled while the request is in progress.
    await expect(handleServingRequest).toBeCalledWith(
      minimalPropsV1.modelName,
      expectedVersion,
      expectedRequest,
      expect.anything(),
      expect.anything(),
    );
    await awaitComponentPromises(() => {
      wrapper.update();
      expect(wrapper.find('.serving-response-textarea').at(0).text()).toBe(expectedError);
      expect(wrapper.find('.submit-request-button button').prop('disabled')).toBe(false);
    });
  });

  test('should handle successful serving requests in V2', async () => {
    const expectedVersion = minimalPropsV2.endpointVersionName;
    const expectedRequest = '{"request": "body"}';
    const expectedResponse = [{ 0: 2426.6474609375 }];
    const expectedResponseText = '[{"0":2426.6474609375}]';
    const handleServingRequest = jest
      .fn()
      .mockReturnValue(Promise.resolve({ value: expectedResponse }));
    const myProps = {
      ...minimalPropsV2,
      submitServingRequestV2Api: handleServingRequest,
    };

    wrapper = rawCallModelViewWrapper(minimalStoreV2, myProps);
    const callModelViewInstance = wrapper.find(CallModelViewImpl).instance();

    callModelViewInstance.setState({ requestBody: expectedRequest });
    expect(wrapper.find('.submit-request-button button').prop('disabled')).toBe(false);

    wrapper.find('.submit-request-button').at(0).simulate('click');

    // Ensure the request button is disabled while the request is in progress.
    expect(wrapper.find('.submit-request-button button').prop('disabled')).toBe(true);
    await expect(handleServingRequest).toBeCalledWith(
      minimalPropsV2.modelName,
      expectedVersion,
      expectedRequest,
      expect.anything(),
      expect.anything(),
    );
    await awaitComponentPromises(() => {
      wrapper.update();
      expect(wrapper.find('.serving-response-textarea').at(0).text()).toBe(expectedResponseText);
      expect(wrapper.find('.submit-request-button button').prop('disabled')).toBe(false);
    });
  });

  test('should handle failed serving requests in V2', async () => {
    const expectedVersion = minimalPropsV2.endpointVersionName;
    const expectedRequest = '{"request": "body"}';
    const expectedError = 'Everything went horribly!';
    const myError = new ErrorWrapper(expectedError, 500);
    const handleServingRequest = jest.fn().mockReturnValue(Promise.reject(myError));
    const myProps = {
      ...minimalPropsV2,
      submitServingRequestV2Api: handleServingRequest,
    };

    wrapper = rawCallModelViewWrapper(minimalStoreV2, myProps);
    const callModelViewInstance = wrapper.find(CallModelViewImpl).instance();

    callModelViewInstance.setState({ requestBody: expectedRequest });
    expect(wrapper.find('.submit-request-button button').prop('disabled')).toBe(false);

    wrapper.find('.submit-request-button').at(0).simulate('click');
    // Ensure the request button is disabled while the request is in progress.
    await expect(handleServingRequest).toBeCalledWith(
      minimalPropsV2.modelName,
      expectedVersion,
      expectedRequest,
      expect.anything(),
      expect.anything(),
    );
    await awaitComponentPromises(() => {
      wrapper.update();
      expect(wrapper.find('.serving-response-textarea').at(0).text()).toBe(expectedError);
      expect(wrapper.find('.submit-request-button button').prop('disabled')).toBe(false);
    });
  });

  test('disable sending serving request button when version is Pending in V2', () => {
    const myProps = {
      ...minimalPropsV2,
      isModelVersionReady: false,
    };
    wrapper = rawCallModelViewWrapper(minimalStoreV2, myProps);

    expect(wrapper.find('.submit-request-button button').prop('disabled')).toBe(true);
  });
});
