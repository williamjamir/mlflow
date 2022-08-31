import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Select, Input, Form } from 'antd';
import { Button, FolderIcon, Tabs } from '@databricks/design-system';
import { FormattedMessage, injectIntl } from 'react-intl';

import { Stages } from '../constants';
import { Spacer } from '../../shared/building_blocks/Spacer';
import { Spinner } from '../../common/components/Spinner';
import DatabricksUtils from '../../common/utils/DatabricksUtils';
import { EnableServing } from '../../model-serving/components/EnableServing';
import { DEFAULT_OUTPUT_TABLE_DIRECTORY } from '../constants';
import './ConfigureInferenceForm.css';
import { UniverseFrontendApis } from '../../common/utils/UniverseFrontendApis';

const { TabPane } = Tabs;
const { Option } = Select;

export const ConfigureInferenceFormFields = {
  MODEL_VERSION_FIELD: 'modelVersion',
  INPUT_DATA_FIELD: 'inputTable',
  OUTPUT_SUBDIRECTORY_FIELD: 'outputSubdirectory',
};

export const ConfigureInferenceTabs = {
  BATCH_INFERENCE: 'batch-inference',
  REAL_TIME: 'real-time',
};

const getDataInputValue = ({ catalog, database, table }) => {
  if (catalog) {
    return `${catalog}.${database}.${table}`;
  }
  return `${database}.${table}`;
};

/**
 * Component that renders a form for generating a batch inference notebook.
 */
class ConfigureInferenceFormImpl extends Component {
  static propTypes = {
    modelName: PropTypes.string.isRequired,
    modelVersions: PropTypes.arrayOf(
      PropTypes.shape({
        current_stage: PropTypes.string.isRequired,
        version: PropTypes.string.isRequired,
      }),
    ).isRequired,
    defaultVersion: PropTypes.string,
    permissionLevel: PropTypes.string.isRequired,
    innerRef: PropTypes.any.isRequired,
    activeKey: PropTypes.string.isRequired,
    handleKeyChange: PropTypes.func.isRequired,
    visible: PropTypes.bool.isRequired,
    validator: PropTypes.func,
    endpointExists: PropTypes.bool,
    loading: PropTypes.bool, // enable serving loading state
    handleEnableServing: PropTypes.func,
    handleEnableServingV2: PropTypes.func,
    intl: PropTypes.any,
  };

  renderDropdownOption(text, disabled, value) {
    return (
      <Option key={value} value={value} disabled={disabled}>
        {text}
      </Option>
    );
  }

  getDropdownOptions() {
    const { defaultVersion, modelVersions } = this.props;
    const activeStageOptions = [];
    let defaultStageOrVersion;
    [Stages.PRODUCTION, Stages.STAGING].forEach((s) => {
      const modelsInStage = modelVersions.filter((m) => m.current_stage === s);
      if (modelsInStage.length === 0) {
        activeStageOptions.push(
          this.renderDropdownOption(`${s} (no ${s.toLowerCase()} models)`, true, s),
        );
      } else {
        const maxVersion = modelsInStage.reduce((p, v) => {
          return p.version > v.version ? p : v;
        });
        if (defaultVersion && defaultVersion === maxVersion.version) {
          defaultStageOrVersion = s;
        }
        activeStageOptions.push(
          this.renderDropdownOption(`${s} (Version ${maxVersion.version})`, false, s),
        );
      }
    });

    if (defaultVersion && !defaultStageOrVersion) {
      defaultStageOrVersion = defaultVersion;
    }

    modelVersions.sort((a, b) => {
      return b.version - a.version;
    });
    const allVersionOptions = modelVersions.map((m) =>
      this.renderDropdownOption(`Version ${m.version}`, false, m.version),
    );

    return { options: [...activeStageOptions, ...allVersionOptions], defaultStageOrVersion };
  }

  renderModelVersionsDropdown() {
    const { options, defaultStageOrVersion } = this.getDropdownOptions();
    return (
      <Form.Item
        data-test-id='generate-batch-inference-dropdown'
        label={this.props.intl.formatMessage({
          defaultMessage: 'Model version',
          description: 'Model version label on the configure inference form',
        })}
        name={ConfigureInferenceFormFields.MODEL_VERSION_FIELD}
        initialValue={defaultStageOrVersion}
        validateTrigger={['onChange', 'onBlur']}
        rules={[
          {
            required: true,
            message: this.props.intl.formatMessage({
              defaultMessage: 'Please select a model stage or version.',
              description:
                // eslint-disable-next-line max-len
                'Error message for missing model stage or version input when generating a batch inference notebook',
            }),
            whitespace: true,
          },
        ]}
      >
        <Select
          placeholder={this.props.intl.formatMessage({
            defaultMessage: 'Model version',
            description: 'Model version placeholder on configure inference form',
          })}
        >
          {options}
        </Select>
      </Form.Item>
    );
  }

  renderBatchInference() {
    const { modelName } = this.props;
    return (
      <Form ref={this.props.innerRef} layout='vertical'>
        <p>
          <FormattedMessage
            defaultMessage='Generates a notebook in your home folder that you can edit.'
            description='Form description for generating a batch inference notebook'
          />
        </p>
        {this.renderModelVersionsDropdown()}
        <Spacer size='medium' direction='horizontal'>
          <div style={{ flexGrow: 1 }}>
            <Form.Item
              label={this.props.intl.formatMessage({
                defaultMessage: 'Input table',
                description: 'Input table label on the configure inference form',
              })}
              name={ConfigureInferenceFormFields.INPUT_DATA_FIELD}
              rules={[
                {
                  required: true,
                  message: this.props.intl.formatMessage({
                    defaultMessage: 'Please provide an input table.',
                    description:
                      // eslint-disable-next-line max-len
                      'Error message for missing input table when generating a batch inference notebook',
                  }),
                },
              ]}
              shouldUpdate={(prevValues, currentValues) =>
                prevValues[ConfigureInferenceFormFields.INPUT_DATA_FIELD] !==
                currentValues[ConfigureInferenceFormFields.INPUT_DATA_FIELD]
              }
            >
              <Input
                placeholder={this.props.intl.formatMessage({
                  defaultMessage: 'Input table',
                  description: 'Input table placeholder on the configure inference form',
                })}
                readOnly
              />
            </Form.Item>
          </div>
          <Form.Item label=' '>
            <Button data-test-id='browse-input-table-btn' onClick={this.showDataSelectorModal}>
              <FormattedMessage
                defaultMessage='Browse'
                description='Button text for browsing tables on the configure inference form'
              />
            </Button>
          </Form.Item>
        </Spacer>
        <Form.Item
          label={this.props.intl.formatMessage({
            defaultMessage: 'Output table location',
            description: 'Output table location placleholder on the configure inference form',
          })}
          extra={this.props.intl.formatMessage({
            defaultMessage:
              'The default output path on DBFS is accessible to everyone in this Workspace.' +
              ' Modify the notebook to disable writing data to DBFS.',
            description: 'Legal disclaimer for output table location',
          })}
          name={ConfigureInferenceFormFields.OUTPUT_SUBDIRECTORY_FIELD}
          initialValue={modelName}
          rules={[
            {
              required: true,
              message: this.props.intl.formatMessage({
                defaultMessage: 'Please provide an output path.',
                description:
                  // eslint-disable-next-line max-len
                  'Error message for missing output table when generating a batch inference notebook',
              }),
            },
          ]}
        >
          <Input
            prefix={
              <FolderIcon
                data-test-id='use-model-folder-icon'
                onClick={this.showFileBrowserModal}
              />
            }
            addonBefore={DEFAULT_OUTPUT_TABLE_DIRECTORY}
            placeholder={this.props.intl.formatMessage({
              defaultMessage: 'Subdirectory',
              description:
                'Input description for the subdirectory field on the configure inference form',
            })}
          />
        </Form.Item>
      </Form>
    );
  }

  showDataSelectorModal = () => {
    UniverseFrontendApis.showDataSelectorModal().then((tablePath) => {
      this.props.innerRef.current.setFieldsValue({
        [ConfigureInferenceFormFields.INPUT_DATA_FIELD]: getDataInputValue(tablePath),
      });
    });
  };

  showFileBrowserModal = () => {
    UniverseFrontendApis.showFileBrowserModal({
      rootPath: DEFAULT_OUTPUT_TABLE_DIRECTORY,
      openPath: this.props.innerRef.current.getFieldValue(
        ConfigureInferenceFormFields.OUTPUT_SUBDIRECTORY_FIELD,
      ),
    }).then((tablePath) => {
      if (tablePath.startsWith(DEFAULT_OUTPUT_TABLE_DIRECTORY)) {
        this.props.innerRef.current.setFieldsValue({
          // eslint-disable-next-line max-len
          // slice here because all paths in the input field are relative to DEFAULT_OUTPUT_TABLE_DIRECTORY
          [ConfigureInferenceFormFields.OUTPUT_SUBDIRECTORY_FIELD]: tablePath.slice(
            DEFAULT_OUTPUT_TABLE_DIRECTORY.length,
          ),
        });
      }
    });
  };

  renderLoadingComponent() {
    return (
      <div className='use-model-spinner'>
        <Spinner />
      </div>
    );
  }

  renderTabs() {
    const { activeKey, handleKeyChange } = this.props;
    return (
      <>
        <p>
          <FormattedMessage
            defaultMessage='Select either batch inference or real-time inference.'
            // eslint-disable-next-line max-len
            description='Text for form description on using the model for batch or real-time inference'
          />
        </p>
        <Tabs animated={false} activeKey={activeKey} onChange={handleKeyChange}>
          <TabPane tab='Batch inference' key={ConfigureInferenceTabs.BATCH_INFERENCE}>
            {this.renderBatchInference()}
          </TabPane>
          <TabPane tab='Real-time' key={ConfigureInferenceTabs.REAL_TIME}>
            {this.renderRealTime()}
          </TabPane>
        </Tabs>
      </>
    );
  }

  renderRealTime() {
    const { permissionLevel, endpointExists, loading, handleEnableServing, handleEnableServingV2 } =
      this.props;

    if (loading) {
      return this.renderLoadingComponent();
    } else if (endpointExists) {
      return (
        <p>
          <FormattedMessage
            // eslint-disable-next-line max-len
            defaultMessage='View existing real-time inference endpoints for this model in the model registry page.'
            description='Text for form description on viewing real-time inference'
          />
        </p>
      );
    } else {
      return (
        <EnableServing
          modelPermissionLevel={permissionLevel}
          handleEnableServing={handleEnableServing}
          handleEnableServingV2={handleEnableServingV2}
          showButton={false}
        />
      );
    }
  }

  render() {
    return DatabricksUtils.isModelServingEnabled()
      ? this.renderTabs()
      : this.renderBatchInference();
  }
}

export const ConfigureInferenceForm = injectIntl(ConfigureInferenceFormImpl);
