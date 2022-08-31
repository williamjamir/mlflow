import React from 'react';
import PropTypes from 'prop-types';
import { ModelVersionTable } from './ModelVersionTable';
import Utils from '../../common/utils/Utils';
import { Link } from 'react-router-dom';
import { modelListPageRoute, getCompareModelVersionsPageRoute, getModelPageRoute } from '../routes';
// BEGIN-EDGE
// TODO(ML-23816): We should migrate antd messages to DuBois' notifications.
// It's not trivial since currently they can be used as hooks in function components only.
// END-EDGE
import { message } from 'antd';
import { ACTIVE_STAGES } from '../constants';
import { CollapsibleSection } from '../../common/components/CollapsibleSection';
import { EditableNote } from '../../common/components/EditableNote';
import { EditableTagsTableView } from '../../common/components/EditableTagsTableView';
import { getRegisteredModelTags } from '../reducers';
import { setRegisteredModelTagApi, deleteRegisteredModelTagApi } from '../actions';
import { connect } from 'react-redux';
import { OverflowMenu, PageHeader } from '../../shared/building_blocks/PageHeader';
import { FormattedMessage, injectIntl } from 'react-intl';
import {
  Modal,
  Button,
  SegmentedControlGroup,
  SegmentedControlButton,
} from '@databricks/design-system';
import { Descriptions } from '../../common/components/Descriptions';
// BEGIN-EDGE
import { HeaderButton } from '../../shared/building_blocks/PageHeader';
import { ConfigureInferenceButton } from './ConfigureInferenceButton';
import { getModelPageServingRoute, getModelPageMonitoringRoute, PANES } from '../routes';
import PermissionUtils from '../utils/PermissionUtils';
import DatabricksUtils from '../../common/utils/DatabricksUtils';
import { ServingPane } from '../../model-serving/components/ServingPane';
import { ModelLevelEmailSubscriptionStatus } from './ModelPage';
import { Tooltip, Tabs, Tag, Select, Spinner, InfoFillIcon } from '@databricks/design-system';
import { getModelRegistryEmailNotificationsDocsUri } from '../utils';
import { MonitoringPane } from '../../model-monitoring/components/MonitoringPane';
import { getActiveModelMonitoringTags } from '../../model-monitoring/utils';
import { AssetType } from '@databricks/web-shared-bundle/recents';

const { TabPane } = Tabs;
// END-EDGE

export const StageFilters = {
  ALL: 'ALL',
  ACTIVE: 'ACTIVE',
};

export class ModelViewImpl extends React.Component {
  constructor(props) {
    super(props);
    this.onCompare = this.onCompare.bind(this);
    // BEGIN-EDGE
    this.handleSetSubscriptionStatus = this.handleSetSubscriptionStatus.bind(this);
    // END-EDGE
  }

  static propTypes = {
    model: PropTypes.shape({
      name: PropTypes.string.isRequired,
      creation_timestamp: PropTypes.number.isRequired,
      last_updated_timestamp: PropTypes.number.isRequired,
      // BEGIN-EDGE
      permission_level: PropTypes.string.isRequired,
      id: PropTypes.string.isRequired,
      // END-EDGE
    }),
    modelVersions: PropTypes.arrayOf(
      PropTypes.shape({
        current_stage: PropTypes.string.isRequired,
      }),
    ),
    handleEditDescription: PropTypes.func.isRequired,
    handleDelete: PropTypes.func.isRequired,
    history: PropTypes.object.isRequired,
    // BEGIN-EDGE
    // @Databricks handler for launching permission modal for registered model from Databricks
    showEditPermissionModal: PropTypes.func.isRequired,
    activePane: PropTypes.oneOf(Object.values(PANES)),
    emailSubscriptionStatus: PropTypes.string,
    userLevelEmailSubscriptionStatus: PropTypes.string,
    handleEmailNotificationPreferenceChange: PropTypes.func,
    // END-EDGE
    tags: PropTypes.object.isRequired,
    setRegisteredModelTagApi: PropTypes.func.isRequired,
    deleteRegisteredModelTagApi: PropTypes.func.isRequired,
    intl: PropTypes.any,
  };

  state = {
    stageFilter: StageFilters.ALL,
    showDescriptionEditor: false,
    isDeleteModalVisible: false,
    isDeleteModalConfirmLoading: false,
    runsSelected: {},
    isTagsRequestPending: false,
    updatingEmailPreferences: false,
  };

  formRef = React.createRef();
  // BEGIN-EDGE
  addToRecents() {
    const { activePane } = this.props;
    if (activePane === PANES.SERVING) {
      DatabricksUtils.addToRecents('endpoint', this.props.model.id);
      DatabricksUtils.registerRecent({ id: this.props.model.id, type: AssetType.ENDPOINT });
    } else if (activePane !== PANES.MONITORING) {
      DatabricksUtils.addToRecents('model', this.props.model.id);
      DatabricksUtils.registerRecent({ id: this.props.model.id, type: AssetType.MODEL });
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.activePane !== this.props.activePane) {
      this.addToRecents();
    }
  }
  // END-EDGE

  componentDidMount() {
    const pageTitle = `${this.props.model.name} - MLflow Model`;
    Utils.updatePageTitle(pageTitle);
    // BEGIN-EDGE
    this.addToRecents();
    // END-EDGE
  }

  handleStageFilterChange = (e) => {
    this.setState({ stageFilter: e.target.value });
  };

  getActiveVersionsCount() {
    const { modelVersions } = this.props;
    return modelVersions
      ? modelVersions.filter((v) => ACTIVE_STAGES.includes(v.current_stage)).length
      : 0;
  }
  // BEGIN-EDGE
  async handleSetSubscriptionStatus({ key: subscriptionStatus }) {
    this.setState({ updatingEmailPreferences: true });
    try {
      await this.props.handleEmailNotificationPreferenceChange(subscriptionStatus);
    } finally {
      this.setState({ updatingEmailPreferences: false });
    }
  }
  // END-EDGE

  handleCancelEditDescription = () => {
    this.setState({ showDescriptionEditor: false });
  };

  handleSubmitEditDescription = (description) => {
    return this.props.handleEditDescription(description).then(() => {
      this.setState({ showDescriptionEditor: false });
    });
  };

  startEditingDescription = (e) => {
    e.stopPropagation();
    this.setState({ showDescriptionEditor: true });
  };

  // BEGIN-EDGE
  canManageModelPermissions() {
    const { permission_level } = this.props.model;
    return PermissionUtils.permissionLevelCanManage(permission_level);
  }
  // END-EDGE
  getOverflowMenuItems() {
    // BEGIN-EDGE
    if (!this.canManageModelPermissions()) {
      return [];
    }
    // END-EDGE
    const menuItems = [
      {
        id: 'delete',
        itemName: (
          <FormattedMessage
            defaultMessage='Delete'
            // eslint-disable-next-line max-len
            description='Text for disabled delete button due to active versions on model view page header'
          />
        ),
        onClick: this.showDeleteModal,
        disabled: this.getActiveVersionsCount() > 0,
      },
    ];

    return menuItems;
  }

  // BEGIN-EDGE
  mapNotificationPreferenceToDisplayText(notificationPreference) {
    if (notificationPreference === ModelLevelEmailSubscriptionStatus.ALL_EVENTS) {
      return this.props.intl.formatMessage({
        defaultMessage: 'All new activity',
        description: 'Text for dropdown for all notifications on model view page',
      });
    } else if (notificationPreference === ModelLevelEmailSubscriptionStatus.UNSUBSCRIBED) {
      return this.props.intl.formatMessage({
        defaultMessage: 'Mute notifications',
        description: 'Text for dropdown for no notifications on model view page',
      });
    } else {
      return this.props.intl.formatMessage({
        defaultMessage: 'Activity on versions I follow',
        description: 'Text for dropdown for notifications that user follows on model view page',
      });
    }
  }

  notificationsEnabledForUser() {
    return (
      DatabricksUtils.modelRegistryEmailNotificationsEnabled() &&
      this.props.userLevelEmailSubscriptionStatus === ModelLevelEmailSubscriptionStatus.SUBSCRIBED
    );
  }

  renderNotificationDropdown = () => {
    if (this.notificationsEnabledForUser()) {
      return (
        <>
          <Select
            value={this.props.emailSubscriptionStatus}
            className='emailNotificationPreferenceDropdown'
            id='emailNotificationPreferenceDropdown'
            data-testid='email-notification-preference-dropdown'
            css={styles.emailNotificationPreferenceDropdown}
            disabled={this.state.updatingEmailPreferences}
            onChange={(key) => this.handleSetSubscriptionStatus({ key })}
          >
            <Select.Option
              value={ModelLevelEmailSubscriptionStatus.ALL_EVENTS}
              data-testid='all-events-menu-item'
            >
              {this.mapNotificationPreferenceToDisplayText(
                ModelLevelEmailSubscriptionStatus.ALL_EVENTS,
              )}
            </Select.Option>
            <Select.Option
              value={ModelLevelEmailSubscriptionStatus.DEFAULT}
              data-testid='default-menu-item'
            >
              {this.mapNotificationPreferenceToDisplayText(
                ModelLevelEmailSubscriptionStatus.DEFAULT,
              )}
            </Select.Option>
            <Select.Option
              value={ModelLevelEmailSubscriptionStatus.UNSUBSCRIBED}
              data-testid='unsubscribed-menu-item'
            >
              {this.mapNotificationPreferenceToDisplayText(
                ModelLevelEmailSubscriptionStatus.UNSUBSCRIBED,
              )}
            </Select.Option>
          </Select>{' '}
          {this.state.updatingEmailPreferences && <Spinner />}
        </>
      );
    }
    return null;
  };

  renderNotificationTooltip = () => {
    let contents = null;
    if (DatabricksUtils.modelRegistryEmailNotificationsEnabled()) {
      if (
        this.props.userLevelEmailSubscriptionStatus === ModelLevelEmailSubscriptionStatus.SUBSCRIBED
      ) {
        contents = (
          <FormattedMessage
            defaultMessage='Automated notifications about model registry activity are sent
                 to your email address. <link>Learn more.</link>'
            description='Tooltip text for email notifications when turned on in the model view
                 page'
            values={{
              link: (chunks) => (
                <a
                  target='_blank'
                  rel='noopener noreferrer'
                  href={getModelRegistryEmailNotificationsDocsUri()}
                >
                  {chunks}
                </a>
              ),
            }}
          />
        );
      } else {
        contents = (
          <FormattedMessage
            defaultMesage='Email notifications are currently turned off. To re-enable email
                 notifications, go to your <link>user settings.</link>'
            description='Tooltip text when user disables email notifications in user settings
                 for model view page'
            values={{
              link: (chunks) => (
                <a target='_blank' rel='noopener noreferrer' href={'/#setting/account'}>
                  {chunks}
                </a>
              ),
            }}
          />
        );
      }
    } else {
      contents = (
        <FormattedMessage
          defaultMessage='Email notifications are not enabled for your workspace. To gain
               access to this feature, please contact your workspace admin.'
          description='Tooltip text for notifications when not enabled for workspace in the
               model view page'
        />
      );
    }
    return (
      <Tooltip title={contents} placement='bottom'>
        <InfoFillIcon
          css={styles.emailNotificationPreferenceTip}
          data-testid='email-notification-preference-mark'
        />
      </Tooltip>
    );
  };

  renderEmailNotificationPreferenceDropdown() {
    let subheadingText;
    if (!DatabricksUtils.modelRegistryEmailNotificationsEnabledInShard()) {
      return null;
    }
    if (this.notificationsEnabledForUser()) {
      subheadingText = this.props.intl.formatMessage({
        defaultMessage: 'Notify me about',
        description: 'Notification setting status message when enabled on the model view page',
      });
    } else {
      subheadingText = this.props.intl.formatMessage({
        defaultMessage: 'Notifications Disabled',
        description: 'Notification setting status message when disabled on the model view page',
      });
    }
    return (
      <div data-testid='email-notification-preference-dropdown-wrapper'>
        {subheadingText}
        {this.renderNotificationTooltip()}
        {this.renderNotificationDropdown()}
      </div>
    );
  }

  renderTopRightPanel() {
    const { model } = this.props;
    if (DatabricksUtils.isGenerateBatchInferenceNotebookEnabled()) {
      return (
        <ConfigureInferenceButton modelName={model.name} permissionLevel={model.permission_level} />
      );
    }

    return null;
  }

  // END-EDGE
  showDeleteModal = () => {
    this.setState({ isDeleteModalVisible: true });
  };

  hideDeleteModal = () => {
    this.setState({ isDeleteModalVisible: false });
  };

  showConfirmLoading = () => {
    this.setState({ isDeleteModalConfirmLoading: true });
  };

  hideConfirmLoading = () => {
    this.setState({ isDeleteModalConfirmLoading: false });
  };

  handleDeleteConfirm = () => {
    const { history } = this.props;
    this.showConfirmLoading();
    this.props
      .handleDelete()
      .then(() => {
        history.push(modelListPageRoute);
      })
      .catch((e) => {
        this.hideConfirmLoading();
        Utils.logErrorAndNotifyUser(e);
      });
  };

  handleAddTag = (values) => {
    const form = this.formRef.current;
    const { model } = this.props;
    const modelName = model.name;
    this.setState({ isTagsRequestPending: true });
    this.props
      .setRegisteredModelTagApi(modelName, values.name, values.value)
      .then(() => {
        this.setState({ isTagsRequestPending: false });
        form.resetFields();
      })
      .catch((ex) => {
        this.setState({ isTagsRequestPending: false });
        console.error(ex);
        message.error('Failed to add tag. Error: ' + ex.getUserVisibleError());
      });
  };

  handleSaveEdit = ({ name, value }) => {
    const { model } = this.props;
    const modelName = model.name;
    return this.props.setRegisteredModelTagApi(modelName, name, value).catch((ex) => {
      console.error(ex);
      message.error('Failed to set tag. Error: ' + ex.getUserVisibleError());
    });
  };

  handleDeleteTag = ({ name }) => {
    const { model } = this.props;
    const modelName = model.name;
    return this.props.deleteRegisteredModelTagApi(modelName, name).catch((ex) => {
      console.error(ex);
      message.error('Failed to delete tag. Error: ' + ex.getUserVisibleError());
    });
  };

  onChange = (selectedRowKeys, selectedRows) => {
    const newState = Object.assign({}, this.state);
    newState.runsSelected = {};
    selectedRows.forEach((row) => {
      newState.runsSelected = {
        ...newState.runsSelected,
        [row.version]: row.run_id,
      };
    });
    this.setState(newState);
  };

  onCompare() {
    this.props.history.push(
      getCompareModelVersionsPageRoute(this.props.model.name, this.state.runsSelected),
    );
  }

  // BEGIN-EDGE
  onTabClick = (key) => {
    const { model, history } = this.props;
    switch (key) {
      case PANES.DETAILS: {
        history.push(getModelPageRoute(model.name));
        break;
      }
      case PANES.MONITORING: {
        history.push(getModelPageMonitoringRoute(model.name));
        break;
      }
      case PANES.SERVING:
      default:
        history.push(getModelPageServingRoute(model.name));
    }
  };

  // END-EDGE
  renderDescriptionEditIcon() {
    // BEGIN-EDGE
    const { permission_level } = this.props.model;
    if (!PermissionUtils.permissionLevelCanEdit(permission_level)) {
      return null;
    }
    // END-EDGE
    return (
      <Button
        data-test-id='descriptionEditButton'
        type='link'
        css={styles.editButton}
        onClick={this.startEditingDescription}
      >
        <FormattedMessage
          defaultMessage='Edit'
          description='Text for the edit button next to the description section title on
             the model view page'
        />
      </Button>
    );
  }

  renderDetails = () => {
    const { model, modelVersions, tags } = this.props;
    const {
      stageFilter,
      showDescriptionEditor,
      isDeleteModalVisible,
      isDeleteModalConfirmLoading,
      isTagsRequestPending,
    } = this.state;
    const modelName = model.name;
    const compareDisabled = Object.keys(this.state.runsSelected).length < 2;
    return (
      <div css={styles.wrapper}>
        {/* BEGIN-EDGE */}
        {this.renderEmailNotificationPreferenceDropdown()}
        {/* END-EDGE */}
        {/* Metadata List */}
        <Descriptions columns={3} data-testid='model-view-metadata'>
          <Descriptions.Item
            data-testid='model-view-metadata-item'
            label={this.props.intl.formatMessage({
              defaultMessage: 'Created Time',
              description:
                'Label name for the created time under details tab on the model view page',
            })}
          >
            {Utils.formatTimestamp(model.creation_timestamp)}
          </Descriptions.Item>
          <Descriptions.Item
            data-testid='model-view-metadata-item'
            label={this.props.intl.formatMessage({
              defaultMessage: 'Last Modified',
              description:
                'Label name for the last modified time under details tab on the model view page',
            })}
          >
            {Utils.formatTimestamp(model.last_updated_timestamp)}
          </Descriptions.Item>
          {/* Reported during ESLint upgrade */}
          {/* eslint-disable-next-line react/prop-types */}
          {model.user_id && (
            <Descriptions.Item
              data-testid='model-view-metadata-item'
              label={this.props.intl.formatMessage({
                defaultMessage: 'Creator',
                description: 'Lable name for the creator under details tab on the model view page',
              })}
            >
              {/* eslint-disable-next-line react/prop-types */}
              <div>{model.user_id}</div>
            </Descriptions.Item>
          )}
        </Descriptions>

        {/* Page Sections */}
        <CollapsibleSection
          css={styles.collapsiblePanel}
          title={
            <span>
              <FormattedMessage
                defaultMessage='Description'
                description='Title text for the description section under details tab on the model
                   view page'
              />{' '}
              {!showDescriptionEditor ? this.renderDescriptionEditIcon() : null}
            </span>
          }
          forceOpen={showDescriptionEditor}
          // Reported during ESLint upgrade
          // eslint-disable-next-line react/prop-types
          defaultCollapsed={!model.description}
          data-test-id='model-description-section'
        >
          <EditableNote
            // Reported during ESLint upgrade
            // eslint-disable-next-line react/prop-types
            defaultMarkdown={model.description}
            onSubmit={this.handleSubmitEditDescription}
            onCancel={this.handleCancelEditDescription}
            showEditor={showDescriptionEditor}
          />
        </CollapsibleSection>
        <div data-test-id='tags-section'>
          <CollapsibleSection
            title={
              <FormattedMessage
                defaultMessage='Tags'
                description='Title text for the tags section under details tab on the model view
                   page'
              />
            }
            defaultCollapsed={Utils.getVisibleTagValues(tags).length === 0}
            data-test-id='model-tags-section'
          >
            <EditableTagsTableView
              innerRef={this.formRef}
              handleAddTag={this.handleAddTag}
              handleDeleteTag={this.handleDeleteTag}
              handleSaveEdit={this.handleSaveEdit}
              tags={tags}
              isRequestPending={isTagsRequestPending}
            />
          </CollapsibleSection>
        </div>
        <CollapsibleSection
          title={
            <>
              <div css={styles.versionsTabButtons}>
                <span>
                  <FormattedMessage
                    defaultMessage='Versions'
                    description='Title text for the versions section under details tab on the
                       model view page'
                  />
                </span>
                <SegmentedControlGroup
                  value={this.state.stageFilter}
                  onChange={(e) => this.handleStageFilterChange(e)}
                >
                  <SegmentedControlButton value={StageFilters.ALL}>
                    <FormattedMessage
                      defaultMessage='All'
                      description={
                        'Tab text to view all versions under details tab on' +
                        ' the model view page'
                      }
                    />
                  </SegmentedControlButton>
                  <SegmentedControlButton value={StageFilters.ACTIVE}>
                    <FormattedMessage
                      defaultMessage='Active'
                      description='Tab text to view active versions under details tab
                               on the model view page'
                    />{' '}
                    {this.getActiveVersionsCount()}
                  </SegmentedControlButton>
                </SegmentedControlGroup>
                <Button
                  data-test-id='compareButton'
                  disabled={compareDisabled}
                  onClick={this.onCompare}
                >
                  <FormattedMessage
                    defaultMessage='Compare'
                    description='Text for compare button to compare versions under details tab
                       on the model view page'
                  />
                </Button>
              </div>
            </>
          }
          data-test-id='model-versions-section'
        >
          <ModelVersionTable
            activeStageOnly={stageFilter === StageFilters.ACTIVE}
            modelName={modelName}
            modelVersions={modelVersions}
            onChange={this.onChange}
          />
        </CollapsibleSection>

        {/* Delete Model Dialog */}
        <Modal
          data-testid='mlflow-input-modal'
          title={this.props.intl.formatMessage({
            defaultMessage: 'Delete Model',
            description: 'Title text for delete model modal on model view page',
          })}
          visible={isDeleteModalVisible}
          confirmLoading={isDeleteModalConfirmLoading}
          onOk={this.handleDeleteConfirm}
          okText={this.props.intl.formatMessage({
            defaultMessage: 'Delete',
            description: 'OK text for delete model modal on model view page',
          })}
          cancelText={this.props.intl.formatMessage({
            defaultMessage: 'Cancel',
            description: 'Cancel text for delete model modal on model view page',
          })}
          okType='danger'
          onCancel={this.hideDeleteModal}
        >
          <span>
            <FormattedMessage
              defaultMessage='Are you sure you want to delete {modelName}? This cannot be undone.'
              description='Confirmation message for delete model modal on model view page'
              values={{ modelName: modelName }}
            />
          </span>
        </Modal>
      </div>
    );
  };

  // BEGIN-EDGE
  renderMainPanel() {
    const { model, activePane } = this.props;
    // Reported during ESLint upgrade
    // eslint-disable-next-line react/prop-types
    const { tags = [] } = model;
    const activeMonitoringTags = getActiveModelMonitoringTags(tags);

    return (
      <Tabs
        activeKey={activePane || PANES.DETAILS}
        onChange={this.onTabClick}
        defaultActiveKey={activePane || PANES.DETAILS}
        destroyInactiveTabPane
      >
        <TabPane
          tab={this.props.intl.formatMessage({
            defaultMessage: 'Details',
            description: 'Tab name for the details tab on the model view main panel',
          })}
          key={PANES.DETAILS}
        >
          {this.renderDetails()}
        </TabPane>
        {DatabricksUtils.isModelServingEnabled() ? (
          <TabPane
            tab={
              <div>
                <span>
                  {this.props.intl.formatMessage({
                    defaultMessage: 'Serving',
                    description: 'Tab name for the serving tab on the model view main panel',
                  })}
                  {DatabricksUtils.modelServingV2EndpointCreationEnabled() ? (
                    <>
                      {' '}
                      <Tag title='Preview'>Preview</Tag>
                    </>
                  ) : null}
                </span>
              </div>
            }
            key={PANES.SERVING}
          >
            <ServingPane modelName={model.name} modelPermissionLevel={model.permission_level} />
          </TabPane>
        ) : null}
        {(DatabricksUtils.getConf('enableModelMonitoringPublicPreview') || // goc for public preview
          (DatabricksUtils.getConf('enableModelMonitoring') && // goc for private preview
            activeMonitoringTags.length > 0)) && (
          <TabPane
            tab={
              <div>
                {this.props.intl.formatMessage({
                  defaultMessage: 'Monitoring',
                  description: 'Tab name for the monitoring tab on the model view main panel',
                })}
                {DatabricksUtils.getConf('enableModelMonitoringPublicPreview') && (
                  <>
                    {' '}
                    <Tag title='Preview'>Preview</Tag>
                  </>
                )}
              </div>
            }
            key={PANES.MONITORING}
          >
            <MonitoringPane monitors={activeMonitoringTags} />
          </TabPane>
        )}
      </Tabs>
    );
  }

  // END-EDGE
  oss_renderMainPanel() {
    return this.renderDetails();
  }

  render() {
    const { model } = this.props;
    const modelName = model.name;

    const breadcrumbs = [
      <Link to={modelListPageRoute}>
        <FormattedMessage
          defaultMessage='Registered Models'
          description='Text for link back to model page under the header on the model view page'
        />
      </Link>,
      <Link data-test-id='breadcrumbRegisteredModel' to={getModelPageRoute(modelName)}>
        {modelName}
      </Link>,
    ];
    return (
      <div>
        <PageHeader title={modelName} breadcrumbs={breadcrumbs}>
          <OverflowMenu menu={this.getOverflowMenuItems()} />
          {/* BEGIN-EDGE */}
          {/* eslint-disable-next-line max-len */}
          {this.canManageModelPermissions() && DatabricksUtils.isAclCheckEnabledForModelRegistry() && (
            <HeaderButton
              type='secondary'
              onClick={this.props.showEditPermissionModal}
              data-test-id='edit-permissions-button'
            >
              <FormattedMessage
                defaultMessage='Permissions'
                description='Text for permissions button on model view page header'
              />
            </HeaderButton>
          )}
          {this.renderTopRightPanel()}
          {/* END-EDGE */}
        </PageHeader>
        {this.renderMainPanel()}
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  const modelName = ownProps.model.name;
  const tags = getRegisteredModelTags(modelName, state);
  return { tags };
};
const mapDispatchToProps = { setRegisteredModelTagApi, deleteRegisteredModelTagApi };

const styles = {
  emailNotificationPreferenceDropdown: (theme) => ({ width: 300, marginBottom: theme.spacing.md }),
  emailNotificationPreferenceTip: (theme) => ({
    paddingLeft: theme.spacing.sm,
    paddingRight: theme.spacing.sm,
  }),
  wrapper: (theme) => ({
    '.collapsible-panel': {
      marginBottom: theme.spacing.md,
    },
    /**
     * This seems to be a best and most stable method to catch
     * antd's collapsible section buttons without hacks
     * and using class names.
     */
    'div[role="button"][aria-expanded]': {
      height: theme.general.buttonHeight,
    },
  }),
  editButton: (theme) => ({
    marginLeft: theme.spacing.md,
  }),
  versionsTabButtons: (theme) => ({
    display: 'flex',
    gap: theme.spacing.md,
    alignItems: 'center',
  }),
};

export const ModelView = connect(mapStateToProps, mapDispatchToProps)(injectIntl(ModelViewImpl));
