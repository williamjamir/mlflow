import React from 'react';
import { Input, Steps } from 'antd';
import { Button, Modal } from '@databricks/design-system';
import PropTypes from 'prop-types';
import {
  ActivityTypes,
  StageTagComponents,
  IconByActivityType,
  ActivityActions,
} from '../constants';
import _ from 'lodash';
import Utils from '../../common/utils/Utils';
import { EditableNote } from '../../common/components/EditableNote';
import { FormattedMessage, injectIntl } from 'react-intl';

const commentEditorToolbarTypes = [
  ['bold', 'italic', 'strikethrough'],
  ['link', 'quote', 'code'],
  ['unordered-list', 'ordered-list', 'checked-list'],
];

export class ModelActivitiesListImpl extends React.Component {
  static propTypes = {
    activities: PropTypes.arrayOf(
      PropTypes.shape({
        activity_type: PropTypes.string,
        from_stage: PropTypes.string,
        to_stage: PropTypes.string,
      }),
    ).isRequired,
    onCreateComment: PropTypes.func.isRequired,
    onEditComment: PropTypes.func.isRequired,
    onDeleteComment: PropTypes.func.isRequired,
    intl: PropTypes.shape({ formatMessage: PropTypes.func.isRequired }).isRequired,
  };

  static defaultProps = {
    activities: [],
  };

  constructor(props) {
    super(props);
    const { activities } = props;
    this.handleShowEdit = this.handleShowEdit.bind(this);
    this.handleSubmitEdit = this.handleSubmitEdit.bind(this);
    this.editCommentDraft = this.editCommentDraft.bind(this);
    this.handleCreateComment = this.handleCreateComment.bind(this);
    this.handleMouseEvent = this.handleMouseEvent.bind(this);
    this.getEditBtn = this.getEditBtn.bind(this);
    this.getDeleteBtn = this.getDeleteBtn.bind(this);
    const showEditInitialState = {};
    const showControlsInitialState = {};
    activities.forEach((activity) => {
      showEditInitialState[activity.id] = false;
      showControlsInitialState[activity.id] = false;
    });
    this.state = {
      showEdit: showEditInitialState,
      showControls: showControlsInitialState,
      commentDraft: '',
      showCommentEditor: false,
      isDeleteModalVisible: false,
      activityIdToDelete: '',
    };
  }

  handleMouseEvent(activityId, value) {
    const updatedControlsState = this.state.showControls;
    updatedControlsState[activityId] = value;
    this.setState({ showControls: updatedControlsState });
  }

  editCommentDraft(commentObj) {
    this.setState({ commentDraft: commentObj.target.value });
  }

  handleShowEdit(activityId, value) {
    const updatedShowEdit = this.state.showEdit;
    updatedShowEdit[activityId] = value;
    this.setState({ showEdit: updatedShowEdit });
  }

  handleSubmitEdit(activityId, comment) {
    return this.props.onEditComment(activityId, comment).then(() => {
      this.handleShowEdit(activityId, false);
    });
  }

  handleCreateComment(comment) {
    return this.props.onCreateComment(comment).then(this.setState({ showCommentEditor: false }));
  }

  handleDeleteComment(activityId) {
    this.props.onDeleteComment(activityId).then(() => {
      this.setState({ activityIdToDelete: '', isDeleteModalVisible: false });
    });
  }

  getTitle(activity) {
    if (activity.activity_type === ActivityTypes.NEW_COMMENT) {
      return this.getCommentActivityTitle(activity);
    } else {
      return this.getTransitionActivityTitle(activity);
    }
  }

  getEditBtn(activity) {
    if (
      activity.available_actions &&
      activity.available_actions.includes(ActivityActions.EDIT_COMMENT) &&
      this.state.showControls[activity.id] === true
    ) {
      return (
        <Button
          className='edit-btn'
          type='link'
          onClick={() => {
            this.handleShowEdit(activity.id, true);
          }}
        >
          <FormattedMessage
            defaultMessage='Edit'
            description='Text for edit button for activities list on the model version page'
          />
        </Button>
      );
    } else {
      return '';
    }
  }

  getDeleteBtn(activity) {
    if (
      activity.available_actions &&
      activity.available_actions.includes(ActivityActions.DELETE_COMMENT) &&
      this.state.showControls[activity.id] === true
    ) {
      return (
        <Button
          className='delete-btn'
          type='link'
          onClick={() => {
            this.setState({ isDeleteModalVisible: true, activityIdToDelete: activity.id });
          }}
        >
          <FormattedMessage
            defaultMessage='Delete'
            description='Text for delete button for activities list on the model version page'
          />
        </Button>
      );
    } else {
      return '';
    }
  }

  getCommentActivityTitle(activity) {
    return (
      <div className='editable-comment-wrapper'>
        <span>
          <b> {activity.user_id} </b>
          <span className='timestamp'>
            {Utils.timeSinceStr(activity.creation_timestamp)}
            &nbsp;
            {activity.creation_timestamp !== activity.last_updated_timestamp ? (
              <FormattedMessage
                defaultMessage='(edited)'
                description='Text signaling whether comment had been edited or not on the
                   model version page'
              />
            ) : (
              ''
            )}
          </span>
          {this.getEditBtn(activity)}
          {this.getDeleteBtn(activity)}
        </span>
      </div>
    );
  }

  getTransitionActivityTitle(activity) {
    if (activity.activity_type === ActivityTypes.SYSTEM_TRANSITION) {
      return (
        <span>
          <FormattedMessage
            defaultMessage='This version was transitioned from'
            description='Activity title text for system transition in model versions page'
          />
          &nbsp;
          {StageTagComponents[activity.from_stage]}
          <i className='fas fa-long-arrow-right' />
          &nbsp;&nbsp;
          {StageTagComponents[activity.to_stage]}
          {
            <FormattedMessage
              defaultMessage='when {systemComment}'
              description='Comment text in activity title for system transition in model
                 version page'
              values={{ systemComment: activity.system_comment }}
            />
          }
          &nbsp;
          {<span className='timestamp'>{Utils.timeSinceStr(activity.creation_timestamp)}</span>}
        </span>
      );
    }
    if (activity.activity_type === ActivityTypes.APPLIED_TRANSITION) {
      return (
        <span>
          <FormattedMessage
            defaultMessage='<bold>{userId}</bold> applied a stage transition'
            description='Activity title text for applied transition in model versions page'
            values={{
              userId: activity.user_id,
              bold: (chunks) => <b>{chunks}</b>,
            }}
          />
          &nbsp;
          {StageTagComponents[activity.from_stage]}
          <i className='fas fa-long-arrow-right' />
          &nbsp;&nbsp;
          {StageTagComponents[activity.to_stage]}
          {activity.system_comment ? `(${activity.system_comment})` : ''}
          &nbsp;
          {<span className='timestamp'>{Utils.timeSinceStr(activity.creation_timestamp)}</span>}
        </span>
      );
    }

    let requestStr = '';
    if (activity.activity_type === ActivityTypes.REQUESTED_TRANSITION) {
      requestStr = (
        <FormattedMessage
          defaultMessage=' requested a stage transition'
          description='Activity title text for requested transition in model versions page'
        />
      );
    } else if (activity.activity_type === ActivityTypes.APPROVED_REQUEST) {
      requestStr = (
        <FormattedMessage
          defaultMessage=' approved a stage transition'
          description='Activity title text for approved transition request in model versions page'
        />
      );
    } else if (activity.activity_type === ActivityTypes.REJECTED_REQUEST) {
      requestStr = (
        <FormattedMessage
          defaultMessage=' rejected a stage transition'
          description='Activity title text for rejected transition request in model versions page'
        />
      );
    } else if (activity.activity_type === ActivityTypes.CANCELLED_REQUEST) {
      requestStr = (
        <FormattedMessage
          defaultMessage=' cancelled their stage transition request'
          description='Activity title text for cancelled transition request in model versions page'
        />
      );
    } else {
      throw new Error('Unrecognized Activity type!');
    }

    return (
      <span>
        {' '}
        <b> {activity.user_id} </b> {requestStr} {StageTagComponents[activity.from_stage]}
        <i className='fas fa-long-arrow-right' />
        &nbsp;&nbsp;
        {StageTagComponents[activity.to_stage]}
        {<span className='timestamp'>{Utils.timeSinceStr(activity.creation_timestamp)}</span>}
      </span>
    );
  }

  getDescription(activity) {
    if (activity.comment && activity.comment !== '') {
      if (activity.activity_type !== ActivityTypes.NEW_COMMENT) {
        return (
          <div className='comment-wrapper'>
            <p className='comment'> {activity.comment} </p>
          </div>
        );
      } else {
        return (
          <div className='comment'>
            <EditableNote
              defaultMarkdown={activity.comment}
              minEditorHeight={52}
              maxEditorHeight={100}
              showEditor={this.state.showEdit[activity.id]}
              onCancel={() => this.handleShowEdit(activity.id, false)}
              onSubmit={(note) => this.handleSubmitEdit(activity.id, note)}
              toolbarCommands={commentEditorToolbarTypes}
            />
          </div>
        );
      }
    } else {
      return undefined;
    }
  }

  createSteps(activities) {
    const sortedActivities = _.sortBy(activities, 'creation_timestamp');
    return sortedActivities.map((activity) => (
      <Steps.Step
        data-test-id={'activity-' + activity.id}
        onMouseEnter={() => this.handleMouseEvent(activity.id, true)}
        onMouseLeave={() => this.handleMouseEvent(activity.id, false)}
        key={activity.creation_timestamp}
        icon={
          <div className='activity-icon-wrapper'>{IconByActivityType[activity.activity_type]}</div>
        }
        status='finish'
        title={this.getTitle(activity)}
        description={this.getDescription(activity)}
      />
    ));
  }

  getCommentEditor() {
    if (this.state.showCommentEditor) {
      return (
        <div className='comment comment-editor'>
          <EditableNote
            saveText={
              <FormattedMessage
                defaultMessage='Add Comment'
                description='Text for add comment button on activities list on model version page'
              />
            }
            toolbarCommands={commentEditorToolbarTypes}
            minEditorHeight={52}
            maxEditorHeight={100}
            childProps={{ textArea: { autoFocus: true } }}
            onSubmit={this.handleCreateComment}
            onCancel={() => this.setState({ showCommentEditor: false })}
            showEditor={this.state.showCommentEditor}
          />
        </div>
      );
    } else {
      return (
        <div className='comment-editor'>
          <Input
            className='comment-preview-pill'
            placeholder={this.props.intl.formatMessage({
              defaultMessage: 'Add a comment',
              description:
                'Placeholder text for add comment section in activities list on model' +
                ' version page',
            })}
            onFocus={() => this.setState({ showCommentEditor: true })}
          />
        </div>
      );
    }
  }

  render() {
    return (
      <div>
        <Steps direction='vertical' size='small' className='activity-steps'>
          {this.createSteps(this.props.activities)}
          <Steps.Step
            key='new-comment'
            icon={
              <div className='activity-icon-wrapper'>
                {IconByActivityType[ActivityTypes.NEW_COMMENT]}
              </div>
            }
            status='finish'
            description={this.getCommentEditor()}
          />
        </Steps>
        <Modal
          title={this.props.intl.formatMessage({
            defaultMessage: 'Delete Comment',
            description:
              'Modal title text for deleting a comment under activities list on the' +
              ' model version page',
          })}
          visible={this.state.isDeleteModalVisible}
          onOk={() => this.handleDeleteComment(this.state.activityIdToDelete)}
          okText={this.props.intl.formatMessage({
            defaultMessage: 'Delete',
            description:
              'Ok button text for deleting a comment under activities list on the' +
              ' model version page',
          })}
          okType='danger'
          onCancel={() => this.setState({ isDeleteModalVisible: false, activityIdToDelete: '' })}
          cancelText={this.props.intl.formatMessage({
            defaultMessage: 'Cancel',
            description:
              'Cancel button text for deleting a comment under activities list on the' +
              ' model version page',
          })}
        >
          <span>
            <FormattedMessage
              defaultMessage='Are you sure you want to delete this comment? This cannot be undone.'
              description='Modal text for deleting a comment under activities list on the model
                 version page'
            />
          </span>
        </Modal>
      </div>
    );
  }
}

export const ModelActivitiesList = injectIntl(ModelActivitiesListImpl);
