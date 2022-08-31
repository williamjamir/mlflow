import React from 'react';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import promiseMiddleware from 'redux-promise-middleware';

import { Button } from '@databricks/design-system';

import { EnableServing } from './EnableServing';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { mountWithIntl } from '../../common/utils/TestUtils';
import { PermissionLevels } from '../../model-registry/constants';

import DatabricksUtils from '../../common/utils/DatabricksUtils';

describe('EnableServing', () => {
  const mockStore = configureStore([thunk, promiseMiddleware()]);

  function setupEnableServingWithIntl(store, modelPermissionLevel) {
    return mountWithIntl(
      <Provider store={store}>
        <BrowserRouter>
          <EnableServing
            modelPermissionLevel={modelPermissionLevel}
            handleEnableServing={jest.fn()}
            handleEnableServingV2={jest.fn()}
          />
        </BrowserRouter>
      </Provider>,
    );
  }

  test('Enable serving button is loading and disabled if the cluster perm is unknown', () => {
    const store = mockStore({
      entities: {
        clusterPermissions: {},
      },
      apis: jest.fn((key) => {
        return {};
      }),
    });
    const wrapper = setupEnableServingWithIntl(store, PermissionLevels.CAN_MANAGE);

    expect(wrapper.find(Button).at(0).props().disabled).toBe(true);
    expect(wrapper.find(Button).at(0).props().loading).toBe(true);
  });

  test('Enable serving button is disabled if the user does not have cluster perm', () => {
    const store = mockStore({
      entities: {
        clusterPermissions: {
          canCreateServingClusters: false,
        },
      },
      apis: jest.fn((key) => {
        return {};
      }),
    });
    const wrapper = setupEnableServingWithIntl(store, PermissionLevels.CAN_MANAGE);

    expect(wrapper.find(Button).at(0).props().loading).toBe(false);
    expect(wrapper.find(Button).at(0).props().disabled).toBe(true);
  });

  test('Enable serving button is enabled if the user does have cluster perm', () => {
    const store = mockStore({
      entities: {
        clusterPermissions: {
          canCreateServingClusters: true,
        },
      },
      apis: jest.fn((key) => {
        return {};
      }),
    });
    const wrapper = setupEnableServingWithIntl(store, PermissionLevels.CAN_MANAGE);

    expect(wrapper.find(Button).at(0).props().disabled).toBe(false);
    expect(wrapper.find(Button).at(0).props().loading).toBe(false);
    expect(wrapper.find(Button).at(0).text()).toBe('Enable Serving');
  });

  test('Enable serving button is disabled if the user does not have CAN_MANAGE rights on the model.', () => {
    const store = mockStore({
      entities: {
        clusterPermissions: {
          canCreateServingClusters: true,
        },
      },
      apis: jest.fn((key) => {
        return {};
      }),
    });
    const wrapper = setupEnableServingWithIntl(store, PermissionLevels.CAN_READ);

    expect(wrapper.find(Button).at(0).props().disabled).toBe(true);
    expect(wrapper.find(Button).at(0).props().loading).toBe(false);
  });

  test('Enable serving button is disabled if serving v1 and v2 are disabled for the workspace.', () => {
    const disabledSpy = jest
      .spyOn(DatabricksUtils, 'modelServingEndpointCreationEnabled')
      .mockImplementation(() => false);
    expect(DatabricksUtils.modelServingEndpointCreationEnabled()).toEqual(false);

    const store = mockStore({
      entities: {
        clusterPermissions: {
          canCreateServingClusters: true,
        },
      },
      apis: jest.fn((key) => {
        return {};
      }),
    });
    const wrapper = setupEnableServingWithIntl(store, PermissionLevels.CAN_MANAGE);

    expect(wrapper.find(Button).at(0).props().disabled).toBe(true);

    disabledSpy.mockRestore();
  });

  test('Error message is displayed when we failed to fetch cluster perms.', () => {
    const store = mockStore({
      entities: {
        clusterPermissions: {
          canCreateServingClusters: true,
          error: { message: 'Error message!' },
        },
      },
      apis: jest.fn((key) => {
        return {};
      }),
    });
    const wrapper = setupEnableServingWithIntl(store, PermissionLevels.CAN_READ);

    expect(wrapper.find('.error-message').at(0).text()).toBe(
      'Failed to fetch create cluster permissions: Error message!',
    );
  });

  test('Enable serverless real-time inference button is enabled if v2 is enabled', () => {
    // Test button enabled even when v1 is disabled
    const v1DisabledSpy = jest
      .spyOn(DatabricksUtils, 'modelServingEndpointCreationEnabled')
      .mockImplementation(() => false);
    expect(DatabricksUtils.modelServingEndpointCreationEnabled()).toEqual(false);
    const v2EnabledSpy = jest
      .spyOn(DatabricksUtils, 'modelServingV2EndpointCreationEnabled')
      .mockImplementation(() => true);
    expect(DatabricksUtils.modelServingV2EndpointCreationEnabled()).toEqual(true);

    const store = mockStore({
      entities: {
        clusterPermissions: {
          canCreateServingClusters: true,
        },
      },
      apis: jest.fn((key) => {
        return {};
      }),
    });
    const wrapper = setupEnableServingWithIntl(store, PermissionLevels.CAN_MANAGE);

    expect(wrapper.find(Button).at(0).props().disabled).toBe(false);
    expect(wrapper.find(Button).at(0).props().loading).toBe(false);
    expect(wrapper.find(Button).at(0).text()).toBe('Enable Serverless Real-Time Inference');

    v1DisabledSpy.mockRestore();
    v2EnabledSpy.mockRestore();
  });
});
