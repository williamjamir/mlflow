import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import promiseMiddleware from 'redux-promise-middleware';
import {
  mockModelName,
  mockStoreV2,
  mockVersionsV2,
  modelReplicas,
  rawLogsViewWrapper,
  logsViewWrapper,
} from '../test-utils';
import { LogTypes } from '../utils';
import { LogsViewImpl } from './LogsView';

describe('LogsView', () => {
  let wrapper;
  let minimalProps;
  let minimalPropsRawImpl;
  let minimalStore;

  const mockEndpointVersionName = '1';
  const mockStore = configureStore([thunk, promiseMiddleware()]);

  beforeEach(() => {
    // TODO: remove global fetch mock by explicitly mocking all the service API calls
    global.fetch = jest.fn(() =>
      Promise.resolve({ ok: true, status: 200, text: () => Promise.resolve('') }),
    );
    minimalProps = {
      modelName: mockModelName,
      endpointVersionName: mockEndpointVersionName,
      handleServingRequest: jest.fn(() => Promise.resolve({ value: 'HotdogV2' })),
      changeTab: jest.fn(),
      // redux actions
      restartComputeConfigUpdateApi: jest.fn(),
      getVersionReplicasApi: jest.fn(),
      getEndpointVersionLogsV2Api: jest.fn(),
      getEndpointVersionBuildLogsApi: jest.fn(),
    };

    minimalPropsRawImpl = {
      modelName: mockModelName,
      endpointVersionName: mockEndpointVersionName,
      replicas: modelReplicas[mockEndpointVersionName],
      endpointVersion: mockVersionsV2[0],
      // redux actions
      getEndpointVersionLogsV2Api: jest.fn(),
      getEndpointVersionBuildLogsApi: jest.fn(),
    };

    minimalStore = mockStore(mockStoreV2);
  });

  test('Should render correct log type based on selected log type', () => {
    wrapper = logsViewWrapper(minimalStore, minimalProps);

    // Load logs for all replicas by default
    expect(wrapper.find('.serving-logs-textarea').text()).toBe('Hello from ALL');
    wrapper.find(LogsViewImpl).setState({ logType: LogTypes.BUILD_LOGS });
    expect(wrapper.find('.serving-logs-textarea').text()).toBe('Build logs for version 1');
  });

  test('Should trigger build logs API call if build logs are not defined but endpoint is ready', async () => {
    const getBuildLogsApi = jest.fn().mockReturnValue(Promise.resolve({ logs: 'Some logs' }));
    const props = {
      ...minimalPropsRawImpl,
      getEndpointVersionBuildLogsApi: getBuildLogsApi,
    };
    wrapper = rawLogsViewWrapper(minimalStore, props);
    wrapper.update();
    await expect(getBuildLogsApi).toBeCalled();
  });
});
