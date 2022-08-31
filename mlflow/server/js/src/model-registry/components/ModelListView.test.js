import React from 'react';
import { ModelListView, ModelListViewImpl } from './ModelListView';
import { mockModelVersionDetailed, mockRegisteredModelDetailed } from '../test-utils';
import { ModelVersionStatus, Stages } from '../constants';
import { BrowserRouter } from 'react-router-dom';
import Utils from '../../common/utils/Utils';
import { ModelRegistryDocUrl } from '../../common/constants';
// BEGIN-EDGE
import { mount } from 'enzyme';
import { PermissionLevels, EMPTY_CELL_PLACEHOLDER } from '../constants';
import DatabricksUtils from '../../common/utils/DatabricksUtils';
import { oss_test } from '../../common/utils/DatabricksTestUtils';
import { DatabricksModelRegistryDocUrl } from '../../common/constants-databricks';
import { getServingModelKey } from '../../model-serving/utils';
import { mockEndpointStatus } from '../../model-serving/test-utils';
import { CloudProvider } from '../../shared/constants-databricks';
import { monitoringTagMock } from 'src/model-monitoring/testUtils';
// END-EDGE
import { Table } from 'antd';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import promiseMiddleware from 'redux-promise-middleware';
import { Provider } from 'react-redux';
import { mountWithIntl } from '../../common/utils/TestUtils';

const mockStore = configureStore([thunk, promiseMiddleware()]);

const ANTD_TABLE_PLACEHOLDER_CLS = 'tr.ant-table-placeholder';

describe('ModelListView', () => {
  let wrapper;
  let instance;
  let minimalProps;
  let minimalStore;
  let onSearchSpy;

  beforeEach(() => {
    onSearchSpy = jest.fn();
    minimalProps = {
      models: [],
      searchInput: '',
      orderByKey: 'name',
      orderByAsc: true,
      currentPage: 1,
      nextPageToken: null, // no next page
      selectedStatusFilter: '',
      selectedOwnerFilter: '',
      onSearch: onSearchSpy,
      onClear: jest.fn(),
      onClickNext: jest.fn(),
      onClickPrev: jest.fn(),
      onClickSortableColumn: jest.fn(),
      onSetMaxResult: jest.fn(),
      getMaxResultValue: jest.fn().mockReturnValue(10),
      onSearchInputChange: jest.fn(),
      onStatusFilterChange: jest.fn(),
      onOwnerFilterChange: jest.fn(),
      // BEGIN-EDGE
      permissionLevel: PermissionLevels.CAN_READ,
      showEditPermissionModal: jest.fn(),
      handleOwnerFilterChange: jest.fn(),
      handleStatusFilterChange: jest.fn(),
      // END-EDGE
    };
    minimalStore = mockStore({});
    // BEGIN-EDGE
    /* eslint-disable no-restricted-globals */
    top.settings = {
      aclChecksEnabledForModelRegistryInCurrentWorkspace: true,
      enableWorkspaceAclsConfig: true,
      isModelRegistryWidePermissionsEnabledInCurrentWorkspace: true,
    };
    // END-EDGE
  });

  function setupModelListViewWithIntl(propsParam) {
    const props = propsParam || minimalProps;
    return mountWithIntl(
      <Provider store={minimalStore}>
        <BrowserRouter>
          <ModelListView {...props} />
        </BrowserRouter>
      </Provider>,
    );
  }

  test('should render with minimal props without exploding', () => {
    wrapper = setupModelListViewWithIntl();
    expect(wrapper.length).toBe(1);
  });

  test('should display onBoarding helper', () => {
    wrapper = setupModelListViewWithIntl();
    expect(wrapper.find('Alert').length).toBe(1);
  });

  test('should not display onBoarding helper if disabled', () => {
    wrapper = setupModelListViewWithIntl();
    wrapper.find(ModelListViewImpl).setState({
      showOnboardingHelper: false,
    });
    expect(wrapper.find('Alert').length).toBe(0);
  });

  oss_test('should show correct link in onboarding helper', () => {
    wrapper = setupModelListViewWithIntl();
    expect(wrapper.find(`a[href="${ModelRegistryDocUrl}"]`)).toHaveLength(1);
  });

  test('should render correct information if table is empty', () => {
    wrapper = setupModelListViewWithIntl();
    expect(wrapper.find(ANTD_TABLE_PLACEHOLDER_CLS).text()).toBe(
      'No models yet. Create a model to get started.',
    );

    wrapper.setProps({
      children: (
        <BrowserRouter>
          <ModelListView {...{ ...minimalProps, searchInput: 'xyz' }} />
        </BrowserRouter>
      ),
    });
    expect(wrapper.find(ANTD_TABLE_PLACEHOLDER_CLS).text()).toBe('No models found.');

    wrapper.find(ModelListViewImpl).setState({ lastNavigationActionWasClickPrev: true });
    expect(wrapper.find(ANTD_TABLE_PLACEHOLDER_CLS).text()).toBe(
      'No models found for the page. ' +
        'Please refresh the page as the underlying data may have changed significantly.',
    );
  });

  // BEGIN-EDGE
  test('should show correct link in onboarding helper', () => {
    // Doc link should point to cloud specific model registry page when cloud provider is available
    [CloudProvider.AWS, CloudProvider.Azure].forEach((provider) => {
      DatabricksUtils.getCloudProvider = jest.fn().mockReturnValue(provider);
      wrapper = setupModelListViewWithIntl();
      expect(wrapper.find(`a[href="${DatabricksModelRegistryDocUrl[provider]}"]`)).toHaveLength(1);
    });

    // Doc link should fallback to point to OSS model registry doc when failed to get cloud provider
    DatabricksUtils.getCloudProvider = jest.fn().mockReturnValue(undefined);
    wrapper = setupModelListViewWithIntl();
    expect(wrapper.find(`a[href="${ModelRegistryDocUrl}"]`)).toHaveLength(1);
  });
  // END-EDGE
  // BEGIN-EDGE
  test('should render serving status correctly', () => {
    /* eslint-disable no-restricted-globals */
    top.settings = {
      isModelServingEnabledInCurrentWorkspace: true,
    };

    const models = [
      mockRegisteredModelDetailed('Model None', []),
      mockRegisteredModelDetailed('Model Ready', []),
      mockRegisteredModelDetailed('Model Pending', []),
      mockRegisteredModelDetailed('Model Failed', []),
    ];
    const endpoints = {
      [getServingModelKey(null, 'Model Ready')]: mockEndpointStatus({
        state: 'ENDPOINT_STATE_READY',
      }),
      [getServingModelKey(null, 'Model Pending')]: mockEndpointStatus({
        state: 'ENDPOINT_STATE_PENDING',
      }),
      [getServingModelKey(null, 'Model Failed')]: mockEndpointStatus({
        state: 'ENDPOINT_STATE_FAILED',
      }),
    };
    const props = { ...minimalProps, models, endpoints };
    wrapper = setupModelListViewWithIntl(props);
    expect(wrapper.find('td.serving').at(0).text().trim()).toBe('_');
    expect(wrapper.find('td.serving').at(1).text().trim()).toBe('Ready');
    expect(wrapper.find('td.serving').at(2).text().trim()).toBe('Pending');
    expect(wrapper.find('td.serving').at(3).text().trim()).toBe('Failed');

    // Validate that the links exist and go to the serving pane.
    expect(wrapper.find(`a[href="/models/Model Ready/serving"]`)).toHaveLength(1);
  });
  // END-EDGE
  test('should render latest version correctly', () => {
    const models = [
      mockRegisteredModelDetailed('Model A', [
        mockModelVersionDetailed('Model A', 1, Stages.PRODUCTION, ModelVersionStatus.READY),
        mockModelVersionDetailed('Model A', 2, Stages.STAGING, ModelVersionStatus.READY),
        mockModelVersionDetailed('Model A', 3, Stages.NONE, ModelVersionStatus.READY),
      ]),
    ];
    const props = { ...minimalProps, models };
    wrapper = setupModelListViewWithIntl(props);
    expect(wrapper.find('td.latest-version').text()).toBe('Version 3');
    expect(wrapper.find('td.latest-staging').text()).toBe('Version 2');
    expect(wrapper.find('td.latest-production').text()).toBe('Version 1');
  });

  test('should render `_` when there is no version to display for the cell', () => {
    const models = [
      mockRegisteredModelDetailed('Model A', [
        mockModelVersionDetailed('Model A', 1, Stages.NONE, ModelVersionStatus.READY),
      ]),
    ];
    const props = { ...minimalProps, models };
    wrapper = setupModelListViewWithIntl(props);
    expect(wrapper.find('td.latest-version').text()).toBe('Version 1');
    expect(wrapper.find('td.latest-staging').text()).toBe('_');
    expect(wrapper.find('td.latest-production').text()).toBe('_');
  });

  test('should render tags correctly', () => {
    const models = [
      mockRegisteredModelDetailed(
        'Model A',
        [],
        [
          { key: 'key', value: 'value' },
          { key: 'key2', value: 'value2' },
          { key: 'key3', value: 'value3' },
          { key: 'key4', value: 'value4' },
        ],
      ),
    ];
    const props = { ...minimalProps, models };
    wrapper = setupModelListViewWithIntl(props);
    expect(wrapper.find('td.table-tag-container').text()).toContain('key:value');
    expect(wrapper.find('td.table-tag-container').text()).toContain('key2:value2');
    expect(wrapper.find('td.table-tag-container').text()).toContain('key3:value3');
    expect(wrapper.find('td.table-tag-container').text()).toContain('key4:value4');
  });

  test('tags cell renders multiple tags and collapses with more than 4 tags', () => {
    const models = [
      mockRegisteredModelDetailed(
        'Model A',
        [],
        [
          { key: 'key', value: 'value' },
          { key: 'key2', value: 'value2' },
          { key: 'key3', value: 'value3' },
          { key: 'key4', value: 'value4' },
          { key: 'key5', value: 'value5' },
        ],
      ),
    ];
    const props = { ...minimalProps, models };
    wrapper = setupModelListViewWithIntl(props);
    expect(wrapper.find('td.table-tag-container').text()).toContain('key:value');
    expect(wrapper.find('td.table-tag-container').text()).toContain('key2:value2');
    expect(wrapper.find('td.table-tag-container').text()).toContain('key3:value3');
    expect(wrapper.find('td.table-tag-container').text()).toContain('2 more');
  });

  test('should render `_` when there are no tags to display for the cell', () => {
    const models = [
      mockRegisteredModelDetailed('Model A', [
        mockModelVersionDetailed('Model A', 1, Stages.NONE, ModelVersionStatus.READY),
      ]),
    ];
    const props = { ...minimalProps, models };
    wrapper = setupModelListViewWithIntl(props);
    expect(wrapper.find('td.table-tag-container').text()).toBe('_');
  });

  const findColumn = (table, index) =>
    table.props().columns.find((elem) => elem.dataIndex === index);

  test('orderByKey, orderByASC props are correctly passed to the table', () => {
    const models = [
      mockRegisteredModelDetailed('Model B', [], [], 'CAN_EDIT', 3),
      mockRegisteredModelDetailed('model c', [], [], 'CAN_EDIT', 1),
      mockRegisteredModelDetailed('Model a', [], [], 'CAN_EDIT', 2),
    ];
    let props = {
      ...minimalProps,
      models,
      orderByKey: 'name',
      orderByAsc: true,
    };
    wrapper = setupModelListViewWithIntl(props);

    let table = wrapper.find(Table);
    // prop values look legit
    expect(findColumn(table, 'name').sortOrder).toBe('ascend');
    expect(findColumn(table, 'last_updated_timestamp').sortOrder).toBe(undefined);
    // the table doesn't actually sort, though, and displays exactly what's given.
    expect(wrapper.find('td.model-name').length).toBe(3);
    expect(wrapper.find('td.model-name').at(0).text()).toBe('Model B');
    expect(wrapper.find('td.model-name').at(1).text()).toBe('model c');
    expect(wrapper.find('td.model-name').at(2).text()).toBe('Model a');

    props = {
      ...minimalProps,
      models,
      orderByKey: 'timestamp',
      orderByAsc: false,
    };
    wrapper = setupModelListViewWithIntl(props);
    table = wrapper.find(Table);
    // prop values look legit
    expect(findColumn(table, 'name').sortOrder).toBe(undefined);
    expect(findColumn(table, 'last_updated_timestamp').sortOrder).toBe('descend');
    // the table doesn't actually sort, though, and displays exactly what's given.
    expect(wrapper.find('td.model-name').length).toBe(3);
    expect(wrapper.find('td.model-name').at(0).text()).toBe('Model B');
    expect(wrapper.find('td.model-name').at(1).text()).toBe('model c');
    expect(wrapper.find('td.model-name').at(2).text()).toBe('Model a');
  });

  test('lastNavigationActionWasClickPrev is set properly on actions', () => {
    wrapper = setupModelListViewWithIntl();
    instance = wrapper.find(ModelListViewImpl).instance();
    expect(instance.state.lastNavigationActionWasClickPrev).toBe(false);

    instance.handleClickPrev();
    expect(instance.state.lastNavigationActionWasClickPrev).toBe(true);
    instance.handleClickNext();
    expect(instance.state.lastNavigationActionWasClickPrev).toBe(false);
    const event = { preventDefault: () => {} };
    instance.handleSearch(event);
    expect(instance.state.lastNavigationActionWasClickPrev).toBe(false);
    instance.handleTableChange(null, null, { field: 'name', order: 'ascend' });
    expect(instance.state.lastNavigationActionWasClickPrev).toBe(false);
  });

  test('Page title is set', () => {
    const mockUpdatePageTitle = jest.fn();
    Utils.updatePageTitle = mockUpdatePageTitle;
    wrapper = setupModelListViewWithIntl();
    expect(mockUpdatePageTitle.mock.calls[0][0]).toBe('MLflow Models');
  });

  // BEGIN-EDGE
  test('should render overflow menu based on user permissions', () => {
    // should render menu breadcrumb if user has manage permissions
    let props = {
      ...minimalProps,
      permissionLevel: PermissionLevels.CAN_MANAGE,
    };
    wrapper = setupModelListViewWithIntl(props);
    expect(wrapper.find('button[data-test-id="edit-permissions-button"]').length).toBe(1);

    // should not render menu breadcrumb if user does not have manage permissions
    props = {
      ...minimalProps,
      permissionLevel: PermissionLevels.CAN_EDIT,
    };
    wrapper = setupModelListViewWithIntl(props);
    expect(wrapper.find('button[data-test-id="edit-permissions-button"]').length).toBe(0);
  });

  test('should trigger showEditPermissionModal when permission menu item is clicked', () => {
    const props = {
      ...minimalProps,
      permissionLevel: PermissionLevels.CAN_MANAGE,
    };
    wrapper = setupModelListViewWithIntl(props);
    wrapper.find('[data-test-id="edit-permissions-button"]').hostNodes().simulate('click');
    expect(minimalProps.showEditPermissionModal).toHaveBeenCalled();
  });

  test('should show/hide edit permission menu item base on config', () => {
    const props = {
      ...minimalProps,
      permissionLevel: PermissionLevels.CAN_MANAGE,
    };
    DatabricksUtils.isAclCheckEnabledForModelRegistry = jest.fn().mockReturnValue(true);
    DatabricksUtils.isRegistryWidePermissionsEnabledForModelRegistry = jest
      .fn()
      .mockReturnValue(true);
    wrapper = setupModelListViewWithIntl(props);
    // should show edit permission menu item when ACL for model registry is enabled
    expect(wrapper.find('[data-test-id="edit-permissions-button"]').hostNodes().length).toBe(1);

    // should not show edit permission menu item when ACL for model registry is disabled
    // for the org via the feature flag or the "Workspace ACLs" setting.
    [(false, true), (true, false), (false, false)].forEach((first, second) => {
      DatabricksUtils.isAclCheckEnabledForModelRegistry = jest.fn().mockReturnValue(first);
      DatabricksUtils.isRegistryWidePermissionsEnabledForModelRegistry = jest
        .fn()
        .mockReturnValue(second);
      wrapper.setProps({
        children: (
          <Provider store={minimalStore}>
            <BrowserRouter>
              <ModelListView {...props} />
            </BrowserRouter>
          </Provider>
        ),
      });
      expect(wrapper.find('[data-test-id="edit-permissions-button"]').length).toBe(0);
    });
  });

  describe('Monitoring Cell', () => {
    beforeEach(() => {
      wrapper = setupModelListViewWithIntl();
      instance = wrapper.find(ModelListViewImpl).instance();
    });

    describe('monitoring column', () => {
      it('should not show by default', () => {
        expect(wrapper.find('th.monitoring')).toHaveLength(0);
      });

      it('should show column with the GOC flag is on', () => {
        jest.spyOn(DatabricksUtils, 'getConf').mockImplementation(() => true);
        wrapper = setupModelListViewWithIntl();
        expect(wrapper.find('th.monitoring')).toHaveLength(1);
      });
    });

    describe('renderMonitoringCell', () => {
      const model = {
        name: 'modelName',
        tags: [],
      };

      it('returns an empty cell by default', () => {
        const output = instance.renderMonitoringCell(model);
        expect(output).toBe(EMPTY_CELL_PLACEHOLDER);
      });

      it('returns the number of active monitors', () => {
        const modelWithMonitors = {
          ...model,
          tags: [monitoringTagMock, { key: 'randomTag', value: 'no ' }, monitoringTagMock],
        };
        const output = instance.renderMonitoringCell(modelWithMonitors);
        const mounted = mount(<BrowserRouter>{output}</BrowserRouter>);
        expect(mounted.find('a').text()).toBe('2');
      });

      it('links to monitoring table', () => {
        const modelWithMonitors = {
          ...model,
          tags: [monitoringTagMock],
        };
        const output = instance.renderMonitoringCell(modelWithMonitors);
        const mounted = mount(<BrowserRouter>{output}</BrowserRouter>);
        expect(mounted.find('a').prop('href')).toEqual(
          expect.stringContaining(modelWithMonitors.name),
        );
        expect(mounted.find('a').prop('href')).toEqual(expect.stringContaining('/monitoring'));
      });
    });
  });
  // END-EDGE
  // eslint-disable-next-line
});
