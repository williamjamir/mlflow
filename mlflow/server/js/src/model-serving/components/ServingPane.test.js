import React from 'react';
import { mount } from 'enzyme';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import promiseMiddleware from 'redux-promise-middleware';
import { ServingPane } from './ServingPane';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { getServingModelKey } from '../utils';
import {
  mockEndpointStatus,
  mockEndpointVersionStatus,
  mockEndpointVersionStatusV2,
  mockEndpointVersionAlias,
  mockInputExampleTypeState,
  mockEndpointStatusV2,
} from '../test-utils';

describe('ServingPane', () => {
  let wrapper;
  let minimalProps;
  let minimalStore;

  const mockModelName = 'ModelA';
  const mockStore = configureStore([thunk, promiseMiddleware()]);

  beforeEach(() => {
    // TODO: remove global fetch mock by explicitly mocking all the service API calls
    global.fetch = jest.fn(() =>
      Promise.resolve({ ok: true, status: 200, text: () => Promise.resolve('') }),
    );
    minimalProps = {
      modelName: mockModelName,
      enableServingApi: jest.fn(),
      getEndpointStatusApi: jest.fn(),
      listEndpointVersionsApi: jest.fn(),
      disableServingApi: jest.fn(),
      getEndpointVersionLogsApi: jest.fn(),
      listEndpointVersionAliasesApi: jest.fn(),
      listEndpointVersionAliasesV2Api: jest.fn(),
      submitServingRequestApi: jest.fn(),
      getEndpointEventHistoryApi: jest.fn(),
      getEndpointMetricHistoryApi: jest.fn(),
      getSupportedClusterNodeTypes: jest.fn(),
    };

    const modelKey = getServingModelKey(null, mockModelName);
    minimalStore = mockStore({
      entities: {
        endpointStatus: {
          [[modelKey]]: mockEndpointStatus({}),
        },
        endpointStatusV2: {
          [[modelKey]]: mockEndpointStatusV2({}),
        },
        endpointVersionStatus: {
          [[modelKey]]: [mockEndpointVersionStatus({})],
        },
        endpointVersionStatusV2: {
          [[modelKey]]: [mockEndpointVersionStatusV2({})],
        },
        endpointAliases: {
          [[modelKey]]: [mockEndpointVersionAlias({})],
        },
        endpointAliasesV2: {
          [[modelKey]]: [mockEndpointVersionAlias({})],
        },
        inputExampleTypeByModelVersion: {
          [[modelKey]]: mockInputExampleTypeState(mockModelName, []),
        },
      },
      apis: jest.fn((key) => {
        return {};
      }),
    });
  });

  test('should render with minimal props without exploding', () => {
    wrapper = mount(
      <Provider store={minimalStore}>
        <BrowserRouter>
          <ServingPane {...minimalProps} />
        </BrowserRouter>
      </Provider>,
    );
    expect(wrapper.find(ServingPane).length).toBe(1);
  });
});
