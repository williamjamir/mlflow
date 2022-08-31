import React from 'react';
import { connect } from 'react-redux';
import { Tooltip } from 'antd';
import { Button } from '@databricks/design-system';
import {
  ConfigureInferenceModal,
  ConfigureInferenceModalWithServing,
} from './ConfigureInferenceModal';
import { getModelVersions } from '../reducers';
import { searchModelVersionsApi } from '../actions';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import DatabricksUtils from '../../common/utils/DatabricksUtils';

export class ConfigureInferenceButtonImpl extends React.Component {
  static propTypes = {
    modelVersions: PropTypes.array,
    defaultVersion: PropTypes.string,
    buttonText: PropTypes.string,
    modelName: PropTypes.string,
    permissionLevel: PropTypes.string,
    searchModelVersionsApi: PropTypes.func.isRequired,
  };

  state = {
    modalVisible: false,
  };

  componentDidMount() {
    const { modelName } = this.props;
    this.props.searchModelVersionsApi({ name: modelName });
  }

  hideModal = () => {
    this.setState({ modalVisible: false });
  };

  showModal = () => {
    this.setState({ modalVisible: true });
  };

  renderButton(disabled) {
    const buttonText = this.props.buttonText || (
      <FormattedMessage
        defaultMessage='Use model for inference'
        description='Button to use model for batch or streaming inference'
      />
    );
    return (
      <Button disabled={disabled} className='use-model-btn' type='primary' onClick={this.showModal}>
        {buttonText}
      </Button>
    );
  }

  renderConfigureInferenceButton() {
    const { modelVersions } = this.props;
    const disabled = modelVersions === undefined;
    return disabled ? (
      <Tooltip
        title={
          <FormattedMessage
            defaultMessage='Register a model to use inference'
            // eslint-disable-next-line max-len
            description='Tooltip text to suggest to register a model when no model versions are available'
          />
        }
      >
        {this.renderButton(disabled)}
      </Tooltip>
    ) : (
      this.renderButton(disabled)
    );
  }

  render() {
    const { modelName, modelVersions, permissionLevel, defaultVersion } = this.props;
    const { modalVisible } = this.state;
    return (
      <div>
        {this.renderConfigureInferenceButton()}
        {DatabricksUtils.isModelServingEnabled() ? (
          <ConfigureInferenceModalWithServing
            modelVersions={modelVersions}
            defaultVersion={defaultVersion}
            modelName={modelName}
            modalVisible={modalVisible}
            hideModal={this.hideModal}
            permissionLevel={permissionLevel}
          />
        ) : (
          <ConfigureInferenceModal
            modelVersions={modelVersions}
            defaultVersion={defaultVersion}
            modelName={modelName}
            modalVisible={modalVisible}
            hideModal={this.hideModal}
            permissionLevel={permissionLevel}
          />
        )}
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  const { modelName } = ownProps;
  const modelVersions = getModelVersions(state, modelName);

  return { modelVersions };
};

const mapDispatchToProps = {
  searchModelVersionsApi,
};

export const ConfigureInferenceButton = connect(
  mapStateToProps,
  mapDispatchToProps,
)(ConfigureInferenceButtonImpl);
