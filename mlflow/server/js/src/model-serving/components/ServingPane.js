import React from 'react';
import PropTypes from 'prop-types';
import { ServingView } from './ServingView';
import { Spinner } from '../../common/components/Spinner';
import { EnableServing } from './EnableServing';
import { withServing } from './withServing';

export class ServingPaneImpl extends React.Component {
  static propTypes = {
    modelName: PropTypes.string.isRequired,
    modelPermissionLevel: PropTypes.string.isRequired,
    // props from withServing
    loading: PropTypes.bool.isRequired,
    endpoint: PropTypes.object,
    endpointV2: PropTypes.object,
    handleEnableServing: PropTypes.func.isRequired,
    handleEnableServingV2: PropTypes.func.isRequired,
    handleDisableServing: PropTypes.func.isRequired,
    handleDisableServingV2: PropTypes.func.isRequired,
  };

  render() {
    const {
      loading,
      modelName,
      modelPermissionLevel,
      endpoint,
      endpointV2,
      handleEnableServing,
      handleEnableServingV2,
      handleDisableServing,
      handleDisableServingV2,
    } = this.props;

    if (loading) {
      return (
        <div className='serving-spinner'>
          <Spinner />
        </div>
      );
    } else if (endpoint || endpointV2) {
      return (
        <ServingView
          modelName={modelName}
          handleDisableServing={handleDisableServing}
          handleDisableServingV2={handleDisableServingV2}
        />
      );
    } else {
      return (
        <EnableServing
          modelPermissionLevel={modelPermissionLevel}
          handleEnableServing={handleEnableServing}
          handleEnableServingV2={handleEnableServingV2}
        />
      );
    }
  }
}

export const ServingPane = withServing(ServingPaneImpl);
