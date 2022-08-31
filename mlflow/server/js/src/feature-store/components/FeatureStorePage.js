import React from 'react';
import { connect } from 'react-redux';
import { PropTypes } from 'prop-types';

import { getUUID } from '../../common/utils/ActionUtils';
import { ErrorView } from '../../common/components/ErrorView';
import RequestStateWrapper from '../../common/components/RequestStateWrapper';

import { FeatureStoreView } from './FeatureStoreView';
import { SearchScopes } from '../constants';
import { getJobApi, searchFeatureTablesApi, getFeatureStoreWidePermissionsApi } from '../actions';
import {
  getFeatureTables,
  getScheduledJobsForFeatureTables,
  getFeatureStoreWidePermissionLevel,
} from '../selectors';
import DatabricksUtils from '../../common/utils/DatabricksUtils';
import Utils from '../../common/utils/Utils';
import { PageContainer } from '../../common/components/PageContainer';
// BEGIN-EDGE
import { LoadingDescription } from '@databricks/web-shared-bundle/metrics';
import { UniverseFrontendApis } from '../../common/utils/UniverseFrontendApis';
// END-EDGE

// Use 'root' which is defined in permission handler to set permission at feature-store root.
const FEATURE_STORE_ROOT = Object.freeze({ id: 'root' });

export class FeatureStorePageImpl extends React.Component {
  constructor(props) {
    super(props);
    const urlState = this.getUrlState();
    this.state = {
      history: PropTypes.object.isRequired,
      searchInput: urlState.searchInput ? decodeURIComponent(urlState.searchInput) : '',
      currentPage: this.defaultFirstPageNumber,
      maxResultsSelection: this.defaultMaxResultsSelection,
      pageTokens: this.defaultPageTokens,
      searchScopes: this.defaultSearchScopes,
      shouldReloadPage: this.defaultShouldReloadPage,
    };
  }
  static propTypes = {
    history: PropTypes.object.isRequired,
    location: PropTypes.object,
    featureTables: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    scheduledJobsForFeatureTables: PropTypes.shape({}).isRequired,
    permissionLevel: PropTypes.string,
    searchFeatureTablesApi: PropTypes.func.isRequired,
    getJobApi: PropTypes.func.isRequired,
    getFeatureStoreWidePermissionsApi: PropTypes.func.isRequired,
  };

  defaultPageTokens = { 1: null };
  defaultFirstPageNumber = 1;
  defaultMaxResultsSelection = 10;
  defaultSearchScopes = [
    SearchScopes.FEATURE_TABLES,
    SearchScopes.FEATURES,
    SearchScopes.DATA_SOURCES,
    SearchScopes.FEATURE_TABLE_TAGS,
    SearchScopes.FEATURE_TAGS,
  ];
  defaultShouldReloadPage = false;
  searchFeatureTablesId = getUUID();
  getFeatureStoreWidePermissionsApiId = getUUID();

  componentDidMount() {
    this.loadPage(this.state.currentPage);
    DatabricksUtils.logClientSideEvent('mlflowFeatureStorePageAction', 'pageView');
  }

  componentDidUpdate() {
    if (this.state.shouldReloadPage) {
      this.loadPage(this.state.currentPage, this.state.searchInput);
      this.setState({ shouldReloadPage: false });
    }
  }

  getUrlState() {
    return this.props.location ? Utils.getSearchParamsFromUrl(this.props.location.search) : {};
  }

  getNextPageTokenFromResponse(response) {
    const { value } = response;
    if (!value || !value.next_page_token) {
      return null;
    } else {
      return value.next_page_token;
    }
  }

  updatePageState = (pageNumber, response = {}) => {
    const nextPageToken = this.getNextPageTokenFromResponse(response);
    this.setState((prevState) => ({
      currentPage: pageNumber,
      pageTokens: {
        ...prevState.pageTokens,
        [pageNumber + 1]: nextPageToken,
      },
    }));
  };

  handleRedirect = (searchInput) => {
    const searchParams = [searchInput ? `searchInput=${encodeURIComponent(searchInput)}` : '']
      .filter((param) => !!param)
      .join('&');
    this.props.history.push({
      search: `?${searchParams}`,
    });
    this.setState({
      ...(searchInput && { searchInput }),
      ...{
        pageTokens: this.defaultPageTokens,
        currentPage: this.defaultFirstPageNumber,
        shouldReloadPage: true,
      },
    });
  };

  handleSearch = (searchInput) => {
    this.setState({ searchInput });
    this.handleRedirect(searchInput);
  };

  handleSearchChange = (searchInput) => {
    this.setState({ searchInput });
  };

  handleMaxResultsChange = ({ key }) => {
    this.setState({
      maxResultsSelection: parseInt(key, 10),
      currentPage: this.defaultFirstPageNumber,
      pageTokens: this.defaultPageTokens,
      shouldReloadPage: true,
    });
  };

  handleClickNext = () => {
    const { searchInput, currentPage } = this.state;
    this.loadPage(currentPage + 1, searchInput);
  };

  handleClickPrev = () => {
    const { searchInput, currentPage } = this.state;
    this.loadPage(currentPage - 1, searchInput);
  };

  showEditPermissionModal = () => {
    UniverseFrontendApis.editFeatureTablePermission({
      featureTable: FEATURE_STORE_ROOT,
    });
  };

  getMaxResultsSelection = () => {
    return this.state.maxResultsSelection;
  };

  loadPage(pageNumber) {
    const { searchInput, pageTokens, maxResultsSelection, searchScopes } = this.state;
    this.props
      .searchFeatureTablesApi(
        searchInput,
        maxResultsSelection,
        pageTokens[pageNumber],
        searchScopes,
        this.searchFeatureTablesId,
      )
      .then((response) => {
        this.updatePageState(pageNumber, response);
        const { value } = response;
        if (!value.feature_tables) return;
        // we only want to fetch jobs that are in the current workspace because
        // jobs APIs does not support cross workspace queries.
        const jobIds = value.feature_tables.flatMap((ft) =>
          (ft.job_producers || [])
            .filter(({ job_workspace_id }) => Utils.isCurrentWorkspace(job_workspace_id))
            .map(({ job_id }) => job_id),
        );
        jobIds.forEach((jobId) =>
          this.props.getJobApi(jobId).catch((error) => {
            // only render error toast when jobs service is unavailable,
            // error such as 404 resource does not exist should not be surfaced to the user
            // because it could simply suggest that the job ids persisted in the backend
            // are stale.
            if (error.getStatus() >= 500) {
              Utils.logErrorAndNotifyUser('Failed to load some job schedules.');
            }
          }),
        );
      })
      .catch(() => {
        this.setState({
          currentPage: this.defaultFirstPageNumber,
          pageTokens: this.defaultPageTokens,
        });
        Utils.logErrorAndNotifyUser('Failed to load feature tables.');
      });
    this.props.getFeatureStoreWidePermissionsApi(this.getFeatureStoreWidePermissionsApiId);
  }

  render() {
    const { featureTables, scheduledJobsForFeatureTables, permissionLevel } = this.props;
    const { searchInput, currentPage, pageTokens } = this.state;

    return (
      <PageContainer data-test-id='feature-store-page'>
        <RequestStateWrapper
          requestIds={[this.searchFeatureTablesId, this.getFeatureStoreWidePermissionsApiId]}
          // eslint-disable-next-line no-trailing-spaces
          // BEGIN-EDGE
          description={LoadingDescription.FEATURE_STORE_PAGE}
          // END-EDGE
        >
          {(isLoading, hasError, requests) => {
            if (hasError) {
              const request = requests.find((r) => r.id === this.searchFeatureTablesId);
              const { error } = request;

              if (error) {
                return (
                  <ErrorView statusCode={error.getStatus()} subMessage={error.getMessageField()} />
                );
              }

              return <ErrorView statusCode={404} />;
            }

            return (
              <FeatureStoreView
                featureTables={featureTables}
                scheduledJobsForFeatureTables={scheduledJobsForFeatureTables}
                searchInput={searchInput}
                currentPage={currentPage}
                nextPageToken={pageTokens[currentPage + 1]}
                showEditPermissionModal={this.showEditPermissionModal}
                permissionLevel={permissionLevel}
                onSearch={this.handleSearch}
                onSearchChange={this.handleSearchChange}
                onClickNext={this.handleClickNext}
                onClickPrev={this.handleClickPrev}
                onSetMaxResult={this.handleMaxResultsChange}
                getMaxResultValue={this.getMaxResultsSelection}
                isLoading={isLoading}
              />
            );
          }}
        </RequestStateWrapper>
      </PageContainer>
    );
  }
}

const mapStateToProps = (state) => {
  const featureTables = getFeatureTables(state);
  const scheduledJobsForFeatureTables = getScheduledJobsForFeatureTables(state, featureTables);
  const permissionLevel = getFeatureStoreWidePermissionLevel(state);
  return {
    featureTables,
    scheduledJobsForFeatureTables,
    permissionLevel,
  };
};

const mapDispatchToProps = {
  searchFeatureTablesApi,
  getJobApi,
  getFeatureStoreWidePermissionsApi,
};

export const FeatureStorePage = connect(mapStateToProps, mapDispatchToProps)(FeatureStorePageImpl);
