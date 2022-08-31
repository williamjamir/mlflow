import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {
  enableServingApi,
  enableServingV2Api,
  getEndpointStatusApi,
  listEndpointVersionsApi,
  listEndpointVersionsV2Api,
  listEndpointVersionAliasesApi,
  listEndpointVersionAliasesV2Api,
  disableServingApi,
  disableServingV2Api,
  getEndpointVersionLogsApi,
  getEndpointEventHistoryApi,
  getEndpointMetricHistoryApi,
  getServingEventHistoryApi,
  getSupportedClusterNodeTypes,
  getSupportedWorkloadSizes,
  getEndpointStatusV2Api,
} from '../actions';
import Utils from '../../common/utils/Utils';
import {
  getServingModelKey,
  suppressInvalidParameterValue,
  suppressResourceDoesNotExist,
} from '../utils';
import DatabricksUtils from '../../common/utils/DatabricksUtils';
import RequestStateWrapper from '../../common/components/RequestStateWrapper';
import { getUUID } from '../../common/utils/ActionUtils';
import { endpointV1Type, endpointV2Type } from './ServingPropTypes';

const SERVING_STATUS_POLL_INTERVAL = 10000;

/**
 * Higher order component for injecting serving state to a serving component
 * @param ServingComponent
 * @returns wrapper class that injects the serving state and renders the ServingComponent
 */
function ServingStateHOC(ServingComponent) {
  return class ServingStateWrapper extends React.Component {
    static propTypes = {
      modelName: PropTypes.string,
      endpoint: endpointV1Type,
      endpointV2: endpointV2Type,
      enableServingApi: PropTypes.func.isRequired,
      enableServingV2Api: PropTypes.func.isRequired,
      getEndpointStatusApi: PropTypes.func.isRequired,
      getEndpointStatusV2Api: PropTypes.func.isRequired,
      listEndpointVersionsApi: PropTypes.func.isRequired,
      listEndpointVersionsV2Api: PropTypes.func.isRequired,
      disableServingApi: PropTypes.func.isRequired,
      disableServingV2Api: PropTypes.func.isRequired,
      getEndpointVersionLogsApi: PropTypes.func.isRequired,
      listEndpointVersionAliasesApi: PropTypes.func.isRequired,
      listEndpointVersionAliasesV2Api: PropTypes.func.isRequired,
      getEndpointEventHistoryApi: PropTypes.func.isRequired,
      getServingEventHistoryApi: PropTypes.func.isRequired,
      getEndpointMetricHistoryApi: PropTypes.func.isRequired,
      getSupportedClusterNodeTypes: PropTypes.func.isRequired,
      getSupportedWorkloadSizes: PropTypes.func.isRequired,
    };

    enableServingApiId = getUUID();
    enableServingV2ApiId = getUUID();
    disableServingApiId = getUUID();
    getEndpointStatusApiId = getUUID();
    getEndpointStatusV2ApiId = getUUID();
    listEndpointVersionsApiId = getUUID();
    listEndpointVersionsV2ApiId = getUUID();
    listEndpointVersionAliasesApiId = getUUID();
    listEndpointVersionAliasesV2ApiId = getUUID();

    getEndpointEventHistoryApiId = getUUID();
    getServingEventHistoryApiId = getUUID();

    initialGetEndpointStatusApiId = getUUID();
    initialGetEndpointStatusV2ApiId = getUUID();
    initialListEndpointVersionsApiId = getUUID();
    initialListEndpointVersionsV2ApiId = getUUID();
    initialGetSupportedClusterNodeTypesId = getUUID();
    initialGetSupportedWorkloadSizesId = getUUID();

    criticalInitialRequestIds = [
      this.initialGetEndpointStatusApiId,
      this.initialListEndpointVersionsApiId,
      this.initialGetSupportedClusterNodeTypesId,
      this.initialGetSupportedWorkloadSizesId,
    ];

    handleEnableServing = (onComplete) => {
      const { modelName } = this.props;
      return this.props
        .enableServingApi(null, modelName, this.enableServingApiId)
        .then(this.loadServingState)
        .then(onComplete)
        .catch(Utils.logErrorAndNotifyUser);
    };

    handleEnableServingV2 = (onComplete) => {
      const { modelName } = this.props;
      return this.props
        .enableServingV2Api(modelName, this.enableServingV2ApiId)
        .then(this.loadServingState)
        .then(onComplete)
        .catch(Utils.logErrorAndNotifyUser);
    };

    handleDisableServing = (onComplete) => {
      const { modelName } = this.props;
      return this.props
        .disableServingApi(null, modelName, this.disableServingApiId)
        .then(this.loadServingState)
        .then(onComplete)
        .catch(Utils.logErrorAndNotifyUser);
    };

    handleDisableServingV2 = (onComplete) => {
      const { modelName } = this.props;
      return this.props
        .disableServingV2Api(modelName, this.disableServingApiId)
        .then(this.loadServingState)
        .then(onComplete)
        .catch(Utils.logErrorAndNotifyUser);
    };

    loadServingState = (initialLoad) => {
      const { endpoint, endpointV2 } = this.props;
      if (DatabricksUtils.modelServingV2AvailableInCurrentWorkspace()) {
        if (initialLoad || !(endpoint || endpointV2)) {
          this.loadServingStateV2(initialLoad);
          this.loadServingStateV1(initialLoad);
        } else if (endpointV2) {
          this.loadServingStateV2(initialLoad);
        } else {
          this.loadServingStateV1(initialLoad);
        }
      } else {
        this.loadServingStateV1(initialLoad);
      }

      if (initialLoad) {
        this.props.getSupportedClusterNodeTypes(this.initialGetSupportedClusterNodeTypesId);
        this.props.getSupportedWorkloadSizes(this.initialGetSupportedWorkloadSizesId);
      }
    };

    loadServingStateV2 = (initialLoad) => {
      const { modelName } = this.props;

      if (initialLoad) {
        this.criticalInitialRequestIds.push(
          this.initialGetEndpointStatusV2ApiId,
          this.initialListEndpointVersionsV2ApiId,
        );
      }

      const getEndpointV2Id = initialLoad
        ? this.initialGetEndpointStatusV2ApiId
        : this.getEndpointStatusV2ApiId;

      this.props
        .getEndpointStatusV2Api(modelName, getEndpointV2Id)
        .catch(suppressResourceDoesNotExist)
        .catch(Utils.logErrorAndNotifyUser);

      const listEndpointVersionsV2Id = initialLoad
        ? this.initialListEndpointVersionsV2ApiId
        : this.listEndpointVersionsV2ApiId;

      this.props
        .listEndpointVersionsV2Api(modelName, listEndpointVersionsV2Id)
        .catch(suppressResourceDoesNotExist)
        .catch(Utils.logErrorAndNotifyUser);
      this.props
        .listEndpointVersionAliasesV2Api(modelName, this.listEndpointVersionAliasesV2ApiId)
        .catch(suppressResourceDoesNotExist)
        .catch(Utils.logErrorAndNotifyUser);

      this.props
        .getServingEventHistoryApi(modelName, this.getServingEventHistoryApiId)
        .catch(suppressResourceDoesNotExist)
        .catch(Utils.logErrorAndNotifyUser);
    };

    loadServingStateV1 = (initialLoad) => {
      const { modelName } = this.props;
      const getEndpointId = initialLoad
        ? this.initialGetEndpointStatusApiId
        : this.getEndpointStatusApiId;

      this.props
        .getEndpointStatusApi(null, modelName, getEndpointId)
        .catch(suppressInvalidParameterValue)
        .catch(Utils.logErrorAndNotifyUser);

      const listVersionsId = initialLoad
        ? this.initialListEndpointVersionsApiId
        : this.listEndpointVersionsApiId;

      this.props
        .listEndpointVersionsApi(null, modelName, listVersionsId)
        .catch(suppressInvalidParameterValue)
        .catch(Utils.logErrorAndNotifyUser);

      this.props
        .listEndpointVersionAliasesApi(null, modelName, this.listEndpointVersionAliasesApiId)
        .catch(suppressInvalidParameterValue)
        .catch(Utils.logErrorAndNotifyUser);

      this.props
        .getEndpointEventHistoryApi(null, modelName, this.getEndpointEventHistoryApiId)
        .catch(suppressInvalidParameterValue)
        .catch(Utils.logErrorAndNotifyUser);
    };

    componentDidMount() {
      this.loadServingState(true);
    }

    componentDidUpdate() {
      const { endpoint, endpointV2 } = this.props;
      if ((endpoint || endpointV2) && !this.pollServingStatusIntervalId) {
        this.pollServingStatusIntervalId = setInterval(
          this.loadServingState,
          SERVING_STATUS_POLL_INTERVAL,
        );
      } else if (!(endpoint || endpointV2)) {
        clearInterval(this.pollServingStatusIntervalId);
        this.pollServingStatusIntervalId = null;
      }
    }

    componentWillUnmount() {
      if (this.pollServingStatusIntervalId) {
        clearInterval(this.pollServingStatusIntervalId);
        this.pollServingStatusIntervalId = null;
      }
    }

    render() {
      return (
        <RequestStateWrapper requestIds={this.criticalInitialRequestIds} shouldOptimisticallyRender>
          {(loading) => {
            return (
              <ServingComponent
                loading={loading}
                handleDisableServing={this.handleDisableServing}
                handleDisableServingV2={this.handleDisableServingV2}
                handleEnableServing={this.handleEnableServing}
                handleEnableServingV2={this.handleEnableServingV2}
                {...this.props}
              />
            );
          }}
        </RequestStateWrapper>
      );
    }
  };
}

const mapDispatchToProps = {
  enableServingApi,
  enableServingV2Api,
  getEndpointStatusApi,
  getEndpointStatusV2Api,
  listEndpointVersionsApi,
  listEndpointVersionsV2Api,
  listEndpointVersionAliasesApi,
  listEndpointVersionAliasesV2Api,
  disableServingApi,
  disableServingV2Api,
  getEndpointVersionLogsApi,
  getEndpointEventHistoryApi,
  getServingEventHistoryApi,
  getEndpointMetricHistoryApi,
  getSupportedClusterNodeTypes,
  getSupportedWorkloadSizes,
};

const mapStateToProps = (state, ownProps) => {
  const { modelName } = ownProps;
  const servingModelKey = getServingModelKey(null, modelName);
  const endpoint = state.entities.endpointStatus[servingModelKey];
  const endpointV2 = state.entities.endpointStatusV2[servingModelKey];
  return {
    modelName,
    endpoint,
    endpointV2,
  };
};

export const withServing = (ServingComponent) =>
  connect(mapStateToProps, mapDispatchToProps)(ServingStateHOC(ServingComponent));
