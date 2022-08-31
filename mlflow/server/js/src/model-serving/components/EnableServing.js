import React from 'react';
import PropTypes from 'prop-types';
import { message } from 'antd';
import { getModelServingDocsUri } from '../utils';
import { EnableServingButton } from './EnableServingButton';
import { withClusterPermissions } from './withClusterPermissions';
import DatabricksUtils from '../../common/utils/DatabricksUtils';
import { PermissionLevels } from '../../model-registry/constants';
import { FormattedMessage } from 'react-intl';

// Component for enable serving button.  The button is disabled when user does not have sufficient
// permissions on the model or to create clusters.
class EnableServingImpl extends React.Component {
  static propTypes = {
    modelPermissionLevel: PropTypes.string.isRequired,
    handleEnableServing: PropTypes.func.isRequired,
    handleEnableServingV2: PropTypes.func.isRequired,
    // props from withClusterPermissions
    canCreateServingClusters: PropTypes.bool,
    canCreateServingClustersErrorMessage: PropTypes.string,
    showButton: PropTypes.bool,
  };

  static defaultProps = {
    // controls visibility of the EnableServing button; used by the ConfigureInferenceModal
    showButton: true,
  };

  render() {
    const {
      modelPermissionLevel,
      canCreateServingClusters,
      handleEnableServing,
      handleEnableServingV2,
      showButton,
    } = this.props;

    const renderCanCreateClustersErrorMessage = () => {
      const { canCreateServingClustersErrorMessage } = this.props;
      const featureNameText = DatabricksUtils.modelServingV2EndpointCreationEnabled() ? (
        <FormattedMessage
          defaultMessage='serverless real-time inference'
          description='Feature name for serving v2 used in error message in enable serving page.'
        />
      ) : (
        <FormattedMessage
          defaultMessage='serving'
          desciption='Feature name for serving v1 used in error message in enable serving page.'
        />
      );
      if (canCreateServingClustersErrorMessage !== undefined) {
        message.error('Failed to fetch create cluster permissions.');
        return (
          <div>
            <div className='error-message'>
              <FormattedMessage
                defaultMessage='Failed to fetch create cluster permissions: {errorMessage}'
                description='Error message when failing to fetch cluster permissions in
                  enable serving page.'
                values={{ errorMessage: canCreateServingClustersErrorMessage }}
              />
            </div>
            <div>
              <FormattedMessage
                defaultMessage='<bold> NOTE: </bold> You need to have permissions to create general
                  purpose clusters in order to successfully enable {featureNameText}.'
                description='Error message description when failing to fetch cluster permissions in
                  enable serving page.'
                values={{
                  featureNameText: featureNameText,
                  bold: (chunks) => <b>{chunks}</b>,
                }}
              />
            </div>
          </div>
        );
      } else {
        return null;
      }
    };

    const renderCreateModelServingV1EndpointLink = () => {
      // Render option to enable serving V1 only if user has sufficient permissions.
      const enabled =
        canCreateServingClusters &&
        modelPermissionLevel === PermissionLevels.CAN_MANAGE &&
        DatabricksUtils.modelServingEndpointCreationEnabled();

      if (enabled) {
        return (
          <span>
            <FormattedMessage
              defaultMessage='You can still use <link>Classic model serving</link>. Click
                <button>this link</button> to enable it.'
              description='Link to allow enabling of serving V1 when serving V2 is enabled in
                enable serving page.'
              values={{
                link: (chunks) => (
                  // Reported during ESLint upgrade
                  // eslint-disable-next-line react/jsx-no-target-blank
                  <a target='_blank' href={getModelServingDocsUri()}>
                    {chunks}
                  </a>
                ),
                button: (chunks) => (
                  <button className='link-button' onClick={handleEnableServing}>
                    {chunks}
                  </button>
                ),
              }}
            />
          </span>
        );
      } else {
        return null;
      }
    };

    const renderEnableServingDesc = DatabricksUtils.modelServingV2EndpointCreationEnabled() ? (
      <div className='enable-serving-description'>
        <FormattedMessage
          defaultMessage='Enable serverless real-time inference behind a REST API interface. This
            will launch endpoints for all active staging and production versions of this model.'
          description='Enable serving description for serving v2 in enable serving page.'
        />{' '}
        {renderCreateModelServingV1EndpointLink()}
        {renderCanCreateClustersErrorMessage()}
      </div>
    ) : (
      <div className='enable-serving-description'>
        <FormattedMessage
          defaultMessage='Enable real-time model serving behind a REST API interface. This will
            launch a single-node cluster that will host all active versions of this model.
            <link>Learn more.</link>'
          description='Enable serving description for serving v1 in enable serving page.'
          values={{
            link: (chunks) => (
              // Reported during ESLint upgrade
              // eslint-disable-next-line react/jsx-no-target-blank
              <a target='_blank' href={getModelServingDocsUri()}>
                {chunks}
              </a>
            ),
          }}
        />
        {renderCanCreateClustersErrorMessage()}
      </div>
    );

    return (
      <div className='enable-serving-container'>
        {renderEnableServingDesc}
        {showButton && (
          <div className='enable-serving-button-container'>
            <EnableServingButton
              modelPermissionLevel={modelPermissionLevel}
              canCreateServingClusters={canCreateServingClusters}
              handleEnableServing={handleEnableServing}
              handleEnableServingV2={handleEnableServingV2}
            />
          </div>
        )}
      </div>
    );
  }
}

export const EnableServing = withClusterPermissions(EnableServingImpl);
