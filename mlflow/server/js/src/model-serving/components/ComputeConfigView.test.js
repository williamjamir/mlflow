import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import promiseMiddleware from 'redux-promise-middleware';
import {
  mockModelName,
  mockStoreV2,
  modelKey,
  computeConfigViewWrapper,
  mockPendingEndpointVersionStatusV2,
  mockFailedEndpointVersionStatusV2,
} from '../test-utils';

describe('ComputeConfigView', () => {
  let wrapper;
  let minimalProps;
  let minimalStore;

  const mockStore = configureStore([thunk, promiseMiddleware()]);

  const getEndpointVersionFromState = (state) => {
    const endpointVersions = state.entities.endpointVersionStatusV2[modelKey];
    return endpointVersions[0];
  };

  beforeEach(() => {
    minimalStore = mockStore(mockStoreV2);

    minimalProps = {
      modelName: mockModelName,
      changeTab: jest.fn(),
    };
  });

  test('Compute config container renders correctly when there are no pending compute config updates', () => {
    minimalStore = mockStore(mockStoreV2);
    wrapper = computeConfigViewWrapper(minimalStore, {
      ...minimalProps,
      endpointVersionName: '1',
      endpointVersion: getEndpointVersionFromState(minimalStore.getState()),
    });
    const computeContainer = wrapper.find('[data-test-id="compute-config-container"]');
    expect(computeContainer.length).toBe(1);
    expect(computeContainer.find('[data-test-id="compute-config-status"]').text()).toBe(
      'Status: Ready',
    );
    expect(computeContainer.find('[data-test-id="compute-config-concurrency"]').text()).toBe(
      'Provisioned Concurrency:8-16 (8 provisioned)',
    );
    expect(computeContainer.find('[data-test-id="compute-config-message"]').text()).toContain(
      'Last updated by 123 at ',
    );
  });

  test('Compute config containers with pending compute show correct information', () => {
    minimalStore = mockStore(mockStoreV2);
    const store = mockStore({
      entities: {
        ...minimalStore.getState().entities,
        endpointVersionStatusV2: { [[modelKey]]: [mockPendingEndpointVersionStatusV2] },
      },
    });
    wrapper = computeConfigViewWrapper(store, {
      ...minimalProps,
      endpointVersionName: '2',
      endpointVersion: getEndpointVersionFromState(store.getState()),
    });
    const computeContainers = wrapper.find('[data-test-id="compute-config-container"]');
    expect(computeContainers.length).toBe(2);

    const deployedComputeContainer = computeContainers.at(0);
    expect(deployedComputeContainer.find('[data-test-id="compute-config-status"]').text()).toBe(
      'Status: Pending',
    );
    expect(
      deployedComputeContainer.find('[data-test-id="compute-config-concurrency"]').text(),
    ).toBe('Provisioned Concurrency:8-16 (4 provisioned)');
    expect(
      deployedComputeContainer.find('[data-test-id="compute-config-message"]').text(),
    ).toContain('Last updated by 123 at ');

    const inProgressComputeContainer = computeContainers.at(1);
    expect(inProgressComputeContainer.find('[data-test-id="compute-config-status"]').text()).toBe(
      'Status: Pending',
    );
    expect(
      inProgressComputeContainer.find('[data-test-id="compute-config-concurrency"]').text(),
    ).toBe('Provisioned Concurrency:4');
    expect(
      inProgressComputeContainer.find('[data-test-id="compute-config-message"]').text(),
    ).toContain('Last updated by 123 at');
  });

  test('Compute config containers with failed compute show correct information', () => {
    minimalStore = mockStore(mockStoreV2);
    const store = mockStore({
      entities: {
        ...minimalStore.getState().entities,
        endpointVersionStatusV2: { [[modelKey]]: [mockFailedEndpointVersionStatusV2] },
      },
    });
    wrapper = computeConfigViewWrapper(store, {
      ...minimalProps,
      endpointVersionName: '4',
      endpointVersion: getEndpointVersionFromState(store.getState()),
    });
    const computeContainers = wrapper.find('[data-test-id="compute-config-container"]');
    expect(computeContainers.length).toBe(2);

    const deployedComputeContainer = computeContainers.at(0);
    expect(deployedComputeContainer.find('[data-test-id="compute-config-status"]').text()).toBe(
      'Status: Failed',
    );
    expect(
      deployedComputeContainer.find('[data-test-id="compute-config-concurrency"]').text(),
    ).toBe('Provisioned Concurrency:8-16');
    expect(
      deployedComputeContainer.find('[data-test-id="compute-config-message"]').text(),
    ).toContain('Last updated by 123 at ');

    const inProgressComputeContainer = computeContainers.at(1);
    expect(inProgressComputeContainer.find('[data-test-id="compute-config-status"]').text()).toBe(
      'Status: Failed',
    );
    expect(
      inProgressComputeContainer.find('[data-test-id="compute-config-concurrency"]').text(),
    ).toBe('Provisioned Concurrency:4');
    expect(inProgressComputeContainer.find('[data-test-id="compute-config-message"]').text()).toBe(
      'Your current compute is still active. You can retry this configuration update or update to another configuration through the Compute Settings tab.',
    );
  });
});
