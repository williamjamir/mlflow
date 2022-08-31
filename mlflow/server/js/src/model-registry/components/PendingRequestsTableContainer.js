import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { getModelVersion, getModelVersionTransitionRequests } from '../reducers';
import { MODEL_VERSION_STATUS_POLL_INTERVAL as POLL_INTERVAL } from '../constants';
import Utils from '../../common/utils/Utils';
import RequestStateWrapper from '../../common/components/RequestStateWrapper';
// import { Error404View } from '../../common/components/Error404View';
// import { Spinner } from '../../common/components/Spinner';
import { getModelPageRoute } from '../routes';
import { getUUID } from '../../common/utils/ActionUtils';
import {
  listTransitionRequestsApi,
  approveTransitionRequestApi,
  rejectTransitionRequestApi,
  deleteTransitionRequestApi,
} from '../actions';
import { PendingRequestsTable } from './PendingRequestsTable';
// BEGIN-EDGE
import { LoadingDescription } from '@databricks/web-shared-bundle/metrics';
// END-EDGE
export class PendingRequestsTableContainerImpl extends React.Component {
  static propTypes = {
    // own props
    history: PropTypes.object.isRequired,
    modelName: PropTypes.string.isRequired,
    version: PropTypes.string.isRequired,
    // connected props
    modelVersion: PropTypes.object,
    apis: PropTypes.object.isRequired,
    transitionRequests: PropTypes.arrayOf(Object),
    listTransitionRequestsApi: PropTypes.func.isRequired,
    approveTransitionRequestApi: PropTypes.func.isRequired,
    rejectTransitionRequestApi: PropTypes.func.isRequired,
    deleteTransitionRequestApi: PropTypes.func.isRequired,
  };

  initListTransitionRequestId = getUUID();
  approveTransitionRequestId = getUUID();
  rejectTransitionRequestId = getUUID();
  deleteTransitionRequestId = getUUID();
  listTransitionRequestId = getUUID();

  state = { criticalInitialRequestIds: [this.initListTransitionRequestId] };

  pollingRelatedRequestIds = [this.listTransitionRequestId];

  hasPendingPollingRequest = () =>
    this.pollingRelatedRequestIds.every((requestId) => {
      const request = this.props.apis[requestId];
      return Boolean(request && request.active);
    });

  loadData = (isInitialLoading) =>
    this.props.listTransitionRequestsApi(
      this.props.modelName,
      this.props.version,
      isInitialLoading === true ? this.initListTransitionRequestId : this.listTransitionRequestId,
    );

  handlePendingRequestApproval = (pendingRequest, comment, archiveExistingVersions) => {
    const { modelName, version } = this.props;
    this.props
      .approveTransitionRequestApi(
        modelName,
        version,
        pendingRequest.to_stage,
        archiveExistingVersions,
        comment,
        this.approveTransitionRequestId,
      )
      .then(this.loadData)
      .catch(Utils.logErrorAndNotifyUser);
  };

  handlePendingRequestRejection = (pendingRequest, comment) => {
    const { modelName, version } = this.props;
    this.props
      .rejectTransitionRequestApi(
        modelName,
        version,
        pendingRequest.to_stage,
        comment,
        this.rejectTransitionRequestId,
      )
      .then(this.loadData)
      .catch(Utils.logErrorAndNotifyUser);
  };

  handlePendingRequestDeletion = (pendingRequest, comment) => {
    const { modelName, version } = this.props;
    this.props
      .deleteTransitionRequestApi(
        modelName,
        version,
        comment,
        pendingRequest.user_id,
        pendingRequest.to_stage,
        this.deleteTransitionRequestId,
      )
      .then(this.loadData)
      .catch(Utils.logErrorAndNotifyUser);
  };

  pollData = () => {
    const { modelName, history } = this.props;
    if (!this.hasPendingPollingRequest() && Utils.isBrowserTabVisible()) {
      return this.loadData().catch((e) => {
        if (e.getErrorCode() === 'RESOURCE_DOES_NOT_EXIST') {
          Utils.logErrorAndNotifyUser(e);
          history.push(getModelPageRoute(modelName));
        } else {
          console.error(e);
        }
      });
    }
    return Promise.resolve();
  };

  componentDidMount() {
    this.loadData(true).catch(console.error);
    this.pollIntervalId = setInterval(this.pollData, POLL_INTERVAL);
  }

  componentWillUnmount() {
    clearTimeout(this.pollIntervalId);
  }

  render() {
    const { modelVersion } = this.props;
    const { transitionRequests } = this.props;
    return (
      <RequestStateWrapper
        requestIds={this.state.criticalInitialRequestIds}
        customSpinner='Loading...'
        // eslint-disable-next-line no-trailing-spaces
        // BEGIN-EDGE
        description={LoadingDescription.MLFLOW_MODEL_PENDING_REQUEST_TABLE}
        // END-EDGE
      >
        <PendingRequestsTable
          currentStage={modelVersion.current_stage}
          pendingRequests={transitionRequests}
          onPendingRequestApproval={this.handlePendingRequestApproval}
          onPendingRequestRejection={this.handlePendingRequestRejection}
          onPendingRequestDeletion={this.handlePendingRequestDeletion}
        />
      </RequestStateWrapper>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  const { modelName, version } = ownProps;
  const modelVersion = getModelVersion(state, modelName, version);
  const transitionRequests = getModelVersionTransitionRequests(state, modelName, version);
  const { apis } = state;
  return {
    modelName,
    version,
    modelVersion,
    transitionRequests,
    apis,
  };
};

const mapDispatchToProps = {
  listTransitionRequestsApi,
  approveTransitionRequestApi,
  rejectTransitionRequestApi,
  deleteTransitionRequestApi,
};

export const PendingRequestsTableContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(PendingRequestsTableContainerImpl);
