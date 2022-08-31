import _ from 'lodash';
import {
  EditableComputeSettingsView,
  EditableComputeSettingsViewImpl,
  DataTestIds,
} from './EditableComputeSettingsView';
import { ConfirmModal } from '../../experiment-tracking/components/modals/ConfirmModal';

import configureStore from 'redux-mock-store';

import {
  mockComputeConfig,
  mockComputeConfigSpec,
  mockEndpointStatusV2,
  mockDifferentComputeConfig,
  mockSameComputeConfig,
  mockSupportedWorkloadSizes,
  computeSettingsWrapper,
} from '../test-utils';

import { WORKLOAD_TSHIRT_SIZES } from '../constants';

describe('ComputeSettingsView', () => {
  let wrapper;
  let instance;
  let minimalProps;
  let mockStore;
  let store;

  const mockModelName = 'ModelAV2';

  const verifyUpdateButtonEnabled = (enabled) => {
    expect(wrapper.find('[data-test-id="serving-cluster-submit"]').at(0).props().disabled).toBe(
      !enabled,
    );
  };

  const simulateDropdownInput = (dataTestId, value) => {
    const selector = `[data-test-id="${dataTestId}"]`;
    wrapper.find(selector).at(0).props().onChange(value);
    wrapper.update();
  };

  const simulateCheckboxClick = (dataTestId) => {
    const selector = `[data-test-id="${dataTestId}"]`;
    wrapper.find(selector).at(0).props().onChange();
    wrapper.update();
  };

  beforeEach(() => {
    minimalProps = {
      modelName: mockModelName,
      endpoint: mockEndpointStatusV2({
        registered_model_name: mockModelName,
        state: 'ENDPOINT_STATE_READY',
        compute_config: mockDifferentComputeConfig,
      }),
      handleSubmit: jest.fn(),
    };
    mockStore = configureStore();
    store = mockStore({
      entities: {
        supportedServingV2WorkloadSizes: mockSupportedWorkloadSizes,
      },
    });
  });

  test('should render with minimal props without exploding', () => {
    wrapper = computeSettingsWrapper(store, minimalProps);
    expect(wrapper.find(EditableComputeSettingsView).length).toBe(1);
  });

  test('workload size dropdown should display three options', () => {
    wrapper = computeSettingsWrapper(store, minimalProps);
    const options = wrapper
      .find(`[data-test-id="${DataTestIds.workloadSizeDropdown}"]`)
      .at(0)
      .props().children;

    expect(options[0].props.value).toBe(WORKLOAD_TSHIRT_SIZES.SMALL);
    expect(options[0].props.children.props.children[1].props.children).toBe(
      '4 concurrent requests (4 DBU)',
    );
    expect(options[1].props.value).toBe(WORKLOAD_TSHIRT_SIZES.MEDIUM);
    expect(options[1].props.children.props.children[1].props.children).toBe(
      '8-16 concurrent requests (8-16 DBU)',
    );
    expect(options[2].props.value).toBe(WORKLOAD_TSHIRT_SIZES.LARGE);
    expect(options[2].props.children.props.children[1].props.children).toBe(
      '16-64 concurrent requests (16-64 DBU)',
    );
  });

  test('should display confirm modal when update button is clicked', () => {
    wrapper = computeSettingsWrapper(store, minimalProps);

    expect(wrapper.find(ConfirmModal).length).toBe(0);
    // Update button should be disabled when no compute config change is detected
    verifyUpdateButtonEnabled(false);

    // Update desired concurrency to enable update button
    simulateDropdownInput(DataTestIds.prodWorkloadSizeDropdown, WORKLOAD_TSHIRT_SIZES.LARGE);

    verifyUpdateButtonEnabled(true);
    // Click on update button
    wrapper.find('[data-test-id="serving-cluster-submit"]').at(0).simulate('click');
    expect(wrapper.find(ConfirmModal).length).toBe(1);
  });

  test('should display callback on submit', (done) => {
    const mockSubmit = jest.fn(() => Promise.resolve({}));
    const myProps = {
      ...minimalProps,
      handleSubmit: mockSubmit,
    };
    wrapper = computeSettingsWrapper(store, myProps);

    instance = wrapper.find(EditableComputeSettingsViewImpl).instance();
    simulateDropdownInput(DataTestIds.prodWorkloadSizeDropdown, WORKLOAD_TSHIRT_SIZES.LARGE);

    const spy = jest.spyOn(instance, 'showSuccessNotification');
    const promise = instance.handleSubmit();
    promise.finally(() => {
      expect(mockSubmit).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledTimes(1);
      done();
    });
  });

  test('should display same/different stage compute options based on selection', () => {
    wrapper = computeSettingsWrapper(store, minimalProps);
    // Both Production and Staging compute configs are editable initially
    expect(
      wrapper.find('[data-test-id="editable-compute-settings-compute-container"]').length,
    ).toBe(2);
    verifyUpdateButtonEnabled(false);

    // Check the checkbox to set the config to be the same for both stages
    wrapper.find('[data-test-id="same-compute-config-checkbox"]').at(0).prop('onChange')();
    wrapper.update();
    expect(
      wrapper.find('[data-test-id="same-compute-config-checkbox"]').at(0).props().checked,
    ).toBe(true);
    // Only one compute config edit option is visible
    expect(
      wrapper.find('[data-test-id="editable-compute-settings-compute-container"]').length,
    ).toBe(1);

    // Check the checkbox to set the config to be different for the stages
    wrapper.find('[data-test-id="same-compute-config-checkbox"]').at(0).prop('onChange')();
    wrapper.update();
    expect(
      wrapper.find('[data-test-id="editable-compute-settings-compute-container"]').length,
    ).toBe(2);
    expect(
      wrapper.find('[data-test-id="same-compute-config-checkbox"]').at(0).props().checked,
    ).toBe(false);
  });

  test('Update compute config button is properly enabled and same compute config checkbox works correctly', () => {
    const myProps = {
      ...minimalProps,
      endpoint: mockEndpointStatusV2({
        registered_model_name: mockModelName,
        state: 'ENDPOINT_STATE_READY',
        compute_config: mockSameComputeConfig,
      }),
    };
    wrapper = computeSettingsWrapper(store, myProps);

    // same compute config should be true by default here
    expect(
      wrapper.find('[data-test-id="same-compute-config-checkbox"]').at(0).props().checked,
    ).toBe(true);

    verifyUpdateButtonEnabled(false);

    simulateDropdownInput(DataTestIds.prodWorkloadSizeDropdown, WORKLOAD_TSHIRT_SIZES.LARGE);
    verifyUpdateButtonEnabled(true);

    // Uncheck the same compute config checkbox
    wrapper.find('[data-test-id="same-compute-config-checkbox"]').at(0).prop('onChange')();
    wrapper.update();
    expect(
      wrapper.find('[data-test-id="same-compute-config-checkbox"]').at(0).props().checked,
    ).toBe(false);

    // Set the prod and staging config back to the original
    simulateDropdownInput(DataTestIds.prodWorkloadSizeDropdown, WORKLOAD_TSHIRT_SIZES.SMALL);
    simulateDropdownInput(DataTestIds.stagingWorkloadSizeDropdown, WORKLOAD_TSHIRT_SIZES.SMALL);
    verifyUpdateButtonEnabled(false);
  });

  test('toggling scale to zero should change workload size dropdown options', () => {
    wrapper = computeSettingsWrapper(store, minimalProps);
    const options = wrapper
      .find(`[data-test-id="${DataTestIds.workloadSizeDropdown}"]`)
      .at(0)
      .props().children;

    expect(options[0].props.value).toBe(WORKLOAD_TSHIRT_SIZES.SMALL);
    expect(options[0].props.children.props.children[1].props.children).toBe(
      '4 concurrent requests (4 DBU)',
    );
    expect(options[1].props.value).toBe(WORKLOAD_TSHIRT_SIZES.MEDIUM);
    expect(options[1].props.children.props.children[1].props.children).toBe(
      '8-16 concurrent requests (8-16 DBU)',
    );
    expect(options[2].props.value).toBe(WORKLOAD_TSHIRT_SIZES.LARGE);
    expect(options[2].props.children.props.children[1].props.children).toBe(
      '16-64 concurrent requests (16-64 DBU)',
    );

    simulateCheckboxClick(DataTestIds.scaleToZeroCheckbox);
    const newOptions = wrapper
      .find(`[data-test-id="${DataTestIds.workloadSizeDropdown}"]`)
      .at(0)
      .props().children;

    expect(newOptions[0].props.value).toBe(WORKLOAD_TSHIRT_SIZES.SMALL);
    expect(newOptions[0].props.children.props.children[1].props.children).toBe(
      '0-4 concurrent requests (0-4 DBU)',
    );
    expect(newOptions[1].props.value).toBe(WORKLOAD_TSHIRT_SIZES.MEDIUM);
    expect(newOptions[1].props.children.props.children[1].props.children).toBe(
      '0-16 concurrent requests (0-16 DBU)',
    );
    expect(newOptions[2].props.value).toBe(WORKLOAD_TSHIRT_SIZES.LARGE);
    expect(newOptions[2].props.children.props.children[1].props.children).toBe(
      '0-64 concurrent requests (0-64 DBU)',
    );

    simulateCheckboxClick(DataTestIds.scaleToZeroCheckbox);
    const originalOptions = wrapper
      .find(`[data-test-id="${DataTestIds.workloadSizeDropdown}"]`)
      .at(0)
      .props().children;

    expect(originalOptions[0].props.value).toBe(WORKLOAD_TSHIRT_SIZES.SMALL);
    expect(originalOptions[0].props.children.props.children[1].props.children).toBe(
      '4 concurrent requests (4 DBU)',
    );
    expect(originalOptions[1].props.value).toBe(WORKLOAD_TSHIRT_SIZES.MEDIUM);
    expect(originalOptions[1].props.children.props.children[1].props.children).toBe(
      '8-16 concurrent requests (8-16 DBU)',
    );
    expect(originalOptions[2].props.value).toBe(WORKLOAD_TSHIRT_SIZES.LARGE);
    expect(originalOptions[2].props.children.props.children[1].props.children).toBe(
      '16-64 concurrent requests (16-64 DBU)',
    );
  });

  test('Compute config confirm modal renders the correct help text', () => {
    const defaultStagingComputeConfig = mockComputeConfig({
      stage: 'Staging',
      workload_spec: mockComputeConfigSpec({
        workload_size_id: WORKLOAD_TSHIRT_SIZES.SMALL,
        scale_to_zero_enabled: false,
      }),
    });
    const defaultProdComputeConfig = mockComputeConfig({
      stage: 'Production',
      workload_spec: mockComputeConfigSpec({
        workload_size_id: WORKLOAD_TSHIRT_SIZES.MEDIUM,
        scale_to_zero_enabled: false,
      }),
    });
    const diffStagingComputeConfig = mockComputeConfig({
      stage: 'Staging',
      workload_spec: mockComputeConfigSpec({
        workload_size_id: WORKLOAD_TSHIRT_SIZES.LARGE,
        scale_to_zero_enabled: false,
      }),
    });
    const diffProdComputeConfig = mockComputeConfig({
      stage: 'Production',
      workload_spec: mockComputeConfigSpec({
        workload_size_id: WORKLOAD_TSHIRT_SIZES.LARGE,
        scale_to_zero_enabled: false,
      }),
    });

    const myProps = {
      ...minimalProps,
      endpoint: mockEndpointStatusV2({
        registered_model_name: mockModelName,
        state: 'ENDPOINT_STATE_READY',
        compute_config: [defaultProdComputeConfig, defaultStagingComputeConfig],
      }),
    };

    wrapper = computeSettingsWrapper(store, myProps);
    const computeWrapper = wrapper.find(EditableComputeSettingsViewImpl);
    computeWrapper.setState({ showUpdateConfirmModal: true });

    // these are the only cases where the confirm modal should be allowed to open
    const cases = [
      {
        desiredStagingComputeSpec: diffStagingComputeConfig.workload_spec,
        desiredProductionComputeSpec: defaultProdComputeConfig.workload_spec,
        helpText:
          'No configuration change specified for Productionmodel versions. Launch resources for Stagingmodel versions with the currently specified compute configuration?',
      },
      {
        desiredStagingComputeSpec: defaultStagingComputeConfig.workload_spec,
        desiredProductionComputeSpec: diffProdComputeConfig.workload_spec,
        helpText:
          'No configuration change specified for Stagingmodel versions. Launch resources for Productionmodel versions with the currently specified compute configuration?',
      },
      {
        desiredStagingComputeSpec: diffStagingComputeConfig.workload_spec,
        desiredProductionComputeSpec: diffProdComputeConfig.workload_spec,
        helpText:
          'Launch resources for Productionand Stagingmodel versions with the currently specified compute configuration?',
      },
      {
        desiredStagingComputeSpec: diffProdComputeConfig.workload_spec,
        desiredProductionComputeSpec: diffProdComputeConfig.workload_spec,
        helpText:
          'Launch resources for Productionand Stagingmodel versions with the currently specified compute configuration?',
      },
    ];

    _.forEach(cases, ({ desiredProductionComputeSpec, desiredStagingComputeSpec, helpText }) => {
      simulateDropdownInput(
        DataTestIds.prodWorkloadSizeDropdown,
        desiredProductionComputeSpec.workload_size_id,
      );
      simulateDropdownInput(
        DataTestIds.stagingWorkloadSizeDropdown,
        desiredStagingComputeSpec.workload_size_id,
      );
      // Click on update button
      wrapper.find('[data-test-id="serving-cluster-submit"]').at(0).simulate('click');
      wrapper.update();
      const modal = wrapper.find('.editable-cluster-settings-form-buttons .modal-explanatory-text');
      expect(modal.text()).toBe(helpText);
    });
  });

  test('Using sameComputeConfigSpecsForStages properly syncs prod and staging compute specs', () => {
    const stagingComputeConfig = mockComputeConfig({
      stage: 'Staging',
      workload_spec: mockComputeConfigSpec({
        workload_size_id: WORKLOAD_TSHIRT_SIZES.SMALL,
        scale_to_zero_enabled: false,
      }),
    });
    const prodComputeConfing = mockComputeConfig({
      stage: 'Production',
      workload_spec: mockComputeConfigSpec({
        workload_size_id: WORKLOAD_TSHIRT_SIZES.MEDIUM,
        scale_to_zero_enabled: false,
      }),
    });

    const myProps = {
      ...minimalProps,
      endpoint: mockEndpointStatusV2({
        registered_model_name: mockModelName,
        state: 'ENDPOINT_STATE_READY',
        compute_config: [prodComputeConfing, stagingComputeConfig],
      }),
    };

    wrapper = wrapper = computeSettingsWrapper(store, myProps);

    const computeWrapper = wrapper.find(EditableComputeSettingsViewImpl);
    const isSameSpecs = () => {
      return _.isEqual(
        computeWrapper.instance().getDesiredProductionComputeSpec(),
        computeWrapper.instance().getDesiredStagingComputeSpec(),
      );
    };

    simulateDropdownInput(DataTestIds.stagingWorkloadSizeDropdown, WORKLOAD_TSHIRT_SIZES.LARGE);

    const stagingComputeSpec = computeWrapper.instance().getDesiredStagingComputeSpec();

    expect(stagingComputeSpec.workload_size_id).toBe(WORKLOAD_TSHIRT_SIZES.LARGE);
    expect(stagingComputeSpec.scale_to_zero_enabled).toBe(false);
    expect(isSameSpecs()).toBe(false);

    // set same compute config for stages to be true
    computeWrapper.setState({ sameComputeConfigSpecsForStages: true });

    // prod and staging spec should be the same after setting same compute config for stages
    expect(isSameSpecs()).toBe(true);

    simulateDropdownInput(DataTestIds.prodWorkloadSizeDropdown, WORKLOAD_TSHIRT_SIZES.SMALL);
    expect(isSameSpecs()).toBe(true);
    expect(
      _.isEqual(computeWrapper.instance().getDesiredProductionComputeSpec(), {
        workload_size_id: WORKLOAD_TSHIRT_SIZES.SMALL,
        scale_to_zero_enabled: false,
      }),
    ).toBe(true);

    // Turn on scale to zero
    simulateCheckboxClick(DataTestIds.prodScaleToZeroCheckbox);
    expect(isSameSpecs()).toBe(true);
    expect(
      _.isEqual(computeWrapper.instance().getDesiredProductionComputeSpec(), {
        workload_size_id: WORKLOAD_TSHIRT_SIZES.SMALL,
        scale_to_zero_enabled: true,
      }),
    ).toBe(true);

    simulateDropdownInput(DataTestIds.prodWorkloadSizeDropdown, WORKLOAD_TSHIRT_SIZES.LARGE);
    expect(isSameSpecs()).toBe(true);
    expect(
      _.isEqual(computeWrapper.instance().getDesiredProductionComputeSpec(), {
        workload_size_id: WORKLOAD_TSHIRT_SIZES.LARGE,
        scale_to_zero_enabled: true,
      }),
    ).toBe(true);

    // Turn off scale to zero
    simulateCheckboxClick(DataTestIds.prodScaleToZeroCheckbox);
    expect(isSameSpecs()).toBe(true);
    expect(
      _.isEqual(computeWrapper.instance().getDesiredProductionComputeSpec(), {
        workload_size_id: WORKLOAD_TSHIRT_SIZES.LARGE,
        scale_to_zero_enabled: false,
      }),
    ).toBe(true);
  });

  test('form maintains correct staging and prod compute spec state', () => {
    const stagingComputeConfig = mockComputeConfig({
      stage: 'Staging',
      workload_spec: mockComputeConfigSpec({
        workload_size_id: WORKLOAD_TSHIRT_SIZES.SMALL,
        scale_to_zero_enabled: false,
      }),
    });
    const prodComputeConfing = mockComputeConfig({
      stage: 'Production',
      workload_spec: mockComputeConfigSpec({
        workload_size_id: WORKLOAD_TSHIRT_SIZES.MEDIUM,
        scale_to_zero_enabled: false,
      }),
    });

    const myProps = {
      ...minimalProps,
      endpoint: mockEndpointStatusV2({
        registered_model_name: mockModelName,
        state: 'ENDPOINT_STATE_READY',
        compute_config: [prodComputeConfing, stagingComputeConfig],
      }),
    };

    wrapper = computeSettingsWrapper(store, myProps);
    const computeWrapper = wrapper.find(EditableComputeSettingsViewImpl);
    const getCurrentProdConfig = () => {
      return computeWrapper.instance().getDesiredProductionComputeSpec();
    };
    const getCurrentStagingConfig = () => {
      return computeWrapper.instance().getDesiredStagingComputeSpec();
    };

    simulateDropdownInput(DataTestIds.stagingWorkloadSizeDropdown, WORKLOAD_TSHIRT_SIZES.LARGE);
    expect(
      _.isEqual(getCurrentStagingConfig(), {
        workload_size_id: WORKLOAD_TSHIRT_SIZES.LARGE,
        scale_to_zero_enabled: false,
      }),
    ).toBe(true);

    simulateDropdownInput(DataTestIds.stagingWorkloadSizeDropdown, WORKLOAD_TSHIRT_SIZES.SMALL);
    expect(
      _.isEqual(getCurrentStagingConfig(), {
        workload_size_id: WORKLOAD_TSHIRT_SIZES.SMALL,
        scale_to_zero_enabled: false,
      }),
    ).toBe(true);

    // Turn on scale to zero
    simulateCheckboxClick(DataTestIds.stagingScaleToZeroCheckbox);
    expect(
      _.isEqual(getCurrentStagingConfig(), {
        workload_size_id: WORKLOAD_TSHIRT_SIZES.SMALL,
        scale_to_zero_enabled: true,
      }),
    ).toBe(true);

    // Turn off scale to zero
    simulateCheckboxClick(DataTestIds.stagingScaleToZeroCheckbox);
    expect(
      _.isEqual(getCurrentStagingConfig(), {
        workload_size_id: WORKLOAD_TSHIRT_SIZES.SMALL,
        scale_to_zero_enabled: false,
      }),
    ).toBe(true);

    simulateDropdownInput(DataTestIds.prodWorkloadSizeDropdown, WORKLOAD_TSHIRT_SIZES.LARGE);
    expect(
      _.isEqual(getCurrentProdConfig(), {
        workload_size_id: WORKLOAD_TSHIRT_SIZES.LARGE,
        scale_to_zero_enabled: false,
      }),
    ).toBe(true);

    // turn on scale to zero
    simulateCheckboxClick(DataTestIds.prodScaleToZeroCheckbox);
    expect(
      _.isEqual(getCurrentProdConfig(), {
        workload_size_id: WORKLOAD_TSHIRT_SIZES.LARGE,
        scale_to_zero_enabled: true,
      }),
    ).toBe(true);

    // There should be no change in the staging compute config
    expect(
      _.isEqual(getCurrentStagingConfig(), {
        workload_size_id: WORKLOAD_TSHIRT_SIZES.SMALL,
        scale_to_zero_enabled: false,
      }),
    ).toBe(true);
  });

  test('submit button tooltip correctly renders', () => {
    wrapper = computeSettingsWrapper(store, minimalProps);
    // tooltip should be present by default
    expect(wrapper.find('Tooltip[data-test-id="submit-compute-tooltip"]').length).toBe(1);
    simulateDropdownInput(DataTestIds.prodWorkloadSizeDropdown, WORKLOAD_TSHIRT_SIZES.LARGE);

    // tooltip should disappear after changing the max concurrency
    expect(wrapper.find('Tooltip[data-test-id="submit-compute-tooltip"]').length).toBe(0);
  });
});
