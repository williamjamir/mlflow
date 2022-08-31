import React from 'react';
import { mount } from 'enzyme';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import promiseMiddleware from 'redux-promise-middleware';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { withClusterPermissions } from './withClusterPermissions';

class PropTest extends React.Component {
  render() {
    return null;
  }
}

const PropTestWithClusterPermissions = withClusterPermissions(PropTest);

describe('withClusterPermissions', () => {
  const mockStore = configureStore([thunk, promiseMiddleware()]);

  test('withClusterPermissions properly injects cluster permissions props', () => {
    const store = mockStore({
      entities: {
        clusterPermissions: {
          canCreateServingClusters: true,
          error: { message: 'error message' },
        },
      },
    });
    const wrapper = mount(
      <Provider store={store}>
        <BrowserRouter>
          <PropTestWithClusterPermissions />
        </BrowserRouter>
      </Provider>,
    );
    expect(wrapper.find(PropTest).props().canCreateServingClusters).toBe(true);

    expect(wrapper.find(PropTest).props().canCreateServingClustersErrorMessage).toBe(
      'error message',
    );
  });

  test('withClusterPermissions properly injects cluster permissions props when cluster permissions are undefined', () => {
    const store = mockStore({
      entities: {
        clusterPermissions: {},
      },
    });
    const wrapper = mount(
      <Provider store={store}>
        <BrowserRouter>
          <PropTestWithClusterPermissions />
        </BrowserRouter>
      </Provider>,
    );
    expect(wrapper.find(PropTest).props().canCreateServingClusters).toBe(undefined);

    expect(wrapper.find(PropTest).props().canCreateServingClustersErrorMessage).toBe(undefined);
  });
});
