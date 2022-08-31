import _ from 'lodash';
import React from 'react';
import { Link } from 'react-router-dom';
import { Table, Alert } from 'antd';
import { PropTypes } from 'prop-types';
import { SimplePagination } from '../../common/components/SimplePagination';
import { Spinner } from '../../common/components/Spinner';
import Utils from '../../common/utils/Utils';
import { getTableDetailPageRoute } from '../routes';
import { PageHeader, HeaderButton } from '../../shared/building_blocks/PageHeader';
import { SearchBox } from '../../shared/building_blocks/SearchBox';
import { FlexBar } from '../../shared/building_blocks/FlexBar';
import { Spacer } from '../../shared/building_blocks/Spacer';
import { onboarding } from '../../common/constants';
import LocalStorageUtils from '../../common/utils/LocalStorageUtils';
import { FormattedMessage, injectIntl } from 'react-intl';
import LinkUtils from '../utils/LinkUtils';
import TableUtils from '../utils/TableUtils';
import CronUtils from '../utils/CronUtils';
import PermissionUtils from '../utils/PermissionUtils';
import ExpandableList from '../../common/components/ExpandableList';
import DatabricksUtils from '../../common/utils/DatabricksUtils';
import { getFeatureTableKey } from '../reducers';
import FeatureTableUtils from '../utils/FeatureTableUtils';
import { MAX_DATA_SOURCES_TABLE_SEARCH_PAGE } from '../constants';

export function OnlineStores({ stores }) {
  if (!stores || stores.length === 0) {
    return null;
  }

  const counts = _.map(
    _.countBy(stores, (store) => store.store_type),
    (count, type) => `${type} (${count})`,
  );

  return (
    <>
      {counts.map((count, index) => (
        <React.Fragment key={index}>
          <span>{count}</span>
          {index < counts.length - 1 && <span>, </span>}
        </React.Fragment>
      ))}
    </>
  );
}

OnlineStores.propTypes = {
  stores: PropTypes.arrayOf(PropTypes.shape({ store_type: PropTypes.string })),
};

export class FeatureStoreViewImpl extends React.Component {
  static propTypes = {
    featureTables: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    scheduledJobsForFeatureTables: PropTypes.shape({}).isRequired,
    searchInput: PropTypes.string.isRequired,
    currentPage: PropTypes.number.isRequired,
    // To know if there is a next page. If null, there is no next page. If undefined, we haven't
    // gotten an answer from the backend yet.
    nextPageToken: PropTypes.string,
    showEditPermissionModal: PropTypes.func.isRequired,
    permissionLevel: PropTypes.string.isRequired,
    onSearch: PropTypes.func.isRequired,
    onSearchChange: PropTypes.func.isRequired,
    onClickNext: PropTypes.func.isRequired,
    onClickPrev: PropTypes.func.isRequired,
    onSetMaxResult: PropTypes.func.isRequired,
    getMaxResultValue: PropTypes.func.isRequired,
    isLoading: PropTypes.bool,
    intl: PropTypes.any,
  };

  static getEmptyTextComponent(searchInput) {
    // Handle the case when emptiness is caused by search filter
    if (searchInput) {
      return (
        <FormattedMessage
          defaultMessage='No feature tables found.'
          description={
            'Text on the table section describing no feature tables are found by search.'
          }
        />
      );
    }

    // Handle the case when emptiness is caused by no feature tables
    return (
      <div>
        <div>
          <FormattedMessage
            defaultMessage={'No feature tables yet.'}
            description={'Text on the table section describing no feature table exists yet.'}
          />
        </div>
        <div>
          <FormattedMessage
            defaultMessage={
              // eslint-disable-next-line max-len
              'Databricks Feature Store is a centralized repository that enables you to manage and share features.'
            }
            description={'Text on the table section describing the feature store product.'}
          />{' '}
          {LinkUtils.renderLearnMoreLink(LinkUtils.getLearnMoreLinkUrl())}
        </div>
      </div>
    );
  }

  shouldEnablePermissionsModal() {
    const { permissionLevel } = this.props;
    return (
      DatabricksUtils.isAclCheckEnabledForWorkspace() &&
      DatabricksUtils.getConf('enableFeatureStoreWidePermissions') &&
      PermissionUtils.hasManagePermission(permissionLevel)
    );
  }

  /**
   * Returns a LocalStorageStore instance that can be used to persist data associated with the
   * FeatureStore component.
   */
  static getLocalStore(key) {
    return LocalStorageUtils.getStoreForComponent('FeatureStoreView', key);
  }

  static showOnboardingHelper() {
    const onboardingInformationStore = FeatureStoreView.getLocalStore(onboarding);
    return onboardingInformationStore.getItem('showFeatureStoreHelper') === null;
  }

  static disableOnboardingHelper() {
    const onboardingInformationStore = FeatureStoreView.getLocalStore(onboarding);
    onboardingInformationStore.setItem('showFeatureStoreHelper', 'false');
  }

  renderOnboardingContent() {
    const content = (
      <div>
        <FormattedMessage
          defaultMessage={'Share and manage machine learning features.'}
          description={'Text on the tooltip for feature store onboarding.'}
        />{' '}
        {LinkUtils.renderLearnMoreLink(LinkUtils.getLearnMoreLinkUrl())}
      </div>
    );
    return (
      <Alert
        css={styles.onboardingAlert}
        message={content}
        type='info'
        showIcon
        closable
        onClose={() => FeatureStoreView.disableOnboardingHelper()}
      />
    );
  }

  getScheduledJobs(featureTableName) {
    const { scheduledJobsForFeatureTables } = this.props;
    const scheduledJobs = scheduledJobsForFeatureTables[getFeatureTableKey(featureTableName)];
    if (!scheduledJobs || scheduledJobs.length === 0) {
      return LinkUtils.renderNoScheduleLink();
    }

    return (
      <ExpandableList showLines={1}>
        {scheduledJobs.map((scheduledJob, index) => {
          const { job_id, name, schedule, job_workspace_url } = scheduledJob;
          return (
            <div key={index}>
              {Utils.renderJobSource(
                Utils.getQueryParams(),
                job_id,
                null,
                name,
                job_workspace_url,
                CronUtils.getJobRunScheduleText(schedule),
              )}
            </div>
          );
        })}
      </ExpandableList>
    );
  }

  getColumns() {
    return [
      {
        title: (
          <FormattedMessage
            defaultMessage={'Feature Table'}
            description={'Title text for the feature table name column.'}
          />
        ),
        width: '20%',
        key: 'feature_table',
        render: (featureTable) => {
          const { features, name } = featureTable;
          const featureNames = features || [];
          return (
            <React.Fragment key={featureTable.id}>
              <div css={styles.tableCellTextWrapper} data-test-id='feature-table-name'>
                <Link to={getTableDetailPageRoute(name)}>{name}</Link>
              </div>
              <div css={styles.truncate}>{featureNames.join(', ')}</div>
            </React.Fragment>
          );
        },
      },
      {
        title: (
          <FormattedMessage
            defaultMessage={'Creator'}
            description={'Title text for the feature table creator column.'}
          />
        ),
        dataIndex: 'creator_id',
        width: '15%',
        render: (creator) => {
          return (
            <div css={styles.tableCellTextWrapper} data-test-id='feature-table-creator'>
              {creator}
            </div>
          );
        },
      },
      {
        title: (
          <FormattedMessage
            defaultMessage={'Data Sources'}
            description={'Title text for the feature table data sources column.'}
          />
        ),
        dataIndex: 'data_sources',
        width: '25%',
        render: (sources) => {
          return (
            <div css={styles.tableCellTextWrapper} data-test-id='feature-table-data-sources'>
              {TableUtils.renderDataSources(sources, MAX_DATA_SOURCES_TABLE_SEARCH_PAGE)}
            </div>
          );
        },
      },
      {
        title: (
          <FormattedMessage
            defaultMessage={'Online Store'}
            description={'Title text for the feature table online stores column.'}
          />
        ),
        key: 'id',
        dataIndex: 'online_stores',
        width: '15%',
        render: (stores) => <OnlineStores stores={stores} />,
      },
      {
        title: TableUtils.renderTitleWithIcon(
          <FormattedMessage
            defaultMessage={'Scheduled jobs'}
            description={'Title text for the feature table scheduled jobs column.'}
          />,
          <div>
            <FormattedMessage
              defaultMessage={'Schedule of the job producers.'}
              description={
                // eslint-disable-next-line max-len
                'Text on the tooltip of the feature table scheduled jobs column title describing the definition of the column title.'
              }
            />{' '}
            {LinkUtils.renderLearnMoreLink(LinkUtils.getScheduleJobLearnMoreLinkUrl())}
          </div>,
        ),
        key: 'scheduled_job',
        dataIndex: 'name',
        width: '15%',
        render: (name) => (
          <div data-test-id='feature-table-scheduled-jobs'>{this.getScheduledJobs(name)}</div>
        ),
      },
      {
        title: TableUtils.renderTitleWithIcon(
          <FormattedMessage
            defaultMessage={'Last written'}
            description={'Title text for the feature table last written column.'}
          />,
          <FormattedMessage
            defaultMessage={'Last time a producer wrote to this table.'}
            description={
              // eslint-disable-next-line max-len
              'Text on the tooltip of the feature table last written column describing the definition of the column title.'
            }
          />,
        ),
        key: 'last_written',
        width: '10%',
        render: (featureTable) => {
          const latestProducer = FeatureTableUtils.getLatestWrittenProducer(featureTable);
          return (
            <div data-test-id='feature-table-last-written'>
              {!!latestProducer && Utils.timeSinceStr(latestProducer.creation_timestamp)}
            </div>
          );
        },
      },
    ];
  }

  handleSearch = (_event, input) => {
    this.props.onSearch(input);
  };

  handleSearchChange = (e) => {
    this.props.onSearchChange(e.target.value);
  };

  render() {
    const {
      featureTables,
      searchInput,
      currentPage,
      nextPageToken,
      onClickNext,
      onClickPrev,
      onSetMaxResult,
      showEditPermissionModal,
      getMaxResultValue,
      isLoading,
    } = this.props;

    return (
      <>
        <PageHeader
          title={
            <FormattedMessage
              defaultMessage={'Feature Store'}
              description={'Text for the feature store page header title.'}
            />
          }
          feedbackForm={'https://databricks.sjc1.qualtrics.com/jfe/form/SV_cux5mX6egOMfJ8G'}
        >
          {this.shouldEnablePermissionsModal() && (
            <HeaderButton onClick={showEditPermissionModal} data-test-id='permissions-button'>
              <FormattedMessage
                defaultMessage={'Permissions'}
                description={'Text for the permissions button.'}
              />
            </HeaderButton>
          )}
        </PageHeader>
        {FeatureStoreView.showOnboardingHelper() && this.renderOnboardingContent()}
        <Spacer size={3} direction='vertical'>
          <FlexBar
            left={<Spacer />}
            right={
              <div css={styles.searchContainer}>
                <SearchBox
                  placeholder={this.props.intl.formatMessage({
                    defaultMessage: 'Search by feature table, feature or data source...',
                    description:
                      // eslint-disable-next-line max-len
                      'Placeholder text on the feature store page search box describing the attributes that the search could be based on.',
                  })}
                  value={searchInput}
                  onSearch={this.handleSearch}
                  onChange={this.handleSearchChange}
                />
              </div>
            }
          />
          <Table
            rowKey={(record) => record.id}
            columns={this.getColumns()}
            dataSource={featureTables}
            locale={{ emptyText: FeatureStoreView.getEmptyTextComponent(searchInput) }}
            pagination={{
              hideOnSinglePage: true,
              size: 'default',
              pageSize: getMaxResultValue(),
            }}
            size='middle'
            loading={isLoading && { indicator: <Spinner /> }}
            showSorterTooltip={false}
          />
          <SimplePagination
            currentPage={currentPage}
            isLastPage={nextPageToken === null}
            onClickNext={onClickNext}
            onClickPrev={onClickPrev}
            handleSetMaxResult={onSetMaxResult}
            maxResultOptions={['10', '25', '50', '100']}
            getSelectedPerPageSelection={getMaxResultValue}
          />
        </Spacer>
      </>
    );
  }
}

export const FeatureStoreView = injectIntl(FeatureStoreViewImpl);

const styles = {
  searchContainer: {
    width: '446px',
  },
  truncate: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: 350,
  },
  // TODO: convert this to use Dubois Alert component and get rid of all this custom CSS
  onboardingAlert: {
    margin: '0px 0px 16px 0px',
    padding: 16,
    background: '#EDFAFE',
    /* Gray-background */
    border: '1px solid #EEEEEE',
    boxSizing: 'border-box',
    /* Dropshadow */
    boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.12)',
    borderRadius: '4px',
    '.ant-alert-icon': {
      color: '#00B379',
    },
  },
  tableCellTextWrapper: {
    overflowWrap: 'anywhere',
  },
};
