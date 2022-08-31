import React from 'react';
import { ModelListView } from './ModelListView';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import RequestStateWrapper from '../../common/components/RequestStateWrapper';
import { getUUID } from '../../common/utils/ActionUtils';
import Utils from '../../common/utils/Utils';
import { getCombinedSearchFilter, constructSearchInputFromURLState } from '../utils/SearchUtils';
import {
  AntdTableSortOrder,
  REGISTERED_MODELS_PER_PAGE,
  REGISTERED_MODELS_SEARCH_NAME_FIELD,
} from '../constants';
import { searchRegisteredModelsApi } from '../actions';
import LocalStorageUtils from '../../common/utils/LocalStorageUtils';
// BEGIN-EDGE
import { getRegistryWidePermissionsApi } from '../actions';
import {
  MODEL_VERSION_STATUS_POLL_INTERVAL as POLL_INTERVAL,
  PermissionLevels,
} from '../constants';
import { getRegistryWidePermissionLevel } from '../reducers';
import { listEndpointsApi, listEndpointsV2Api } from '../../model-serving/actions';
import DatabricksUtils from '../../common/utils/DatabricksUtils';
import { LoadingDescription } from '@databricks/web-shared-bundle/metrics';
import { UniverseFrontendApis } from '../../common/utils/UniverseFrontendApis';
import { OwnerFilter, StatusFilter } from '../utils/SearchUtils';
// END-EDGE

export class ModelListPageImpl extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      orderByKey: REGISTERED_MODELS_SEARCH_NAME_FIELD,
      orderByAsc: true,
      currentPage: 1,
      maxResultsSelection: REGISTERED_MODELS_PER_PAGE,
      pageTokens: {},
      loading: false,
      searchInput: constructSearchInputFromURLState(this.getUrlState()),
      // BEGIN-EDGE
      selectedOwnerFilter: OwnerFilter.ACCESSIBLE_BY_ME,
      selectedStatusFilter: StatusFilter.ALL,
      // END-EDGE
    };
  }
  static propTypes = {
    models: PropTypes.arrayOf(PropTypes.object),
    searchRegisteredModelsApi: PropTypes.func.isRequired,
    // react-router props
    history: PropTypes.object.isRequired,
    location: PropTypes.object,
    // BEGIN-EDGE
    endpoints: PropTypes.object,
    endpointsV2: PropTypes.array,
    listEndpointsApi: PropTypes.func.isRequired,
    listEndpointsV2Api: PropTypes.func.isRequired,
    getRegistryWidePermissionsApi: PropTypes.func.isRequired,
    permissionLevel: PropTypes.string,
    apis: PropTypes.object.isRequired,
    // END-EDGE
  };
  modelListPageStoreKey = 'ModelListPageStore';
  defaultPersistedPageTokens = { 1: null };
  initialSearchRegisteredModelsApiId = getUUID();
  searchRegisteredModelsApiId = getUUID();
  // BEGIN-EDGE
  initgetRegistryWidePermissionsApiId = getUUID();
  getRegistryWidePermissionsApiId = getUUID();
  // END-EDGE
  criticalInitialRequestIds = [this.initialSearchRegisteredModelsApiId];

  getUrlState() {
    return this.props.location ? Utils.getSearchParamsFromUrl(this.props.location.search) : {};
  }

  // BEGIN-EDGE
  // Launch edit permission modal from Databricks window
  showEditPermissionModal = () => {
    const dummyModelForPermissions = { id: 'root' };
    UniverseFrontendApis.editRegisteredModelPermission({
      registeredModel: dummyModelForPermissions,
    }).then(() => {
      // TODO(sueann): apply UI changes based on permission changes
    });
  };

  loadData = (isInitialLoading) => {
    const promiseValues = [];
    // if ACL checks are not enabled for model registry, backend will throw
    if (DatabricksUtils.isRegistryWidePermissionsEnabledForModelRegistry()) {
      promiseValues.push(
        this.props.getRegistryWidePermissionsApi(
          isInitialLoading === true
            ? this.initgetRegistryWidePermissionsApiId
            : this.getRegistryWidePermissionsApiId,
        ),
      );
    }
    return Promise.all(promiseValues);
  };

  pollingRelatedRequestIds = [this.getRegistryWidePermissionsApiId];

  hasPendingPollingRequest = () =>
    this.pollingRelatedRequestIds.every((requestId) => {
      const request = this.props.apis[requestId];
      return Boolean(request && request.active);
    });

  pollData = () => {
    if (!this.hasPendingPollingRequest() && Utils.isBrowserTabVisible()) {
      return this.loadData(false).catch(console.error);
    }
    return Promise.resolve();
  };

  // END-EDGE
  componentDidMount() {
    const urlState = this.getUrlState();
    const persistedPageTokens = this.getPersistedPageTokens();
    const maxResultsForTokens = this.getPersistedMaxResults();
    // eslint-disable-next-line react/no-did-mount-set-state
    this.setState(
      {
        orderByKey: urlState.orderByKey === undefined ? this.state.orderByKey : urlState.orderByKey,
        orderByAsc:
          urlState.orderByAsc === undefined
            ? this.state.orderByAsc
            : urlState.orderByAsc === 'true',
        currentPage:
          urlState.page !== undefined && urlState.page in persistedPageTokens
            ? parseInt(urlState.page, 10)
            : this.state.currentPage,
        maxResultsSelection: maxResultsForTokens,
        pageTokens: persistedPageTokens,
      },
      () => {
        this.loadModels(true);
        // BEGIN-EDGE
        this.loadData(true).catch(console.error);
        this.pollIntervalId = setInterval(this.pollData, POLL_INTERVAL);
        // END-EDGE
      },
    );
    // BEGIN-EDGE
    DatabricksUtils.logClientSideEvent('mlflowModelListPageAction', 'pageView');
    // END-EDGE
  }

  // BEGIN-EDGE
  componentWillUnmount() {
    clearInterval(this.pollIntervalId);
  }

  // END-EDGE
  getPersistedPageTokens() {
    const store = ModelListPageImpl.getLocalStore(this.modelListPageStoreKey);
    if (store && store.getItem('page_tokens')) {
      return JSON.parse(store.getItem('page_tokens'));
    } else {
      return this.defaultPersistedPageTokens;
    }
  }

  setPersistedPageTokens(page_tokens) {
    const store = ModelListPageImpl.getLocalStore(this.modelListPageStoreKey);
    if (store) {
      store.setItem('page_tokens', JSON.stringify(page_tokens));
    }
  }

  getPersistedMaxResults() {
    const store = ModelListPageImpl.getLocalStore(this.modelListPageStoreKey);
    if (store && store.getItem('max_results')) {
      return parseInt(store.getItem('max_results'), 10);
    } else {
      return REGISTERED_MODELS_PER_PAGE;
    }
  }

  setMaxResultsInStore(max_results) {
    const store = ModelListPageImpl.getLocalStore(this.modelListPageStoreKey);
    store.setItem('max_results', max_results.toString());
  }

  /**
   * Returns a LocalStorageStore instance that can be used to persist data associated with the
   * ModelRegistry component.
   */
  static getLocalStore(key) {
    return LocalStorageUtils.getSessionScopedStoreForComponent('ModelListPage', key);
  }

  // Loads the initial set of models.
  loadModels(isInitialLoading = false) {
    this.loadPage(this.state.currentPage, undefined, undefined, isInitialLoading);
  }

  resetHistoryState() {
    this.setState((prevState) => ({
      currentPage: 1,
      pageTokens: this.defaultPersistedPageTokens,
    }));
    this.setPersistedPageTokens(this.defaultPersistedPageTokens);
  }

  /**
   *
   * @param orderByKey column key to sort by
   * @param orderByAsc is sort by ascending order
   * @returns {string} ex. 'name ASC'
   */
  static getOrderByExpr = (orderByKey, orderByAsc) =>
    orderByKey ? `${orderByKey} ${orderByAsc ? 'ASC' : 'DESC'}` : '';

  oss_isEmptyPageResponse = (value) => {
    return !value || !value.registered_models || !value.next_page_token;
  };

  // BEGIN-EDGE
  isEmptyPageResponse = (value) => {
    return !value || !value.registered_models_databricks || !value.next_page_token;
  };
  // END-EDGE
  getNextPageTokenFromResponse(response) {
    const { value } = response;
    if (this.isEmptyPageResponse(value)) {
      // Why we could be here:
      // 1. There are no models returned: we went to the previous page but all models after that
      //    page's token has been deleted.
      // 2. If `next_page_token` is not returned, assume there is no next page.
      return null;
    } else {
      return value.next_page_token;
    }
  }

  updatePageState = (page, response = {}) => {
    const nextPageToken = this.getNextPageTokenFromResponse(response);
    this.setState(
      (prevState) => ({
        currentPage: page,
        pageTokens: {
          ...prevState.pageTokens,
          [page + 1]: nextPageToken,
        },
      }),
      () => {
        this.setPersistedPageTokens(this.state.pageTokens);
      },
    );
  };

  handleSearch = (callback, errorCallback, searchInput) => {
    this.resetHistoryState();
    this.setState({ searchInput: searchInput }, () => {
      this.loadPage(1, callback, errorCallback);
    });
  };

  handleClear = (callback, errorCallback) => {
    this.setState(
      {
        orderByKey: REGISTERED_MODELS_SEARCH_NAME_FIELD,
        orderByAsc: true,
        searchInput: '',
        // BEGIN-EDGE
        selectedOwnerFilter: OwnerFilter.ACCESSIBLE_BY_ME,
        selectedStatusFilter: StatusFilter.ALL,
        // END-EDGE
        // eslint-disable-nextline
      },
      () => {
        this.updateUrlWithSearchFilter('', REGISTERED_MODELS_SEARCH_NAME_FIELD, true, 1);
        this.loadPage(1, callback, errorCallback);
      },
    );
  };

  handleSearchInputChange = (searchInput) => {
    this.setState({ searchInput: searchInput });
  };
  // BEGIN-EDGE
  handleOwnerFilterChange = (selectedOwnerFilter, callback, errorCallback) => {
    this.setState({ selectedOwnerFilter: selectedOwnerFilter }, () => {
      this.resetHistoryState();
      this.loadPage(1, callback, errorCallback);
    });
  };
  handleStatusFilterChange = (selectedStatusFilter, callback, errorCallback) => {
    this.setState({ selectedStatusFilter: selectedStatusFilter }, () => {
      this.resetHistoryState();
      this.loadPage(1, callback, errorCallback);
    });
  };
  // END-EDGE

  updateUrlWithSearchFilter = (searchInput, orderByKey, orderByAsc, page) => {
    const urlParams = {};
    if (searchInput) {
      urlParams['searchInput'] = searchInput;
    }
    if (orderByKey && orderByKey !== REGISTERED_MODELS_SEARCH_NAME_FIELD) {
      urlParams['orderByKey'] = orderByKey;
    }
    if (orderByAsc === false) {
      urlParams['orderByAsc'] = orderByAsc;
    }
    if (page && page !== 1) {
      urlParams['page'] = page;
    }
    const newUrl = `/models?${Utils.getSearchUrlFromState(urlParams)}`;
    if (newUrl !== this.props.history.location.pathname + this.props.history.location.search) {
      this.props.history.push(newUrl);
    }
  };

  handleMaxResultsChange = (key, callback, errorCallback) => {
    this.setState({ maxResultsSelection: parseInt(key, 10) }, () => {
      this.resetHistoryState();
      const { maxResultsSelection } = this.state;
      this.setMaxResultsInStore(maxResultsSelection);
      this.loadPage(1, callback, errorCallback);
    });
  };

  handleClickNext = (callback, errorCallback) => {
    const { currentPage } = this.state;
    this.loadPage(currentPage + 1, callback, errorCallback);
  };

  handleClickPrev = (callback, errorCallback) => {
    const { currentPage } = this.state;
    this.loadPage(currentPage - 1, callback, errorCallback);
  };

  handleClickSortableColumn = (orderByKey, sortOrder, callback, errorCallback) => {
    const orderByAsc = sortOrder !== AntdTableSortOrder.DESC; // default to true
    this.setState({ orderByKey, orderByAsc }, () => {
      this.resetHistoryState();
      this.loadPage(1, callback, errorCallback);
    });
  };

  getMaxResultsSelection = () => {
    return this.state.maxResultsSelection;
  };

  loadPage(page, callback, errorCallback, isInitialLoading) {
    const {
      searchInput,
      pageTokens,
      orderByKey,
      orderByAsc,
      // BEGIN-EDGE
      selectedOwnerFilter,
      selectedStatusFilter,
      // END-EDGE
      // eslint-disable-nextline
    } = this.state;
    this.setState({ loading: true });
    this.updateUrlWithSearchFilter(searchInput, orderByKey, orderByAsc, page);
    this.props
      .searchRegisteredModelsApi(
        getCombinedSearchFilter({
          query: searchInput,
          // BEGIN-EDGE
          selectedOwnerFilter: selectedOwnerFilter,
          selectedStatusFilter: selectedStatusFilter,
          // END-EDGE
          // eslint-disable-nextline
        }),
        this.state.maxResultsSelection,
        ModelListPageImpl.getOrderByExpr(orderByKey, orderByAsc),
        pageTokens[page],
        isInitialLoading
          ? this.initialSearchRegisteredModelsApiId
          : this.searchRegisteredModelsApiId,
      )
      .then((r) => {
        this.updatePageState(page, r);
        this.setState({ loading: false });
        callback && callback();
      })
      .catch((e) => {
        Utils.logErrorAndNotifyUser(e);
        this.setState({ currentPage: 1 });
        this.resetHistoryState();
        errorCallback && errorCallback();
      });
    // BEGIN-EDGE
    // TODO(aaron) Load only endpoints relevant to the current page being shown.
    if (DatabricksUtils.isModelServingEnabled()) {
      this.props.listEndpointsApi();
      this.props.listEndpointsV2Api();
    }
    // END-EDGE
  }

  render() {
    const {
      orderByKey,
      orderByAsc,
      currentPage,
      pageTokens,
      searchInput,
      // BEGIN-EDGE
      selectedOwnerFilter,
      selectedStatusFilter,
      // END-EDGE
      // eslint-disable-nextline
    } = this.state;
    const { models } = this.props;
    // BEGIN-EDGE
    const { endpoints, permissionLevel } = this.props;
    // END-EDGE
    return (
      <RequestStateWrapper
        requestIds={[this.criticalInitialRequestIds]}
        // eslint-disable-next-line no-trailing-spaces
        // BEGIN-EDGE
        description={LoadingDescription.MLFLOW_MODEL_LIST_PAGE}
        // END-EDGE
      >
        <ModelListView
          models={models}
          loading={this.state.loading}
          // BEGIN-EDGE
          endpoints={endpoints}
          permissionLevel={permissionLevel}
          showEditPermissionModal={this.showEditPermissionModal}
          selectedOwnerFilter={selectedOwnerFilter}
          selectedStatusFilter={selectedStatusFilter}
          // END-EDGE
          searchInput={searchInput}
          orderByKey={orderByKey}
          orderByAsc={orderByAsc}
          currentPage={currentPage}
          nextPageToken={pageTokens[currentPage + 1]}
          onSearch={this.handleSearch}
          onSearchInputChange={this.handleSearchInputChange}
          // BEGIN-EDGE
          onOwnerFilterChange={this.handleOwnerFilterChange}
          onStatusFilterChange={this.handleStatusFilterChange}
          // END-EDGE
          onClear={this.handleClear}
          onClickNext={this.handleClickNext}
          onClickPrev={this.handleClickPrev}
          onClickSortableColumn={this.handleClickSortableColumn}
          onSetMaxResult={this.handleMaxResultsChange}
          getMaxResultValue={this.getMaxResultsSelection}
        />
      </RequestStateWrapper>
    );
  }
}

const mapStateToProps = (state) => {
  const models = Object.values(state.entities.modelByName);
  // BEGIN-EDGE
  const endpoints = state.entities.endpointStatus;
  const permissionLevel =
    getRegistryWidePermissionLevel(state) || PermissionLevels.CAN_CREATE_REGISTERED_MODEL;
  const { apis } = state;
  // END-EDGE
  return {
    models,
    // BEGIN-EDGE
    endpoints,
    permissionLevel,
    apis,
    // END-EDGE
  };
};

const mapDispatchToProps = {
  searchRegisteredModelsApi,
  // BEGIN-EDGE
  listEndpointsApi,
  listEndpointsV2Api,
  getRegistryWidePermissionsApi,
  // END-EDGE
};

export const ModelListPage = connect(mapStateToProps, mapDispatchToProps)(ModelListPageImpl);
