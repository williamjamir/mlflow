import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import promiseMiddleware from 'redux-promise-middleware';
import {
  mockEndpointVersionAlias,
  mockModelName,
  mockPendingEndpointVersionStatusV2,
  mockReadyEndpointVersionStatusV2,
  mockStoreV2,
  modelEndpointVersionViewWrapper,
} from '../test-utils';
import { getServingModelKey } from '../utils';
import { ModelEndpointVersionViewImpl } from './ModelEndpointVersionView';

describe('ModelEndpointVersionView', () => {
  let wrapper;
  let minimalProps;
  let minimalStore;
  let modelKey;

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

    modelKey = getServingModelKey(null, mockModelName);
    minimalStore = mockStore(mockStoreV2);
  });

  test('should render with default values without exploding', () => {
    const store = {
      ...minimalStore,
      endpointStatus: {},
    };
    wrapper = modelEndpointVersionViewWrapper(store, minimalProps);
    expect(wrapper.find(ModelEndpointVersionViewImpl).length).toBe(1);
  });

  test('should render all model urls in servingV2', () => {
    const mockEndpointVersionStatusesV2 = [
      mockReadyEndpointVersionStatusV2,
      mockPendingEndpointVersionStatusV2,
    ];
    const mockAliasesV2 = [
      mockEndpointVersionAlias({ alias: 'Production', endpoint_version_name: '1' }),
    ];

    const store = mockStore({
      entities: {
        ...minimalStore.getState().entities,
        endpointVersionStatusV2: { [[modelKey]]: mockEndpointVersionStatusesV2 },
        endpointAliasesV2: { [[modelKey]]: mockAliasesV2 },
      },
    });
    wrapper = modelEndpointVersionViewWrapper(store, minimalProps);

    expect(wrapper.find('span[data-testid="serving-model-urls"]').length).toBe(2);
    // Copy icons for model URLs appear
    expect(wrapper.find('.anticon-copy').length).toBe(2);
    expect(wrapper.find('span[data-testid="serving-model-urls"]').at(0).text()).toBe(
      'https://localhost/model-endpoint/ModelA/1/invocations',
    );
    expect(wrapper.find('span[data-testid="serving-model-urls"]').at(1).text()).toBe(
      'https://localhost/model-endpoint/ModelA/Production/invocations',
    );
  });
});
