import React from 'react';
import { mount } from 'enzyme';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import promiseMiddleware from 'redux-promise-middleware';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { withServing } from './withServing';
import { getServingModelKey } from '../utils';
import { mockEndpoint, mockEndpointV2 } from '../test-utils';

class PropTest extends React.Component {
  render() {
    return null;
  }
}

const PropTestWithServing = withServing(PropTest);

describe('withServing', () => {
  const mockStore = configureStore([thunk, promiseMiddleware()]);

  beforeEach(() => {
    // TODO: remove global fetch mock by explicitly mocking all the service API calls
    global.fetch = jest.fn(() =>
      Promise.resolve({ ok: true, status: 200, text: () => Promise.resolve('') }),
    );
  });

  test('withServing properly injects serving state props', () => {
    const mockModelName = 'Model A';
    const servingKey = getServingModelKey(null, mockModelName);
    const expectedProps = {
      modelName: mockModelName,
      endpoint: mockEndpoint,
      endpointV2: mockEndpointV2,
    };

    const minimalProps = {
      modelName: mockModelName,
      enableServingApi: jest.fn(),
      getEndpointStatusApi: jest.fn(),
      listEndpointVersionsApi: jest.fn(),
      disableServingApi: jest.fn(),
      getEndpointVersionLogsApi: jest.fn(),
      listEndpointVersionAliasesApi: jest.fn(),
      listEndpointVersionAliasesV2Api: jest.fn(),
      getEndpointEventHistoryApi: jest.fn(),
      getEndpointMetricHistoryApi: jest.fn(),
      getSupportedClusterNodeTypes: jest.fn(),
    };
    const store = mockStore({
      entities: {
        endpointStatus: {
          [servingKey]: expectedProps.endpoint,
        },
        endpointStatusV2: {
          [servingKey]: expectedProps.endpointV2,
        },
        endpointVersionStatus: {
          [servingKey]: expectedProps.endpointVersions,
        },
        endpointVersionStatusV2: {
          [servingKey]: expectedProps.endpointVersionsV2,
        },
        endpointAliases: {
          [servingKey]: expectedProps.aliases,
        },
        endpointAliasesV2: {
          [servingKey]: expectedProps.aliasesV2,
        },
        inputExampleTypeByModelVersion: {
          [servingKey]: expectedProps.endpointVersionExampleTypes,
        },
      },
      apis: jest.fn((key) => {
        return {};
      }),
    });
    const wrapper = mount(
      <Provider store={store}>
        <BrowserRouter>
          <PropTestWithServing {...minimalProps} />
        </BrowserRouter>
      </Provider>,
    );

    for (const [key, val] of Object.entries(expectedProps)) {
      expect(wrapper.find(PropTest).prop(key)).toEqual(val);
    }
  });
});
