import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import _ from 'lodash';
import { Checkbox, Col, notification, Row, Form, Tooltip as AntdTooltip } from 'antd';
import {
  Button,
  Spacer,
  Typography,
  Select,
  useDesignSystemTheme,
} from '@databricks/design-system';
import { ConfirmModal } from '../../experiment-tracking/components/modals/ConfirmModal';
import Utils from '../../common/utils/Utils';
import { Tooltip } from '../utils';
import { Stages, StageTagComponents } from '../../model-registry/constants';
import { FormattedMessage } from 'react-intl';
import { DBU_PER_CONCURRENT_REQUEST } from '../constants';

const { Title } = Typography;

export const DataTestIds = {
  workloadSizeDropdown: 'compute-workload-size-dropdown',
  prodWorkloadSizeDropdown: 'production-compute-workload-size-dropdown',
  stagingWorkloadSizeDropdown: 'staging-compute-workload-size-dropdown',
  prodScaleToZeroCheckbox: 'production-scale-to-zero-checkbox',
  stagingScaleToZeroCheckbox: 'staging-scale-to-zero-checkbox',
  scaleToZeroCheckbox: 'scale-to-zero-checkbox',
};

ScaleToZeroCheckbox.propTypes = {
  checked: PropTypes.bool,
  onChange: PropTypes.func,
};

function ScaleToZeroCheckbox({ checked, onChange }) {
  return (
    <Checkbox
      css={styles.scaleToZeroCheckbox}
      checked={checked}
      onChange={onChange}
      data-test-id={DataTestIds.scaleToZeroCheckbox}
    >
      {messages.enableScaleToZeroLabel}
    </Checkbox>
  );
}

WorkloadSizeDropdown.propTypes = {
  supportedServingV2WorkloadSizes: PropTypes.array,
  workloadSizeId: PropTypes.string,
  onChange: PropTypes.func,
  scaleToZeroEnabled: PropTypes.bool,
  dbuPerConcurrentRequest: PropTypes.number,
};

function WorkloadSizeDropdown({
  supportedServingV2WorkloadSizes,
  workloadSizeId,
  onChange,
  scaleToZeroEnabled,
  dbuPerConcurrentRequest,
}) {
  return (
    <div>
      <Select
        data-test-id={DataTestIds.workloadSizeDropdown}
        value={workloadSizeId}
        onChange={(event) => {
          onChange(event);
        }}
        css={{
          width: '75%',
        }}
      >
        {supportedServingV2WorkloadSizes.map((workloadSize) => {
          const { key, max_concurrency } = workloadSize;
          const min_concurrency = scaleToZeroEnabled ? 0 : workloadSize.min_concurrency;
          const min_dbu = min_concurrency * dbuPerConcurrentRequest;
          const max_dbu = max_concurrency * dbuPerConcurrentRequest;
          const concurrencyDescription =
            min_concurrency === max_concurrency
              ? `${min_concurrency} concurrent requests`
              : `${min_concurrency}-${max_concurrency} concurrent requests`;
          const dbuDescription =
            min_dbu === max_dbu ? `(${min_dbu} DBU)` : `(${min_dbu}-${max_dbu} DBU)`;
          const workloadSizeDescription = `${concurrencyDescription} ${dbuDescription}`;
          return (
            <Select.Option value={key}>
              <div
                css={{
                  marginRight: '10px',
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <span>
                  <b>{key}</b>
                </span>
                <span>{workloadSizeDescription}</span>
              </div>
            </Select.Option>
          );
        })}
      </Select>
    </div>
  );
}

ComputeContainer.propTypes = {
  configMessage: PropTypes.any,
  checkbox: PropTypes.any,
  workloadSizeDropdown: PropTypes.any,
};

// Renders the container that contains the staging and/or production compute config options
function ComputeContainer({ configMessage, checkbox, workloadSizeDropdown }) {
  const { theme } = useDesignSystemTheme();
  const workloadSizeLabel = (
    <div>
      {messages.workloadSizeLabelText}
      <Tooltip contents={messages.workloadTooltipText} />
    </div>
  );
  return (
    <div
      data-test-id='editable-compute-settings-compute-container'
      css={{
        borderRadius: theme.borders.borderRadiusMd,
        border: `1px solid ${theme.colors.border}`,
        padding: theme.spacing.lg,
        maxWidth: '50%',
        marginBottom: theme.spacing.lg,
      }}
    >
      <Row gutter={[0, 20]}>
        <Col span={24}>{configMessage}</Col>
      </Row>
      <Row gutter={20}>
        <Col span={20}>
          <Form.Item label={workloadSizeLabel}>{workloadSizeDropdown}</Form.Item>
        </Col>
      </Row>
      <Row gutter={20}>
        <Col span={20}>{checkbox}</Col>
      </Row>
    </div>
  );
}

ComputeOptions.propTypes = {
  formRef: PropTypes.object,
  productionWorkloadSizeId: PropTypes.string,
  stagingWorkloadSizeId: PropTypes.string,
  supportedServingV2WorkloadSizes: PropTypes.array,
  handleStagingWorkloadSizeIdChange: PropTypes.func,
  handleProdWorkloadSizeIdChange: PropTypes.func,
  sameComputeConfigSpecsForStages: PropTypes.bool,
  scaleToZeroEnabledForProd: PropTypes.bool,
  handleScaleToZeroProdCheckbox: PropTypes.func,
  scaleToZeroEnabledForStaging: PropTypes.bool,
  handleScaleToZeroStagingCheckbox: PropTypes.func,
  stagingFieldNames: PropTypes.object,
  productionFieldNames: PropTypes.object,
  dbuPerConcurrentRequest: PropTypes.number,
};

// Renders Scale To Zero checkbox and Compute dropdowns
// eslint-disable-next-line max-params
function ComputeOptions({
  productionWorkloadSizeId,
  stagingWorkloadSizeId,
  supportedServingV2WorkloadSizes,
  handleStagingWorkloadSizeIdChange,
  handleProdWorkloadSizeIdChange,
  sameComputeConfigSpecsForStages,
  scaleToZeroEnabledForProd,
  handleScaleToZeroProdCheckbox,
  scaleToZeroEnabledForStaging,
  handleScaleToZeroStagingCheckbox,
  dbuPerConcurrentRequest,
}) {
  const sameConfigMessage = (
    <div css={styles.configText}>
      <FormattedMessage
        defaultMessage='All {productionTag}and {stagingTag}models will use the following compute:'
        description='Compute config message for configurations with same compute'
        values={messages.stageTags}
      />
    </div>
  );

  const productionConfigMessage = (
    <div css={styles.configText}>
      <FormattedMessage
        defaultMessage='{productionTag}models will use the following compute:'
        description='Compute config message for production compute'
        values={messages.stageTags}
      />
    </div>
  );

  const stagingConfigMessage = (
    <div css={styles.configText}>
      <FormattedMessage
        defaultMessage='{stagingTag}models will use the following compute:'
        description='Compute config message for staging compute'
        values={messages.stageTags}
      />
    </div>
  );

  const productionMessage = sameComputeConfigSpecsForStages
    ? sameConfigMessage
    : productionConfigMessage;
  const productionComputeContainer = (
    <ComputeContainer
      configMessage={productionMessage}
      checkbox={
        <ScaleToZeroCheckbox
          checked={scaleToZeroEnabledForProd}
          onChange={handleScaleToZeroProdCheckbox}
          data-test-id={DataTestIds.prodScaleToZeroCheckbox}
        />
      }
      workloadSizeDropdown={
        <WorkloadSizeDropdown
          data-test-id={DataTestIds.prodWorkloadSizeDropdown}
          supportedServingV2WorkloadSizes={supportedServingV2WorkloadSizes}
          workloadSizeId={productionWorkloadSizeId}
          onChange={handleProdWorkloadSizeIdChange}
          scaleToZeroEnabled={scaleToZeroEnabledForProd}
          dbuPerConcurrentRequest={dbuPerConcurrentRequest}
        />
      }
    />
  );

  // Render only one compute container when staging and production models have the same compute
  if (sameComputeConfigSpecsForStages) {
    return productionComputeContainer;
  } else {
    // Render two compute containers when staging and production have different compute configs
    const stagingComputeContainer = (
      <ComputeContainer
        configMessage={stagingConfigMessage}
        checkbox={
          <ScaleToZeroCheckbox
            checked={scaleToZeroEnabledForStaging}
            onChange={handleScaleToZeroStagingCheckbox}
            data-test-id={DataTestIds.stagingScaleToZeroCheckbox}
          />
        }
        workloadSizeDropdown={
          <WorkloadSizeDropdown
            data-test-id={DataTestIds.stagingWorkloadSizeDropdown}
            supportedServingV2WorkloadSizes={supportedServingV2WorkloadSizes}
            workloadSizeId={stagingWorkloadSizeId}
            onChange={handleStagingWorkloadSizeIdChange}
            scaleToZeroEnabled={scaleToZeroEnabledForStaging}
            dbuPerConcurrentRequest={dbuPerConcurrentRequest}
          />
        }
      />
    );

    return (
      <div>
        {productionComputeContainer}
        {stagingComputeContainer}
      </div>
    );
  }
}

ComputeSettingsSubmitButton.propTypes = {
  canSubmitForm: PropTypes.bool,
  prodConfigChanged: PropTypes.bool,
  stagingConfigChanged: PropTypes.bool,
  isSubmitting: PropTypes.bool,
};

function ComputeSettingsSubmitButton({
  canSubmitForm,
  prodConfigChanged,
  stagingConfigChanged,
  isSubmitting,
}) {
  const submitButton = (
    <Button
      type='primary'
      htmlType='submit'
      data-test-id='serving-cluster-submit'
      disabled={!canSubmitForm}
      loading={isSubmitting}
    >
      {messages.updateButton}
    </Button>
  );
  if (prodConfigChanged || stagingConfigChanged) {
    return submitButton;
  }

  return (
    <AntdTooltip
      data-test-id='submit-compute-tooltip'
      title={messages.noConfigurationChangeTooltip}
    >
      {submitButton}
    </AntdTooltip>
  );
}

/**
 * NB: This component assumes that endpoint.compute_config is defined, which
 * is briefly false when the endpoint is just being created. Therefore, the
 * rendering of this component should be gated on compute_config.
 */
export class EditableComputeSettingsViewImpl extends React.Component {
  static propTypes = {
    modelName: PropTypes.string.isRequired,
    endpoint: PropTypes.shape({
      registered_model_name: PropTypes.string.isRequired,
      state: PropTypes.string.isRequired,
      state_message: PropTypes.string,
      compute_config: PropTypes.arrayOf(
        // Compute Config
        PropTypes.shape({
          stage: PropTypes.string.isRequired,
          version: PropTypes.number.isRequired,
          creation_timestamp: PropTypes.number,
          user_id: PropTypes.number,
          // Compute Config Spec
          workload_spec: PropTypes.shape({
            workload_size_id: PropTypes.string.isRequired,
            scale_to_zero_enabled: PropTypes.bool.isRequired,
          }),
        }),
      ),
    }).isRequired,
    supportedServingV2WorkloadSizes: PropTypes.array.isRequired,
    handleSubmit: PropTypes.func.isRequired,
  };

  getComputeConfigForStage = (stage, compute_configs) => {
    if (!compute_configs) {
      return '';
    }
    return compute_configs.filter((compute_config) => {
      return compute_config.stage === stage;
    })[0];
  };

  constructor(props) {
    super(props);
    const { compute_config } = this.props.endpoint;
    const stagingConfigSpec = this.getComputeConfigForStage(
      Stages.STAGING,
      compute_config,
    ).workload_spec;
    const productionConfigSpec = this.getComputeConfigForStage(
      Stages.PRODUCTION,
      compute_config,
    ).workload_spec;
    this.state = {
      stagingWorkloadSizeId: stagingConfigSpec.workload_size_id,
      productionWorkloadSizeId: productionConfigSpec.workload_size_id,
      showUpdateConfirmModal: false,
      sameComputeConfigSpecsForStages: _.isEqual(stagingConfigSpec, productionConfigSpec),
      scaleToZeroEnabledForStaging: stagingConfigSpec.scale_to_zero_enabled,
      scaleToZeroEnabledForProduction: productionConfigSpec.scale_to_zero_enabled,
      dbuPerConcurrentRequest: DBU_PER_CONCURRENT_REQUEST,
      isSubmitting: false,
    };
    // NB: For any functions that use this.formRef.current, it's important that
    // they are called after the Form component is mounted, otherwise
    // formRef.current is null. getConfirmModalHelpText for example was called
    // before the form was rendered and tried to get the form fields, which is why it
    // is conditionally rendered based on canSubmitForm. canSubmitForm implicitly
    // guarantees that the form is rendered as it checks that field values are defined
    this.formRef = React.createRef();
  }

  getConfigUpdateDescription = (stageTag) => {
    return (
      <FormattedMessage
        defaultMessage='Creating new {stageTag}compute resources with the specified configuration.
        This may take a few minutes.'
        description='Compute config update description'
        values={{ stageTag: stageTag }}
      />
    );
  };

  showSuccessNotification = (shouldShow, description) => {
    if (shouldShow) {
      return notification.info({
        message: messages.successNotificationMessage,
        description: description,
        placement: 'bottomRight',
        duration: 10,
      });
    }
    return null;
  };

  isDesiredStagingConfigSame = () => {
    const { compute_config } = this.props.endpoint;
    const stagingConfigSpec = this.getComputeConfigForStage(
      Stages.STAGING,
      compute_config,
    ).workload_spec;
    return _.isEqual(stagingConfigSpec, this.getDesiredStagingComputeSpec());
  };

  isDesiredProductionConfigSame = () => {
    const { compute_config } = this.props.endpoint;
    const productionConfigSpec = this.getComputeConfigForStage(
      Stages.PRODUCTION,
      compute_config,
    ).workload_spec;
    return _.isEqual(productionConfigSpec, this.getDesiredProductionComputeSpec());
  };

  getDesiredStagingComputeSpec = () => {
    if (this.state.sameComputeConfigSpecsForStages) {
      return this.getDesiredProductionComputeSpec();
    }

    return {
      workload_size_id: this.state.stagingWorkloadSizeId,
      scale_to_zero_enabled: this.state.scaleToZeroEnabledForStaging,
    };
  };

  getDesiredProductionComputeSpec = () => {
    return {
      workload_size_id: this.state.productionWorkloadSizeId,
      scale_to_zero_enabled: this.state.scaleToZeroEnabledForProduction,
    };
  };

  handleSubmit = async () => {
    const stagingConfigChanged = !this.isDesiredStagingConfigSame();
    const prodConfigChanged = !this.isDesiredProductionConfigSame();
    let ret;
    this.setState({
      isSubmitting: true,
    });
    if (stagingConfigChanged) {
      ret = await this.props
        .handleSubmit(Stages.STAGING, this.getDesiredStagingComputeSpec())
        .then(() =>
          this.showSuccessNotification(
            !this.isDesiredStagingConfigSame(),
            this.getConfigUpdateDescription(StageTagComponents[Stages.STAGING]),
          ),
        )
        .catch(Utils.logErrorAndNotifyUser);
    }
    if (prodConfigChanged) {
      ret = await this.props
        .handleSubmit(Stages.PRODUCTION, this.getDesiredProductionComputeSpec())
        .then(() =>
          this.showSuccessNotification(
            !this.isDesiredProductionConfigSame(),
            this.getConfigUpdateDescription(StageTagComponents[Stages.PRODUCTION]),
          ),
        )
        .catch(Utils.logErrorAndNotifyUser);
    }

    return ret;
  };

  openConfirmModal = () => {
    this.setState({
      showUpdateConfirmModal: true,
    });
  };

  closeConfirmModal = () => {
    this.setState({
      showUpdateConfirmModal: false,
    });
  };

  handleSameConfigCheckboxChange = () => {
    const { sameComputeConfigSpecsForStages } = this.state;
    if (!sameComputeConfigSpecsForStages) {
      this.setState({
        desiredStagingComputeSpec: {
          ...this.state.desiredProductionComputeSpec,
        },
        sameComputeConfigSpecsForStages: !this.state.sameComputeConfigSpecsForStages,
      });
    } else {
      const { compute_config } = this.props.endpoint;
      const stagingConfigSpec = this.getComputeConfigForStage(
        Stages.STAGING,
        compute_config,
      ).workload_spec;
      this.setState({
        desiredStagingComputeSpec: stagingConfigSpec,
        sameComputeConfigSpecsForStages: !this.state.sameComputeConfigSpecsForStages,
      });
    }
  };

  sameComputeSettingsTooltip = (
    <div>
      <FormattedMessage
        defaultMessage='Choose to share or have different compute settings between
        {stagingTag}and {productionTag}models.'
        description='Tooltip for same compute checkbox toggle'
        values={messages.stageTags}
      />
    </div>
  );

  handleScaleToZeroProductionCheckbox = () => {
    this.setState((state, props) => ({
      scaleToZeroEnabledForProduction: !state.scaleToZeroEnabledForProduction,
    }));
  };

  handleScaleToZeroStagingCheckbox = () => {
    this.setState((state, props) => ({
      scaleToZeroEnabledForStaging: !state.scaleToZeroEnabledForStaging,
    }));
  };

  handleProductionWorkloadSizeIdChange = (value) => {
    if (this.state.sameComputeConfigSpecsForStages) {
      this.setState({
        productionWorkloadSizeId: value,
        stagingWorkloadSizeId: value,
      });
    } else {
      this.setState({
        productionWorkloadSizeId: value,
      });
    }
  };

  handleStagingWorkloadSizeIdChange = (value) => {
    this.setState({
      stagingWorkloadSizeId: value,
    });
  };

  getFormState = () => {
    const prodConfigChanged = !this.isDesiredProductionConfigSame();
    const stagingConfigChanged = !this.isDesiredStagingConfigSame();
    const canSubmitForm = prodConfigChanged || stagingConfigChanged;
    // NB: The frontend sees config updates based on regular polling. Thus, we
    // set loading state here rather than after the API call, otherwise the button
    // will flash from loading to clickable during the time between the API call
    // and the next polling interval
    if (this.state.isSubmitting && !canSubmitForm) {
      this.setState({
        isSubmitting: false,
      });
    }
    const { isSubmitting } = this.state;
    return { canSubmitForm, prodConfigChanged, stagingConfigChanged, isSubmitting };
  };

  productionAndStagingConfigChangeMessage = (
    <div css={styles.configText}>
      <FormattedMessage
        defaultMessage='Launch resources for {productionTag}and
      {stagingTag}model versions with the currently specified compute configuration?'
        description='Confirmation message for updating production and staging compute config'
        values={messages.stageTags}
      />
    </div>
  );

  productionConfigChangeMessage = (
    <div css={styles.configText}>
      <p style={{ whiteSpace: 'pre-line' }}>
        <FormattedMessage
          defaultMessage='No configuration change specified for {stagingTag}model versions.{br}{br}
          Launch resources for {productionTag}model versions with the currently specified compute
          configuration?'
          description='Confirmation message for updating production compute config'
          values={{ ...messages.stageTags, br: <br /> }}
        />
      </p>
    </div>
  );

  stagingConfigChangeMessage = (
    <div css={styles.configText}>
      <p style={{ whiteSpace: 'pre-line' }}>
        <FormattedMessage
          // eslint-disable-next-line max-len
          defaultMessage='No configuration change specified for {productionTag}model versions.{br}{br}
          Launch resources for {stagingTag}model versions with the currently specified compute
          configuration?'
          description='Confirmation message for updating staging compute config'
          values={{ ...messages.stageTags, br: <br /> }}
        />
      </p>
    </div>
  );

  getConfirmModalHelpText = () => {
    const prodConfigUnchanged = this.isDesiredProductionConfigSame();
    const stagingConfigUnchanged = this.isDesiredStagingConfigSame();
    if (!prodConfigUnchanged && !stagingConfigUnchanged) {
      return this.productionAndStagingConfigChangeMessage;
    } else if (stagingConfigUnchanged) {
      return this.productionConfigChangeMessage;
    } else {
      return this.stagingConfigChangeMessage;
    }
  };

  render() {
    const {
      showUpdateConfirmModal,
      stagingWorkloadSizeId,
      productionWorkloadSizeId,
      sameComputeConfigSpecsForStages,
      dbuPerConcurrentRequest,
    } = this.state;

    return (
      <div className='editable-cluster-settings-page' css={styles.computePage}>
        <div className='editable-cluster-settings-intro' css={styles.introduction}>
          <Title level={3} withoutMargins>
            {messages.computeSettingsTitle}
          </Title>
          <Spacer size='small' />
          <div className='editable-cluster-settings-description' css={styles.configText}>
            {messages.computeSettingsDescription}
          </div>
          <Title level={4} withoutMargins>
            {messages.preferencesTitle}
          </Title>
          <Spacer size='small' />
          <Checkbox
            data-test-id='same-compute-config-checkbox'
            checked={sameComputeConfigSpecsForStages}
            onChange={this.handleSameConfigCheckboxChange}
          >
            {messages.sameComputeConfigCheckboxDescription}{' '}
            <Tooltip contents={this.sameComputeSettingsTooltip} />
          </Checkbox>
        </div>
        <div data-test-id='editable-compute-settings'>
          <Form layout='vertical' ref={this.formRef} onFinish={this.openConfirmModal}>
            <ComputeOptions
              supportedServingV2WorkloadSizes={this.props.supportedServingV2WorkloadSizes}
              stagingWorkloadSizeId={stagingWorkloadSizeId}
              productionWorkloadSizeId={productionWorkloadSizeId}
              handleStagingWorkloadSizeIdChange={this.handleStagingWorkloadSizeIdChange}
              handleProdWorkloadSizeIdChange={this.handleProductionWorkloadSizeIdChange}
              sameComputeConfigSpecsForStages={sameComputeConfigSpecsForStages}
              scaleToZeroEnabledForProd={this.state.scaleToZeroEnabledForProduction}
              handleScaleToZeroProdCheckbox={this.handleScaleToZeroProductionCheckbox}
              scaleToZeroEnabledForStaging={this.state.scaleToZeroEnabledForStaging}
              handleScaleToZeroStagingCheckbox={this.handleScaleToZeroStagingCheckbox}
              dbuPerConcurrentRequest={dbuPerConcurrentRequest}
              onFinish={this.openConfirmModal}
            />
            <Form.Item shouldUpdate>
              {() => {
                const formState = this.getFormState();
                return (
                  <div className='editable-cluster-settings-form-buttons' css={styles.formButtons}>
                    <ComputeSettingsSubmitButton {...formState} />
                    {/* The confirm modal should not be rendered if the form cannot be submitted */}
                    {formState.canSubmitForm && (
                      <ConfirmModal
                        isOpen={showUpdateConfirmModal}
                        onClose={this.closeConfirmModal}
                        handleSubmit={this.handleSubmit}
                        title={messages.confirmModalTitle}
                        helpText={this.getConfirmModalHelpText()}
                        confirmButtonText={messages.confirmButton}
                      />
                    )}
                  </div>
                );
              }}
            </Form.Item>
          </Form>
        </div>
      </div>
    );
  }
}

const styles = {
  introduction: {
    marginBottom: 20,
  },
  formButtons: {
    marginTop: '50px',
  },
  sectionStyle: {
    width: '600px',
  },
  configText: {
    marginBottom: '16px',
  },
  scaleToZeroCheckbox: {
    marginTop: 0,
    marginBottom: 16,
    width: '75%',
    justifyContent: 'right',
  },
};

const messages = {
  stageTags: {
    productionTag: StageTagComponents[Stages.PRODUCTION],
    stagingTag: StageTagComponents[Stages.STAGING],
  },
  workloadTooltipText: (
    <FormattedMessage
      defaultMessage='The number of requests that can be concurrently processed.'
      description='Tooltip for workload size dropdown'
    />
  ),
  workloadSizeLabelText: (
    <FormattedMessage
      defaultMessage='Workload size'
      description='Workload size label for compute configuration'
    />
  ),
  enableScaleToZeroLabel: (
    <FormattedMessage
      defaultMessage='Scale to zero'
      description='Checkbox text for enabling scale to zero'
    />
  ),
  successNotificationMessage: (
    <FormattedMessage
      defaultMessage='Launching Compute Configuration'
      description='Compute config successful update request notification title'
    />
  ),
  computeSettingsTitle: (
    <FormattedMessage defaultMessage='Compute Settings' description='Compute config tab title' />
  ),
  computeSettingsDescription: (
    <FormattedMessage
      defaultMessage='Change the compute configurations used in serving this endpoint.'
      description='Compute config tab description'
    />
  ),
  preferencesTitle: (
    <FormattedMessage
      defaultMessage='Preferences'
      description='Preferences title for compute config'
    />
  ),
  sameComputeConfigCheckboxDescription: (
    <FormattedMessage
      defaultMessage='Use same compute settings for each model stage'
      description='Description for same compute settings checkbox'
    />
  ),
  confirmModalTitle: (
    <FormattedMessage
      defaultMessage='Confirm New Settings'
      description='Title for confirm compute config update modal'
    />
  ),
  confirmButton: (
    <span>
      <FormattedMessage
        defaultMessage='Confirm'
        description='Update compute config confirm button text'
      />
    </span>
  ),
  updateButton: (
    <span>
      <FormattedMessage defaultMessage='Update' description='Compute config update button text' />
    </span>
  ),
  noConfigurationChangeTooltip: (
    <FormattedMessage
      defaultMessage='No configuration change specified for staging and production model versions'
      description='Tooltip message for when no configuration changes are specified'
    />
  ),
};

const mapStateToProps = (state, ownProps) => {
  const { supportedServingV2WorkloadSizes } = state.entities;
  return { supportedServingV2WorkloadSizes };
};

export const EditableComputeSettingsView = connect(
  mapStateToProps,
  null,
)(EditableComputeSettingsViewImpl);
