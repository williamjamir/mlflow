import React from 'react';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import promiseMiddleware from 'redux-promise-middleware';
import { Provider } from 'react-redux';
import { Tabs } from '@databricks/design-system';
import { shallowWithInjectIntl } from '../../common/utils/TestUtils';
import { ConfigureInferenceForm, ConfigureInferenceTabs } from './ConfigureInferenceForm';
import { mockModelVersionDetailed } from '../test-utils';
import { Stages, PermissionLevels, ModelVersionStatus } from '../constants';
import { mountWithIntl } from '../../common/utils/TestUtils';

describe('Render test', () => {
  let wrapper;
  let minimalProps;
  let minimalStore;
  const mockStore = configureStore([thunk, promiseMiddleware()]);

  const setServingEnabled = (enabled) => {
    /* eslint-disable no-restricted-globals */
    top.settings = {
      isModelServingEnabledInCurrentWorkspace: enabled,
    };
  };

  beforeEach(() => {
    minimalStore = mockStore({ entities: { clusterPermissions: {} } });
    minimalProps = {
      modelName: 'model',
      visible: true,
      modelVersions: [],
      permissionLevel: PermissionLevels.CAN_MANAGE,
      handleEnableServing: jest.fn(),
      handleEnableServingV2: jest.fn(),
      handleKeyChange: jest.fn(),
      activeKey: ConfigureInferenceTabs.BATCH_INFERENCE,
      innerRef: React.createRef(),
    };
    setServingEnabled(true);
    window.top.postMessage = jest.fn();
  });

  test('should render batch inference tab with minimal props without exploding', () => {
    const props = {
      ...minimalProps,
      activeKey: ConfigureInferenceTabs.BATCH_INFERENCE,
    };
    wrapper = mountWithIntl(
      <Provider store={minimalStore}>
        <ConfigureInferenceForm {...props} />
      </Provider>,
    );
    expect(wrapper.length).toBe(1);
  });

  test('should render real-time tab with minimal props without exploding', () => {
    const props = { ...minimalProps, activeKey: ConfigureInferenceTabs.REAL_TIME };
    wrapper = mountWithIntl(
      <Provider store={minimalStore}>
        <ConfigureInferenceForm {...props} />
      </Provider>,
    );
    expect(wrapper.find(Tabs).length).toBe(1);
    expect(wrapper.length).toBe(1);
  });

  test('should not render real-time tab if serving is not enabled', () => {
    setServingEnabled(false);
    wrapper = mountWithIntl(
      <Provider store={minimalStore}>
        <ConfigureInferenceForm {...minimalProps} />
      </Provider>,
    );
    expect(wrapper.find(Tabs).length).toBe(0);
  });

  test('options dropdown displays correctly when production and staging are available', () => {
    const modelVersions = [
      mockModelVersionDetailed('Model A', '1', Stages.PRODUCTION, ModelVersionStatus.READY),
      mockModelVersionDetailed('Model A', '2', Stages.STAGING, ModelVersionStatus.READY),
      mockModelVersionDetailed('Model A', '3', Stages.NONE, ModelVersionStatus.READY),
    ];
    const props = {
      ...minimalProps,
      activeKey: ConfigureInferenceTabs.BATCH_INFERENCE,
      modelVersions: modelVersions,
    };
    wrapper = shallowWithInjectIntl(<ConfigureInferenceForm {...props} />);
    expect(wrapper.find('[value="Production"]').children().text()).toContain('Version 1');
    expect(wrapper.find('[value="Staging"]').children().text()).toContain('Version 2');
    expect(wrapper.find('[value="Production"]').prop('disabled')).toBe(false);
    expect(wrapper.find('[value="Staging"]').prop('disabled')).toBe(false);
    modelVersions.forEach((m) => {
      expect(wrapper.find(`[value="${m.version}"]`).children().text()).toBe(`Version ${m.version}`);
    });
  });

  test('options dropdown displays correctly when production is not available', () => {
    const modelVersions = [
      mockModelVersionDetailed('Model A', '1', Stages.NONE, ModelVersionStatus.READY),
      mockModelVersionDetailed('Model A', '2', Stages.STAGING, ModelVersionStatus.READY),
      mockModelVersionDetailed('Model A', '3', Stages.NONE, ModelVersionStatus.READY),
    ];
    const props = {
      ...minimalProps,
      activeKey: ConfigureInferenceTabs.BATCH_INFERENCE,
      modelVersions: modelVersions,
    };
    wrapper = shallowWithInjectIntl(<ConfigureInferenceForm {...props} />);
    expect(wrapper.find('[value="Production"]').length).toBe(1);
    expect(wrapper.find('[value="Staging"]').children().text()).toContain('Version 2');
    expect(wrapper.find('[value="Production"]').prop('disabled')).toBe(true);
    expect(wrapper.find('[value="Staging"]').prop('disabled')).toBe(false);
    modelVersions.forEach((m) => {
      expect(wrapper.find(`[value="${m.version}"]`).children().text()).toBe(`Version ${m.version}`);
    });
  });

  test('options dropdown uses latest version when multiple production models are available', () => {
    const modelVersions = [
      mockModelVersionDetailed('Model A', '1', Stages.PRODUCTION, ModelVersionStatus.READY),
      mockModelVersionDetailed('Model A', '2', Stages.PRODUCTION, ModelVersionStatus.READY),
      mockModelVersionDetailed('Model A', '3', Stages.STAGING, ModelVersionStatus.READY),
      mockModelVersionDetailed('Model A', '4', Stages.STAGING, ModelVersionStatus.READY),
    ];
    const props = {
      ...minimalProps,
      activeKey: ConfigureInferenceTabs.BATCH_INFERENCE,
      modelVersions: modelVersions,
    };
    wrapper = shallowWithInjectIntl(<ConfigureInferenceForm {...props} />);
    expect(wrapper.find('[value="Production"]').children().text()).toContain(`Version 2`);
    expect(wrapper.find('[value="Staging"]').children().text()).toContain(`Version 4`);
    expect(wrapper.find('[value="Production"]').prop('disabled')).toBe(false);
    expect(wrapper.find('[value="Staging"]').prop('disabled')).toBe(false);
    modelVersions.forEach((m) => {
      expect(wrapper.find(`[value="${m.version}"]`).children().text()).toBe(`Version ${m.version}`);
    });
  });

  test('clicking on browse should post message', () => {
    wrapper = mountWithIntl(<ConfigureInferenceForm {...minimalProps} />);
    wrapper.find('button[data-test-id="browse-input-table-btn"]').simulate('click');
    expect(window.top.postMessage).toHaveBeenCalledTimes(1);
  });

  test('clicking on folder icon should post message', () => {
    wrapper = mountWithIntl(<ConfigureInferenceForm {...minimalProps} />);
    expect(wrapper.find('[role="img"][data-test-id="use-model-folder-icon"]').length).toBe(1);
    wrapper.find('[role="img"][data-test-id="use-model-folder-icon"]').simulate('click');
    expect(window.top.postMessage).toHaveBeenCalledTimes(1);
  });
});
