import _ from 'lodash';
import React from 'react';
import { Link } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { PropTypes } from 'prop-types';
import { Table, Descriptions } from 'antd';
import { Modal, Button } from '@databricks/design-system';
import { Tabs, Tag, WithDesignSystemThemeHoc } from '@databricks/design-system';
import Utils from '../../common/utils/Utils';
import PermissionUtils from '../utils/PermissionUtils';
import LinkUtils from '../utils/LinkUtils';
import { CollapsibleSection } from '../../common/components/CollapsibleSection';
import { FeatureStoreRoutes, getOnlineStorePageRoute } from '../routes';
import { EditableNote } from '../../common/components/EditableNote';
import { getOnlineStoreKey } from '../reducers';
import { HeaderButton, OverflowMenu, PageHeader } from '../../shared/building_blocks/PageHeader';
import { Spacer } from '../../shared/building_blocks/Spacer';
import IconUtils from '../utils/IconUtils';
import { FeatureTableProducers } from './FeatureTableProducers';
import { FeatureTableFeatures } from './FeatureTableFeatures';
import { FeatureTableProfilePane } from './FeatureTableProfilePane';
import FeatureTableUtils from '../utils/FeatureTableUtils';
import DatabricksUtils from '../../common/utils/DatabricksUtils';
import { EditableTagsTableView } from '../../common/components/EditableTagsTableView';
import TableUtils from '../utils/TableUtils';
import { MAX_DATA_SOURCES_TABLE_DETAILED_PAGE } from '../constants';
import OnlineStoreUtils from '../utils/OnlineStoreUtils';

const { TabPane } = Tabs;

const FEATURE_TABLE_PANES = Object.freeze({
  DETAILS: 'details',
  DATA_PROFILES: 'data_profiles',
});

class FeatureTableViewImpl extends React.Component {
  static propTypes = {
    history: PropTypes.shape({}).isRequired,
    featureTable: PropTypes.shape({}).isRequired,
    features: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    notebookConsumers: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    jobConsumers: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    notebookProducers: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    jobProducers: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    pipelineProducers: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    modelVersionsByFeature: PropTypes.shape({}).isRequired,
    featureTableTags: PropTypes.shape({}).isRequired,
    handleEditDescription: PropTypes.func.isRequired,
    handleDeleteFeatureTable: PropTypes.func.isRequired,
    showEditPermissionModal: PropTypes.func.isRequired,
    handleSetFeatureTableTags: PropTypes.func.isRequired,
    handleDeleteFeatureTableTags: PropTypes.func.isRequired,
    designSystemThemeApi: PropTypes.any.isRequired,
  };

  state = {
    showDescriptionEditor: false,
    isFeatureTableDeletionModalVisible: false,
    isFeatureTableDeletionModalConfirmLoading: false,
    isSetTagsForFeatureTableRequestPending: false,
  };

  formRef = React.createRef();

  handleCancelEditDescription = () => {
    this.setState({ showDescriptionEditor: false });
  };

  handleSubmitEditDescription = (description) => {
    return this.props.handleEditDescription(description).then(() => {
      this.setState({ showDescriptionEditor: false });
    });
  };

  showFeatureTableDeletionModal = () => {
    this.setState({ isFeatureTableDeletionModalVisible: true });
  };

  hideFeatureTableDeletionModal = () => {
    this.setState({ isFeatureTableDeletionModalVisible: false });
  };

  showFeatureTableDeletionConfirmLoading = () => {
    this.setState({ isFeatureTableDeletionModalConfirmLoading: true });
  };

  hideFeatureTableDeletionConfirmLoading = () => {
    this.setState({ isFeatureTableDeletionModalConfirmLoading: false });
  };

  handleConfirmDeleteFeatureTable = () => {
    const { history } = this.props;
    this.showFeatureTableDeletionConfirmLoading();
    this.props
      .handleDeleteFeatureTable() // Reported during ESLint upgrade
      // eslint-disable-next-line react/prop-types
      .then(() => history.push(FeatureStoreRoutes.BASE))
      .catch((e) => {
        this.hideFeatureTableDeletionConfirmLoading();
        Utils.logErrorAndNotifyUser(e);
      });
  };

  startEditingDescription = (e) => {
    e.stopPropagation();
    this.setState({ showDescriptionEditor: true });
  };

  handleAddFeatureTableTag = (values) => {
    const form = this.formRef.current;
    this.setState({ isSetTagsForFeatureTableRequestPending: true });
    this.props
      .handleSetFeatureTableTags([{ key: values.name, value: values.value }])
      .then(() => {
        this.setState({ isSetTagsForFeatureTableRequestPending: false });
        form.resetFields();
      })
      .catch((ex) => {
        this.setState({ isSetTagsForFeatureTableRequestPending: false });
        Utils.logErrorAndNotifyUser('Failed to add tag. Error: ' + ex.getUserVisibleError());
      });
  };

  handleSaveEditFeatureTableTag = ({ name, value }) => {
    return this.props.handleSetFeatureTableTags([{ key: name, value: value }]).catch((ex) => {
      Utils.logErrorAndNotifyUser('Failed to set tag. Error: ' + ex.getUserVisibleError());
    });
  };

  handleDeleteFeatureTableTag = ({ name }) => {
    return this.props.handleDeleteFeatureTableTags([name]).catch((ex) => {
      Utils.logErrorAndNotifyUser('Failed to delete tag. Error: ' + ex.getUserVisibleError());
    });
  };

  renderFeatureTableDeletionModal() {
    const { featureTable } = this.props;
    const { isFeatureTableDeletionModalVisible, isFeatureTableDeletionModalConfirmLoading } =
      this.state;
    return (
      // Reported during ESLint upgrade
      // eslint-disable-next-line react/prop-types
      PermissionUtils.hasManagePermission(featureTable.permission_level) && (
        <Modal
          title={
            <FormattedMessage
              defaultMessage='Delete Feature Table'
              description={'Text for the feature table deletion modal title.'}
            />
          }
          visible={isFeatureTableDeletionModalVisible}
          confirmLoading={isFeatureTableDeletionModalConfirmLoading}
          onOk={this.handleConfirmDeleteFeatureTable}
          okText={
            <FormattedMessage
              defaultMessage='Delete'
              description={
                'Text on the feature table deletion modal to confirm deletion of the feature table.'
              }
            />
          }
          cancelText={
            <FormattedMessage
              defaultMessage='Cancel'
              description={
                'Text on the feature table deletion modal to cancel deletion of the feature table.'
              }
            />
          }
          okType={'danger'}
          onCancel={this.hideFeatureTableDeletionModal}
          data-test-id='feature-table-deletion-modal'
        >
          <Spacer direction='vertical' size='medium'>
            <div>
              <FormattedMessage
                defaultMessage={'Are you sure you want to delete {name}? This cannot be undone.'}
                description={
                  // eslint-disable-next-line max-len
                  'Text on the feature table deletion modal describing consequences of this operation.'
                }
                // Reported during ESLint upgrade
                // eslint-disable-next-line react/prop-types
                values={{ name: featureTable.name }}
              />
            </div>
            <div>
              {IconUtils.getWarningIcon()}{' '}
              <FormattedMessage
                css={styles.deletionModalText}
                defaultMessage={
                  // eslint-disable-next-line max-len
                  'Deleting a feature table can lead to unexpected failures in upstream producers and downstream consumers (models, endpoints, and scheduled jobs).'
                }
                description={
                  // eslint-disable-next-line max-len
                  'Text on the feature table deletion modal describing consequences of this operation.'
                }
              />
            </div>
            <div>
              {IconUtils.getWarningIcon()}{' '}
              <FormattedMessage
                css={styles.deletionModalText}
                defaultMessage={
                  // eslint-disable-next-line max-len
                  'You must delete the published online tables and the underlying Delta table separately. <link>Learn More</link>'
                }
                description={
                  // eslint-disable-next-line max-len
                  'Text on the feature table deletion modal describing consequences of this operation.'
                }
                values={{
                  link: (chunks) => (
                    <a
                      href={LinkUtils.getDeleteTableLearnMoreLinkUrl()}
                      target='_blank'
                      rel='noopener noreferrer'
                    >
                      {chunks}
                    </a>
                  ),
                }}
              />
            </div>
          </Spacer>
        </Modal>
      )
    );
  }

  getStoreColumns(hasDynamoDbOnlineStore) {
    return [
      {
        title: (
          <FormattedMessage
            defaultMessage={'Online Store'}
            description={'Title text for the online store name column.'}
          />
        ),
        dataIndex: 'name',
        sorter: true,
        width: '30%',
        render: (name, store) => {
          const { featureTable } = this.props;
          return (
            <div css={styles.tableCellTextWrapper} data-test-id='online-store-name'>
              <Link
                // Reported during ESLint upgrade
                // eslint-disable-next-line react/prop-types, max-len
                to={getOnlineStorePageRoute(
                  // Reported during ESLint upgrade
                  // eslint-disable-next-line react/prop-types
                  featureTable.name,
                  name,
                  store.cloud,
                  store.store_type,
                  store.dynamodb_metadata && encodeURIComponent(store.dynamodb_metadata.table_arn),
                  store.cosmosdb_metadata &&
                    encodeURIComponent(store.cosmosdb_metadata.container_uri),
                )}
              >
                {name}
              </Link>
            </div>
          );
        },
      },
      ...(hasDynamoDbOnlineStore
        ? [
            {
              title: (
                <FormattedMessage
                  defaultMessage={'Region'}
                  description={'Title text for the online store region column.'}
                />
              ),
              sorter: (a, b) =>
                OnlineStoreUtils.getDynamoDbRegion(a).localeCompare(
                  OnlineStoreUtils.getDynamoDbRegion(b),
                ),
              key: 'region',
              width: '10%',
              render: (onlineStore) => {
                return (
                  <div css={styles.tableCellTextWrapper} data-test-id='online-store-region'>
                    {OnlineStoreUtils.getDynamoDbRegion(onlineStore)}
                  </div>
                );
              },
            },
          ]
        : []),
      {
        title: (
          <FormattedMessage
            defaultMessage={'Cloud'}
            description={'Title text for the online store cloud column.'}
          />
        ),
        dataIndex: 'cloud',
        sorter: true,
        width: hasDynamoDbOnlineStore ? '10%' : '15%',
        render: (cloud) => {
          return (
            <div css={styles.tableCellTextWrapper} data-test-id='online-store-cloud'>
              {cloud}
            </div>
          );
        },
      },
      {
        title: (
          <FormattedMessage
            defaultMessage={'Storage'}
            description={'Title text for the online store storage column.'}
          />
        ),
        dataIndex: 'store_type',
        sorter: true,
        width: hasDynamoDbOnlineStore ? '10%' : '15%',
        render: (storage) => {
          return (
            <div css={styles.tableCellTextWrapper} data-test-id='online-store-storage'>
              {storage}
            </div>
          );
        },
      },
      {
        title: (
          <FormattedMessage
            defaultMessage={'Last published'}
            description={'Title text for the online store last published column.'}
          />
        ),
        dataIndex: 'last_updated_timestamp',
        sorter: true,
        width: '20%',
        render: (lastPublishedTimestamp) => {
          return (
            <div
              css={styles.tableCellTextWrapper}
              data-test-id='online-store-last-published-timestamp'
            >
              {Utils.formatTimestamp(lastPublishedTimestamp)}
            </div>
          );
        },
      },
      {
        title: (
          <FormattedMessage
            defaultMessage={'Last published by'}
            description={'Title text for the online store last published by column.'}
          />
        ),
        dataIndex: 'last_update_user_id',
        sorter: true,
        width: '20%',
        render: (lastUpdatedUserId) => {
          return (
            <div
              css={styles.tableCellTextWrapper}
              data-test-id='online-store-last-published-user-id'
            >
              {lastUpdatedUserId}
            </div>
          );
        },
      },
    ];
  }

  render() {
    const {
      featureTable,
      features,
      jobProducers,
      notebookProducers,
      pipelineProducers,
      jobConsumers,
      notebookConsumers,
      modelVersionsByFeature,
      featureTableTags,
      showEditPermissionModal,
    } = this.props;
    const { showDescriptionEditor, isSetTagsForFeatureTableRequestPending } = this.state;
    // Reported during ESLint upgrade
    // eslint-disable-next-line react/prop-types
    const onlineStores = featureTable.online_stores || [];
    const hasDynamoDbOnlineStore = onlineStores.some(
      (onlineStore) => OnlineStoreUtils.getDynamoDbRegion(onlineStore) !== '-',
    );
    // Reported during ESLint upgrade
    // eslint-disable-next-line react/prop-types
    const dataSources = featureTable.data_sources || [];
    // Reported during ESLint upgrade
    // eslint-disable-next-line react/prop-types
    const primaryKeys = featureTable.primary_keys || [];
    // Reported during ESLint upgrade
    // eslint-disable-next-line react/prop-types
    const partitionKeys = featureTable.partition_keys || [];
    // Reported during ESLint upgrade
    // eslint-disable-next-line react/prop-types
    const timestampKeys = featureTable.timestamp_keys || [];
    const latestProducer = FeatureTableUtils.getLatestWrittenProducer(featureTable);

    const breadcrumbs = [
      <FormattedMessage
        defaultMessage={'<link>Feature Store</link>'}
        description={
          'Text link on the breadcrumbs section that links to the feature store home page.'
        }
        values={{ link: (chunks) => <Link to={FeatureStoreRoutes.BASE}>{chunks}</Link> }}
      />,
      // Reported during ESLint upgrade
      // eslint-disable-next-line react/prop-types
      featureTable.name,
    ];

    const userHasManagePermissions = PermissionUtils.hasManagePermission(
      // Reported during ESLint upgrade
      // eslint-disable-next-line react/prop-types
      featureTable.permission_level,
    );

    // Enrich keys with data type
    const addTypeInfoToKeys = (keys) => {
      const keyFeatures = features.filter((feature) => keys.includes(feature.name));
      return keyFeatures.map((feature) => feature.name + ' (' + feature.data_type + ') ');
    };

    // Remove keys from features
    const keys = primaryKeys + partitionKeys + timestampKeys;
    const featuresWithoutKeys = features.filter((feature) => !keys.includes(feature.name));

    return (
      <>
        <PageHeader
          // Reported during ESLint upgrade
          // eslint-disable-next-line react/prop-types
          title={featureTable.name}
          breadcrumbs={breadcrumbs}
          feedbackForm={'https://databricks.sjc1.qualtrics.com/jfe/form/SV_cux5mX6egOMfJ8G'}
        >
          <OverflowMenu
            menu={_.compact([
              userHasManagePermissions && {
                id: 'deletion-dropdown',
                onClick: this.showFeatureTableDeletionModal,
                itemName: 'Delete',
              },
            ])}
          />
          {userHasManagePermissions && DatabricksUtils.isAclCheckEnabledForWorkspace() && (
            <HeaderButton onClick={showEditPermissionModal} data-test-id='permissions-button'>
              <FormattedMessage
                defaultMessage={'Permissions'}
                description={'Text for the permissions button.'}
              />
            </HeaderButton>
          )}
        </PageHeader>
        <div
          css={{
            ...styles.container,
            marginBottom: 24,
          }}
        >
          <div css={styles.metadataCol}>
            <Descriptions column={{ md: 4, xs: 1 }}>
              <Descriptions.Item
                label={
                  // Reported during ESLint upgrade
                  // eslint-disable-next-line react/prop-types
                  featureTable.is_imported ? (
                    <FormattedMessage
                      defaultMessage={'Imported'}
                      description={'Title text for the feature table imported metadata field.'}
                    />
                  ) : (
                    <FormattedMessage
                      defaultMessage={'Created'}
                      description={'Title text for the feature table created metadata field.'}
                    />
                  )
                }
                css={styles.descriptionItemWrapper}
              >
                {/* Reported during ESLint upgrade */}
                {/* eslint-disable-next-line react/prop-types */}
                {Utils.formatTimestamp(featureTable.creation_timestamp)}
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <span>
                    {TableUtils.renderTitleWithIcon(
                      <FormattedMessage
                        defaultMessage={'Last written'}
                        description={
                          'Title text for the feature table last written metadata field.'
                        }
                      />,
                      <FormattedMessage
                        defaultMessage={'Last time a producer wrote to this feature table.'}
                        description={
                          // eslint-disable-next-line max-len
                          'Text on the tooltip describing the definition of last written timestamp field.'
                        }
                      />,
                    )}
                  </span>
                }
                css={styles.descriptionItemWrapper}
              >
                <span>
                  {!!latestProducer && Utils.formatTimestamp(latestProducer.creation_timestamp)}
                </span>
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <span>
                    {TableUtils.renderTitleWithIcon(
                      <FormattedMessage
                        defaultMessage={'Last modified'}
                        description={
                          'Title text for the feature table last modified metadata field.'
                        }
                      />,
                      <FormattedMessage
                        defaultMessage={'Last time the metadata of this feature table was updated.'}
                        description={
                          // eslint-disable-next-line max-len
                          'Text on the tooltip describing the definition of last modified timestamp field.'
                        }
                      />,
                    )}
                  </span>
                }
                css={styles.descriptionItemWrapper}
              >
                {/* Reported during ESLint upgrade */}
                {/* eslint-disable-next-line react/prop-types */}
                {Utils.formatTimestamp(featureTable.last_updated_timestamp)}
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <FormattedMessage
                    defaultMessage={'Primary Keys'}
                    description={'Title text for the feature table primary keys metadata field.'}
                  />
                }
                css={styles.descriptionItemWrapper}
              >
                <div>{addTypeInfoToKeys(primaryKeys).join(', ')}</div>
              </Descriptions.Item>
              <Descriptions.Item
                // Reported during ESLint upgrade
                // eslint-disable-next-line react/prop-types
                label={
                  // Reported during ESLint upgrade
                  // eslint-disable-next-line react/prop-types
                  featureTable.is_imported ? (
                    <FormattedMessage
                      defaultMessage={'Imported by'}
                      description={'Title text for the feature table imported metadata field.'}
                    />
                  ) : (
                    <FormattedMessage
                      defaultMessage={'Created by'}
                      description={'Title text for the feature table created metadata field.'}
                    />
                  )
                }
                css={styles.descriptionItemWrapper}
              >
                {/* Reported during ESLint upgrade */}
                {/* eslint-disable-next-line react/prop-types */}
                {featureTable.creator_id}
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <FormattedMessage
                    defaultMessage={'Last written by'}
                    description={'Title text for the feature table last written by metadata field.'}
                  />
                }
                css={styles.descriptionItemWrapper}
              >
                <span>{!!latestProducer && latestProducer.creator_id}</span>
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <FormattedMessage
                    defaultMessage={'Last modified by'}
                    description={
                      'Title text for the feature table last modified by metadata field.'
                    }
                  />
                }
                css={styles.descriptionItemWrapper}
              >
                {/* Reported during ESLint upgrade */}
                {/* eslint-disable-next-line react/prop-types */}
                {featureTable.last_update_user_id}
              </Descriptions.Item>
              {
                // Only display one of timestampKeys and partitionKeys
                timestampKeys.length === 0 ? (
                  <Descriptions.Item
                    label={
                      <FormattedMessage
                        defaultMessage={'Partition Keys'}
                        description={
                          'Title text for the feature table partition keys metadata field.'
                        }
                      />
                    }
                    css={styles.descriptionItemWrapper}
                  >
                    <div>{addTypeInfoToKeys(partitionKeys).join(', ')}</div>
                  </Descriptions.Item>
                ) : (
                  <Descriptions.Item
                    label={
                      <FormattedMessage
                        defaultMessage={'Timestamp Keys'}
                        description={
                          'Title text for the feature table timestamp keys metadata field.'
                        }
                      />
                    }
                    css={styles.descriptionItemWrapper}
                  >
                    <div>{addTypeInfoToKeys(timestampKeys).join(',')}</div>
                  </Descriptions.Item>
                )
              }
              <Descriptions.Item
                label={
                  <FormattedMessage
                    defaultMessage={'Data Sources'}
                    description={'Title text for the feature table data sources metadata field.'}
                  />
                }
                css={styles.descriptionItemWrapper}
                span={4}
              >
                <div>
                  {TableUtils.renderDataSources(dataSources, MAX_DATA_SOURCES_TABLE_DETAILED_PAGE)}
                </div>
              </Descriptions.Item>
            </Descriptions>
          </div>
        </div>
        <Tabs defaultActiveKey={FEATURE_TABLE_PANES.DETAILS} destroyInactiveTabPane>
          <TabPane
            tab={
              <FormattedMessage
                defaultMessage='Details'
                description='Tab pane name for feature table details'
              />
            }
            key={FEATURE_TABLE_PANES.DETAILS}
          >
            <Spacer size={3} direction='vertical'>
              <CollapsibleSection
                title={
                  <Spacer size='small' direction='horizontal'>
                    <span>
                      <FormattedMessage
                        defaultMessage={'Description'}
                        description={'Title text for the feature table description section field.'}
                      />
                    </span>
                    {!showDescriptionEditor &&
                      // Reported during ESLint upgrade
                      // eslint-disable-next-line react/prop-types
                      PermissionUtils.hasEditPermission(featureTable.permission_level) && (
                        <Button
                          data-test-id='edit-icon-button'
                          type='link'
                          onClick={this.startEditingDescription}
                        >
                          <FormattedMessage
                            defaultMessage='Edit'
                            description={
                              // eslint-disable-next-line max-len
                              'Text for the edit button next to the description section title on the feautre table view page.'
                            }
                          />
                        </Button>
                      )}
                  </Spacer>
                }
                forceOpen={showDescriptionEditor}
                data-test-id='feature-table-description-section'
              >
                <EditableNote
                  // Reported during ESLint upgrade
                  // eslint-disable-next-line react/prop-types
                  defaultMarkdown={featureTable.description}
                  onSubmit={this.handleSubmitEditDescription}
                  onCancel={this.handleCancelEditDescription}
                  showEditor={showDescriptionEditor}
                />
              </CollapsibleSection>
              <CollapsibleSection
                title={
                  <span>
                    <FormattedMessage
                      defaultMessage={'Tags ({length})'}
                      description={'Title text for the feature table tags section.'}
                      values={{ length: Object.values(featureTableTags).length }}
                    />
                  </span>
                }
                data-test-id='feature-table-tags-section'
              >
                <EditableTagsTableView
                  innerRef={this.formRef}
                  handleAddTag={this.handleAddFeatureTableTag}
                  handleDeleteTag={this.handleDeleteFeatureTableTag}
                  handleSaveEdit={this.handleSaveEditFeatureTableTag}
                  tags={featureTableTags}
                  isRequestPending={isSetTagsForFeatureTableRequestPending}
                />
              </CollapsibleSection>
              <CollapsibleSection
                title={
                  <span>
                    <FormattedMessage
                      defaultMessage={'Producers ({length})'}
                      description={'Title text for the feature table producers section.'}
                      values={{
                        length:
                          jobProducers.length + notebookProducers.length + pipelineProducers.length,
                      }}
                    />
                  </span>
                }
                data-test-id='feature-table-producers-section'
              >
                <FeatureTableProducers
                  jobProducers={jobProducers}
                  notebookProducers={notebookProducers}
                  pipelineProducers={pipelineProducers}
                />
              </CollapsibleSection>
              <CollapsibleSection
                title={
                  <span>
                    <FormattedMessage
                      defaultMessage={'Online Stores ({length})'}
                      description={'Title text for the feature table online stores section.'}
                      values={{ length: onlineStores.length }}
                    />
                  </span>
                }
                data-test-id='feature-table-online-stores-section'
              >
                <Table
                  columns={this.getStoreColumns(hasDynamoDbOnlineStore)}
                  dataSource={onlineStores}
                  rowKey={(onlineStore) =>
                    getOnlineStoreKey(
                      // Reported during ESLint upgrade
                      // eslint-disable-next-line react/prop-types
                      featureTable.name,
                      onlineStore.name,
                      onlineStore.cloud,
                      onlineStore.store_type,
                      onlineStore?.dynamodb_metadata?.table_arn,
                      onlineStore?.cosmosdb_metadata?.container_uri,
                    )
                  }
                  locale={{
                    emptyText: (
                      <FormattedMessage
                        defaultMessage={'No online stores found.'}
                        description={
                          'Text describing no online stores exists for the feature table.'
                        }
                      />
                    ),
                  }}
                  size='middle'
                  pagination={{ hideOnSinglePage: true, size: 'default' }}
                  showSorterTooltip={false}
                />
              </CollapsibleSection>
              <CollapsibleSection
                title={
                  <span>
                    <FormattedMessage
                      defaultMessage={'Features ({length})'}
                      description={'Title text for the feature table features section.'}
                      values={{
                        length: featuresWithoutKeys.length,
                      }}
                    />
                  </span>
                }
                data-test-id='feature-table-features-section'
              >
                <FeatureTableFeatures
                  features={featuresWithoutKeys}
                  notebookConsumers={notebookConsumers}
                  jobConsumers={jobConsumers}
                  modelVersionsByFeature={modelVersionsByFeature}
                />
              </CollapsibleSection>
            </Spacer>
          </TabPane>
          {DatabricksUtils.getConf('enableFeatureProfiling') && (
            <TabPane
              tab={
                <>
                  <FormattedMessage
                    defaultMessage='Data profiles'
                    description='Tab pane name for feature table data profiles'
                  />{' '}
                  <Tag color='charcoal'>
                    <FormattedMessage
                      defaultMessage='New'
                      description='New tag label for data profile in feature store table view'
                    />
                  </Tag>
                </>
              }
              key={FEATURE_TABLE_PANES.DATA_PROFILES}
            >
              <FeatureTableProfilePane featureTable={featureTable} />
            </TabPane>
          )}
        </Tabs>
        {this.renderFeatureTableDeletionModal()}
      </>
    );
  }
}

const styles = {
  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  metadataCol: {
    flex: '3 3 480px',
  },
  descriptionItemWrapper: {
    verticalAlign: 'top',
    'span.ant-descriptions-item-label, span.ant-descriptions-item-content': {
      verticalAlign: 'top',
    },
    overflowWrap: 'anywhere',
  },
  deletionModalText: {
    padding: '0px 8px',
  },
  tableCellTextWrapper: {
    overflowWrap: 'anywhere',
  },
};

export const FeatureTableView = WithDesignSystemThemeHoc(FeatureTableViewImpl);
