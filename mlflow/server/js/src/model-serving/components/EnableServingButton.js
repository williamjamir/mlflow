import React from 'react';
import PropTypes from 'prop-types';
import { PermissionLevels } from '../../model-registry/constants';

import DatabricksUtils from '../../common/utils/DatabricksUtils';
import { FormattedMessage } from 'react-intl';
import { Button, Popover } from '@databricks/design-system';

// Component for enable serving button.  The button is disabled when user does not have sufficient
// permissions on the model or to create clusters.
export class EnableServingButton extends React.Component {
  static propTypes = {
    modelPermissionLevel: PropTypes.string.isRequired,
    canCreateServingClusters: PropTypes.bool,
    handleEnableServing: PropTypes.func.isRequired,
    handleEnableServingV2: PropTypes.func.isRequired,
    onEnableServing: PropTypes.func,
  };

  onClick = (e) => {
    DatabricksUtils.modelServingV2EndpointCreationEnabled()
      ? this.props.handleEnableServingV2(this.props.onEnableServing)
      : this.props.handleEnableServing(this.props.onEnableServing);
  };

  render() {
    const enabledForWorkspace =
      DatabricksUtils.modelServingEndpointCreationEnabled() ||
      DatabricksUtils.modelServingV2EndpointCreationEnabled();
    const enabled =
      this.props.canCreateServingClusters &&
      this.props.modelPermissionLevel === PermissionLevels.CAN_MANAGE &&
      enabledForWorkspace;
    const loading = this.props.canCreateServingClusters === undefined;

    const renderButton = () => {
      const buttonText = DatabricksUtils.modelServingV2EndpointCreationEnabled() ? (
        <FormattedMessage
          defaultMessage='Enable Serverless Real-Time Inference'
          description='Button text to enable serving v2.'
        />
      ) : (
        <FormattedMessage
          defaultMessage='Enable Serving'
          desciption='Button text to enable serving v1.'
        />
      );
      return (
        <Button
          className='enable-serving-button'
          type='primary'
          htmlType='button'
          loading={loading}
          onClick={this.onClick}
          disabled={!enabled}
        >
          {buttonText}
        </Button>
      );
    };

    if (enabled || loading) {
      return renderButton();
    } else {
      const featureNameText = DatabricksUtils.modelServingV2EndpointCreationEnabled() ? (
        <FormattedMessage
          defaultMessage='serverless real-time inference'
          description='Feature name for serving v2 used in error message in enable serving
            button popover.'
        />
      ) : (
        <FormattedMessage
          defaultMessage='serving'
          desciption='Feature name for serving v1 used in error message in enable serving
            button popover.'
        />
      );
      let insufficientPermissionsMessage;
      if (!enabledForWorkspace) {
        insufficientPermissionsMessage = (
          <FormattedMessage
            defaultMessage='Model serving is disabled by the admin for this workspace.'
            description='Error message when model serving is not available in workspace in
              enable serving button popover.'
          />
        );
      } else if (
        !this.props.canCreateServingClusters &&
        this.props.modelPermissionLevel !== PermissionLevels.CAN_MANAGE
      ) {
        insufficientPermissionsMessage = (
          <FormattedMessage
            defaultMessage="You need to have permissions to create general purpose clusters as
              well as 'CAN_MANAGE' permissions on this model in order to enable {featureNameText}."
            description='Error message when user has neither cluster create nor model manage
              permissions in enable serving button popover.'
            values={{ featureNameText: featureNameText }}
          />
        );
      } else if (!this.props.canCreateServingClusters) {
        insufficientPermissionsMessage = (
          <FormattedMessage
            defaultMessage='You need to have permission to create general purpose clusters in
              order to enable {featureNameText}.'
            description='Error message when user does not have cluster create permissions in
              enable serving button popover.'
            values={{ featureNameText: featureNameText }}
          />
        );
      } else {
        insufficientPermissionsMessage = (
          <FormattedMessage
            defaultMessage="You need to have 'CAN_MANAGE' permissions on this model in order
              to enable {featureNameText}."
            description='Error message when user does not have model manage permissions in enable
              serving button popover.'
            values={{ featureNameText: featureNameText }}
          />
        );
      }
      return (
        <Popover
          className='enable-serving-button-popover'
          overlayClassName='enable-serving-message'
          content={insufficientPermissionsMessage}
          placement='bottom'
        >
          {renderButton()}
        </Popover>
      );
    }
  }
}
