import React from 'react';
import { Dropdown, Menu, Modal, ChevronDownIcon } from '@databricks/design-system';

import PropTypes from 'prop-types';
import { Stages, StageTagComponents, ActivityTypes } from '../constants';
import { DirectTransitionForm } from './DirectTransitionForm';
// BEGIN-EDGE
import PermissionUtils from '../utils/PermissionUtils';
import { TransitionRequestForm } from './TransitionRequestForm';
// END-EDGE
import _ from 'lodash';
import { FormattedMessage } from 'react-intl';

export class ModelStageTransitionDropdown extends React.Component {
  static propTypes = {
    currentStage: PropTypes.string,
    // BEGIN-EDGE
    permissionLevel: PropTypes.string,
    // END-EDGE
    onSelect: PropTypes.func,
  };

  static defaultProps = {
    currentStage: Stages.NONE,
  };

  state = {
    confirmModalVisible: false,
    confirmingActivity: null,
    handleConfirm: undefined,
  };

  transitionFormRef = React.createRef();

  // BEGIN-EDGE
  handleMenuItemClick = (activity) => {
    const { onSelect } = this.props;
    this.setState({
      confirmModalVisible: true,
      confirmingActivity: activity,
      handleConfirm:
        onSelect &&
        (() => {
          this.setState({ confirmModalVisible: false });
          const comment = this.transitionFormRef.current.getFieldValue('comment');
          const archiveExistingVersions = Boolean(
            this.transitionFormRef.current.getFieldValue('archiveExistingVersions'),
          );
          this.transitionFormRef.current.resetFields();
          this.props.onSelect(activity, comment, archiveExistingVersions);
        }),
    });
  };

  // END-EDGE
  oss_handleMenuItemClick = (activity) => {
    const { onSelect } = this.props;
    this.setState({
      confirmModalVisible: true,
      confirmingActivity: activity,
      handleConfirm:
        onSelect &&
        (() => {
          this.setState({ confirmModalVisible: false });
          const archiveExistingVersions = Boolean(
            this.transitionFormRef.current.getFieldValue('archiveExistingVersions'),
          );
          this.props.onSelect(activity, archiveExistingVersions);
        }),
    });
  };

  handleConfirmModalCancel = () => {
    this.setState({ confirmModalVisible: false });
  };

  getNoneCurrentStages = (currentStage) => {
    const stages = Object.values(Stages);
    _.remove(stages, (s) => s === currentStage);
    return stages;
  };

  // BEGIN-EDGE
  getTransitionAvailableStages = (currentStage, permissionLevel) => {
    const stages = Object.values(Stages);
    _.remove(
      stages,
      (toStage) =>
        !PermissionUtils.permissionLevelCanTransitionToStage(
          permissionLevel,
          currentStage,
          toStage,
        ),
    );
    return stages;
  };

  getMenu() {
    const { currentStage, onSelect, permissionLevel } = this.props;
    const nonCurrentStages = this.getNoneCurrentStages(currentStage);
    const transitionAvailableStages = this.getTransitionAvailableStages(
      currentStage,
      permissionLevel,
    );
    return (
      <Menu onSelect={onSelect}>
        {nonCurrentStages.map((stage) => (
          <Menu.Item
            key={`request-transition-to-${stage}`}
            onClick={() =>
              this.handleMenuItemClick({
                type: ActivityTypes.REQUESTED_TRANSITION,
                to_stage: stage,
              })
            }
          >
            <FormattedMessage
              defaultMessage='Request transition to'
              description='Text for requesting transition to a different stage for a model version
                 under dropdown menu in model version page'
            />
            &nbsp;&nbsp;&nbsp;
            <i className='fas fa-long-arrow-right' />
            &nbsp;&nbsp;&nbsp;&nbsp;
            {StageTagComponents[stage]}
          </Menu.Item>
        ))}
        {PermissionUtils.permissionLevelCanTransitionStages(permissionLevel) && (
          // Menu.Divider is not available in Dubois so we're recreating it here.
          // Should be obsolete after refactoring the component to use DropdownMenu.
          <Menu.Item
            data-test-id='transition-menu-item-divider'
            css={({ colors, spacing }) => ({
              borderBottom: `1px solid ${colors.border}`,
              marginBottom: spacing.sm,
            })}
            disabled
          />
        )}
        {PermissionUtils.permissionLevelCanTransitionStages(permissionLevel) &&
          transitionAvailableStages.map((stage) => (
            <Menu.Item
              key={`transition-to-${stage}`}
              onClick={() =>
                this.handleMenuItemClick({
                  type: ActivityTypes.APPLIED_TRANSITION,
                  to_stage: stage,
                })
              }
            >
              <FormattedMessage
                defaultMessage='Transition to'
                description='Text for transitioning a model version to a different stage under
                   dropdown menu in model version page'
              />
              &nbsp;&nbsp;&nbsp;&nbsp;
              <i className='fas fa-long-arrow-right' />
              &nbsp;&nbsp;&nbsp;&nbsp;
              {StageTagComponents[stage]}
            </Menu.Item>
          ))}
      </Menu>
    );
  }

  // END-EDGE
  oss_getMenu() {
    const { currentStage, onSelect } = this.props;
    const nonCurrentStages = this.getNoneCurrentStages(currentStage);
    return (
      <Menu onSelect={onSelect}>
        {nonCurrentStages.map((stage) => (
          <Menu.Item
            key={`transition-to-${stage}`}
            onClick={() =>
              this.handleMenuItemClick({
                type: ActivityTypes.APPLIED_TRANSITION,
                to_stage: stage,
              })
            }
          >
            <FormattedMessage
              defaultMessage='Transition to'
              description='Text for transitioning a model version to a different stage under
                 dropdown menu in model version page'
            />
            &nbsp;&nbsp;&nbsp;&nbsp;
            <i className='fas fa-long-arrow-right' />
            &nbsp;&nbsp;&nbsp;&nbsp;
            {StageTagComponents[stage]}
          </Menu.Item>
        ))}
      </Menu>
    );
  }

  // BEGIN-EDGE
  renderConfirmModal() {
    const { confirmModalVisible, confirmingActivity, handleConfirm } = this.state;
    if (confirmingActivity) {
      let formComponent;
      switch (confirmingActivity.type) {
        case ActivityTypes.REQUESTED_TRANSITION:
          formComponent = <TransitionRequestForm innerRef={this.transitionFormRef} />;
          break;
        case ActivityTypes.APPLIED_TRANSITION:
          formComponent = (
            <DirectTransitionForm
              innerRef={this.transitionFormRef}
              toStage={confirmingActivity.to_stage}
            />
          );
          break;
        default:
          formComponent = null;
      }
      return (
        <Modal
          title={
            <FormattedMessage
              defaultMessage='Stage Transition'
              description='Title text for model version stage transitions in confirm modal'
            />
          }
          visible={confirmModalVisible}
          onOk={handleConfirm}
          onCancel={this.handleConfirmModalCancel}
          okText={
            <FormattedMessage
              defaultMessage='OK'
              description='Text for OK button on the confirmation page for stage transition
                 on the model versions page'
            />
          }
          cancelText={
            <FormattedMessage
              defaultMessage='Cancel'
              description='Text for cancel button on the confirmation page for stage
                transitions on the model versions page'
            />
          }
        >
          {renderActivityDescription(confirmingActivity)}
          {formComponent}
        </Modal>
      );
    }
    return null;
  }

  // END-EDGE
  oss_renderConfirmModal() {
    const { confirmModalVisible, confirmingActivity, handleConfirm } = this.state;
    if (confirmingActivity) {
      const formComponent = (
        <DirectTransitionForm
          innerRef={this.transitionFormRef}
          toStage={confirmingActivity.to_stage}
        />
      );
      return (
        <Modal
          title={
            <FormattedMessage
              defaultMessage='Stage Transition'
              description='Title text for model version stage transitions in confirm modal'
            />
          }
          visible={confirmModalVisible}
          onOk={handleConfirm}
          onCancel={this.handleConfirmModalCancel}
          okText={
            <FormattedMessage
              defaultMessage='OK'
              description='Text for OK button on the confirmation page for stage transition
                 on the model versions page'
            />
          }
          cancelText={
            <FormattedMessage
              defaultMessage='Cancel'
              description='Text for cancel button on the confirmation page for stage
                transitions on the model versions page'
            />
          }
        >
          {renderActivityDescription(confirmingActivity)}
          {formComponent}
        </Modal>
      );
    }
    return null;
  }

  render() {
    const { currentStage } = this.props;
    return (
      <span>
        <Dropdown
          overlay={this.getMenu()}
          trigger={['click']}
          className='stage-transition-dropdown'
        >
          <span>
            {StageTagComponents[currentStage]}
            <ChevronDownIcon css={{ cursor: 'pointer', marginLeft: -4 }} />
          </span>
        </Dropdown>
        {this.renderConfirmModal()}
      </span>
    );
  }
}

// BEGIN-EDGE
export const renderActivityDescription = (activity) => {
  if (activity) {
    const isRequestTransition = activity.type === ActivityTypes.REQUESTED_TRANSITION;
    return (
      <div>
        {isRequestTransition ? (
          <FormattedMessage
            defaultMessage='Request transition to'
            description='Text for activity description under confirmation modal for model
             version stage transition request'
          />
        ) : (
          <FormattedMessage
            defaultMessage='Transition to'
            description='Text for activity description under confirmation modal for model
               version stage transition'
          />
        )}
        &nbsp;&nbsp;&nbsp;
        <i className='fas fa-long-arrow-right' />
        &nbsp;&nbsp;&nbsp;&nbsp;
        {StageTagComponents[activity.to_stage]}
      </div>
    );
  }
  return null;
};

// END-EDGE
export const oss_renderActivityDescription = (activity) => {
  if (activity) {
    return (
      <div>
        <FormattedMessage
          defaultMessage='Transition to'
          description='Text for activity description under confirmation modal for model
             version stage transition'
        />
        &nbsp;&nbsp;&nbsp;
        <i className='fas fa-long-arrow-right' />
        &nbsp;&nbsp;&nbsp;&nbsp;
        {StageTagComponents[activity.to_stage]}
      </div>
    );
  }
  return null;
};
