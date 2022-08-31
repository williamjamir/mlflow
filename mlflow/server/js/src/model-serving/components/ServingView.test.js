import { ServingView, ServingViewImpl } from './ServingView';
import { curl_client_code_text } from './CurlClientCode';
import { python_client_code_text } from './PythonClientCode';
import Utils from '../../common/utils/Utils';
import {
  mockAliases,
  mockEndpoint,
  mockEndpointV2,
  mockFailedEndpointVersionStatusV2,
  mockModelName,
  mockPendingEndpointVersionStatusV2,
  mockReadyEndpointVersionStatusV2,
  mockRetryRequestedEndpointVersionStatusV2,
  mockStoreV1,
  mockStoreV2,
  mockUnknownEndpointVersionStatusV2,
  mockValidNodeTypes,
  mockVersions,
  servingViewWrapper,
} from '../test-utils';
import { EndpointState, getServingModelKey, ENDPOINT_VERSIONS } from '../utils';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import promiseMiddleware from 'redux-promise-middleware';
import _ from 'lodash';

describe('ServingView', () => {
  let wrapper;
  let minimalProps;
  let minimalPropsV2;
  let minimalStoreV1;
  let minimalStoreV2;
  let modelKey;

  const mockStore = configureStore([thunk, promiseMiddleware()]);

  beforeEach(() => {
    // TODO: remove global fetch mock by explicitly mocking all the service API calls
    global.fetch = jest.fn(() =>
      Promise.resolve({ ok: true, status: 200, text: () => Promise.resolve('') }),
    );
    minimalProps = {
      modelName: mockModelName,
      handleEnableServing: jest.fn(),
      handleDisableServing: jest.fn(),
      handleDisableServingV2: jest.fn(),
      handleServingRequest: jest.fn(() => Promise.resolve({ value: 'Hotdog' })),
      updateEndpointClusterConfigApi: jest.fn(),
      updateEndpointComputeConfigApi: jest.fn(),
      restartComputeConfigUpdateApi: jest.fn(),
      loadVersionReplicas: jest.fn(() => Promise.resolve({ value: { version_replicas: [] } })),
      supportedClusterNodeTypes: mockValidNodeTypes,
    };
    minimalPropsV2 = {
      modelName: mockModelName,
      handleEnableServing: jest.fn(),
      handleDisableServing: jest.fn(),
      handleServingRequestV2: jest.fn(() => Promise.resolve({ value: 'HotdogV2' })),
      updateEndpointClusterConfigApi: jest.fn(),
      updateEndpointComputeConfigApi: jest.fn(),
      loadVersionReplicas: jest.fn(() => Promise.resolve({ value: { version_replicas: [] } })),
      restartComputeConfigUpdateApi: jest.fn(),
    };
    modelKey = getServingModelKey(null, mockModelName);
    minimalStoreV1 = mockStore(mockStoreV1);
    minimalStoreV2 = mockStore(mockStoreV2);
  });

  test('should render with no endpoint definitions without exploding', () => {
    const store = {
      ...minimalStoreV1,
      endpointStatus: {},
    };
    wrapper = servingViewWrapper(store, minimalProps);
    expect(wrapper.find(ServingView).length).toBe(1);
  });

  test('should render with minimal props without exploding', () => {
    wrapper = servingViewWrapper(minimalStoreV1, minimalProps);
    expect(wrapper.find(ServingView).length).toBe(1);
    expect(wrapper.find('.enable-serving-button').length).toBe(0);
  });

  test('should render all versions initially', () => {
    wrapper = servingViewWrapper(minimalStoreV1, minimalProps);
    expect(wrapper.find('.serving-version-version-num').length).toBe(3);
    expect(wrapper.find('.serving-version-version-num').at(0).text()).toBe('Version 1');
    expect(wrapper.find('.serving-version-version-num').at(1).text()).toBe('Version 2');
    expect(wrapper.find('.serving-version-version-num').at(2).text()).toBe('Version 4');

    expect(wrapper.find('.serving-version-stage-container').length).toBe(3);
    expect(wrapper.find('.serving-version-stage-container').at(0).text()).toBe('Production');
    expect(wrapper.find('.serving-version-stage-container').at(1).text()).toBe('Staging');
    expect(wrapper.find('.serving-version-stage-container').at(2).text()).toBe('');
  });

  test('should render Ready when endpoint state is ready', () => {
    const updatedEndpoint = { ...mockEndpoint, state: EndpointState.READY };
    const store = {
      ...minimalStoreV1,
      endpointStatus: { [[modelKey]]: updatedEndpoint },
    };
    wrapper = servingViewWrapper(store, minimalProps);
    expect(wrapper.find('#serving-endpoint-state').text()).toContain('Ready');
  });

  test('should render Pending when endpoint state is pending', () => {
    const updatedEndpoint = { ...mockEndpoint, state: EndpointState.PENDING };
    const store = mockStore({
      entities: {
        ...minimalStoreV1.getState().entities,
        endpointStatus: { [[modelKey]]: updatedEndpoint },
      },
    });
    wrapper = servingViewWrapper(store, minimalProps);
    expect(wrapper.find('#serving-endpoint-state').text()).toContain('Pending');
  });

  test('should render Failed when endpoint state is failed', () => {
    const updatedEndpoint = { ...mockEndpoint, state: 'ENDPOINT_STATE_FAILED' };
    const store = mockStore({
      entities: {
        ...minimalStoreV1.getState().entities,
        endpointStatus: { [[modelKey]]: updatedEndpoint },
      },
    });
    wrapper = servingViewWrapper(store, minimalProps);
    expect(wrapper.find('#serving-endpoint-state').text()).toContain('Failed');
  });

  test('should render all model urls', () => {
    wrapper = servingViewWrapper(minimalStoreV1, minimalProps);
    expect(wrapper.find('span[data-testid="serving-model-urls"]').length).toBe(2);
    // Copy icons for model URLs appear
    expect(wrapper.find('.anticon-copy').length).toBe(2);
    expect(wrapper.find('span[data-testid="serving-model-urls"]').at(0).text()).toBe(
      'https://localhost/model/ModelA/1/invocations',
    );
    expect(wrapper.find('span[data-testid="serving-model-urls"]').at(1).text()).toBe(
      'https://localhost/model/ModelA/Production/invocations',
    );

    // Click on third version, and expect URLs to be updated.
    wrapper.find('[data-test-id="serving-sidebar-version-container"]').at(2).simulate('click');

    expect(wrapper.find('span[data-testid="serving-model-urls"]').length).toBe(1);
    expect(wrapper.find('.anticon-copy').length).toBe(1);
    expect(wrapper.find('span[data-testid="serving-model-urls"]').at(0).text()).toBe(
      'https://localhost/model/ModelA/4/invocations',
    );
  });

  test('should render all encoded model urls', () => {
    const encodingModelName = 'Model A';
    minimalProps = {
      ...minimalProps,
      modelName: encodingModelName,
    };
    const updatedModelKey = getServingModelKey(null, encodingModelName);
    const mockEndpointModelA = { ...mockEndpoint, registered_model_name: encodingModelName };
    const store = mockStore({
      entities: {
        ...minimalStoreV1.getState().entities,
        endpointStatus: { [[updatedModelKey]]: mockEndpointModelA },
        endpointVersionStatus: { [[updatedModelKey]]: mockVersions },
        endpointAliases: { [[updatedModelKey]]: mockAliases },
      },
    });
    wrapper = servingViewWrapper(store, minimalProps);
    expect(wrapper.find('span[data-testid="serving-model-urls"]').length).toBe(2);
    // Copy icons for model URLs appear
    expect(wrapper.find('.anticon-copy').length).toBe(2);
    expect(wrapper.find('span[data-testid="serving-model-urls"]').at(0).text()).toBe(
      'https://localhost/model/Model%20A/1/invocations',
    );
    expect(wrapper.find('span[data-testid="serving-model-urls"]').at(1).text()).toBe(
      'https://localhost/model/Model%20A/Production/invocations',
    );

    // Click on third version, and expect URLs to be updated.
    wrapper.find('[data-test-id="serving-sidebar-version-container"]').at(2).simulate('click');

    expect(wrapper.find('span[data-testid="serving-model-urls"]').length).toBe(1);
    expect(wrapper.find('.anticon-copy').length).toBe(1);
    expect(wrapper.find('span[data-testid="serving-model-urls"]').at(0).text()).toBe(
      'https://localhost/model/Model%20A/4/invocations',
    );
  });

  test('model urls copy buttons still appear on window narrow', () => {
    wrapper = servingViewWrapper(minimalStoreV1, minimalProps);
    expect(wrapper.find('.anticon-copy').length).toBe(2);

    // Change the viewport to be 100px
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 100 });

    // Trigger the window resize event.
    global.dispatchEvent(new Event('resize'));

    expect(wrapper.find('.anticon-copy').length).toBe(2);
  });

  test('should render logs based on version selected', () => {
    wrapper = servingViewWrapper(minimalStoreV1, minimalProps);

    expect(wrapper.find('.serving-logs-textarea').text()).toBe('Hello!');
    // Now click on the third version, which should update logs
    wrapper.find('[data-test-id="serving-sidebar-version-container"]').at(2).simulate('click');
    // And eventually succeed!
    expect(wrapper.find('.serving-logs-textarea').text()).toBe('Boopity!');
  });

  test('Client code examples V1.', () => {
    wrapper = servingViewWrapper(minimalStoreV1, minimalProps);
    wrapper.find({ value: 'Curl' }).map((x) => x.simulate('change', { target: { checked: true } }));
    const url = 'https://localhost/model/ModelA/1/invocations';
    const headers = 'Content-Type: application/json';
    const curl_text_raw = curl_client_code_text(headers, url).replace(/\n/g, '');
    expect(wrapper.find('[data-testid="serving-example-client-code"]').text()).toBe(curl_text_raw);
    wrapper
      .find({ value: 'Python' })
      .map((x) => x.simulate('change', { target: { checked: true } }));
    const python_text_raw = python_client_code_text(url, ENDPOINT_VERSIONS.V1).replace(/\n/g, '');
    expect(wrapper.find('[data-testid="serving-example-client-code"]').text()).toBe(
      python_text_raw,
    );
  });

  test('Version events are filtered by current version.', () => {
    wrapper = servingViewWrapper(minimalStoreV1, minimalProps);
    // click on all tabs to render them
    wrapper.find('[role="tab"]').map((x) => x.simulate('click'));

    expect(wrapper.find('.serving-events-textarea').text()).toBe(
      [
        [Utils.formatTimestamp(123), 'First message for version 1.'].join('\t'),
        [Utils.formatTimestamp(124), 'Second message for version 1.'].join('\t'),
      ].join('\n'),
    );
    wrapper.find('[data-test-id="serving-sidebar-version-container"]').at(2).simulate('click');
    expect(wrapper.find('.serving-events-textarea').text()).toBe(
      [[Utils.formatTimestamp(126), 'First message for version 4.'].join('\t')].join('\n'),
    );
  });

  test('Version events show correct message when events are not loaded.', () => {
    const store = mockStore({
      entities: {
        ...minimalStoreV1.getState().entities,
        endpointEventHistory: {},
      },
    });
    wrapper = servingViewWrapper(store, minimalProps);
    // click on all tabs to render them
    wrapper.find('[role="tab"]').map((x) => x.simulate('click'));

    expect(wrapper.find('.serving-events-textarea').text()).toBe('Loading...');
  });

  test('Model events show correct message when events are not loaded.', () => {
    const store = mockStore({
      entities: {
        ...minimalStoreV1.getState().entities,
        endpointEventHistory: {},
      },
    });
    wrapper = servingViewWrapper(store, minimalProps);
    // click on model events tab to render it
    wrapper.find('[role="tab"]').map((x) => x.simulate('click'));
    expect(wrapper.find('.serving-model-events-panel').text()).toBe('Loading...');
  });

  test('Model events display correctly', () => {
    wrapper = servingViewWrapper(minimalStoreV1, minimalProps);
    // click on model events tab to render it
    wrapper.find('[role="tab"]').at(1).simulate('click');

    const table_rows = wrapper
      .find('.serving-model-events-panel')
      .find('table')
      .find('tr:not(.ant-table-measure-row)');
    // TODO: why does the render an ant-table-measure-row???
    expect(table_rows.length).toBe(5);
    const header = table_rows.at(0).find('th');
    expect(header.length).toBe(4);
    const first_row = table_rows.at(1).find('td');
    expect(first_row.length).toBe(4);
    expect(first_row.at(0).text()).toBe(Utils.formatTimestamp(125));
    expect(first_row.at(1).text()).toBe('MODEL_UPDATE');
    expect(first_row.at(2).text()).toBe('');
    expect(first_row.at(3).text()).toBe('Message.');
    const second_row = table_rows.at(2).find('td');
    expect(second_row.length).toBe(4);
    expect(second_row.at(0).text()).toBe(Utils.formatTimestamp(125));
    expect(second_row.at(1).text()).toBe('VERSION_UPDATE');
    expect(second_row.at(2).text()).toBe('1');
    expect(second_row.at(3).text()).toBe('Second message for version 1.');
    const third_row = table_rows.at(3).find('td');
    expect(third_row.length).toBe(4);
    expect(third_row.at(0).text()).toBe(Utils.formatTimestamp(126));
    expect(third_row.at(1).text()).toBe('VERSION_UPDATE');
    expect(third_row.at(2).text()).toBe('4');
    expect(third_row.at(3).text()).toBe('First message for version 4.');
    const fourth_row = table_rows.at(4).find('td');
    expect(fourth_row.length).toBe(4);
    expect(fourth_row.at(0).text()).toBe(Utils.formatTimestamp(123));
    expect(fourth_row.at(1).text()).toBe('VERSION_UPDATE');
    expect(fourth_row.at(2).text()).toBe('1');
    expect(fourth_row.at(3).text()).toBe('First message for version 1.');
  });

  test('disable sending serving request button when version is Pending', () => {
    wrapper = servingViewWrapper(minimalStoreV1, minimalProps);

    expect(wrapper.find('.submit-request-button button').prop('disabled')).toBe(false);

    // The third version is pending, so the submit request button should be disabled.
    wrapper.find('[data-test-id="serving-sidebar-version-container"]').at(2).simulate('click');
    expect(wrapper.find('.submit-request-button button').prop('disabled')).toBe(true);
  });
  // -------------------- SERVING V2 TESTS -------------------------

  test('Client code examples V2.', () => {
    wrapper = servingViewWrapper(minimalStoreV2, minimalPropsV2);
    wrapper.find({ value: 'Curl' }).map((x) => x.simulate('change', { target: { checked: true } }));
    const url = 'https://localhost/model-endpoint/ModelA/1/invocations';
    const headers = 'Content-Type: application/json';
    const curl_text_raw = curl_client_code_text(headers, url).replace(/\n/g, '');
    expect(wrapper.find('[data-testid="serving-example-client-code"]').text()).toBe(curl_text_raw);
    wrapper
      .find({ value: 'Python' })
      .map((x) => x.simulate('change', { target: { checked: true } }));
    const python_text_raw = python_client_code_text(url, ENDPOINT_VERSIONS.V2).replace(/\n/g, '');
    expect(wrapper.find('[data-testid="serving-example-client-code"]').text()).toBe(
      python_text_raw,
    );
  });

  test('should not render cluster link when endpoint is v2', () => {
    wrapper = servingViewWrapper(minimalStoreV1, minimalProps);
    expect(wrapper.find('.metadata-info a').length).toBe(1);

    wrapper = servingViewWrapper(minimalStoreV2, minimalPropsV2);
    expect(wrapper.find('.metadata-info a').length).toBe(0);
  });

  test('should render logs based on version and replica when endpoint is V2', () => {
    wrapper = servingViewWrapper(minimalStoreV2, minimalPropsV2);

    // Load logs for all replicas by default
    expect(wrapper.find('.serving-logs-textarea').text()).toBe('Hello from ALL');

    // Now click on a replica, which should load the log for the replica
    wrapper.update();

    const findAllTabsButtons = () => wrapper.find('.servingv2-logs-container').find('[role="tab"]');

    expect(findAllTabsButtons().length).toBe(3);
    findAllTabsButtons().at(2).simulate('click');
    expect(wrapper.find('.serving-logs-textarea.v1r2').text()).toBe('Hello from v1r2');

    // Now click on the next version, which should default to its all replicas tab
    wrapper.update();
    wrapper.find('[data-test-id="serving-sidebar-version-container"]').at(1).simulate('click');
    expect(wrapper.find('.serving-logs-textarea.all').text()).toBe('Boopity from ALL');

    // Now click on a replica, which should load the log for the replica
    expect(findAllTabsButtons().length).toBe(4);
    findAllTabsButtons().at(3).simulate('click');
    expect(wrapper.find('.serving-logs-textarea.v2r3').text()).toBe('Boopity from v2r3');

    // Now click on the next version, which should have no replicas or logs
    wrapper.update();
    wrapper.find('[data-test-id="serving-sidebar-version-container"]').at(2).simulate('click');
    expect(wrapper.find('.serving-logs-textarea').text()).toBe('Loading...');
    expect(findAllTabsButtons().length).toBe(1);
  });

  test('Failed compute update container link to compute config tab works', () => {
    const store = mockStore({
      entities: {
        ...minimalStoreV2.getState().entities,
        endpointVersionStatusV2: { [[modelKey]]: [mockFailedEndpointVersionStatusV2] },
      },
    });
    wrapper = servingViewWrapper(store, minimalPropsV2);

    // expect compute settings tab to not be rendered yet
    expect(wrapper.find('[data-test-id="serving-compute-settings-panel"]').length).toBe(0);

    const computeContainers = wrapper.find('[data-test-id="compute-config-container"]');
    expect(computeContainers.length).toBe(2);
    const inProgressComputeContainer = computeContainers.at(1);
    // click on the link to the compute settings tab
    inProgressComputeContainer
      .find('[data-test-id="serving-failed-compute-tab-link"]')
      .at(0)
      .simulate('click');

    // compute settings tab is rendered and open when link is clicked
    expect(wrapper.find('[data-test-id="serving-compute-settings-panel"]').length).toBe(1);
  });

  test('Compute tab renders empty state if compute config is not defined', () => {
    const endpointV2NoComputeConfig = _.omit(mockEndpointV2, ['compute_config']);
    const store = mockStore({
      entities: {
        ...minimalStoreV2.getState().entities,
        endpointStatusV2: { [[modelKey]]: endpointV2NoComputeConfig },
      },
    });
    wrapper = servingViewWrapper(store, minimalPropsV2);
    // open the compute config tab
    wrapper.find(ServingViewImpl).setState({ activeTab: '3' });

    // compute settings tab should be open
    expect(wrapper.find('[data-test-id="serving-compute-settings-panel"]').length).toBe(1);

    // Empty state should be rendered
    expect(wrapper.find('[data-test-id="serving-compute-settings-empty-state"]').length).toBe(1);
    expect(wrapper.find('[data-test-id="serving-compute-settings-empty-state"]').text()).toContain(
      'wait until the endpoint is ready to be configured',
    );
    expect(wrapper.find('.editable-cluster-settings-page').length).toBe(0);
  });

  test("Compute tab doesn't render spinner when compute_config is defined", () => {
    wrapper = servingViewWrapper(minimalStoreV2, minimalPropsV2);
    // open the compute config tab
    wrapper.find(ServingViewImpl).setState({ activeTab: '3' });

    // compute settings tab should be open
    expect(wrapper.find('[data-test-id="serving-compute-settings-panel"]').length).toBe(1);

    // empty state should not be rendered
    expect(wrapper.find('[data-test-id="serving-compute-settings-empty-state"]').length).toBe(0);
    expect(wrapper.find('.editable-cluster-settings-page').length).toBe(1);
  });

  test('Version sidebar shows correct compute configuration status information', () => {
    wrapper = servingViewWrapper(minimalStoreV2, minimalPropsV2);
    const configStatuses = wrapper.find('[data-test-id="sidebar-config-status"]');
    expect(configStatuses.length).toBe(3);
    expect(configStatuses.at(0).text()).toBe('');
    expect(configStatuses.at(1).text()).toBe(' Updating');
    expect(configStatuses.at(2).text()).toBe(' Update Failed');
  });

  test('Version sidebar shows correct version statuses', () => {
    const store = mockStore({
      entities: {
        ...minimalStoreV2.getState().entities,
        endpointVersionStatusV2: {
          [[modelKey]]: [
            mockReadyEndpointVersionStatusV2,
            mockRetryRequestedEndpointVersionStatusV2,
            mockPendingEndpointVersionStatusV2,
            mockFailedEndpointVersionStatusV2,
            mockUnknownEndpointVersionStatusV2,
          ],
        },
      },
    });
    const expectedStatuses = ['Ready', 'Ready', 'Pending', 'Failed', 'Failed'];

    wrapper = servingViewWrapper(store, minimalPropsV2);
    const statusIndicators = wrapper.find('[data-test-id="sidebar-version-status"]');
    expect(
      wrapper.find('[data-test-id="serving-sidebar-version-model-detail-cell"]').text(),
    ).toContain('See your other model versions');

    expect(statusIndicators.length).toBe(5);
    expectedStatuses.forEach((s, i) => {
      expect(statusIndicators.at(i).text().trim()).toBe(s);
    });
  });

  test('when endpoint is pending, empty state shows a message that the endpoint is being created', () => {
    const store = mockStore({
      entities: {
        ...minimalStoreV2.getState().entities,
        endpointStatusV2: { [[modelKey]]: { ...mockEndpointV2, state: EndpointState.PENDING } },
        endpointVersionStatusV2: {},
      },
    });
    wrapper = servingViewWrapper(store, minimalPropsV2);
    expect(wrapper.find('[data-test-id="empty-state-text"]').text()).toContain(
      'still being created',
    );
  });

  test('when endpoint is ready but without versions, empty state shows a message that no versions are in staging or production', () => {
    const store = mockStore({
      entities: {
        ...minimalStoreV2.getState().entities,
        endpointVersionStatusV2: {},
      },
    });
    wrapper = servingViewWrapper(store, minimalProps);
    expect(wrapper.find('[data-test-id="empty-state-text"]').text()).toContain(
      'Move a model version into Staging or Production',
    );
  });
});
