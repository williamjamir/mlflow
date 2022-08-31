import React from 'react';
import { Table, Divider } from 'antd';
import { Button, Modal } from '@databricks/design-system';
import PropType from 'prop-types';
import { ActivityActions, ActivityTypes, StageTagComponents } from '../constants';
import { TransitionRequestForm } from './TransitionRequestForm';
import { FormattedMessage } from 'react-intl';

const { Column } = Table;

export class PendingRequestsTable extends React.Component {
  static propTypes = {
    currentStage: PropType.string.isRequired,
    pendingRequests: PropType.arrayOf(Object),
    onPendingRequestApproval: PropType.func.isRequired,
    onPendingRequestRejection: PropType.func.isRequired,
    onPendingRequestDeletion: PropType.func.isRequired,
  };

  state = {
    confirmModalVisible: false,
    confirmingRequestAction: ActivityActions.APPROVE_TRANSITION_REQUEST,
    confirmingRequest: null,
  };

  transitionFormRef = React.createRef();

  renderActionsColumn = (pendingRequest) => {
    const approveLink = (
      <Button
        type='link'
        onClick={() =>
          this.showConfirmModal(pendingRequest, ActivityActions.APPROVE_TRANSITION_REQUEST)
        }
      >
        <FormattedMessage
          defaultMessage='Approve'
          description='Button text for approving pending requests on the model version page'
        />
      </Button>
    );

    const rejectLink = (
      <Button
        type='link'
        onClick={() =>
          this.showConfirmModal(pendingRequest, ActivityActions.REJECT_TRANSITION_REQUEST)
        }
      >
        <FormattedMessage
          defaultMessage='Reject'
          description='Button text for rejecting pending requests on the model version page'
        />
      </Button>
    );

    const cancelLink = (
      <Button
        type='link'
        onClick={() =>
          this.showConfirmModal(pendingRequest, ActivityActions.CANCEL_TRANSITION_REQUEST)
        }
      >
        <FormattedMessage
          defaultMessage='Cancel'
          description='Button text for canceling pending request on the model version page'
        />
      </Button>
    );

    return (
      <span>
        {pendingRequest.available_actions &&
          pendingRequest.available_actions.includes(ActivityActions.APPROVE_TRANSITION_REQUEST) && (
            <React.Fragment>
              {approveLink}
              <Divider type='vertical' />
            </React.Fragment>
          )}
        {pendingRequest.available_actions &&
          pendingRequest.available_actions.includes(ActivityActions.REJECT_TRANSITION_REQUEST) && (
            <React.Fragment>
              {rejectLink}
              <Divider type='vertical' />
            </React.Fragment>
          )}
        {pendingRequest.available_actions &&
          pendingRequest.available_actions.includes(ActivityActions.CANCEL_TRANSITION_REQUEST) &&
          cancelLink}
      </span>
    );
  };

  renderPendingRequestDescription = (request, action) => {
    const isRequestTransition = request.type === ActivityTypes.REQUESTED_TRANSITION;
    const isRequestDeletion = action === ActivityActions.CANCEL_TRANSITION_REQUEST;
    return (
      <div>
        {isRequestTransition ? (
          <FormattedMessage
            defaultMessage='Request transition to'
            description='Text for transition request under request column in the pending
               requests table'
          />
        ) : isRequestDeletion ? (
          <FormattedMessage
            defaultMessage='Cancel request to transition to'
            description='Text for transition cancel request under request column in the
               pending requests table'
          />
        ) : (
          <FormattedMessage
            defaultMessage='Transition to'
            description='Text for transition under request column in the pending
               requests table'
          />
        )}
        &nbsp;&nbsp;&nbsp;
        <i className='fas fa-long-arrow-right' />
        &nbsp;&nbsp;&nbsp;&nbsp;
        {StageTagComponents[request.to_stage]}
      </div>
    );
  };

  showConfirmModal = (confirmingRequest, confirmingRequestAction) => {
    this.setState({
      confirmModalVisible: true,
      confirmingRequest,
      confirmingRequestAction,
    });
  };

  closeConfirmModal = () => {
    this.setState({ confirmModalVisible: false });
  };

  handleConfirmModalConfirm = () => {
    const { confirmingRequest, confirmingRequestAction } = this.state;
    const comment = this.transitionFormRef.current.getFieldValue('comment');
    const archiveExistingVersions =
      !!this.transitionFormRef.current.getFieldValue('archiveExistingVersions');
    this.transitionFormRef.current.resetFields();
    if (confirmingRequestAction === ActivityActions.APPROVE_TRANSITION_REQUEST) {
      this.props.onPendingRequestApproval(confirmingRequest, comment, archiveExistingVersions);
    } else if (confirmingRequestAction === ActivityActions.REJECT_TRANSITION_REQUEST) {
      this.props.onPendingRequestRejection(confirmingRequest, comment);
    } else {
      this.props.onPendingRequestDeletion(confirmingRequest, comment);
    }
    this.closeConfirmModal();
  };

  render() {
    const { pendingRequests } = this.props;
    return (
      <div>
        <Table
          size='middle'
          rowKey='creation_timestamp'
          className='pending-requests-table'
          dataSource={pendingRequests}
          pagination={false}
          locale={{
            emptyText: (
              <FormattedMessage
                defaultMessage='No pending request.'
                description='Default text in pending requests table when no pending requests
                   for the model version'
              />
            ),
          }}
          style={{ maxWidth: 800 }}
        >
          <Column
            key={1}
            title={
              <FormattedMessage
                defaultMessage='Request'
                description='Column name text for requests in pending requests table in model
                   registry'
              />
            }
            render={this.renderPendingRequestDescription}
          />
          <Column
            key={2}
            title={
              <FormattedMessage
                defaultMessage='Request by'
                description='Column name text for requester in pending requests table in model
                   registry'
              />
            }
            dataIndex='user_id'
          />
          <Column
            key={3}
            title={
              <FormattedMessage
                defaultMessage='Actions'
                description='Column name text for actions in pending requests table in model
                   registry'
              />
            }
            render={this.renderActionsColumn}
          />
        </Table>
        {this.renderConfirmModal()}
      </div>
    );
  }

  renderConfirmModal() {
    const { confirmModalVisible, confirmingRequestAction, confirmingRequest } = this.state;
    const isApproval = confirmingRequestAction === ActivityActions.APPROVE_TRANSITION_REQUEST;
    const isRejection = confirmingRequestAction === ActivityActions.REJECT_TRANSITION_REQUEST;
    const toStage = confirmingRequest ? confirmingRequest.to_stage : null;
    return (
      <Modal
        className='pending-request-action-modal'
        title={
          isApproval ? (
            <FormattedMessage
              defaultMessage='Approve Pending Request'
              description='Title text for approve pending request confirmation modal in model
                   registry'
            />
          ) : isRejection ? (
            <FormattedMessage
              defaultMessage='Reject Pending Request'
              description='Title text for reject pending request confirmation modal in model
                   registry'
            />
          ) : (
            <FormattedMessage
              defaultMessage='Cancel Pending Request'
              description='Title text for cancel pending request confirmation modal in model
                   registry'
            />
          )
        }
        visible={confirmModalVisible}
        onOk={this.handleConfirmModalConfirm}
        okText={
          <FormattedMessage
            defaultMessage='Confirm'
            description='OK text for button to confirm pending request action in model registry'
          />
        }
        onCancel={this.closeConfirmModal}
        cancelText={
          <FormattedMessage
            defaultMessage='Cancel'
            description='Cancel text for button to cancel pending request action in model registry'
          />
        }
      >
        {confirmingRequest &&
          this.renderPendingRequestDescription(confirmingRequest, confirmingRequestAction)}
        <TransitionRequestForm
          innerRef={this.transitionFormRef}
          toStage={toStage}
          isApproval={isApproval}
        />
      </Modal>
    );
  }
}
