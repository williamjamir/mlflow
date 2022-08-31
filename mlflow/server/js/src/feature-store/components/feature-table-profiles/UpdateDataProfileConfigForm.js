import React, { useEffect, useState } from 'react';
import {
  CalendarEventIcon,
  Checkbox,
  Form,
  Select,
  Spacer,
  Typography,
} from '@databricks/design-system';
import PropTypes from 'prop-types';
import { useIntl, defineMessages } from 'react-intl';
import { Select as AntSelect } from 'antd';
import { FeatureTableProps, ModelMonitoringConfigurationProps } from './FeatureTableProfileProps';

const { Option } = Select;
// Dubois does not currently have OptGroup. Can remove when it finally does.
const { OptGroup } = AntSelect;
const { Title } = Typography;

export const GLOBAL_PROFILE_KEY = 'GLOBAL';
export const RefreshMode = {
  MANUAL_REFRESH: 'MANUAL_REFRESH',
  AUTO_REFRESH: 'AUTO_REFRESH',
};

const granularities = ['1 hour', '1 day', '1 week', '1 month'];
const SELECT_WIDTH = 360;

const granularityTranslations = defineMessages({
  [GLOBAL_PROFILE_KEY]: {
    defaultMessage: 'Global (single profile)',
    description: 'global window granularity for data profiles',
  },
  '1 hour': {
    defaultMessage: '1 hour',
    description: '1 hour window granularity for data profiles',
  },
  '1 day': { defaultMessage: '1 day', description: '1 day window granularity for data profiles' },
  '1 week': {
    defaultMessage: '1 week',
    description: '1 week window granularity for data profiles',
  },
  '1 month': {
    defaultMessage: '1 month',
    description: '1 month window granularity for data profiles',
  },
});

/**
 * The following function is necessary because the form requires 1 value for window granularity,
 * but the backend responds with an array of window_granularities (1 granularity + "GLOBAL" if
 * global profile is included).
 * Thus we determine the value of windowGranularity by either filtering out the "GLOBAL" key or
 * simply taking the initial value in the array.
 */
export function getInitialWindowGranularity(window_granularities) {
  return window_granularities.length > 1
    ? window_granularities.filter((g) => g !== GLOBAL_PROFILE_KEY)[0]
    : window_granularities[0];
}

export function setInitialValues(config = {}) {
  const { features = [], refresh_mode, window_granularities = [] } = config;
  const windowGranularity = getInitialWindowGranularity(window_granularities);

  return {
    windowGranularity,
    shouldAutoRecompute: refresh_mode === RefreshMode.AUTO_REFRESH,
    includeGlobalProfile: window_granularities.includes(GLOBAL_PROFILE_KEY),
    features,
  };
}

// The form features a checkbox which should only be disabled if the current config is set to GLOBAL
// only.
export function getInitialDisableGlobalCheckboxState(config = {}) {
  const { window_granularities = [] } = config;
  return window_granularities.length === 1 && window_granularities[0] === GLOBAL_PROFILE_KEY;
}

export function UpdateDataProfileConfigForm({ config, featureTable, form }) {
  const intl = useIntl();
  const [shouldDisableGlobalCheckbox, setShouldDisableGlobalCheckbox] = useState(
    getInitialDisableGlobalCheckboxState(config),
  );
  const { features } = featureTable;

  useEffect(() => {
    form.resetFields();
  }, [config, form]);

  const handleValuesChange = (changedValue) => {
    const { windowGranularity } = changedValue;
    if (windowGranularity) {
      setShouldDisableGlobalCheckbox(windowGranularity === GLOBAL_PROFILE_KEY);
    }
  };

  return (
    <Form
      name='update-data-profile-config'
      form={form}
      initialValues={setInitialValues(config)}
      onValuesChange={handleValuesChange}
    >
      <Form.Item
        label={intl.formatMessage({
          defaultMessage: 'Time Window Granularity',
          description: 'Label text for window granularity in update config modal',
        })}
        help={intl.formatMessage({
          defaultMessage: 'Aggregate data into time windows or group as a single profile',
          description: 'Hint text for window granularity in update config modal',
        })}
        name='windowGranularity'
      >
        <Select style={{ width: SELECT_WIDTH }}>
          <Option value={GLOBAL_PROFILE_KEY}>
            {intl.formatMessage(granularityTranslations[GLOBAL_PROFILE_KEY])}
          </Option>
          <OptGroup
            label={intl.formatMessage({
              defaultMessage: 'Granularities',
              description: 'Option group title for window granularities in update config modal',
            })}
          >
            {granularities.map((g) => (
              <Option key={g} value={g}>
                <CalendarEventIcon /> {intl.formatMessage(granularityTranslations[g])}
              </Option>
            ))}
          </OptGroup>
        </Select>
      </Form.Item>
      <Spacer size='medium' />

      <Form.Item
        help={intl.formatMessage({
          defaultMessage:
            'Include a profile of the entire feature table (in addition to the windowed profiles)',
          description: 'Hint text for global profile in update config modal',
        })}
        name='includeGlobalProfile'
        valuePropName='isChecked'
      >
        <Checkbox isDisabled={shouldDisableGlobalCheckbox}>
          {intl.formatMessage({
            defaultMessage: 'Compute global profiles',
            description: 'Checkbox text for including global data profiles for feature tables',
          })}
        </Checkbox>
      </Form.Item>
      <Spacer size='medium' />

      <Title level={3}>
        {intl.formatMessage({
          defaultMessage: 'Advanced',
          description: 'Advanced section heading in update config modal',
        })}
      </Title>

      <Form.Item name='shouldAutoRecompute' valuePropName='isChecked'>
        <Checkbox>
          {intl.formatMessage({
            defaultMessage: 'Automatically recompute profiles when feature table is updated',
            description:
              'Checkbox text for auto recomputing global data profiles for feature tables',
          })}
        </Checkbox>
      </Form.Item>

      <Form.Item
        label={intl.formatMessage({
          defaultMessage: 'Included Features',
          description: 'Label text for features in update config modal',
        })}
        name='features'
      >
        <Select
          mode='multiple'
          style={{ width: SELECT_WIDTH }}
          maxTagCount='responsive'
          placeholder={intl.formatMessage({
            defaultMessage: 'All features',
            description: 'Label text for features in update config modal',
          })}
        >
          <OptGroup
            label={intl.formatMessage({
              defaultMessage: 'Features',
              description: 'Option group title for features in update config modal',
            })}
          >
            {features.map((f) => (
              <Option key={f} value={f}>
                {f}
              </Option>
            ))}
          </OptGroup>
        </Select>
      </Form.Item>
    </Form>
  );
}
UpdateDataProfileConfigForm.propTypes = {
  config: ModelMonitoringConfigurationProps,
  featureTable: FeatureTableProps.isRequired,
  form: PropTypes.shape({
    resetFields: PropTypes.func.isRequired,
  }).isRequired,
};
