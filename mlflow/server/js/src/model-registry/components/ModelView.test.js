import React from 'react';
import { ModelView, ModelViewImpl, StageFilters } from './ModelView';
import { mockModelVersionDetailed, mockRegisteredModelDetailed } from '../test-utils';
import { ModelVersionStatus, Stages } from '../constants';
import { BrowserRouter } from 'react-router-dom';
import { ModelVersionTable } from './ModelVersionTable';
import Utils from '../../common/utils/Utils';
import { getCompareModelVersionsPageRoute } from '../routes';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import promiseMiddleware from 'redux-promise-middleware';
import { RegisteredModelTag } from '../sdk/ModelRegistryMessages';
import { Provider } from 'react-redux';
import { mountWithIntl } from '../../common/utils/TestUtils';
import { DesignSystemProvider } from '@databricks/design-system';
// BEGIN-EDGE
import DatabricksUtils from '../../common/utils/DatabricksUtils';
import { PermissionLevels } from '../constants';
import { PANES } from '../routes';
import { ServingPane } from '../../model-serving/components/ServingPane';
import { MonitoringPane } from '../../model-monitoring/components/MonitoringPane';
import { monitoringTagMock, customMonitoringTagMock } from '../../model-monitoring/testUtils';
import { registerRecent } from '@databricks/web-shared-bundle/recents';

jest.mock('@databricks/web-shared-bundle/recents');
// END-EDGE

describe('ModelView', () => {
  let wrapper;
  let instance;
  let minimalProps;
  let historyMock;
  let minimalStoreRaw;
  let minimalStore;
  let createComponentInstance;
  const mockStore = configureStore([thunk, promiseMiddleware()]);

  const mockModel = {
    name: 'Model A',
    latestVersions: [
      mockModelVersionDetailed('Model A', 1, Stages.PRODUCTION, ModelVersionStatus.READY),
      mockModelVersionDetailed('Model A', 2, Stages.STAGING, ModelVersionStatus.READY),
      mockModelVersionDetailed('Model A', 3, Stages.NONE, ModelVersionStatus.READY),
    ],
    versions: [
      mockModelVersionDetailed('Model A', 1, Stages.PRODUCTION, ModelVersionStatus.READY),
      mockModelVersionDetailed('Model A', 2, Stages.STAGING, ModelVersionStatus.READY),
      mockModelVersionDetailed('Model A', 3, Stages.NONE, ModelVersionStatus.READY),
    ],
    tags: [
      {
        'special key': RegisteredModelTag.fromJs({
          key: 'special key',
          value: 'not so special value',
        }),
      },
    ],
    // BEGIN-EDGE
    permissionLevel: PermissionLevels.CAN_EDIT,
    // END-EDGE
  };

  beforeEach(() => {
    // TODO: remove global fetch mock by explicitly mocking all the service API calls
    global.fetch = jest.fn(() =>
      Promise.resolve({ ok: true, status: 200, text: () => Promise.resolve('') }),
    );
    historyMock = jest.fn();
    minimalProps = {
      model: mockRegisteredModelDetailed(
        mockModel.name,
        mockModel.latestVersions,
        mockModel.tags,
        mockModel.permissionLevel,
      ),
      modelVersions: mockModel.versions,
      handleEditDescription: jest.fn(),
      handleDelete: jest.fn(),
      showEditPermissionModal: jest.fn(),
      // BEGIN-EDGE
      activePane: undefined,
      userLevelEmailSubscriptionStatus: 'SUBSCRIBED',
      // END-EDGE
      history: { push: historyMock },
      tags: {},
      setRegisteredModelTagApi: jest.fn(),
      deleteRegisteredModelTagApi: jest.fn(),
    };
    minimalStoreRaw = {
      entities: {
        tagsByRegisteredModel: {
          'Model A': {
            'special key': RegisteredModelTag.fromJs({
              key: 'special key',
              value: 'not so special value',
            }),
          },
        },
        // BEGIN-EDGE
        endpointStatus: {},
        endpointStatusV2: {},
        endpointVersionStatus: {},
        endpointVersionStatusV2: {},
        endpointAliases: {},
        endpointAliasesV2: {},
        endpointEventHistory: {},
        inputExampleTypeByModelVersion: {},
        supportedClusterNodeTypes: {},
        // END-EDGE
      },
      apis: {},
    };
    minimalStore = mockStore(minimalStoreRaw);

    createComponentInstance = (modelViewProps) =>
      mountWithIntl(
        <DesignSystemProvider>
          <Provider store={minimalStore}>
            <BrowserRouter>
              <ModelView {...modelViewProps} />
            </BrowserRouter>
          </Provider>
        </DesignSystemProvider>,
      );
    // BEGIN-EDGE
    /* eslint-disable no-restricted-globals */
    top.settings = {
      aclChecksEnabledForModelRegistryInCurrentWorkspace: true,
      enableWorkspaceAclsConfig: true,
      enableModelRegistryEmailNotificationsInShard: true,
      mlflowModelRegistryEmailNotificationsEnabled: true,
    };
    // END-EDGE
  });

  // BEGIN-EDGE
  afterEach(() => {
    /* eslint-disable no-restricted-globals */
    top.settings = {};
    jest.resetAllMocks();
  });

  // END-EDGE
  test('should render with minimal props without exploding', () => {
    wrapper = createComponentInstance(minimalProps);
    expect(wrapper.find(ModelView).length).toBe(1);
  });

  // BEGIN-EDGE
  test('should render serving pane without exploding', () => {
    /* eslint-disable no-restricted-globals */
    top.settings = {
      isModelServingEnabledInCurrentWorkspace: true,
    };

    const props = {
      ...minimalProps,
      activePane: PANES.SERVING,
    };
    wrapper = createComponentInstance(props);
    expect(wrapper.find(ServingPane).length).toBe(1);
  });

  test('should render monitoring pane without exploding', () => {
    /* eslint-disable no-restricted-globals */
    top.settings = {
      enableModelMonitoring: true,
    };
    const props = {
      ...minimalProps,
      activePane: PANES.MONITORING,
      model: {
        ...minimalProps.model,
        tags: [monitoringTagMock],
      },
    };

    wrapper = createComponentInstance(props);
    expect(wrapper.find(MonitoringPane).length).toBe(1);
  });

  describe('Model Page Panes', () => {
    const baseSettings = {
      enableModelMonitoring: true,
    };

    const mountWrapper = (passedProps) => createComponentInstance(passedProps);

    it('should render only the Details pane by default', () => {
      wrapper = mountWrapper(minimalProps);
      expect(wrapper.find('[role="tab"]').length).toBe(1);
      const activeTab = wrapper.find('[role="tab"][aria-selected=true]');
      expect(activeTab.text()).toBe('Details');
    });

    it('should include Serving as a pane if serving is enabled', () => {
      /* eslint-disable no-restricted-globals */
      top.settings = {
        isModelServingEnabledInCurrentWorkspace: true,
        ...baseSettings,
      };
      wrapper = mountWrapper({
        ...minimalProps,
        activePane: PANES.SERVING,
      });
      expect(wrapper.find('[role="tab"]').length).toBe(2);
      const activeTab = wrapper.find('[role="tab"][aria-selected=true]');
      expect(activeTab.text()).toBe('Serving');
    });

    it('Displayed pane switches depending on activePane prop', () => {
      /* eslint-disable no-restricted-globals */
      top.settings = {
        isModelServingEnabledInCurrentWorkspace: true,
        ...baseSettings,
      };
      const props = {
        ...minimalProps,
        activePane: PANES.SERVING,
      };
      wrapper = mountWrapper({ ...props });
      expect(wrapper.find('[role="tab"]').length).toBe(2);
      const activeTab = wrapper.find('[role="tab"][aria-selected=true]');
      expect(activeTab.text()).toBe('Serving');

      const newProps = {
        ...minimalProps,
        activePane: PANES.DETAILS,
      };

      // The purpose of this test is to verify the pane switch when activePane
      // is changed. However, by simply calling setProps({...}), the tab
      // selection does not work as expected. By setting `children`, it is
      // fine.
      wrapper.setProps({
        children: createComponentInstance(newProps),
      });
      const newActiveTab = wrapper.find('[role="tab"][aria-selected=true]');
      expect(newActiveTab.text()).toBe('Details');
    });

    it('should default to Details pane if given undefined or nonsense subpage key', () => {
      /* eslint-disable no-restricted-globals */
      top.settings = {
        isModelServingEnabledInCurrentWorkspace: true,
        ...baseSettings,
      };
      wrapper = mountWrapper({
        ...minimalProps,
        model: {
          ...minimalProps.model,
          tags: [monitoringTagMock],
        },
      });
      expect(wrapper.find('[role="tab"]').length).toBe(3);
      const activeTab = wrapper.find('[role="tab"][aria-selected=true]');
      expect(activeTab.text()).toBe('Details');
    });

    describe('Monitoring Pane', () => {
      let monitoringProps;
      let model;

      beforeEach(() => {
        /* eslint-disable no-restricted-globals */
        top.settings = { ...baseSettings };
        model = {
          ...minimalProps.model,
          tags: [monitoringTagMock],
        };
        monitoringProps = {
          ...minimalProps,
          model,
          activePane: PANES.MONITORING,
        };
      });

      it('should include Monitoring as a pane if it has active monitoring tags in the model', () => {
        wrapper = mountWrapper({ ...monitoringProps });
        expect(wrapper.find('[role="tab"]').length).toBe(2);
        const activeTab = wrapper.find('[role="tab"][aria-selected=true]');
        expect(activeTab.text()).toEqual(expect.stringContaining('Monitoring'));
      });

      it('should not include Monitoring pane if the GOC is switched off', () => {
        /* eslint-disable no-restricted-globals */
        top.settings = {
          enableModelMonitoring: false,
        };
        // monitoringProps hard codes the activePane to an invalid value
        // PANES.MONITORING, as the Monitoring pane is not included. Here we
        // reset as undefined.
        const props = {
          ...monitoringProps,
          activePane: undefined,
        };
        wrapper = mountWrapper({ ...props });
        expect(wrapper.find('[role="tab"]').length).toBe(1);
        const activeTab = wrapper.find('[role="tab"][aria-selected=true]');
        expect(activeTab.text()).toBe('Details');
      });

      it('should not include Monitoring as a pane if it only has deleted or zombie monitoring tags', () => {
        wrapper = mountWrapper({
          ...monitoringProps,
          // monitoringProps hard codes the activePane to an invalid value
          // PANES.MONITORING, as the Monitoring pane is not included. Here we
          // reset as undefined.
          activePane: undefined,
          model: {
            ...model,
            tags: [
              customMonitoringTagMock({ status: 'zombie' }),
              customMonitoringTagMock({ status: 'inactive' }),
            ],
          },
        });
        expect(wrapper.find('[role="tab"]').length).toBe(1);
        const activeTab = wrapper.find('[role="tab"][aria-selected=true]');
        expect(activeTab.text()).toBe('Details');
      });

      it('should not explode if monitoring tags includes malformed json', () => {
        wrapper = mountWrapper({
          ...monitoringProps,
          model: {
            ...model,
            tags: [
              monitoringTagMock,
              customMonitoringTagMock({ value: "wait a minute this isn't json" }),
            ],
          },
        });
        expect(wrapper.find('[role="tab"]').length).toBe(2);
        const activeTab = wrapper.find('[role="tab"][aria-selected=true]');
        expect(activeTab.text()).toEqual(expect.stringContaining('Monitoring'));
      });

      describe('public preview', () => {
        beforeEach(() => {
          jest.spyOn(DatabricksUtils, 'getConf').mockImplementation(() => true);
        });

        it('should always show the Monitoring tab even without any monitors', () => {
          wrapper = mountWrapper({
            ...minimalProps,
            model,
            activePane: PANES.MONITORING,
          });
          expect(wrapper.find('[role="tab"]').length).toBe(2);
          const activeTab = wrapper.find('[role="tab"][aria-selected=true]');
          expect(activeTab.text()).toEqual(expect.stringContaining('Monitoring'));
        });

        it('should always show the Monitoring tab with monitors', () => {
          wrapper = mountWrapper(monitoringProps);
          expect(wrapper.find('[role="tab"]').length).toBe(2);
          const activeTab = wrapper.find('[role="tab"][aria-selected=true]');
          expect(activeTab.text()).toEqual(expect.stringContaining('Monitoring'));
        });
      });
    });
  });

  // END-EDGE
  test('should render all model versions initially', () => {
    wrapper = createComponentInstance(minimalProps);
    expect(wrapper.find('td.model-version').length).toBe(3);
    expect(wrapper.find('td.model-version').at(0).text()).toBe('Version 3');
    expect(wrapper.find('td.model-version').at(1).text()).toBe('Version 2');
    expect(wrapper.find('td.model-version').at(2).text()).toBe('Version 1');
  });

  test('should render model version table with activeStageOnly when "Active" button is on', () => {
    wrapper = createComponentInstance(minimalProps);
    expect(wrapper.find(ModelVersionTable).props().activeStageOnly).toBe(false);
    instance = wrapper.find(ModelViewImpl).instance();
    instance.setState({ stageFilter: StageFilters.ACTIVE });
    wrapper.update();
    expect(wrapper.find(ModelVersionTable).props().activeStageOnly).toBe(true);
  });

  // BEGIN-EDGE
  // Don't test things with permissions in OSS.
  test('should render description edit button based on user permissions', () => {
    // should render description edit button if user has edit permissions
    wrapper = createComponentInstance(minimalProps);
    expect(wrapper.find('[data-test-id="descriptionEditButton"]').hostNodes().length).toBe(1);

    // should not render description edit button if user does not have edit permissions
    const readProps = {
      ...minimalProps,
      model: {
        ...minimalProps.model,
        permission_level: PermissionLevels.CAN_READ,
      },
    };
    wrapper.setProps({
      children: createComponentInstance(readProps),
    });
    expect(wrapper.find('[data-test-id="descriptionEditButton"]').hostNodes().length).toBe(0);
  });

  test('should render page header menu based on user permissions', () => {
    // should render menu breadcrumb if user has manage permissions
    let props = {
      ...minimalProps,
      model: {
        ...minimalProps.model,
        permission_level: PermissionLevels.CAN_MANAGE,
      },
    };
    wrapper = createComponentInstance(props);

    // It has an overflow menu
    expect(wrapper.find('button[data-test-id="overflow-menu-trigger"]').length).toBe(1);
    // It has a permissions button
    expect(wrapper.find('button[data-test-id="edit-permissions-button"]').length).toBe(1);

    // should not render menu breadcrumb if user does not have manage permissions
    props = {
      ...minimalProps,
      model: {
        ...minimalProps.model,
        permission_level: PermissionLevels.CAN_EDIT,
      },
    };
    wrapper = createComponentInstance(props);

    expect(wrapper.find('button[data-test-id="overflow-menu-trigger"]').length).toBe(0);
    expect(wrapper.find('button[data-test-id="edit-permissions-button"]').length).toBe(0);
  });

  test('should trigger showEditPermissionModal when permission menu item is clicked', () => {
    const props = {
      ...minimalProps,
      model: {
        ...minimalProps.model,
        permission_level: PermissionLevels.CAN_MANAGE,
      },
    };
    wrapper = createComponentInstance(props);

    wrapper.find('button[data-test-id="edit-permissions-button"]').simulate('click');
    expect(minimalProps.showEditPermissionModal).toHaveBeenCalled();
  });

  test('should show/hide edit permission menu item base on config', () => {
    const props = {
      ...minimalProps,
      model: {
        ...minimalProps.model,
        permission_level: PermissionLevels.CAN_MANAGE,
      },
    };
    DatabricksUtils.isAclCheckEnabledForModelRegistry = jest.fn().mockReturnValue(true);
    wrapper = createComponentInstance(props);

    // should show edit permission menu item when ACL for model registry is enabled
    expect(wrapper.find('button[data-test-id="edit-permissions-button"]').length).toBe(1);

    // should not show edit permission menu item when ACL for model registry is disabled
    // for the org via the feature flag or the "Workspace ACLs" setting.
    DatabricksUtils.isAclCheckEnabledForModelRegistry = jest.fn().mockReturnValue(false);
    wrapper.setProps({
      children: createComponentInstance(props),
    });
    expect(wrapper.find('button[data-test-id="edit-permissions-button"]').length).toBe(0);
  });

  // END-EDGE
  test('Page title is set', () => {
    const mockUpdatePageTitle = jest.fn();
    Utils.updatePageTitle = mockUpdatePageTitle;
    wrapper = createComponentInstance(minimalProps);

    expect(mockUpdatePageTitle.mock.calls[0][0]).toBe('Model A - MLflow Model');
  });

  test('should disable dropdown delete menu item when model has active versions', () => {
    const props = {
      ...minimalProps,
      model: {
        ...minimalProps.model,
        // BEGIN-EDGE
        permission_level: PermissionLevels.CAN_MANAGE,
        // END-EDGE
      },
    };
    wrapper = createComponentInstance(props);

    wrapper.find('button[data-test-id="overflow-menu-trigger"]').simulate('click');
    // The antd `Menu.Item` component converts the `disabled` attribute to `aria-disabled`
    // when generating HTML. Accordingly, we check for the presence of the `aria-disabled`
    // attribute within the rendered HTML.
    const deleteMenuItem = wrapper.find('[data-test-id="delete"]').hostNodes();
    expect(deleteMenuItem.prop('aria-disabled')).toBe(true);
    deleteMenuItem.simulate('click');
    expect(wrapper.find(ModelViewImpl).instance().state.isDeleteModalVisible).toBe(false);
  });

  test('compare button is disabled when no/1 run selected, active when 2+ runs selected', () => {
    wrapper = createComponentInstance(minimalProps);

    expect(wrapper.find('[data-test-id="compareButton"]').hostNodes().length).toBe(1);
    expect(wrapper.find('[data-test-id="compareButton"]').hostNodes().props().disabled).toEqual(
      true,
    );

    wrapper
      .find(ModelViewImpl)
      .instance()
      .setState({
        runsSelected: { run_id_1: 'version_1' },
      });
    wrapper.update();
    expect(wrapper.find('[data-test-id="compareButton"]').hostNodes().props().disabled).toEqual(
      true,
    );

    const twoRunsSelected = { run_id_1: 'version_1', run_id_2: 'version_2' };
    wrapper.find(ModelViewImpl).instance().setState({
      runsSelected: twoRunsSelected,
    });
    wrapper.update();
    expect(wrapper.find('[data-test-id="compareButton"]').hostNodes().props().disabled).toEqual(
      false,
    );

    wrapper.find('[data-test-id="compareButton"]').hostNodes().simulate('click');
    expect(historyMock).toHaveBeenCalledWith(
      getCompareModelVersionsPageRoute(minimalProps['model']['name'], twoRunsSelected),
    );
  });
  // BEGIN-EDGE
  test('should enable dropdown delete menu item when model has no active versions', () => {
    const latestVersions = [
      mockModelVersionDetailed('Model A', 1, Stages.NONE, ModelVersionStatus.READY),
      mockModelVersionDetailed('Model A', 2, Stages.ARCHIVED, ModelVersionStatus.READY),
    ];
    const versions = [
      mockModelVersionDetailed('Model A', 1, Stages.NONE, ModelVersionStatus.READY),
      mockModelVersionDetailed('Model A', 2, Stages.ARCHIVED, ModelVersionStatus.READY),
    ];
    const props = {
      ...minimalProps,
      model: mockRegisteredModelDetailed(
        mockModel.name,
        latestVersions,
        [],
        PermissionLevels.CAN_MANAGE,
      ),
      modelVersions: versions,
    };
    wrapper = createComponentInstance(props);

    wrapper.find('button[data-test-id="overflow-menu-trigger"]').simulate('click');
    // The antd `Menu.Item` component converts the `disabled` attribute to `aria-disabled`
    // when generating HTML. Accordingly, we check for the presence of the `aria-disabled`
    // attribute within the rendered HTML.
    const deleteMenuItem = wrapper.find('[data-test-id="delete"]').hostNodes();
    expect(deleteMenuItem.prop('aria-disabled')).toBeUndefined;
    deleteMenuItem.simulate('click');
    expect(wrapper.find(ModelViewImpl).instance().state.isDeleteModalVisible).toBe(true);
  });

  test('notification menu renders when email notifs are enabled in conf, admin console, and user-level', () => {
    wrapper = mountWithIntl(
      <DesignSystemProvider>
        <Provider store={minimalStore}>
          <BrowserRouter>
            <ModelView {...minimalProps} />
          </BrowserRouter>
        </Provider>
      </DesignSystemProvider>,
    );
    expect(
      wrapper.find('[data-testid="email-notification-preference-dropdown-wrapper"]').length,
    ).toBe(1);
    expect(wrapper.find('[data-testid="email-notification-preference-dropdown"]').length).not.toBe(
      0,
    );
    expect(wrapper.find('[data-testid="email-notification-preference-mark"]').length).not.toBe(0);
  });

  test('notification menu does not render when email notifs are disabled in conf', () => {
    top.settings.enableModelRegistryEmailNotificationsInShard = false;
    top.settings.mlflowModelRegistryEmailNotificationsEnabled = true;
    wrapper = createComponentInstance(minimalProps);

    expect(
      wrapper.find('[data-testid="email-notification-preference-dropdown-wrapper"]').length,
    ).toBe(0);
    expect(wrapper.find('[data-testid="email-notification-preference-dropdown"]').length).toBe(0);
    expect(wrapper.find('[data-testid="email-notification-preference-mark"]').length).toBe(0);
  });

  test('notification menu only shows text and tooltip when email notifs are disabled in admin console', () => {
    top.settings.enableModelRegistryEmailNotificationsInShard = true;
    top.settings.mlflowModelRegistryEmailNotificationsEnabled = false;
    wrapper = createComponentInstance(minimalProps);

    expect(
      wrapper.find('[data-testid="email-notification-preference-dropdown-wrapper"]').length,
    ).toBe(1);
    expect(wrapper.find('[data-testid="email-notification-preference-dropdown"]').length).toBe(0);
    expect(wrapper.find('[data-testid="email-notification-preference-mark"]').length).not.toBe(0);
  });

  test('notification menu only shows text and tooltip when email notifs are disabled at user level', () => {
    top.settings.enableModelRegistryEmailNotificationsInShard = true;
    top.settings.mlflowModelRegistryEmailNotificationsEnabled = true;
    minimalProps.userLevelEmailSubscriptionStatus = 'UNSUBSCRIBED';
    wrapper = createComponentInstance(minimalProps);

    expect(
      wrapper.find('[data-testid="email-notification-preference-dropdown-wrapper"]').length,
    ).toBe(1);
    expect(wrapper.find('[data-testid="email-notification-preference-dropdown"]').length).toBe(0);
    expect(wrapper.find('[data-testid="email-notification-preference-mark"]').length).not.toBe(0);
  });

  describe('Recents Integration', () => {
    test('Once endpoint component is rendered, the registerRecent method should have been called at least once', () => {
      const props = {
        ...minimalProps,
        activePane: PANES.SERVING,
      };
      wrapper = createComponentInstance(props);

      expect(registerRecent).toHaveBeenCalled();
    });

    test('Once model component is rendered, the registerRecent method should have been called at least once', () => {
      const props = {
        ...minimalProps,
        activePane: PANES.DETAILS,
      };
      wrapper = createComponentInstance(props);

      expect(registerRecent).toHaveBeenCalled();
    });

    test("If active pane is 'monitoring', the registerRecent method should not have been called", () => {
      const props = {
        ...minimalProps,
        activePane: PANES.MONITORING,
      };
      wrapper = createComponentInstance(props);

      expect(registerRecent).not.toHaveBeenCalled();
    });
  });

  // END-EDGE

  test('should tags rendered in the UI', () => {
    wrapper = createComponentInstance(minimalProps);

    expect(wrapper.html()).toContain('special key');
    expect(wrapper.html()).toContain('not so special value');
  });

  test('creator description not rendered if user_id is unavailable', () => {
    wrapper = createComponentInstance(minimalProps);

    expect(wrapper.find('[data-testid="model-view-metadata-item"]').length).toBe(2);
    expect(wrapper.find('[data-testid="model-view-metadata"]').text()).toContain('Created Time');
    expect(wrapper.find('[data-testid="model-view-metadata"]').text()).toContain('Last Modified');
  });

  test('creator description rendered if user_id is available', () => {
    const user_id = 'email@databricks.com';
    const props = {
      ...minimalProps,
      model: {
        ...minimalProps.model,
        user_id,
      },
    };
    wrapper = createComponentInstance(props);

    expect(wrapper.find('[data-testid="model-view-metadata-item"]').length).toBe(3);
    expect(wrapper.find('[data-testid="model-view-metadata"]').text()).toContain('Creator');
    expect(wrapper.find('[data-testid="model-view-metadata"]').text()).toContain(user_id);
  });
});
