import React from 'react';
import PropTypes from 'prop-types';
import { Table, Tooltip } from 'antd';
import { Link } from 'react-router-dom';
import { Typography } from '@databricks/design-system';
import Utils from '../../common/utils/Utils';
import { truncateToFirstLineWithMaxLength } from '../../common/utils/StringUtils';
import {
  ACTIVE_STAGES,
  // BEGIN-EDGE
  EMPTY_CELL_PLACEHOLDER,
  // END-EDGE
  StageTagComponents,
  ModelVersionStatus,
  ModelVersionStatusIcons,
  modelVersionStatusIconTooltips,
} from '../constants';
import { getModelVersionPageRoute } from '../routes';
import { RegisteringModelDocUrl } from '../../common/constants';
import { FormattedMessage, injectIntl } from 'react-intl';
// BEGIN-EDGE
import { DatabricksRegisterAModelDocUrl } from '../../common/constants-databricks';
import DatabricksUtils from '../../common/utils/DatabricksUtils';
import { ModelLevelEmailSubscriptionStatus } from './ModelPage';
import { getModelVersionFollowSubscriptionTooltip } from '../utils';
// END-EDGE

const { Text } = Typography;

export class ModelVersionTableImpl extends React.Component {
  static propTypes = {
    modelName: PropTypes.string.isRequired,
    modelVersions: PropTypes.array.isRequired,
    activeStageOnly: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
    intl: PropTypes.any,
  };

  static defaultProps = {
    modelVersions: [],
    activeStageOnly: false,
  };

  // BEGIN-EDGE
  getSubscriptionTooltip(user_id) {
    if (window && window.top && window.top.settings && window.top.settings.user === user_id) {
      return 'You are following this model version because you created it.';
    } else {
      return (
        'You are following this model version because you interacted with' +
        ' it (via comments, transition requests, etc.)'
      );
    }
  }

  getFollowColumnDetails() {
    if (
      DatabricksUtils.modelRegistryEmailNotificationsEnabledInShard() &&
      DatabricksUtils.modelRegistryEmailNotificationsEnabledForWorkspace()
    ) {
      return {
        key: 'following',
        title: '', // Follow column does not have title
        render: ({ email_subscription_status, user_id }) => {
          if (email_subscription_status === ModelLevelEmailSubscriptionStatus.ALL_EVENTS) {
            return (
              <Tooltip title={getModelVersionFollowSubscriptionTooltip(user_id, window)}>
                <i className='fas fa-bell'></i>
              </Tooltip>
            );
          } else {
            return null;
          }
        },
        align: 'right',
        width: 40,
      };
    } else {
      return null;
    }
  }

  // END-EDGE
  getColumns = () => {
    const { modelName } = this.props;
    const columns = [
      {
        key: 'status',
        title: '', // Status column does not have title
        render: ({ status, status_message }) => (
          <Tooltip title={status_message || modelVersionStatusIconTooltips[status]}>
            <Text size='lg'>{ModelVersionStatusIcons[status]}</Text>
          </Tooltip>
        ),
        align: 'right',
        width: 40,
      },
      {
        title: this.props.intl.formatMessage({
          defaultMessage: 'Version',
          description: 'Column title text for model version in model version table',
        }),
        className: 'model-version',
        dataIndex: 'version',
        render: (version) => (
          <FormattedMessage
            defaultMessage='<link>Version {versionNumber}</link>'
            description='Link to model version in the model version table'
            values={{
              link: (chunks) => (
                <Link to={getModelVersionPageRoute(modelName, version)}>{chunks}</Link>
              ),
              versionNumber: version,
            }}
          />
        ),
      },
      {
        title: this.props.intl.formatMessage({
          defaultMessage: 'Registered at',
          description: 'Column title text for created at timestamp in model version table',
        }),
        dataIndex: 'creation_timestamp',
        render: (creationTimestamp) => <span>{Utils.formatTimestamp(creationTimestamp)}</span>,
        sorter: (a, b) => a.creation_timestamp - b.creation_timestamp,
        defaultSortOrder: 'descend',
        sortDirections: ['descend'],
      },
      {
        title: this.props.intl.formatMessage({
          defaultMessage: 'Created by',
          description: 'Column title text for creator username in model version table',
        }),
        dataIndex: 'user_id',
      },
      {
        title: this.props.intl.formatMessage({
          defaultMessage: 'Stage',
          description: 'Column title text for model version stage in model version table',
        }),
        dataIndex: 'current_stage',
        render: (currentStage) => {
          return StageTagComponents[currentStage];
        },
      },
      // BEGIN-EDGE
      {
        title: this.props.intl.formatMessage({
          defaultMessage: 'Pending Requests',
          description: 'Column title text for pending requests in model version table',
        }),
        dataIndex: 'open_requests',
        render: (requests) => (requests ? requests.length : EMPTY_CELL_PLACEHOLDER),
      },
      // END-EDGE
      {
        title: this.props.intl.formatMessage({
          defaultMessage: 'Description',
          description: 'Column title text for description in model version table',
        }),
        dataIndex: 'description',
        render: (description) => truncateToFirstLineWithMaxLength(description, 32),
      },
    ];
    // BEGIN-EDGE
    const followColumn = this.getFollowColumnDetails();
    if (followColumn) {
      columns.splice(1, 0, this.getFollowColumnDetails());
    }
    // END-EDGE
    return columns;
  };

  getRowKey = (record) => record.creation_timestamp;

  emptyTablePlaceholder = () => {
    const learnMoreLinkUrl = ModelVersionTable.getLearnMoreLinkUrl();
    return (
      <span>
        <FormattedMessage
          defaultMessage='No models are registered yet. <link>Learn more</link> about how to
             register a model.'
          description='Message text when no model versions are registerd'
          values={{
            link: (chunks) => (
              // Reported during ESLint upgrade
              // eslint-disable-next-line react/jsx-no-target-blank
              <a target='_blank' href={learnMoreLinkUrl}>
                {chunks}
              </a>
            ),
          }}
        />
      </span>
    );
  };
  // BEGIN-EDGE
  static getLearnMoreLinkUrl() {
    const cloudProvider = DatabricksUtils.getCloudProvider();
    return cloudProvider ? DatabricksRegisterAModelDocUrl[cloudProvider] : RegisteringModelDocUrl;
  }
  // END-EDGE
  static oss_getLearnMoreLinkUrl = () => RegisteringModelDocUrl;

  render() {
    const { modelVersions, activeStageOnly } = this.props;
    const versions = activeStageOnly
      ? modelVersions.filter((v) => ACTIVE_STAGES.includes(v.current_stage))
      : modelVersions;
    return (
      <Table
        size='middle'
        rowKey={this.getRowKey}
        className='model-version-table'
        dataSource={versions}
        columns={this.getColumns()}
        locale={{ emptyText: this.emptyTablePlaceholder() }}
        rowSelection={{
          onChange: this.props.onChange,
          getCheckboxProps: (record) => ({
            disabled: record.status !== ModelVersionStatus.READY,
          }),
        }}
        pagination={{
          position: ['bottomRight'],
          size: 'default',
        }}
      />
    );
  }
}

export const ModelVersionTable = injectIntl(ModelVersionTableImpl);
