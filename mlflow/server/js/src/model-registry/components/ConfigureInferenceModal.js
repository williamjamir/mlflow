import React from 'react';
import { Button } from '@databricks/design-system';
import { GenericInputModal } from '../../experiment-tracking/components/modals/GenericInputModal';
import { ConfigureInferenceForm } from './ConfigureInferenceForm';
import { connect } from 'react-redux';
import { generateBatchInferenceNotebookApi } from '../actions';
import { getUUID } from '../../common/utils/ActionUtils';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import { getModelPageRoute } from '../routes';
import { ConfigureInferenceFormFields, ConfigureInferenceTabs } from './ConfigureInferenceForm';
import Utils from '../../common/utils/Utils';
import { EnableServingButton } from '../../model-serving/components/EnableServingButton';
import { withServing } from '../../model-serving/components/withServing';
import { withClusterPermissions } from '../../model-serving/components/withClusterPermissions';
import { PreviewIcon } from '../../shared/building_blocks/PreviewIcon';
import { FeedbackLink } from '../../shared/databricks_edge/FeedbackLink';
import { Spacer } from '../../shared/building_blocks/Spacer';
import { FormattedMessage } from 'react-intl';
import { DEFAULT_OUTPUT_TABLE_DIRECTORY } from '../constants';
import { getServingModelKey } from '../../model-serving/utils';

export class ConfigureInferenceModalImpl extends React.Component {
  static propTypes = {
    generateBatchInferenceNotebookApi: PropTypes.func.isRequired,
    modelName: PropTypes.string.isRequired,
    modelVersions: PropTypes.array,
    defaultVersion: PropTypes.string,
    permissionLevel: PropTypes.string,
    history: PropTypes.object.isRequired,
    modalVisible: PropTypes.bool.isRequired,
    hideModal: PropTypes.func.isRequired,
    intl: PropTypes.any,
    // props from withServing
    endpoint: PropTypes.object,
    loading: PropTypes.bool,
    handleEnableServing: PropTypes.func,
    handleEnableServingV2: PropTypes.func,
    // wired props
    endpointV2: PropTypes.object,
    // props from withClusterPermissions
    canCreateServingClusters: PropTypes.bool,
  };

  static createOutputPath(subdirectory) {
    return DEFAULT_OUTPUT_TABLE_DIRECTORY + subdirectory;
  }

  createGenerateBatchInferenceNotebookRequestId = getUUID();

  // active tab
  state = {
    activeKey: ConfigureInferenceTabs.BATCH_INFERENCE,
  };

  handleKeyChange = (key) => {
    this.setState({ activeKey: key });
  };

  getOkButtonText = () => {
    return this.props.intl.formatMessage({
      defaultMessage: 'Use model for batch inference',
      description: 'Use model button text for generating batch inference notebooks',
    });
  };

  // handleSubmit should only be called on the batch-inference tab
  handleSubmit = async (values) => {
    if (this.state.activeKey === ConfigureInferenceTabs.BATCH_INFERENCE) {
      const result = await this.props.generateBatchInferenceNotebookApi(
        this.props.modelName,
        values[ConfigureInferenceFormFields.MODEL_VERSION_FIELD],
        values[ConfigureInferenceFormFields.INPUT_DATA_FIELD],
        ConfigureInferenceModalImpl.createOutputPath(
          values[ConfigureInferenceFormFields.OUTPUT_SUBDIRECTORY_FIELD],
        ),
        this.createGenerateBatchInferenceNotebookRequestId,
      );
      const notebookId = result.value && result.value.notebook_id;
      if (notebookId) {
        // Jump to the page of newly created notebook. Here we are yielding to the next tick
        // to allow modal and form to finish closing and cleaning up.
        setTimeout(() => window.top.location.replace(Utils.getNotebookLink(notebookId)));
      }
    }
  };

  getCancelButtonText() {
    return this.props.intl.formatMessage({
      defaultMessage: 'Cancel',
      description: 'Cancel button text for generating batch inference notebooks',
    });
  }

  redirectToServing = () => {
    this.props.hideModal();
    this.props.history.push(getModelPageRoute(this.props.modelName) + '/serving');
  };

  renderFooter() {
    const {
      loading,
      endpoint,
      endpointV2,
      permissionLevel,
      canCreateServingClusters,
      handleEnableServing,
      handleEnableServingV2,
      hideModal,
    } = this.props;
    // returning undefined here will allow the GenericInputModal to render the default footer
    if (this.state.activeKey === ConfigureInferenceTabs.BATCH_INFERENCE) {
      return undefined;
    }
    const footer = [
      <Button key='cancel' onClick={hideModal}>
        {this.getCancelButtonText()}
      </Button>,
    ];

    if (endpoint || endpointV2 || loading) {
      footer.push(
        <Button
          data-test-id='view-real-time-endpoints-btn'
          key='view real-time'
          type='primary'
          onClick={this.redirectToServing}
        >
          <FormattedMessage
            defaultMessage='View existing real-time inference'
            description='View existing real-time inference button text'
          />
        </Button>,
      );
    } else {
      footer.push(
        <EnableServingButton
          key='enable serving'
          modelPermissionLevel={permissionLevel}
          canCreateServingClusters={canCreateServingClusters}
          handleEnableServing={handleEnableServing}
          handleEnableServingV2={handleEnableServingV2}
          onEnableServing={this.redirectToServing}
        />,
      );
    }
    return footer;
  }

  render() {
    const {
      modelName,
      modelVersions,
      permissionLevel,
      defaultVersion,
      modalVisible,
      hideModal,
      loading,
      endpoint,
      endpointV2,
      handleEnableServing,
      handleEnableServingV2,
    } = this.props;
    const { activeKey } = this.state;
    const endpointExists = Boolean(endpoint || endpointV2);
    const form = 'https://databricks.sjc1.qualtrics.com/jfe/form/SV_1H6Ovx38zgCKAR0';
    return (
      <GenericInputModal
        className={`use-model-modal-${activeKey}`}
        title={
          <Spacer size={1} direction='horizontal'>
            <span>
              {this.props.intl.formatMessage({
                defaultMessage: 'Set up model inference',
                description: 'Modal title text for setting up model inference',
              })}
            </span>
            <PreviewIcon />
            <FeedbackLink link={form} />
          </Spacer>
        }
        okText={this.getOkButtonText()}
        cancelText={this.getCancelButtonText()}
        isOpen={modalVisible}
        handleSubmit={this.handleSubmit}
        onClose={hideModal}
        footer={this.renderFooter()}
      >
        <ConfigureInferenceForm
          loading={loading}
          endpointExists={endpointExists}
          handleEnableServing={handleEnableServing}
          handleEnableServingV2={handleEnableServingV2}
          modelName={modelName}
          defaultVersion={defaultVersion}
          modelVersions={modelVersions}
          permissionLevel={permissionLevel}
          activeKey={activeKey}
          handleKeyChange={this.handleKeyChange}
          visible={modalVisible}
        />
      </GenericInputModal>
    );
  }
}

const mapDispatchToProps = {
  generateBatchInferenceNotebookApi,
};

const mapStateToProps = (state, ownProps) => {
  const { modelName } = ownProps;
  const servingModelKey = getServingModelKey(null, modelName);
  const endpoint = state.entities.endpointStatus[servingModelKey];
  const endpointV2 = state.entities.endpointStatusV2[servingModelKey];
  return {
    endpoint,
    endpointV2,
  };
};

export const ConfigureInferenceModalWithIntl = injectIntl(ConfigureInferenceModalImpl);
export const ConfigureInferenceModal = withRouter(
  connect(mapStateToProps, mapDispatchToProps)(ConfigureInferenceModalWithIntl),
);
export const ConfigureInferenceModalWithServing = withClusterPermissions(
  withServing(ConfigureInferenceModal),
);
