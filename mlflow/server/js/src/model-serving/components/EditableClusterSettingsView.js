import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import _ from 'lodash';
import { Popconfirm, notification } from 'antd';
import { Button, Spacer, Typography } from '@databricks/design-system';
import { EditableTagsTableView } from '../../common/components/EditableTagsTableView';
import { ModelVersionTag } from '../../model-registry/sdk/ModelRegistryMessages';
import { ConfirmModal } from '../../experiment-tracking/components/modals/ConfirmModal';
import Utils from '../../common/utils/Utils';
import { ClusterDropdown, getCategoryAndNodeInfo, NodeLabel } from '../utils';

const { Title } = Typography;
export class EditableClusterSettingsViewImpl extends React.Component {
  static propTypes = {
    modelName: PropTypes.string.isRequired,
    endpoint: PropTypes.object.isRequired,
    supportedClusterNodes: PropTypes.object.isRequired,
    handleSubmit: PropTypes.func.isRequired,
  };

  formRef = React.createRef();

  constructor(props) {
    super(props);
    const { actual_cluster_config } = this.props.endpoint;
    this.state = {
      desiredClusterNodeType:
        actual_cluster_config === undefined ? '' : actual_cluster_config.node_type_id,
      desiredClusterTags: actual_cluster_config === undefined ? [] : actual_cluster_config.tags,
      isAddTagRequestPending: false,
      showUpdateConfirmModal: false,
    };
  }

  showSuccessNotification = () => {
    notification.info({
      message: `Launching Cluster`,
      description:
        'Creating a new cluster with the specified configuration. This may take a few minutes.',
      placement: 'bottomRight',
      duration: 10,
    });
  };

  handleSubmit = () => {
    const { desiredClusterNodeType, desiredClusterTags } = this.state;
    const desiredClusterState = {
      node_type_id: desiredClusterNodeType,
      tags: desiredClusterTags,
    };
    return this.props
      .handleSubmit(desiredClusterState)
      .then(() => this.showSuccessNotification())
      .catch(Utils.logErrorAndNotifyUser);
  };

  handleCancel = () => {
    const { endpoint } = this.props;
    this.setState(
      {
        desiredClusterNodeType: endpoint.actual_cluster_config.node_type_id,
        desiredClusterTags: endpoint.actual_cluster_config.tags,
      },
      () => {
        // Since the initial value displayed on the cascader does not change after a re-render, we
        // need to reload the page for the `desiredClusterNodeType` to be correctly shown on the
        // cascader. In addition, this ensures that a stale/corrupted state is never reached.
        window.location.reload();
      },
    );
  };

  handleNodeTypeChange = (value) => {
    this.setState({
      desiredClusterNodeType: _.last(value),
    });
  };

  handleAddTag = (values) => {
    const form = this.formRef.current;
    this.setState({ isAddTagRequestPending: true });
    const tag = { key: values.name, value: values.value };
    this.setState(
      (prevState) => {
        const previousTags = prevState.desiredClusterTags || [];
        return { desiredClusterTags: [...previousTags, tag] };
      },
      () => {
        this.setState({ isAddTagRequestPending: false });
        form.resetFields();
      },
    );
  };

  handleDeleteTag = ({ name }) => {
    this.setState((prevState) => ({
      desiredClusterTags: prevState.desiredClusterTags.filter((tag) => tag.key !== name),
    }));
    // EditableTagsTableView uses EditableFormTable which expects a resolved promise when a tag
    // is deleted.
    return Promise.resolve();
  };

  handleSaveEdit = ({ name, value }) => {
    let { desiredClusterTags } = this.state;
    desiredClusterTags = desiredClusterTags.filter((tag) => tag.key !== name);
    const tag = { key: name, value: value };
    this.setState({
      desiredClusterTags: [...desiredClusterTags, tag],
    });
    // EditableTagsTableView uses EditableFormTable which expects a resolved promise when a tag
    // is edited.
    return Promise.resolve();
  };

  getCurrentClusterNodeType() {
    const { desiredClusterNodeType } = this.state;
    if (desiredClusterNodeType) {
      const node = getCategoryAndNodeInfo(desiredClusterNodeType, this.props.supportedClusterNodes);
      if (node) {
        return [node.category, node.nodeInfo.nodeTypeId];
      }
    }
    return null;
  }

  getData = () => {
    const tags = this.state.desiredClusterTags || [];
    const tagObj = {};
    // The EditableTagsTableView expects tags as a FatRecord. Since all tags are
    // key-value pairs, we chose to reuse an existing class rather than duplicating code
    // for the clusterTags.
    tags.forEach((tag) => (tagObj[tag.key] = ModelVersionTag.fromJs(tag)));
    return tagObj;
  };

  // Since the cascader only has 1 level of nesting, the selectedOptions contains
  // an array of type [Category, Node]. To finally display the information pertaining to the node,
  // the last element is selected.
  renderClusterCascaderDisplay = (labels, selectedOptions) => {
    const option = _.last(selectedOptions);
    if (option) {
      const node = getCategoryAndNodeInfo(option.value, this.props.supportedClusterNodes);
      return (
        <span key={option.value}>
          <NodeLabel nodeInfo={node.nodeInfo} />
        </span>
      );
    }
    return [];
  };

  openConfirmModal = () => {
    this.setState({
      showUpdateConfirmModal: true,
    });
  };

  closeConfirmModal = () => {
    this.setState({
      showUpdateConfirmModal: false,
    });
  };

  render() {
    const { isAddTagRequestPending, showUpdateConfirmModal } = this.state;
    return (
      <div className='editable-cluster-settings-page' css={styles.clusterPage}>
        <div className='editable-cluster-settings-intro' css={styles.introduction}>
          <Title level={3}>Cluster Settings</Title>
          <Spacer size='small' />
          <span className='editable-cluster-settings-description' css={styles.description}>
            Change the configuration of the cluster used in serving this endpoint.
          </span>
        </div>
        <div data-test-id='editable-cluster-settings'>
          <Title level={4} withoutMargins>
            Instance Type
          </Title>
          <ClusterDropdown
            supportedClusterNodes={this.props.supportedClusterNodes}
            defaultValue={this.getCurrentClusterNodeType()}
            displayRender={this.renderClusterCascaderDisplay}
            onChange={this.handleNodeTypeChange}
          />
          <div data-test-id='serving-tags-table'>
            <Spacer size='large' />
            <Title level={4} withoutMargins>
              Tags
            </Title>
            <Spacer size='medium' />
            <EditableTagsTableView
              innerRef={this.formRef}
              handleAddTag={this.handleAddTag}
              handleDeleteTag={this.handleDeleteTag}
              handleSaveEdit={this.handleSaveEdit}
              tags={this.getData()}
              isRequestPending={isAddTagRequestPending}
            />
          </div>
          <div className='editable-cluster-settings-form-buttons' css={styles.formButtons}>
            <ConfirmModal
              isOpen={showUpdateConfirmModal}
              onClose={this.closeConfirmModal}
              handleSubmit={this.handleSubmit}
              title={'Confirm New Settings'}
              helpText={'Launch a new cluster with specified settings.'}
              confirmButtonText={'Confirm'}
            />
            <Button
              type='primary'
              data-test-id='serving-cluster-submit'
              onClick={this.openConfirmModal}
            >
              Save
            </Button>
            <Popconfirm
              title='All unsaved changes will be lost'
              okText='Confirm'
              cancelText='Cancel'
              onConfirm={this.handleCancel}
            >
              <Button
                type='button'
                className='editable-cluster-settings-cancel-button'
                css={styles.cancelButton}
                data-test-id='serving-cluster-cancel'
              >
                Cancel
              </Button>
            </Popconfirm>
          </div>
        </div>
      </div>
    );
  }
}

const styles = {
  introduction: {
    marginBottom: 20,
  },
  description: {
    color: '#849298',
    fontSize: 'smaller',
    fontWeight: '400',
  },
  formButtons: {
    marginTop: '50px',
  },
  nodeInfo: {
    fontSize: '10px',
    color: '#556A72',
    marginLeft: 'auto',
    textAlign: 'right',
    paddingRight: '5px',
  },
  label: {
    display: 'flex',
  },
  sectionStyle: {
    width: '600px',
  },
  cancelButton: {
    marginLeft: '15px',
  },
};

const mapStateToProps = (state, ownProps) => {
  const { supportedClusterNodes } = state.entities;
  return {
    supportedClusterNodes,
  };
};

export const EditableClusterSettingsView = connect(
  mapStateToProps,
  null,
)(EditableClusterSettingsViewImpl);
