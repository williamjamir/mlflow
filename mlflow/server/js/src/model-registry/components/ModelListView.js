import React from 'react';
import PropTypes from 'prop-types';
import { Table, Alert } from 'antd';
import { Link } from 'react-router-dom';
import './ModelListView.css';
import { getModelPageRoute, getModelVersionPageRoute } from '../routes';
import Utils from '../../common/utils/Utils';
import {
  AntdTableSortOrder,
  Stages,
  StageTagComponents,
  EMPTY_CELL_PLACEHOLDER,
  REGISTERED_MODELS_PER_PAGE,
  REGISTERED_MODELS_SEARCH_NAME_FIELD,
  REGISTERED_MODELS_SEARCH_TIMESTAMP_FIELD,
  // BEGIN-EDGE
  REGISTERED_MODELS_SEARCH_SERVING_FIELD,
  // END-EDGE
} from '../constants';
import {
  ExperimentSearchSyntaxDocUrl,
  ModelRegistryDocUrl,
  ModelRegistryOnboardingString,
  onboarding,
} from '../../common/constants';
// BEGIN-EDGE
import DatabricksUtils from '../../common/utils/DatabricksUtils';
import PermissionUtils from '../utils/PermissionUtils';
import {
  DatabricksModelRegistryDocUrl,
  DatabricksModelRegistryOnboardingString,
} from '../../common/constants-databricks';
import { getServingModelKey, getModelServingDocsUri } from '../../model-serving/utils';
import { getModelPageServingRoute, getModelPageMonitoringRoute } from '../routes';
// END-EDGE
import { SimplePagination } from '../../common/components/SimplePagination';
import { Spinner } from '../../common/components/Spinner';
import { CreateModelButton } from './CreateModelButton';
import LocalStorageUtils from '../../common/utils/LocalStorageUtils';
import { CollapsibleTagsCell } from '../../common/components/CollapsibleTagsCell';
import { RegisteredModelTag } from '../sdk/ModelRegistryMessages';
import { PageHeader } from '../../shared/building_blocks/PageHeader';
// BEGIN-EDGE
import { HeaderButton } from '../../shared/building_blocks/PageHeader';
// END-EDGE
import { FlexBar } from '../../shared/building_blocks/FlexBar';
import { Spacer } from '../../shared/building_blocks/Spacer';
import { SearchBox } from '../../shared/building_blocks/SearchBox';
import { FormattedMessage, injectIntl } from 'react-intl';
import { PageContainer } from '../../common/components/PageContainer';
import { Button, Popover, QuestionMarkFillIcon } from '@databricks/design-system';
// BEGIN-EDGE
import { CircleIcon } from '../utils';
import { OwnerFilter, StatusFilter } from '../utils/SearchUtils';
import {
  SegmentedControlGroup,
  SegmentedControlButton,
  Select,
  Option,
} from '@databricks/design-system';
import { getActiveModelMonitoringTags, getMonitoringDocsUrl } from '../../model-monitoring/utils';
// END-EDGE

const NAME_COLUMN_INDEX = 'name';
const LAST_MODIFIED_COLUMN_INDEX = 'last_updated_timestamp';
// BEGIN-EDGE
const SERVING_COLUMN_INDEX = 'serving';
// END-EDGE

const getOverallLatestVersionNumber = (latest_versions) =>
  latest_versions && Math.max(...latest_versions.map((v) => v.version));

const getLatestVersionNumberByStage = (latest_versions, stage) => {
  const modelVersion = latest_versions && latest_versions.find((v) => v.current_stage === stage);
  return modelVersion && modelVersion.version;
};

export class ModelListViewImpl extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      lastNavigationActionWasClickPrev: false,
      maxResultsSelection: REGISTERED_MODELS_PER_PAGE,
      showOnboardingHelper: this.showOnboardingHelper(),
    };
  }

  static propTypes = {
    models: PropTypes.array.isRequired,
    // BEGIN-EDGE
    endpoints: PropTypes.object,
    showEditPermissionModal: PropTypes.func.isRequired,
    permissionLevel: PropTypes.string.isRequired,
    selectedOwnerFilter: PropTypes.string.isRequired,
    selectedStatusFilter: PropTypes.string.isRequired,
    onOwnerFilterChange: PropTypes.func.isRequired,
    onStatusFilterChange: PropTypes.func.isRequired,
    // END-EDGE
    searchInput: PropTypes.string.isRequired,
    orderByKey: PropTypes.string.isRequired,
    orderByAsc: PropTypes.bool.isRequired,
    currentPage: PropTypes.number.isRequired,
    // To know if there is a next page. If null, there is no next page. If undefined, we haven't
    // gotten an answer from the backend yet.
    nextPageToken: PropTypes.string,
    loading: PropTypes.bool,
    onSearch: PropTypes.func.isRequired,
    onSearchInputChange: PropTypes.func.isRequired,
    onClear: PropTypes.func.isRequired,
    onClickNext: PropTypes.func.isRequired,
    onClickPrev: PropTypes.func.isRequired,
    onClickSortableColumn: PropTypes.func.isRequired,
    onSetMaxResult: PropTypes.func.isRequired,
    getMaxResultValue: PropTypes.func.isRequired,
    intl: PropTypes.any,
  };

  static defaultProps = {
    models: [],
    searchInput: '',
    // BEGIN-EDGE
    endpoints: {},
    // END-EDGE`
  };

  showOnboardingHelper() {
    const onboardingInformationStore = ModelListViewImpl.getLocalStore(onboarding);
    return onboardingInformationStore.getItem('showRegistryHelper') === null;
  }

  disableOnboardingHelper() {
    const onboardingInformationStore = ModelListViewImpl.getLocalStore(onboarding);
    onboardingInformationStore.setItem('showRegistryHelper', 'false');
  }

  /**
   * Returns a LocalStorageStore instance that can be used to persist data associated with the
   * ModelRegistry component.
   */
  static getLocalStore(key) {
    return LocalStorageUtils.getStoreForComponent('ModelListView', key);
  }

  componentDidMount() {
    const pageTitle = 'MLflow Models';
    Utils.updatePageTitle(pageTitle);
  }

  renderModelVersionLink(name, versionNumber) {
    return (
      <FormattedMessage
        defaultMessage='<link>Version {versionNumber}</link>'
        description='Row entry for version columns in the registered model page'
        values={{
          versionNumber: versionNumber,
          link: (chunks) => (
            <Link to={getModelVersionPageRoute(name, versionNumber)}>{chunks}</Link>
          ),
        }}
      />
    );
  }

  // BEGIN-EDGE
  shouldSkipPermissions() {
    const { permissionLevel } = this.props;
    return (
      !DatabricksUtils.isAclCheckEnabledForModelRegistry() ||
      !DatabricksUtils.isRegistryWidePermissionsEnabledForModelRegistry() ||
      !PermissionUtils.permissionLevelCanManage(permissionLevel)
    );
  }

  // END-EDGE
  getSortOrder = (key) => {
    const { orderByKey, orderByAsc } = this.props;
    if (key !== orderByKey) {
      return null;
    }
    return { sortOrder: orderByAsc ? AntdTableSortOrder.ASC : AntdTableSortOrder.DESC };
  };

  handleCellToggle = () => {
    this.forceUpdate();
  };

  getColumns = () => {
    const columns = [
      {
        title: this.props.intl.formatMessage({
          defaultMessage: 'Name',
          description: 'Column title for model name in the registered model page',
        }),
        className: 'model-name',
        dataIndex: NAME_COLUMN_INDEX,
        render: (text, row) => {
          return <Link to={getModelPageRoute(row.name)}>{text}</Link>;
        },
        sorter: true,
        ...this.getSortOrder(REGISTERED_MODELS_SEARCH_NAME_FIELD),
      },
      {
        title: this.props.intl.formatMessage({
          defaultMessage: 'Latest Version',
          description: 'Column title for latest model version in the registered model page',
        }),
        className: 'latest-version',
        render: ({ name, latest_versions }) => {
          const versionNumber = getOverallLatestVersionNumber(latest_versions);
          return versionNumber
            ? this.renderModelVersionLink(name, versionNumber)
            : EMPTY_CELL_PLACEHOLDER;
        },
      },
      {
        title: StageTagComponents[Stages.STAGING],
        className: 'latest-staging',
        render: ({ name, latest_versions }) => {
          const versionNumber = getLatestVersionNumberByStage(latest_versions, Stages.STAGING);
          return versionNumber
            ? this.renderModelVersionLink(name, versionNumber)
            : EMPTY_CELL_PLACEHOLDER;
        },
      },
      {
        title: StageTagComponents[Stages.PRODUCTION],
        className: 'latest-production',
        render: ({ name, latest_versions }) => {
          const versionNumber = getLatestVersionNumberByStage(latest_versions, Stages.PRODUCTION);
          return versionNumber
            ? this.renderModelVersionLink(name, versionNumber)
            : EMPTY_CELL_PLACEHOLDER;
        },
      },
      {
        title: this.props.intl.formatMessage({
          defaultMessage: 'Last Modified',
          description:
            'Column title for last modified timestamp for a model in the registered model page',
        }),
        className: 'last-modified',
        dataIndex: LAST_MODIFIED_COLUMN_INDEX,
        render: (text, row) => <span>{Utils.formatTimestamp(row.last_updated_timestamp)}</span>,
        sorter: true,
        ...this.getSortOrder(REGISTERED_MODELS_SEARCH_TIMESTAMP_FIELD),
      },
      {
        title: this.props.intl.formatMessage({
          defaultMessage: 'Tags',
          description: 'Column title for model tags in the registered model page',
        }),
        className: 'table-tag-container',
        render: (row, index) => {
          return index.tags && index.tags.length > 0 ? (
            <div style={{ wordWrap: 'break-word', wordBreak: 'break-word' }}>
              <CollapsibleTagsCell
                tags={{ ...index.tags.map((tag) => RegisteredModelTag.fromJs(tag)) }}
                onToggle={this.handleCellToggle}
              />
            </div>
          ) : (
            EMPTY_CELL_PLACEHOLDER
          );
        },
      },
    ];
    // BEGIN-EDGE
    if (DatabricksUtils.isModelServingEnabled()) {
      columns.push({
        title: (
          <span>
            <FormattedMessage
              defaultMessage='Serving'
              description='Column title for model serving in the registered model page'
            />
            {this.renderServingTooltip()}
          </span>
        ),
        dataIndex: SERVING_COLUMN_INDEX,
        className: 'serving',
        render: (text, row) => {
          const modelName = row.name;
          const endpoint = this.props.endpoints[getServingModelKey(null, modelName)];
          return this.renderServingCell(modelName, endpoint);
        },
      });
    }

    if (DatabricksUtils.getConf('enableModelMonitoringPublicPreview', false)) {
      columns.push({
        title: (
          <span>
            <FormattedMessage
              defaultMessage='Monitors'
              description='Column title for model monitoring in the registered model page'
            />
            <Popover
              overlayClassName='serving-tooltip'
              content={
                <span className='serving-tooltip-content'>
                  <FormattedMessage
                    // eslint-disable-next-line max-len
                    defaultMessage='Monitor model features and performance (Public Preview). <link>Learn more.</link>'
                    description='Text for tooltip for model monitoring in the registered model page'
                    values={{
                      link: (chunks) => (
                        <a target='_blank' rel='noreferrer' href={getMonitoringDocsUrl()}>
                          {chunks}
                        </a>
                      ),
                    }}
                  />
                </span>
              }
              placement='bottomRight'
            >
              <QuestionMarkFillIcon css={styles.questionMark} />
            </Popover>
          </span>
        ),
        dataIndex: 'monitoring',
        className: 'monitoring',
        render: (text, row) => this.renderMonitoringCell(row),
      });
    }
    // END-EDGE
    return columns;
  };
  // BEGIN-EDGE
  renderServingTooltip = () => {
    const contents = (
      <span className='serving-tooltip-content'>
        <FormattedMessage
          defaultMessage='Hosted real-time model serving behind a REST API interface. <link>
            Learn more.</link>'
          description='Text for tooltip for model serving in the registered model page'
          values={{
            link: (chunks) => (
              // Reported during ESLint upgrade
              // eslint-disable-next-line react/jsx-no-target-blank
              <a target='_blank' href={getModelServingDocsUri()}>
                {chunks}
              </a>
            ),
          }}
        />
      </span>
    );
    return (
      <Popover overlayClassName='serving-tooltip' content={contents} placement='bottom'>
        <QuestionMarkFillIcon css={styles.questionMark} />
      </Popover>
    );
  };

  renderServingCell = (modelName, endpoint) => {
    return (
      <Link to={getModelPageServingRoute(modelName)}>{this.renderServingStatus(endpoint)}</Link>
    );
  };

  renderServingStatus = (endpoint) => {
    const iconReady = <CircleIcon type='READY' />;
    const iconPending = <CircleIcon type='PENDING' />;
    const iconFailed = <CircleIcon type='FAILED' />;

    if (endpoint === undefined) {
      return EMPTY_CELL_PLACEHOLDER;
    }
    if (endpoint.state === 'ENDPOINT_STATE_READY') {
      return <span>{iconReady} Ready</span>;
    } else if (endpoint.state === 'ENDPOINT_STATE_PENDING') {
      return <span>{iconPending} Pending</span>;
    } else if (endpoint.state === 'ENDPOINT_STATE_FAILED') {
      return <span>{iconFailed} Failed</span>;
    }
    return null;
  };

  renderMonitoringCell(model) {
    const { name, tags } = model;
    // TODO: use monitoring service as source of truth once it becomes available
    if (tags && tags.length > 0) {
      const numActiveMonitors = getActiveModelMonitoringTags(tags).length;
      if (numActiveMonitors > 0) {
        return <Link to={getModelPageMonitoringRoute(name)}>{numActiveMonitors}</Link>;
      }
    }
    return EMPTY_CELL_PLACEHOLDER;
  }
  // END-EDGE

  getRowKey = (record) => record.name;

  setLoadingFalse = () => {
    this.setState({ loading: false });
  };

  handleSearch = (event, searchInput) => {
    event.preventDefault();
    this.setState({ loading: true, lastNavigationActionWasClickPrev: false });
    this.props.onSearch(this.setLoadingFalse, this.setLoadingFalse, searchInput);
  };

  static getSortFieldName = (column) => {
    switch (column) {
      case NAME_COLUMN_INDEX:
        return REGISTERED_MODELS_SEARCH_NAME_FIELD;
      case LAST_MODIFIED_COLUMN_INDEX:
        return REGISTERED_MODELS_SEARCH_TIMESTAMP_FIELD;
      // BEGIN-EDGE
      case SERVING_COLUMN_INDEX:
        return REGISTERED_MODELS_SEARCH_SERVING_FIELD;
      // END-EDGE
      default:
        return null;
    }
  };

  handleTableChange = (pagination, filters, sorter) => {
    this.setState({ loading: true, lastNavigationActionWasClickPrev: false });
    this.props.onClickSortableColumn(
      ModelListViewImpl.getSortFieldName(sorter.field),
      sorter.order,
      this.setLoadingFalse,
      this.setLoadingFalse,
    );
  };

  renderOnboardingContent() {
    const learnMoreLinkUrl = ModelListViewImpl.getLearnMoreLinkUrl();
    const learnMoreDisplayString = ModelListViewImpl.getLearnMoreDisplayString();
    const content = (
      <div>
        {learnMoreDisplayString}{' '}
        <FormattedMessage
          defaultMessage='<link>Learn more</link>'
          description='Learn more link on the model list page with cloud-specific link'
          values={{
            link: (chunks) => (
              <a
                href={learnMoreLinkUrl}
                target='_blank'
                rel='noopener noreferrer'
                className='LinkColor'
              >
                {chunks}
              </a>
            ),
          }}
        />
      </div>
    );

    return this.state.showOnboardingHelper ? (
      <Alert
        css={styles.alert}
        message={content}
        type='info'
        showIcon
        closable
        onClose={() => this.disableOnboardingHelper()}
      />
    ) : null;
  }

  getEmptyTextComponent() {
    const { searchInput } = this.props;
    const { lastNavigationActionWasClickPrev } = this.state;
    // Handle the case when emptiness is caused by search filter
    if (searchInput) {
      if (lastNavigationActionWasClickPrev) {
        return (
          'No models found for the page. Please refresh the page as the underlying data may ' +
          'have changed significantly.'
        );
      } else {
        return 'No models found.';
      }
    }
    return (
      <div>
        <span>
          <FormattedMessage
            defaultMessage='No models yet. <link>Create a model</link> to get started.'
            description='Placeholder text for empty models table in the registered model list page'
            values={{
              link: (chunks) => <CreateModelButton buttonType='link' buttonText={chunks} />,
            }}
          />
        </span>
      </div>
    );
  }

  static oss_getLearnMoreLinkUrl = () => ModelRegistryDocUrl;
  // BEGIN-EDGE
  static getLearnMoreLinkUrl() {
    const cloudProvider = DatabricksUtils.getCloudProvider();
    return cloudProvider ? DatabricksModelRegistryDocUrl[cloudProvider] : ModelRegistryDocUrl;
  }
  // END-EDGE

  static oss_getLearnMoreDisplayString = () => ModelRegistryOnboardingString;
  // BEGIN-EDGE
  static getLearnMoreDisplayString() {
    const cloudProvider = DatabricksUtils.getCloudProvider();
    return cloudProvider
      ? DatabricksModelRegistryOnboardingString[cloudProvider]
      : ModelRegistryOnboardingString;
  }
  // END-EDGE

  handleClickNext = () => {
    this.setState({ loading: true, lastNavigationActionWasClickPrev: false });
    this.props.onClickNext(this.setLoadingFalse, this.setLoadingFalse);
  };

  handleClickPrev = () => {
    this.setState({ loading: true, lastNavigationActionWasClickPrev: true });
    this.props.onClickPrev(this.setLoadingFalse, this.setLoadingFalse);
  };

  handleSetMaxResult = ({ item, key, keyPath, domEvent }) => {
    this.setState({ loading: true });
    this.props.onSetMaxResult(key, this.setLoadingFalse, this.setLoadingFalse);
  };

  handleSearchInput = (event) => {
    this.props.onSearchInputChange(event.target.value);
  };

  handleClear = () => {
    this.props.onClear(this.setLoadingFalse, this.setLoadingFalse);
  };
  // BEGIN-EDGE
  handleOwnerRadioChange = (event) => {
    this.setState({ loading: true, lastNavigationActionWasClickPrev: false });
    this.props.onOwnerFilterChange(event.target.value, this.setLoadingFalse, this.setLoadingFalse);
  };

  handleStatusSelectionChange = (value) => {
    this.setState({ loading: true, lastNavigationActionWasClickPrev: false });
    this.props.onStatusFilterChange(value, this.setLoadingFalse, this.setLoadingFalse);
  };
  // END-EDGE

  searchInputHelpTooltipContent = () => {
    return (
      <div className='search-input-tooltip-content'>
        <FormattedMessage
          // eslint-disable-next-line max-len
          defaultMessage='To search by tags or by names and tags, please use <link>MLflow Search Syntax</link>.{newline}Examples:{examples}'
          description='Tooltip string to explain how to search models from the model registry table'
          values={{
            newline: <br />,
            link: (chunks) => (
              <a href={ExperimentSearchSyntaxDocUrl} target='_blank' rel='noopener noreferrer'>
                {chunks}
              </a>
            ),
            examples: (
              <ul>
                <li>tags.key = "value"</li>
                <li>name ilike "%my_model_name%" and tags.key = "value"</li>
              </ul>
            ),
          }}
        />
      </div>
    );
  };

  render() {
    const { models, currentPage, nextPageToken } = this.props;
    const { loading } = this.state;

    const title = (
      <FormattedMessage
        defaultMessage='Registered Models'
        description='Header for displaying models in the model registry'
      />
    );
    return (
      <PageContainer data-test-id='ModelListView-container'>
        <PageHeader title={title}>
          <></>
          {/* BEGIN-EDGE */}
          {!this.shouldSkipPermissions() && (
            <HeaderButton
              type='secondary'
              onClick={this.props.showEditPermissionModal}
              data-test-id='edit-permissions-button'
            >
              <FormattedMessage
                defaultMessage='Permissions'
                description='Title dropdown text for permissions in registered model page'
              />
            </HeaderButton>
          )}
          {/* END-EDGE */}
        </PageHeader>
        {this.renderOnboardingContent()}
        <div css={styles.searchFlexBar}>
          <FlexBar
            left={
              <Spacer size='small' direction='horizontal'>
                <CreateModelButton />
              </Spacer>
            }
            right={
              <Spacer direction='horizontal' size='small'>
                <Spacer direction='horizontal' size='large'>
                  {/* BEGIN-EDGE */}
                  <Select
                    onChange={this.handleStatusSelectionChange}
                    style={{
                      width: 180,
                    }}
                    value={this.props.selectedStatusFilter}
                  >
                    <Option value={StatusFilter.ALL}>
                      <FormattedMessage
                        defaultMessage='All models'
                        // eslint-disable-next-line max-len
                        description='Selection item text in model registry to filter models by all models'
                      />
                    </Option>
                    <Option value={StatusFilter.SERVING_ENABLED}>
                      <FormattedMessage
                        defaultMessage='Serving enabled'
                        // eslint-disable-next-line max-len
                        description='Selection item text in model registry to filter models by serving enabled'
                      />
                    </Option>
                  </Select>
                  <div style={{ gap: '24px' }}>
                    <SegmentedControlGroup
                      value={this.props.selectedOwnerFilter}
                      onChange={this.handleOwnerRadioChange}
                    >
                      <SegmentedControlButton value={OwnerFilter.OWNED_BY_ME}>
                        <FormattedMessage
                          defaultMessage='Owned by me'
                          // eslint-disable-next-line max-len
                          description='Radio item text in model registry to filter models by models owned by me.'
                        />
                      </SegmentedControlButton>
                      <SegmentedControlButton value={OwnerFilter.ACCESSIBLE_BY_ME}>
                        <FormattedMessage
                          defaultMessage='Accessible by me'
                          // eslint-disable-next-line max-len
                          description='Radio item text in model registry to filter models by models accessible by me.'
                        />
                      </SegmentedControlButton>
                    </SegmentedControlGroup>
                  </div>
                  {/* END-EDGE */}
                  <Popover
                    overlayClassName='search-input-tooltip'
                    content={this.searchInputHelpTooltipContent}
                    placement='bottom'
                  >
                    <QuestionMarkFillIcon />
                  </Popover>
                </Spacer>

                <Spacer direction='horizontal' size='large'>
                  <div css={styles.nameSearchBox}>
                    <SearchBox
                      onChange={this.handleSearchInput}
                      value={this.props.searchInput}
                      onSearch={this.handleSearch}
                      placeholder={this.props.intl.formatMessage({
                        defaultMessage: 'Search by model names or tags',
                        description: 'Placeholder text inside model search bar',
                      })}
                    />
                  </div>
                  <Button
                    data-test-id='clear-button'
                    onClick={this.handleClear}
                    disabled={this.props.searchInput === ''}
                  >
                    <FormattedMessage
                      defaultMessage='Clear'
                      // eslint-disable-next-line max-len
                      description='String for the clear button to clear the text for searching models'
                    />
                  </Button>
                </Spacer>
              </Spacer>
            }
          />
        </div>
        <Table
          size='middle'
          rowKey={this.getRowKey}
          className='model-version-table'
          dataSource={models}
          columns={this.getColumns()}
          locale={{ emptyText: this.getEmptyTextComponent() }}
          pagination={{
            hideOnSinglePage: true,
            pageSize: this.props.getMaxResultValue(),
          }}
          loading={loading && { indicator: <Spinner /> }}
          onChange={this.handleTableChange}
          showSorterTooltip={false}
        />
        <div>
          <SimplePagination
            currentPage={currentPage}
            isLastPage={nextPageToken === null}
            onClickNext={this.handleClickNext}
            onClickPrev={this.handleClickPrev}
            handleSetMaxResult={this.handleSetMaxResult}
            maxResultOptions={[String(REGISTERED_MODELS_PER_PAGE), '25', '50', '100']}
            getSelectedPerPageSelection={this.props.getMaxResultValue}
          />
        </div>
      </PageContainer>
    );
  }
}

export const ModelListView = injectIntl(ModelListViewImpl);

const styles = {
  nameSearchBox: {
    width: '446px',
  },
  searchFlexBar: {
    marginBottom: '24px',
  },
  // TODO: Convert this into Dubois Alert
  alert: {
    marginBottom: 16,
    padding: 16,
    background: '#edfafe' /* Gray-background */,
    border: '1px solid #eeeeee',
    boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.12)' /* Dropshadow */,
    borderRadius: 4,
  },
  questionMark: {
    marginLeft: 4,
    cursor: 'pointer',
    color: '#888',
  },
};
