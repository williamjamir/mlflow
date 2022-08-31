import { Select } from '@databricks/design-system';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { mountWithIntl } from 'src/common/utils/TestUtils';
import { customMonitoringTagMock, monitoringTagMock } from '../testUtils';
import { getActiveModelMonitoringTags } from '../utils';
import { MonitoringPane, modelDetails } from './MonitoringPane';

jest.mock('../hooks/useJobFetch', () => ({
  useJobFetch: () => ({
    isLoading: true,
  }),
}));

describe('MonitoringPane', () => {
  const monitoringViewWrapper = (props) =>
    mountWithIntl(
      <BrowserRouter>
        <MonitoringPane {...props} />
      </BrowserRouter>,
    );

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should render with minimal props without exploding', () => {
    const tags = getActiveModelMonitoringTags([monitoringTagMock]);
    const wrapper = monitoringViewWrapper({ monitors: tags });
    expect(wrapper.find("[data-testid='model-monitoring-pane']")).toHaveLength(1);
  });

  it('shows monitoring dashboard button when dashboard path exists', () => {
    const tags = getActiveModelMonitoringTags([monitoringTagMock]);
    const wrapper = monitoringViewWrapper({ monitors: tags });
    const button = wrapper.find("a[data-testid='monitor-dashboard-button']");
    expect(button.prop('disabled')).toBe(false);
  });

  it('displays an link to the docs when no monitors exist', () => {
    const wrapper = monitoringViewWrapper({ monitors: [] });
    expect(wrapper.find('a[data-testid="monitoring-docs-link"]')).toHaveLength(1);
  });

  it('disables the monitoring button when dashboard path is missing', () => {
    const tags = getActiveModelMonitoringTags([
      customMonitoringTagMock({ dashboard_notebook_path: null }),
    ]);
    const wrapper = monitoringViewWrapper({ monitors: tags });
    const button = wrapper.find("button[data-testid='monitor-dashboard-button']");
    expect(button.prop('disabled')).toBe(true);
  });

  describe('monitor select', () => {
    it('should be disabled if only one monitor', () => {
      const tags = getActiveModelMonitoringTags([monitoringTagMock]);
      const wrapper = monitoringViewWrapper({ monitors: tags });
      const input = wrapper.find(Select);
      expect(input.prop('disabled')).toBe(true);
    });

    it('should display the monitor name', () => {
      const monitorName = 'my custom model name';
      const tags = getActiveModelMonitoringTags([
        customMonitoringTagMock({ config: { monitor_name: monitorName } }),
      ]);
      const wrapper = monitoringViewWrapper({ monitors: tags });
      const input = wrapper.find(Select);
      expect(input.text()).toBe(monitorName);
    });

    it('should allow for switching between two or more monitors', () => {
      const tags = getActiveModelMonitoringTags([
        monitoringTagMock,
        customMonitoringTagMock({ config: { monitor_name: 'second monitor' } }),
      ]);

      const wrapper = monitoringViewWrapper({ monitors: tags });
      const input = wrapper.find(Select);
      expect(input.prop('disabled')).toBe(false);
    });
  });

  describe('monitor details', () => {
    modelDetails.forEach((key) => {
      it(`displays ${key} for monitor`, () => {
        const customText = 'my_custom_values';
        const tags = getActiveModelMonitoringTags([
          customMonitoringTagMock({ config: { [key]: customText } }),
        ]);
        const wrapper = monitoringViewWrapper({ monitors: tags });
        const span = wrapper.find(`[data-testid='${key}']`);
        expect(span.text()).toBe(customText);
      });
    });
  });
});
