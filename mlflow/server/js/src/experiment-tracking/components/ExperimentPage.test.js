import React from 'react';
import { shallow } from 'enzyme';
import { MemoryRouter as Router } from 'react-router-dom';

import { ErrorCodes } from '../../common/constants';
import { ExperimentPage, isNewRun, lifecycleFilterToRunViewType } from './ExperimentPage';
import { ExperimentPagePersistedState } from '../sdk/MlflowLocalStorageMessages';
import Utils from '../../common/utils/Utils';
import ExperimentView from './ExperimentView';
import { ViewType } from '../sdk/MlflowEnums';
import { getUUID } from '../../common/utils/ActionUtils';
import { ErrorWrapper } from '../../common/utils/ErrorWrapper';
import { MAX_RUNS_IN_SEARCH_MODEL_VERSIONS_FILTER } from '../../model-registry/constants';
import {
  ATTRIBUTE_COLUMN_SORT_KEY,
  COLUMN_TYPES,
  DEFAULT_CATEGORIZED_UNCHECKED_KEYS,
  DEFAULT_DIFF_SWITCH_SELECTED,
  DEFAULT_LIFECYCLE_FILTER,
  DEFAULT_MODEL_VERSION_FILTER,
  DEFAULT_ORDER_BY_ASC,
  DEFAULT_ORDER_BY_KEY,
  DEFAULT_START_TIME,
  LIFECYCLE_FILTER,
  MAX_DETECT_NEW_RUNS_RESULTS,
  MODEL_VERSION_FILTER,
  PAGINATION_DEFAULT_STATE,
  POLL_INTERVAL,
  MLFLOW_EXPERIMENT_PRIMARY_METRIC_NAME,
  MLFLOW_EXPERIMENT_PRIMARY_METRIC_GREATER_IS_BETTER,
} from '../constants';
import Fixtures from '../utils/test-utils/Fixtures';
// BEGIN-EDGE
import DatabricksUtils from '../../common/utils/DatabricksUtils';
import { AUTOML_TAG_PREFIX } from './automl/AutoMLExperimentPanelPage';
import {
  AUTOML_WARNING_PREFIX,
  AUTOML_WARNING_PREFIX_DEPRECATED,
  WARNING_NAMES,
} from './automl/AutoMLWarningDashboard';
import { UniverseFrontendApis } from '../../common/utils/UniverseFrontendApis';
// END-EDGE

const EXPERIMENT_ID = '17';
const BASE_PATH = '/experiments/17/s';
const MOCK_EXPERIMENT = Fixtures.createExperiment({ experiment_id: EXPERIMENT_ID, tags: [] });

jest.useFakeTimers();
// BEGIN-EDGE
jest.mock('../../common/utils/UniverseFrontendApis');
// END-EDGE

let searchRunsApi;
let getExperimentApi;
let batchGetExperimentsApi;
let loadMoreRunsApi;
let searchModelVersionsApi;
let searchForNewRuns;
let setCompareExperiments;
let history;
let location;
let dateNowSpy;

beforeEach(() => {
  dateNowSpy = jest.spyOn(Date, 'now').mockImplementation(() => 0);
  localStorage.clear();
  searchRunsApi = jest.fn(() => Promise.resolve());
  getExperimentApi = jest.fn(() => Promise.resolve({ action: { payload: {} } }));
  // BEGIN-EDGE
  batchGetExperimentsApi = jest.fn(() =>
    Promise.resolve({
      action: { payload: { experiments_databricks: [{ experiment: MOCK_EXPERIMENT }] } },
    }),
  );
  // END-EDGE
  searchModelVersionsApi = jest.fn(() => Promise.resolve());
  loadMoreRunsApi = jest.fn(() => Promise.resolve());
  searchForNewRuns = jest.fn(() => Promise.resolve());
  setCompareExperiments = jest.fn(() => {});
  location = {
    pathname: '/',
  };
  history = {
    push: jest.fn(),
    location: {
      pathname: BASE_PATH,
      search: '',
    },
  };
  // BEGIN-EDGE
  /* eslint-disable no-restricted-globals */
  top.settings = {
    autoMLEnabled: true,
  };
  // END-EDGE
});

afterAll(() => {
  dateNowSpy.mockRestore();
});

const getExperimentPageMock = (additionalProps) => {
  return shallow(
    <ExperimentPage
      experiments={[MOCK_EXPERIMENT]}
      experimentIds={[EXPERIMENT_ID]}
      searchRunsApi={searchRunsApi}
      getExperimentApi={getExperimentApi}
      batchGetExperimentsApi={batchGetExperimentsApi}
      searchModelVersionsApi={searchModelVersionsApi}
      loadMoreRunsApi={loadMoreRunsApi}
      searchForNewRuns={searchForNewRuns}
      setCompareExperiments={setCompareExperiments}
      history={history}
      location={location}
      intl={{ formatMessage: () => {} }}
      {...additionalProps}
    />,
  );
};

// BEGIN-EDGE
// In edge we issue a search runs call only if we get a sensible output
// from the (batch) getExperiments call. In OSS we issue the call regardless
// of the output. Thus we should expect an extraneous call in OSS.
const getSearchRunsCall = () => {
  return 0;
};
// END-EDGE
// eslint-disable-next-line no-unused-vars
const oss_getSearchRunsCall = () => {
  return 1;
};

test('State and search params are correct for blank search', () => {
  const wrapper = getExperimentPageMock({
    location: {
      search: '?searchInput=test',
    },
  });
  wrapper.instance().onSearch({ searchInput: '' });

  expect(wrapper.state().persistedState.searchInput).toEqual('');
  expect(wrapper.state().persistedState.orderByKey).toEqual(DEFAULT_ORDER_BY_KEY);
  expect(wrapper.state().persistedState.orderByAsc).toEqual(DEFAULT_ORDER_BY_ASC);
  expect(wrapper.state().persistedState.lifecycleFilter).toEqual(DEFAULT_LIFECYCLE_FILTER);
  expect(wrapper.state().persistedState.modelVersionFilter).toEqual(DEFAULT_MODEL_VERSION_FILTER);
  expect(wrapper.state().persistedState.startTime).toEqual(DEFAULT_START_TIME);

  const searchRunsCallParams = searchRunsApi.mock.calls[getSearchRunsCall()][0];

  expect(searchRunsCallParams.experimentIds).toEqual([EXPERIMENT_ID]);
  expect(searchRunsCallParams.filter).toEqual('');
  expect(searchRunsCallParams.runViewType).toEqual(ViewType.ACTIVE_ONLY);
  expect(searchRunsCallParams.orderBy).toEqual(['attributes.start_time DESC']);
});

test('State and search params are correct for complete search', () => {
  const wrapper = getExperimentPageMock();
  wrapper.instance().onSearch({
    searchInput: 'metrics.metric0 > 3',
    orderByKey: 'test-key',
    orderByAsc: true,
    lifecycleFilter: 'Deleted',
    modelVersionFilter: MODEL_VERSION_FILTER.WTIHOUT_MODEL_VERSIONS,
    startTime: '1 Hour',
  });

  expect(wrapper.state().persistedState.searchInput).toEqual('metrics.metric0 > 3');
  expect(wrapper.state().persistedState.orderByKey).toEqual('test-key');
  expect(wrapper.state().persistedState.orderByAsc).toEqual(true);
  expect(wrapper.state().persistedState.lifecycleFilter).toEqual('Deleted');
  expect(wrapper.state().persistedState.modelVersionFilter).toEqual(
    MODEL_VERSION_FILTER.WTIHOUT_MODEL_VERSIONS,
  );
  expect(wrapper.state().persistedState.startTime).toEqual('1 Hour');

  const searchRunsCallParams = searchRunsApi.mock.calls[getSearchRunsCall()][0];
  expect(searchRunsCallParams.filter).toEqual('metrics.metric0 > 3');
  expect(searchRunsCallParams.runViewType).toEqual(ViewType.DELETED_ONLY);
  expect(searchRunsCallParams.orderBy).toEqual(['test-key ASC']);
});
// BEGIN-EDGE
test('Should not search for runs if no experiments received', () => {
  batchGetExperimentsApi = jest.fn(() => Promise.resolve({ action: { payload: {} } }));
  getExperimentPageMock();
  const searchRunsCalls = searchRunsApi.mock.calls;
  expect(searchRunsCalls.length).toBe(0);
});
// END-EDGE

test('Loading state without any URL params and no snapshot', () => {
  const wrapper = getExperimentPageMock();
  const { state } = wrapper.instance();
  expect(state.persistedState.searchInput).toEqual('');
  expect(state.persistedState.lifecycleFilter).toEqual(DEFAULT_LIFECYCLE_FILTER);
  expect(state.persistedState.modelVersionFilter).toEqual(DEFAULT_MODEL_VERSION_FILTER);
  expect(state.persistedState.orderByKey).toBe(DEFAULT_ORDER_BY_KEY);
  expect(state.persistedState.orderByAsc).toEqual(DEFAULT_ORDER_BY_ASC);
  expect(state.persistedState.startTime).toEqual(DEFAULT_START_TIME);
  expect(state.persistedState.diffSwitchSelected).toEqual(DEFAULT_DIFF_SWITCH_SELECTED);
  expect(state.persistedState.categorizedUncheckedKeys).toEqual(DEFAULT_CATEGORIZED_UNCHECKED_KEYS);
  expect(state.persistedState.preSwitchCategorizedUncheckedKeys).toEqual(
    DEFAULT_CATEGORIZED_UNCHECKED_KEYS,
  );
  expect(state.persistedState.postSwitchCategorizedUncheckedKeys).toEqual(
    DEFAULT_CATEGORIZED_UNCHECKED_KEYS,
  );
});

test('Loading state with all URL params and no snapshot', () => {
  location.search =
    'searchInput=c&orderByKey=d&orderByAsc=false&startTime=LAST_HOUR' +
    '&lifecycleFilter=lifecycle&modelVersionFilter=With%20Model%20Versions' +
    '&diffSwitchSelected=true' +
    '&categorizedUncheckedKeys%5Battributes%5D%5B0%5D=a1' +
    '&categorizedUncheckedKeys%5Bparams%5D%5B0%5D=p1' +
    '&categorizedUncheckedKeys%5Bmetrics%5D%5B0%5D=m1' +
    '&categorizedUncheckedKeys%5Btags%5D%5B0%5D=t1' +
    '&preSwitchCategorizedUncheckedKeys%5Battributes%5D%5B0%5D=a2' +
    '&preSwitchCategorizedUncheckedKeys%5Bparams%5D%5B0%5D=p2' +
    '&preSwitchCategorizedUncheckedKeys%5Bmetrics%5D%5B0%5D=m2' +
    '&preSwitchCategorizedUncheckedKeys%5Btags%5D%5B0%5D=t2' +
    '&postSwitchCategorizedUncheckedKeys%5Battributes%5D%5B0%5D=a3' +
    '&postSwitchCategorizedUncheckedKeys%5Bparams%5D%5B0%5D=p3' +
    '&postSwitchCategorizedUncheckedKeys%5Bmetrics%5D%5B0%5D=m3' +
    '&postSwitchCategorizedUncheckedKeys%5Btags%5D%5B0%5D=t3';

  const wrapper = getExperimentPageMock();
  const { state } = wrapper.instance();
  expect(state.persistedState.searchInput).toEqual('c');
  expect(state.persistedState.lifecycleFilter).toEqual('lifecycle');
  expect(state.persistedState.modelVersionFilter).toEqual('With Model Versions');
  expect(state.persistedState.orderByKey).toEqual('d');
  expect(state.persistedState.orderByAsc).toEqual(false);
  expect(state.persistedState.startTime).toEqual('LAST_HOUR');
  expect(state.persistedState.diffSwitchSelected).toEqual(true);
  expect(state.persistedState.categorizedUncheckedKeys).toEqual({
    [COLUMN_TYPES.ATTRIBUTES]: ['a1'],
    [COLUMN_TYPES.PARAMS]: ['p1'],
    [COLUMN_TYPES.METRICS]: ['m1'],
    [COLUMN_TYPES.TAGS]: ['t1'],
  });
  expect(state.persistedState.preSwitchCategorizedUncheckedKeys).toEqual({
    [COLUMN_TYPES.ATTRIBUTES]: ['a2'],
    [COLUMN_TYPES.PARAMS]: ['p2'],
    [COLUMN_TYPES.METRICS]: ['m2'],
    [COLUMN_TYPES.TAGS]: ['t2'],
  });
  expect(state.persistedState.postSwitchCategorizedUncheckedKeys).toEqual({
    [COLUMN_TYPES.ATTRIBUTES]: ['a3'],
    [COLUMN_TYPES.PARAMS]: ['p3'],
    [COLUMN_TYPES.METRICS]: ['m3'],
    [COLUMN_TYPES.TAGS]: ['t3'],
  });
});

test('onClear clears all parameters', () => {
  const wrapper = getExperimentPageMock();
  const instance = wrapper.instance();
  const updateUrlWithViewStateSpy = jest.fn();
  instance.updateUrlWithViewState = updateUrlWithViewStateSpy;
  instance.setState({
    persistedState: new ExperimentPagePersistedState({
      searchInput: 'testing',
      orderByKey: 'test-key',
      orderByAsc: false,
      startTime: 'HOUR',
      lifecycleFilter: LIFECYCLE_FILTER.DELETED,
      modelVersionFilter: MODEL_VERSION_FILTER.WITH_MODEL_VERSIONS,
      categorizedUncheckedKeys: {},
      diffSwitchSelected: true,
      preSwitchCategorizedUncheckedKeys: {},
      postSwitchCategorizedUncheckedKeys: {},
    }).toJSON(),
  });

  instance.onClear();
  const { state } = instance;
  expect(updateUrlWithViewStateSpy).toHaveBeenCalledTimes(1);
  expect(state.persistedState.searchInput).toEqual('');
  expect(state.persistedState.lifecycleFilter).toEqual(DEFAULT_LIFECYCLE_FILTER);
  expect(state.persistedState.modelVersionFilter).toEqual(DEFAULT_MODEL_VERSION_FILTER);
  expect(state.persistedState.orderByKey).toBe(DEFAULT_ORDER_BY_KEY);
  expect(state.persistedState.orderByAsc).toEqual(DEFAULT_ORDER_BY_ASC);
  expect(state.persistedState.startTime).toEqual(DEFAULT_START_TIME);
  expect(state.persistedState.diffSwitchSelected).toEqual(DEFAULT_DIFF_SWITCH_SELECTED);
  expect(state.persistedState.categorizedUncheckedKeys).toEqual(DEFAULT_CATEGORIZED_UNCHECKED_KEYS);
  expect(state.persistedState.preSwitchCategorizedUncheckedKeys).toEqual(
    DEFAULT_CATEGORIZED_UNCHECKED_KEYS,
  );
  expect(state.persistedState.postSwitchCategorizedUncheckedKeys).toEqual(
    DEFAULT_CATEGORIZED_UNCHECKED_KEYS,
  );
});

test('should render permission denied view when getExperiment yields permission error', () => {
  const experimentPageInstance = getExperimentPageMock().instance();
  experimentPageInstance.setState({
    getExperimentRequestIds: [getUUID()],
    searchRunsRequestId: getUUID(),
  });
  const errorMessage = 'Access Denied';
  const responseErrorWrapper = new ErrorWrapper(
    `{"error_code": "${ErrorCodes.PERMISSION_DENIED}", "message": "${errorMessage}"}`,
    403,
  );
  const searchRunsErrorRequest = {
    id: experimentPageInstance.state.searchRunsRequestId,
    active: false,
    error: responseErrorWrapper,
  };
  const getExperimentErrorRequest = {
    id: experimentPageInstance.state.getExperimentRequestIds[0],
    active: false,
    error: responseErrorWrapper,
  };
  const wrapper = shallow(
    experimentPageInstance.renderExperimentView(false, true, [
      searchRunsErrorRequest,
      getExperimentErrorRequest,
    ]),
  );
  expect(wrapper.find('[data-testid="error-message"]').text()).toEqual(errorMessage);
});

test('should render experiment view when search error occurs', () => {
  const experimentPageInstance = getExperimentPageMock().instance();
  experimentPageInstance.setState({
    getExperimentRequestIds: [getUUID()],
    searchRunsRequestId: getUUID(),
  });
  const responseErrorWrapper = new ErrorWrapper(
    `{"error_code": "${ErrorCodes.INVALID_PARAMETER_VALUE}", "message": "Invalid"}`,
    400,
  );
  const searchRunsErrorRequest = {
    id: experimentPageInstance.state.searchRunsRequestId,
    active: false,
    error: responseErrorWrapper,
  };
  const getExperimentErrorRequest = {
    id: experimentPageInstance.state.getExperimentRequestIds[0],
    active: false,
  };
  const renderedView = shallow(
    <Router>
      {experimentPageInstance.renderExperimentView(false, true, [
        searchRunsErrorRequest,
        getExperimentErrorRequest,
      ])}
    </Router>,
  );
  expect(renderedView.find(ExperimentView)).toHaveLength(1);
});

test('should update next page token initially', async () => {
  const promise = Promise.resolve({ value: { next_page_token: 'token_1' } });
  getExperimentApi = jest.fn(() =>
    Promise.resolve({ action: { payload: { experiment: MOCK_EXPERIMENT } } }),
  );
  searchRunsApi = jest.fn(() => promise);
  const wrapper = await getExperimentPageMock();
  const instance = wrapper.instance();
  return promise.then(() => expect(instance.state.nextPageToken).toBe('token_1'));
});

test('should update next page token after load-more', () => {
  const promise = Promise.resolve({ value: { next_page_token: 'token_1' } });
  loadMoreRunsApi = jest.fn(() => promise);
  const wrapper = getExperimentPageMock();
  const instance = wrapper.instance();
  instance.handleLoadMoreRuns();
  return promise.then(() => expect(instance.state.nextPageToken).toBe('token_1'));
});

test('should update next page token to null when load-more response has no token', async () => {
  const promise1 = Promise.resolve({ value: { next_page_token: 'token_1' } });
  const promise2 = Promise.resolve({ value: {} });
  searchRunsApi = jest.fn(() => promise1);
  loadMoreRunsApi = jest.fn(() => promise2);
  const wrapper = await getExperimentPageMock();
  const instance = wrapper.instance();
  instance.handleLoadMoreRuns();
  return Promise.all([promise1, promise2]).then(() =>
    expect(instance.state.nextPageToken).toBe(null),
  );
});

test('should set state to default values on promise rejection when loading more', () => {
  loadMoreRunsApi = jest.fn(() => Promise.reject(new Error('loadMoreRuns rejected')));
  const wrapper = getExperimentPageMock();
  const instance = wrapper.instance();
  return Promise.resolve(instance.handleLoadMoreRuns()).then(() => {
    expect(instance.state.nextPageToken).toBe(PAGINATION_DEFAULT_STATE.nextPageToken);
    expect(instance.state.numRunsFromLatestSearch).toBe(
      PAGINATION_DEFAULT_STATE.numRunsFromLatestSearch,
    );
    expect(instance.state.loadingMore).toBe(PAGINATION_DEFAULT_STATE.loadingMore);
  });
});

test('should set state to default values on promise rejection onSearch', () => {
  const wrapper = getExperimentPageMock();
  const instance = wrapper.instance();
  return Promise.resolve(instance.onSearch({})).then(() => {
    expect(instance.state.nextPageToken).toBe(PAGINATION_DEFAULT_STATE.nextPageToken);
    expect(instance.state.numRunsFromLatestSearch).toBe(
      PAGINATION_DEFAULT_STATE.numRunsFromLatestSearch,
    );
    expect(instance.state.loadingMore).toBe(PAGINATION_DEFAULT_STATE.loadingMore);
  });
});

test('should nest children when filtering or sorting', () => {
  const wrapper = getExperimentPageMock();
  const instance = wrapper.instance();

  instance.setState(
    {
      persistedState: {
        orderByKey: null,
        searchInput: null,
      },
    },
    () => expect(instance.shouldNestChildrenAndFetchParents()).toBe(true),
  );
  instance.setState(
    {
      persistedState: {
        orderByKey: 'name',
        searchInput: null,
      },
    },
    () => expect(instance.shouldNestChildrenAndFetchParents()).toBe(false),
  );
  instance.setState(
    {
      persistedState: {
        orderByKey: null,
        searchInput: 'metrics.a > 1',
      },
    },
    () => expect(instance.shouldNestChildrenAndFetchParents()).toBe(false),
  );
  instance.setState(
    {
      persistedState: {
        orderByKey: 'name',
        searchInput: 'metrics.a > 1',
      },
    },
    () => expect(instance.shouldNestChildrenAndFetchParents()).toBe(false),
  );
  instance.setState(
    {
      persistedState: {
        orderByKey: ATTRIBUTE_COLUMN_SORT_KEY.DATE,
        searchInput: 'metrics.a > 1',
      },
    },
    () => expect(instance.shouldNestChildrenAndFetchParents()).toBe(true),
  );
  instance.setState(
    {
      persistedState: {
        orderByKey: ATTRIBUTE_COLUMN_SORT_KEY.DATE,
        searchInput: null,
      },
    },
    () => expect(instance.shouldNestChildrenAndFetchParents()).toBe(true),
  );
});

test('should return correct orderBy expression', () => {
  const wrapper = getExperimentPageMock();
  const instance = wrapper.instance();

  instance.setState(
    {
      persistedState: {
        orderByKey: 'key',
        orderByAsc: true,
      },
    },
    () => expect(instance.getOrderByExpr()).toEqual(['key ASC']),
  );
  instance.setState(
    {
      persistedState: {
        orderByKey: 'key',
        orderByAsc: false,
      },
    },
    () => expect(instance.getOrderByExpr()).toEqual(['key DESC']),
  );
  instance.setState(
    {
      persistedState: {
        orderByKey: '',
        orderByAsc: true,
      },
    },
    () => expect(instance.getOrderByExpr()).toEqual([]),
  );
  instance.setState(
    {
      persistedState: {
        orderByKey: null,
        orderByAsc: null,
      },
    },
    () => expect(instance.getOrderByExpr()).toEqual([]),
  );
});

test('handleGettingRuns chain functions should not change response', () => {
  const wrapper = getExperimentPageMock();
  const instance = wrapper.instance();

  const response = {
    value: {
      runs: [
        {
          info: {},
          data: {},
        },
      ],
    },
  };

  expect(instance.updateNextPageToken(response)).toEqual(response);
  expect(instance.updateNumRunsFromLatestSearch(response)).toEqual(response);
  expect(instance.fetchModelVersionsForRuns(response)).toEqual(response);
  expect(instance.updateCachedStartDate(response)).toEqual(response);
});

describe('updateNextPageToken', () => {
  it('should set loadingMore to false and update nextPageToken', () => {
    const wrapper = getExperimentPageMock();
    const instance = wrapper.instance();

    instance.updateNextPageToken({ value: { next_page_token: 'token' } });
    expect(instance.state.nextPageToken).toBe('token');
    expect(instance.state.loadingMore).toBe(false);
  });

  it('should set nextPageToken to null when not given one', () => {
    const wrapper = getExperimentPageMock();
    const instance = wrapper.instance();

    instance.updateNextPageToken({});
    expect(instance.state.nextPageToken).toBe(null);
    expect(instance.state.loadingMore).toBe(false);
  });
});

describe('updateCachedStartDate', () => {
  it('should set cachedStartTime when there is next page token', () => {
    const wrapper = getExperimentPageMock();
    const instance = wrapper.instance();

    const responseWithToken = { value: { next_page_token: 'token' } };
    const startDateFilter = 'attributes.start_time >= 100';

    instance.updateCachedStartDate(responseWithToken, startDateFilter);
    expect(instance.state.cachedStartTime).toBe(startDateFilter);
  });

  it('should set cachedStartTime to null when no next page token has been received', () => {
    const wrapper = getExperimentPageMock();
    const instance = wrapper.instance();

    const responseWithToken = { value: { next_page_token: null } };
    const startDateFilter = 'attributes.start_time >= 100';

    instance.updateCachedStartDate(responseWithToken, startDateFilter);
    expect(instance.state.cachedStartTime).toBe(null);
  });
});

describe('using cached startTime when requesting subsequent pages', () => {
  it('should use cached start time when fetching next page', async () => {
    // BEGIN-EDGE
    batchGetExperimentsApi = jest.fn(() => Promise.resolve({ action: { payload: {} } }));
    // END-EDGE
    let startTimeFilter;
    const wrapper = getExperimentPageMock();
    const instance = wrapper.instance();
    instance.setState({
      persistedState: new ExperimentPagePersistedState({
        startTime: 'LAST_24_HOURS',
      }).toJSON(),
    });

    const mockFirstRequestFn = jest.fn().mockImplementation(({ filter }) => {
      startTimeFilter = filter;
      return Promise.resolve({ value: { next_page_token: 'TOKEN' } });
    });

    await instance.handleGettingRuns(mockFirstRequestFn, instance.searchRunsApi);

    expect(mockFirstRequestFn).toBeCalledWith(
      expect.objectContaining({
        filter: expect.stringContaining('attributes.start_time'),
      }),
    );

    jest.advanceTimersByTime(5000);

    const mockNextPageRequestFn = jest.fn().mockResolvedValue({});

    await instance.handleGettingRuns(mockNextPageRequestFn, instance.searchRunsApi);

    expect(mockNextPageRequestFn).toBeCalledWith(
      expect.objectContaining({
        filter: startTimeFilter,
      }),
    );
  });
});

describe('updateNumRunsFromLatestSearch', () => {
  test('should update numRunsFromLatestSearch correctly', () => {
    const wrapper = getExperimentPageMock();
    const instance = wrapper.instance();

    const runs = Array(100).fill([{ info: {}, data: {} }]);
    instance.updateNumRunsFromLatestSearch({ value: { runs } });

    expect(instance.state.numRunsFromLatestSearch).toBe(100);
  });

  test('should not update if no runs', () => {
    const wrapper = getExperimentPageMock();
    const instance = wrapper.instance();
    instance.setState({ numRunsFromLatestSearch: 1 });
    instance.updateNumRunsFromLatestSearch({});
    expect(instance.state.numRunsFromLatestSearch).toBe(1);
    instance.updateNumRunsFromLatestSearch({ value: {} });
    expect(instance.state.numRunsFromLatestSearch).toBe(1);
  });
});

describe('fetchModelVersionsForRuns', () => {
  it('when given valid response, should call searchModelVersionsApi with correct arguments', () => {
    const wrapper = getExperimentPageMock();
    const instance = wrapper.instance();

    instance.fetchModelVersionsForRuns({
      value: {
        runs: [{ info: { run_id: '1' } }, { info: { run_id: '2' } }, { info: { run_id: '3' } }],
      },
    });

    expect(searchModelVersionsApi).toHaveBeenCalledWith(
      { run_id: ['1', '2', '3'] },
      instance.searchModelVersionsRequestId,
    );
  });

  it('should not call searchModelVersionsApi if invalid or no runs', () => {
    const wrapper = getExperimentPageMock();
    const instance = wrapper.instance();

    instance.fetchModelVersionsForRuns();
    instance.fetchModelVersionsForRuns({});
    instance.fetchModelVersionsForRuns({ value: {} });
    instance.fetchModelVersionsForRuns({ value: { runs: [] } });

    expect(searchModelVersionsApi).not.toHaveBeenCalled();
  });

  it('should chunk runs to searchModelVersions', () => {
    const wrapper = getExperimentPageMock();
    const instance = wrapper.instance();
    const runs = [...Array(MAX_RUNS_IN_SEARCH_MODEL_VERSIONS_FILTER + 1).keys()].map((run_id) => ({
      info: { run_id },
      data: {},
    }));

    instance.fetchModelVersionsForRuns({ value: { runs } });

    expect(searchModelVersionsApi).toHaveBeenCalledTimes(2);
  });
});

describe('handleGettingRuns', () => {
  it('should call updateNextPageToken, updateNumRunsFromLatestSearch, fetchModelVersionsForRuns', () => {
    const wrapper = getExperimentPageMock();
    const instance = wrapper.instance();
    instance.updateCachedStartDate = jest.fn();
    instance.updateNextPageToken = jest.fn();
    instance.updateNumRunsFromLatestSearch = jest.fn();
    instance.fetchModelVersionsForRuns = jest.fn();

    return Promise.resolve(
      instance.handleGettingRuns(() => Promise.resolve(), instance.searchRunsApi),
    ).then(() => {
      expect(instance.updateCachedStartDate).toHaveBeenCalled();
      expect(instance.updateNextPageToken).toHaveBeenCalled();
      expect(instance.updateNumRunsFromLatestSearch).toHaveBeenCalled();
      expect(instance.fetchModelVersionsForRuns).toHaveBeenCalled();
    });
  });
});

test('lifecycleFilterToRunViewType', () => {
  expect(lifecycleFilterToRunViewType('Active')).toBe('ACTIVE_ONLY');
  expect(lifecycleFilterToRunViewType('Deleted')).toBe('DELETED_ONLY');
});

describe('pollInfo', () => {
  test('Should be called every POLL_INTERVAL', () => {
    const instance = getExperimentPageMock().instance();
    instance.pollInfo = jest.fn();

    jest.advanceTimersByTime(POLL_INTERVAL - 1);
    expect(instance.pollInfo).toHaveBeenCalledTimes(0);
    jest.advanceTimersByTime(1);
    expect(instance.pollInfo).toHaveBeenCalledTimes(1);
    jest.advanceTimersByTime(POLL_INTERVAL);
    expect(instance.pollInfo).toHaveBeenCalledTimes(2);
  });

  test('Should not be called after unmount', async () => {
    // BEGIN-EDGE
    // Return no experiments to ensure searchRunsApi is not
    // called, ensuring no promises are initiated. Use of
    // "this" with promise handlers in conjunction with
    // unmount is problematic.
    // See https://github.com/enzymejs/enzyme/issues/2278#issuecomment-548657195
    batchGetExperimentsApi = jest.fn(() => Promise.resolve());
    // END-EDGE
    const wrapper = getExperimentPageMock();
    const instance = wrapper.instance();
    instance.pollInfo = jest.fn();
    await instance.pollInfo();

    wrapper.unmount();
    jest.advanceTimersByTime(POLL_INTERVAL);
    expect(instance.pollInfo).toHaveBeenCalledTimes(1);
    jest.advanceTimersByTime(POLL_INTERVAL);
    expect(instance.pollInfo).toHaveBeenCalledTimes(1);
    jest.advanceTimersByTime(POLL_INTERVAL * 100);
    expect(instance.pollInfo).toHaveBeenCalledTimes(1);
  });

  test('pollNewRuns is called if newRuns is true', async () => {
    const instance = getExperimentPageMock().instance();
    instance.pollNewRuns = jest.fn();

    expect(instance.state.pollingState.newRuns).toEqual(true);
    await instance.pollInfo();
    expect(instance.pollNewRuns).toHaveBeenCalledTimes(1);
  });

  test('pollNewRuns is not called if newRuns is false', () => {
    const instance = getExperimentPageMock().instance();
    instance.pollNewRuns = jest.fn();

    instance.setState(
      {
        pollingState: {
          newRuns: false,
        },
      },
      async () => {
        await instance.pollInfo();
        expect(instance.pollNewRuns).toHaveBeenCalledTimes(0);
      },
    );
  });
  // BEGIN-EDGE

  test('pollAutoMLEvaluationMetric is called if autoMLEvaluationMetric is true', async () => {
    jest.spyOn(ExperimentPage.prototype, 'loadData').mockImplementationOnce(() => {});
    const instance = getExperimentPageMock().instance();
    instance.shouldRenderAutoMLExperimentPanel = () => true;
    instance.pollAutoMLEvaluationMetric = jest.fn();

    expect(instance.state.pollingState.autoMLEvaluationMetric).toEqual(true);
    expect(instance.pollAutoMLEvaluationMetric).toHaveBeenCalledTimes(0);
    await instance.pollInfo();
    expect(instance.pollAutoMLEvaluationMetric).toHaveBeenCalledTimes(1);
  });

  test('pollAutoMLEvaluationMetric is not called if autoMLEvaluationMetric is false', async () => {
    jest.spyOn(ExperimentPage.prototype, 'loadData').mockImplementationOnce(() => {});
    location.search = 'orderByKey=d'; // Given orderByKey in url, autoMLEvaluationMetric is set to false
    const instance = getExperimentPageMock().instance();
    instance.shouldRenderAutoMLExperimentPanel = () => true;
    instance.pollAutoMLEvaluationMetric = jest.fn();

    expect(instance.state.pollingState.autoMLEvaluationMetric).toEqual(false);
    await instance.pollInfo();
    expect(instance.pollAutoMLEvaluationMetric).toHaveBeenCalledTimes(0);
  });
  // END-EDGE
});

describe('pollNewRuns', () => {
  describe('newRuns state', () => {
    const maxNewRuns = [];
    for (let i = 0; i < MAX_DETECT_NEW_RUNS_RESULTS; i++) {
      maxNewRuns.push({ info: { start_time: Date.now() + 10000 } });
    }

    test('Should set pollingState.newRuns to false if there are already max new runs', async () => {
      const mockSearchForNewRuns = jest.fn(() => Promise.resolve({ runs: maxNewRuns }));
      const instance = getExperimentPageMock({
        searchForNewRuns: mockSearchForNewRuns,
      }).instance();

      expect(mockSearchForNewRuns).toHaveBeenCalledTimes(0);
      await instance.pollNewRuns();
      expect(mockSearchForNewRuns).toHaveBeenCalledTimes(1);
      expect(instance.state.pollingState.newRuns).toEqual(false);
      jest.advanceTimersByTime(POLL_INTERVAL * 100);
      expect(mockSearchForNewRuns).toHaveBeenCalledTimes(1);
    });

    test('Should set pollingState.newRuns to true if a new search is triggered', async () => {
      const mockSearchForNewRuns = jest.fn(() => Promise.resolve({ runs: maxNewRuns }));
      const instance = getExperimentPageMock({
        searchForNewRuns: mockSearchForNewRuns,
      }).instance();

      await instance.pollNewRuns();
      expect(mockSearchForNewRuns).toHaveBeenCalledTimes(1);
      expect(instance.state.pollingState.newRuns).toEqual(false);

      await instance.onSearch();
      expect(instance.state.pollingState.newRuns).toEqual(true);
    });
  });

  describe('numberOfNewRuns state', () => {
    test('numberOfNewRuns should be 0 be default', () => {
      const instance = getExperimentPageMock().instance();
      expect(instance.state.numberOfNewRuns).toEqual(0);
    });

    test('numberOfNewRuns should be 0 if no new runs', async () => {
      const instance = getExperimentPageMock({
        searchForNewRuns: () => Promise.resolve({ runs: [] }),
      }).instance();

      await instance.pollNewRuns();
      expect(instance.state.numberOfNewRuns).toEqual(0);
    });

    test('Should update numberOfNewRuns correctly', async () => {
      const mockSearchForNewRuns = jest.fn(() =>
        Promise.resolve({
          runs: [
            {
              info: {
                start_time: Date.now() + 10000,
              },
            },
            {
              info: {
                end_time: Date.now() + 10000,
              },
            },
            {
              info: {
                end_time: 0,
              },
            },
          ],
        }),
      );

      const instance = getExperimentPageMock({
        searchForNewRuns: mockSearchForNewRuns,
      }).instance();

      await instance.pollNewRuns();
      expect(instance.state.numberOfNewRuns).toEqual(2);
    });

    test('Should not explode if no runs', async () => {
      const instance = getExperimentPageMock().instance();

      await instance.pollNewRuns();
      expect(instance.state.numberOfNewRuns).toEqual(0);
    });
  });
});

describe('isNewRun', () => {
  test('should return false if run undefined', () => {
    expect(isNewRun(2, undefined)).toEqual(false);
  });

  test('should return false if run info undefined', () => {
    expect(isNewRun(2, {})).toEqual(false);
  });

  test('should return false if start time and end time undefined', () => {
    expect(
      isNewRun(2, {
        info: {},
      }),
    ).toEqual(false);
  });

  test('should return false if start time and end time are < lastRunsRefreshTime', () => {
    expect(
      isNewRun(2, {
        info: {
          start_time: 1,
          end_time: 1,
        },
      }),
    ).toEqual(false);
  });

  test('should return false if start time < lastRunsRefreshTime and end time is 0', () => {
    expect(
      isNewRun(2, {
        info: {
          start_time: 1,
          end_time: 0,
        },
      }),
    ).toEqual(false);
  });

  test('should return true if start time >= lastRunsRefreshTime', () => {
    expect(
      isNewRun(1, {
        info: {
          start_time: 1,
          end_time: 0,
        },
      }),
    ).toEqual(true);
  });

  test('should return true if end time not 0 and <= lastRunsRefreshTime', () => {
    expect(
      isNewRun(2, {
        info: {
          start_time: 1,
          end_time: 3,
        },
      }),
    ).toEqual(true);
  });
});
// BEGIN-EDGE

describe('autoML', () => {
  beforeEach(() => {
    location = { search: '' };
  });

  const getAutoMLExperimentPageInstance = () => {
    const automlTag = { key: AUTOML_TAG_PREFIX, value: 'True' }; // cast from python string
    const automlEvaluationMetricTag = {
      key: `${AUTOML_TAG_PREFIX}.evaluation_metric`,
      value: 'val_f1_score',
    };
    const automlStartTimeOverriddenTag = {
      key: `${AUTOML_TAG_PREFIX}.start_time`,
      value: 1000,
    };
    const evalMetricAscOverriddenTag = {
      key: `${AUTOML_TAG_PREFIX}.evaluation_metric_order_by_asc`,
      value: 'False',
    };
    const problemTypeOveriddenTag = {
      key: `${AUTOML_TAG_PREFIX}.problem_type`,
      value: 'classification',
    };
    const errorMessageOverriddenTag = {
      key: `${AUTOML_TAG_PREFIX}.error_message`,
      value: 'some error message',
    };
    const automlWarningTag = {
      key: `${AUTOML_WARNING_PREFIX}.${WARNING_NAMES.unsupportedFeatureCols}`,
      value: JSON.stringify({
        version: 1,
        severity: 'medium',
        affected: [{ id: 'this' }, { id: 'is' }, { id: 'sparta' }],
      }),
    };
    const automlDeprecatedWarningTag = {
      key: `${AUTOML_WARNING_PREFIX_DEPRECATED}.${WARNING_NAMES.unsupportedTargetType}`,
      value: JSON.stringify({
        version: 1,
        severity: 'high',
        affected: [{ id: 'this' }, { id: 'is' }, { id: 'patrick' }],
      }),
    };

    const someNonAutoMLTag = { key: 'some', value: 'thing' };
    const wrapper = getExperimentPageMock({
      experiments: [
        Fixtures.createExperiment({
          tags: [
            automlTag,
            automlEvaluationMetricTag,
            automlStartTimeOverriddenTag,
            evalMetricAscOverriddenTag,
            problemTypeOveriddenTag,
            errorMessageOverriddenTag,
            automlWarningTag,
            automlDeprecatedWarningTag,
            someNonAutoMLTag,
          ],
        }),
      ],
    });

    return wrapper.instance();
  };

  test('getAutoMLExperimentData returns correct data', () => {
    const instance = getAutoMLExperimentPageInstance();
    expect(instance.getAutoMLExperimentData()).toEqual({
      automl: 'True',
      evaluationMetric: 'val_f1_score',
      problemType: 'CLASSIFICATION',
      startTimeSeconds: 1000,
      evaluationMetricHigherIsBetter: true,
      jobRunErrorMessage: 'some error message',
      warnings: [
        {
          name: WARNING_NAMES.unsupportedFeatureCols,
          version: 1,
          severity: 'MEDIUM',
          affected: [{ id: 'this' }, { id: 'is' }, { id: 'sparta' }],
        },
        {
          name: WARNING_NAMES.unsupportedTargetType,
          version: 1,
          severity: 'HIGH',
          affected: [{ id: 'this' }, { id: 'is' }, { id: 'patrick' }],
        },
      ],
    });
  });

  test('getAutoMLExperimentData returns empty when service is enabled', () => {
    /* eslint-disable no-restricted-globals */
    top.settings = {
      ...top.settings,
      autoMLServiceAPIUsed: true,
    };

    const instance = getAutoMLExperimentPageInstance();
    expect(instance.getAutoMLExperimentData()).toEqual(null);
  });

  test('getAutoMLExperimentData returns data when service is not enabled', () => {
    const instance = getAutoMLExperimentPageInstance();
    expect(instance.getAutoMLExperimentData()).not.toEqual(null);
  });

  test('getAutoMLEvaluationMetricData returns data when service is enabled', () => {
    /* eslint-disable no-restricted-globals */
    top.settings = {
      ...top.settings,
      autoMLServiceAPIUsed: true,
    };

    const instance = getAutoMLExperimentPageInstance();
    expect(instance.getAutoMLEvaluationMetricData()).toEqual({
      evaluationMetric: 'val_f1_score',
      evaluationMetricOrderByAsc: 'False',
    });
  });

  describe('AutoML warning tags', () => {
    test('should not throw if warning tag value is not a json', () => {
      const wrapper = getExperimentPageMock({
        experiments: [
          Fixtures.createExperiment({
            tags: [
              {
                key: `${AUTOML_WARNING_PREFIX_DEPRECATED}.${WARNING_NAMES.unsupportedTargetType}`,
                value: '([{])} definitely not a json!',
              },
            ],
          }),
        ],
      });
      const instance = wrapper.instance();

      expect(() => instance.getAutoMLExperimentData()).not.toThrow();
    });

    test('should not include warnings with invalid names', () => {
      const instance = getExperimentPageMock({
        experiments: [
          Fixtures.createExperiment({
            tags: [
              {
                key: AUTOML_TAG_PREFIX,
                value: 'true',
              },
              {
                key: `${AUTOML_WARNING_PREFIX_DEPRECATED}.not_a_valid_alert`,
                value: JSON.stringify({}),
              },
            ],
          }),
        ],
      }).instance();
      expect(instance.getAutoMLExperimentData()).toEqual({ automl: 'true', warnings: [] });
    });
  });

  test('shouldRenderAutoMLExperimentPanel true if flag enabled AND tag exists', () => {
    jest.spyOn(DatabricksUtils, 'autoMLEnabled').mockImplementation(() => true);
    const instances = [
      getAutoMLExperimentPageInstance(),
      getExperimentPageMock({
        experiments: [
          Fixtures.createExperiment({
            name: 'mypath/expName',
            tags: [{ key: AUTOML_TAG_PREFIX, value: 'true' }],
          }),
        ],
      }).instance(),
      getExperimentPageMock({
        experiments: [
          Fixtures.createExperiment({
            name: 'mypath/expName',
            tags: [{ key: AUTOML_TAG_PREFIX, value: 'True' }],
          }),
        ],
      }).instance(),
      getExperimentPageMock({
        experiments: [
          Fixtures.createExperiment({
            name: 'mypath/expName',
            tags: [{ key: AUTOML_TAG_PREFIX, value: 'anything, really' }],
          }),
        ],
      }).instance(),
      getExperimentPageMock({
        experiments: [
          Fixtures.createExperiment({
            name: 'mypath/expName',
            tags: [{ key: AUTOML_TAG_PREFIX, value: '' }],
          }),
        ],
      }).instance(),
      getExperimentPageMock({
        experiments: [
          Fixtures.createExperiment({
            name: 'mypath/expName',
            tags: [{ key: AUTOML_TAG_PREFIX }],
          }),
        ],
      }).instance(),
    ];
    for (const instance of instances) {
      expect(instance.shouldRenderAutoMLExperimentPanel()).toEqual(true);
    }
  });

  test('shouldRenderAutoMLExperimentPanel false if flag disabled AND tag exists', () => {
    jest.spyOn(DatabricksUtils, 'autoMLEnabled').mockImplementation(() => false);
    const instance = getAutoMLExperimentPageInstance();
    expect(instance.shouldRenderAutoMLExperimentPanel()).toEqual(false);
  });

  test('shouldRenderAutoMLExperimentPanel false if flag enabled AND no automl tags', () => {
    jest.spyOn(DatabricksUtils, 'autoMLEnabled').mockImplementation(() => true);
    const instance = getExperimentPageMock({
      experiments: [
        Fixtures.createExperiment({
          name: 'mypath/expName',
          tags: [{ key: 'mlflow.experimentType', value: 'MLFLOW_EXPERIMENT' }],
        }),
      ],
    }).instance();
    expect(instance.shouldRenderAutoMLExperimentPanel()).toEqual(false);
  });

  test('shouldRenderAutoMLExperimentPanel false if flag disabled AND no automl tags', () => {
    jest.spyOn(DatabricksUtils, 'autoMLEnabled').mockImplementation(() => false);
    const instance = getExperimentPageMock({
      experiments: [
        Fixtures.createExperiment({
          name: 'mypath/expName',
          tags: [{ key: 'mlflow.experimentType', value: 'MLFLOW_EXPERIMENT' }],
        }),
      ],
    }).instance();
    expect(instance.shouldRenderAutoMLExperimentPanel()).toEqual(false);
  });

  test('shouldRenderAutoMLExperimentPanel false if flag enabled AND given exp with no tags', () => {
    jest.spyOn(DatabricksUtils, 'autoMLEnabled').mockImplementation(() => true);
    const instance = getExperimentPageMock({
      experiments: [
        Fixtures.createExperiment({
          name: 'mypath/expName',
        }),
      ],
    }).instance();
    expect(instance.shouldRenderAutoMLExperimentPanel()).toEqual(false);
  });

  test('shouldRenderAutoMLExperimentPanel false if flag enabled AND some other autoML tag exists', () => {
    jest.spyOn(DatabricksUtils, 'autoMLEnabled').mockImplementation(() => true);
    const instance = getExperimentPageMock({
      experiments: [
        Fixtures.createExperiment({
          name: 'mypath/expName',
          tags: [{ key: `${AUTOML_TAG_PREFIX}.something`, value: 'True' }],
        }),
      ],
    }).instance();
    expect(instance.shouldRenderAutoMLExperimentPanel()).toEqual(false);
  });

  test('should call pollAutoMLEvaluationMetric if shouldRenderAutoMLExperimentPanel true', () => {
    const instance = getAutoMLExperimentPageInstance();
    instance.shouldRenderAutoMLExperimentPanel = () => true;
    instance.pollAutoMLEvaluationMetric = jest.fn();
    return instance.loadData().then(() => {
      expect(instance.pollAutoMLEvaluationMetric).toHaveBeenCalled();
    });
  });

  test('should not call pollAutoMLEvaluationMetric if shouldRenderAutoMLExperimentPanel false', () => {
    const instance = getAutoMLExperimentPageInstance();
    instance.shouldRenderAutoMLExperimentPanel = () => false;
    instance.pollAutoMLEvaluationMetric = jest.fn();
    return instance.loadData().then(() => {
      expect(instance.pollAutoMLEvaluationMetric).toHaveBeenCalledTimes(0);
    });
  });

  test('pollingState.autoMLEvaluationMetric is initialized to true without any URL params', () => {
    const wrapper = getExperimentPageMock();
    const { state } = wrapper.instance();
    expect(state.pollingState.autoMLEvaluationMetric).toEqual(true);
  });

  test('pollingState.autoMLEvaluationMetric is initialized to false with orderByKey set in URL params', () => {
    location.search = 'orderByKey=d';
    const wrapper = getExperimentPageMock();
    const { state } = wrapper.instance();
    expect(state.pollingState.autoMLEvaluationMetric).toEqual(false);
  });

  test(
    'pollAutoMLEvaluationMetric updates state when evaluationMetric exists and ' +
      'pollingState.autoMLEvaluationMetric is true',
    () => {
      const instance = getAutoMLExperimentPageInstance();
      instance.pollAutoMLEvaluationMetric();
      expect(instance.state.persistedState.orderByKey).toEqual('metrics.`val_f1_score`');
      expect(instance.state.persistedState.orderByAsc).toEqual(false);
      expect(instance.state.pollingState.autoMLEvaluationMetric).toEqual(false);
    },
  );

  test('pollAutoMLEvaluationMetric does not update state until evaluationMetric exists', () => {
    const instance = getAutoMLExperimentPageInstance();
    instance.getAutoMLEvaluationMetricData = () => ({});

    const { state } = instance;
    instance.pollAutoMLEvaluationMetric();
    expect(instance.state).toEqual(state);

    instance.getAutoMLEvaluationMetricData = () => ({
      evaluationMetric: 'val_f1_score',
      evaluationMetricOrderByAsc: null,
    });
    instance.pollAutoMLEvaluationMetric();
    expect(instance.state.persistedState.orderByKey).toEqual('metrics.`val_f1_score`');
    expect(instance.state.persistedState.orderByAsc).toEqual(false);
    expect(instance.state.pollingState.autoMLEvaluationMetric).toEqual(false);
  });

  test(
    'pollAutoMLEvaluationMetric does not update state ' +
      'when pollingState.autoMLEvaluationMetric is false',
    () => {
      location.search = 'orderByKey=d'; // Given orderByKey in url, autoMLEvaluationMetric is set to false
      const instance = getAutoMLExperimentPageInstance();
      const { state } = instance;
      instance.pollAutoMLEvaluationMetric();
      expect(instance.state).toEqual(state);
    },
  );
});
// END-EDGE

describe('startTime select filters out the experiment runs correctly', () => {
  test('should get startTime expr for the filter query generated correctly', () => {
    const wrapper = getExperimentPageMock();
    const instance = wrapper.instance();

    instance.setState(
      {
        persistedState: new ExperimentPagePersistedState({
          startTime: '',
        }).toJSON(),
      },
      () => expect(instance.getStartTimeExpr()).toBe(null),
    );

    instance.setState(
      {
        persistedState: new ExperimentPagePersistedState({
          startTime: undefined,
        }).toJSON(),
      },
      () => expect(instance.getStartTimeExpr()).toBe(null),
    );

    instance.setState(
      {
        persistedState: new ExperimentPagePersistedState({
          startTime: 'ALL',
        }).toJSON(),
      },
      () => expect(instance.getStartTimeExpr()).toBe(null),
    );

    instance.setState(
      {
        persistedState: new ExperimentPagePersistedState({
          startTime: 'LAST_24_HOURS',
        }).toJSON(),
      },
      () => expect(instance.getStartTimeExpr()).toMatch('attributes.start_time'),
    );
  });

  test('handleGettingRuns correctly generates the filter string', () => {
    const wrapper = getExperimentPageMock();
    const instance = wrapper.instance();
    const getRunsAction = jest.fn(() => Promise.resolve());
    const requestId = '123';

    instance.setState(
      {
        persistedState: {
          startTime: '',
          searchInput: 'metrics.met > 0',
        },
      },
      () => {
        instance.handleGettingRuns(getRunsAction, requestId);
        expect(getRunsAction).toHaveBeenCalledWith(
          expect.objectContaining({
            filter: 'metrics.met > 0',
          }),
        );
      },
    );

    instance.setState(
      {
        persistedState: {
          startTime: 'ALL',
          searchInput: 'metrics.met > 0',
        },
      },
      () => {
        instance.handleGettingRuns(getRunsAction, requestId);
        expect(getRunsAction).toHaveBeenCalledWith(
          expect.objectContaining({
            filter: 'metrics.met > 0',
          }),
        );
      },
    );

    instance.setState(
      {
        persistedState: {
          startTime: 'LAST_HOUR_FAKE',
          searchInput: 'metrics.met > 0',
        },
      },
      () => {
        instance.handleGettingRuns(getRunsAction, requestId);
        expect(getRunsAction).toHaveBeenCalledWith(
          expect.objectContaining({
            filter: 'metrics.met > 0',
          }),
        );
      },
    );

    instance.setState(
      {
        persistedState: {
          startTime: 'LAST_HOUR',
          searchInput: 'metrics.met > 0',
        },
      },
      () => {
        instance.handleGettingRuns(getRunsAction, requestId);
        expect(getRunsAction).toHaveBeenCalledWith(
          expect.objectContaining({
            filter: expect.stringMatching('metrics.met > 0 and attributes.start_time'),
          }),
        );
      },
    );
  });
});

function expectSearchState(historyEntry, searchQueryParams) {
  const expectedPrefix = BASE_PATH + '?';
  expect(historyEntry.startsWith(expectedPrefix)).toBe(true);
  const search = historyEntry.substring(expectedPrefix.length);
  expect(Utils.getSearchParamsFromUrl(search)).toEqual(searchQueryParams);
}
// BEGIN-EDGE
test('post message is sent in showDeleteModal', () => {
  UniverseFrontendApis.deleteExperiment.mockResolvedValue();
  const experimentParams = {
    name: 'mypath/expName',
    tags: [{ key: 'mlflow.experimentType', value: 'MLFLOW_EXPERIMENT' }],
  };
  const wrapper = getExperimentPageMock({
    experiments: [Fixtures.createExperiment(experimentParams)],
  });
  wrapper.instance().showDeleteModal();
  expect(UniverseFrontendApis.deleteExperiment).toHaveBeenCalledTimes(1);
  expect(UniverseFrontendApis.deleteExperiment).toHaveBeenCalledWith({
    id: EXPERIMENT_ID,
    name: 'expName',
    fullLocation: experimentParams.name,
    experimentType: experimentParams.tags[0].value,
  });
});
// END-EDGE

describe('updateUrlWithViewState', () => {
  const emptyCategorizedUncheckedKeys = {
    [COLUMN_TYPES.ATTRIBUTES]: [''],
    [COLUMN_TYPES.PARAMS]: [''],
    [COLUMN_TYPES.METRICS]: [''],
    [COLUMN_TYPES.TAGS]: [''],
  };
  const defaultParameters = {
    searchInput: '',
    lifecycleFilter: DEFAULT_LIFECYCLE_FILTER,
    modelVersionFilter: DEFAULT_MODEL_VERSION_FILTER,
    orderByKey: DEFAULT_ORDER_BY_KEY,
    orderByAsc: DEFAULT_ORDER_BY_ASC,
    startTime: DEFAULT_START_TIME,
    categorizedUncheckedKeys: DEFAULT_CATEGORIZED_UNCHECKED_KEYS,
    diffSwitchSelected: DEFAULT_DIFF_SWITCH_SELECTED,
    preSwitchCategorizedUncheckedKeys: DEFAULT_CATEGORIZED_UNCHECKED_KEYS,
    postSwitchCategorizedUncheckedKeys: DEFAULT_CATEGORIZED_UNCHECKED_KEYS,
  };
  let wrapper;
  let instance;
  beforeEach(() => {
    localStorage.clear();
    wrapper = getExperimentPageMock({
      history: history,
    });
    instance = wrapper.instance();
  });

  test('updateUrlWithViewState updates URL correctly with default params', () => {
    const {
      searchInput,
      orderByKey,
      orderByAsc,
      startTime,
      lifecycleFilter,
      modelVersionFilter,
      diffSwitchSelected,
    } = defaultParameters;

    instance.updateUrlWithViewState();

    expectSearchState(history.push.mock.calls[0][0], {
      searchInput,
      orderByKey,
      orderByAsc,
      startTime,
      lifecycleFilter,
      modelVersionFilter,
      categorizedUncheckedKeys: emptyCategorizedUncheckedKeys,
      diffSwitchSelected,
      preSwitchCategorizedUncheckedKeys: emptyCategorizedUncheckedKeys,
      postSwitchCategorizedUncheckedKeys: emptyCategorizedUncheckedKeys,
    });
  });

  test('updateUrlWithViewState updates URL correctly with orderByAsc true', () => {
    instance.setState({
      persistedState: new ExperimentPagePersistedState({
        orderByAsc: true,
      }).toJSON(),
    });

    const {
      searchInput,
      orderByKey,
      startTime,
      lifecycleFilter,
      modelVersionFilter,
      diffSwitchSelected,
    } = defaultParameters;

    instance.updateUrlWithViewState();

    expectSearchState(history.push.mock.calls[0][0], {
      searchInput,
      orderByKey,
      orderByAsc: true,
      startTime,
      lifecycleFilter,
      modelVersionFilter,
      categorizedUncheckedKeys: emptyCategorizedUncheckedKeys,
      diffSwitchSelected,
      preSwitchCategorizedUncheckedKeys: emptyCategorizedUncheckedKeys,
      postSwitchCategorizedUncheckedKeys: emptyCategorizedUncheckedKeys,
    });
  });

  test('updateUrlWithViewState updates URL correctly with lifecycle & model filter', () => {
    instance.setState({
      persistedState: new ExperimentPagePersistedState({
        lifecycleFilter: 'life',
        modelVersionFilter: 'model',
      }).toJSON(),
    });

    const { searchInput, orderByKey, orderByAsc, startTime, diffSwitchSelected } =
      defaultParameters;

    instance.updateUrlWithViewState();

    expectSearchState(history.push.mock.calls[0][0], {
      searchInput,
      orderByKey,
      orderByAsc,
      startTime,
      lifecycleFilter: 'life',
      modelVersionFilter: 'model',
      categorizedUncheckedKeys: emptyCategorizedUncheckedKeys,
      diffSwitchSelected,
      preSwitchCategorizedUncheckedKeys: emptyCategorizedUncheckedKeys,
      postSwitchCategorizedUncheckedKeys: emptyCategorizedUncheckedKeys,
    });
  });

  test('updateUrlWithViewState updates URL correctly with searchInput', () => {
    instance.setState({
      persistedState: new ExperimentPagePersistedState({
        searchInput: 'search-value',
      }).toJSON(),
    });

    const {
      orderByKey,
      orderByAsc,
      startTime,
      lifecycleFilter,
      modelVersionFilter,
      diffSwitchSelected,
    } = defaultParameters;

    instance.updateUrlWithViewState();

    expectSearchState(history.push.mock.calls[0][0], {
      searchInput: 'search-value',
      orderByKey,
      orderByAsc,
      startTime,
      lifecycleFilter,
      modelVersionFilter,
      categorizedUncheckedKeys: emptyCategorizedUncheckedKeys,
      diffSwitchSelected,
      preSwitchCategorizedUncheckedKeys: emptyCategorizedUncheckedKeys,
      postSwitchCategorizedUncheckedKeys: emptyCategorizedUncheckedKeys,
    });
  });

  test('updateUrlWithViewState updates URL correctly with diffSwitchSelected true', () => {
    const categorizedUncheckedKeys = {
      [COLUMN_TYPES.ATTRIBUTES]: ['a1'],
      [COLUMN_TYPES.PARAMS]: ['p1'],
      [COLUMN_TYPES.METRICS]: ['m1'],
      [COLUMN_TYPES.TAGS]: ['t1'],
    };

    const preSwitchCategorizedUncheckedKeys = {
      [COLUMN_TYPES.ATTRIBUTES]: ['a2'],
      [COLUMN_TYPES.PARAMS]: ['p2'],
      [COLUMN_TYPES.METRICS]: ['m2'],
      [COLUMN_TYPES.TAGS]: ['t2'],
    };

    const postSwitchCategorizedUncheckedKeys = {
      [COLUMN_TYPES.ATTRIBUTES]: ['a3'],
      [COLUMN_TYPES.PARAMS]: ['p3'],
      [COLUMN_TYPES.METRICS]: ['m3'],
      [COLUMN_TYPES.TAGS]: ['t3'],
    };

    instance.setState({
      persistedState: new ExperimentPagePersistedState({
        diffSwitchSelected: true,
        categorizedUncheckedKeys: categorizedUncheckedKeys,
        preSwitchCategorizedUncheckedKeys: preSwitchCategorizedUncheckedKeys,
        postSwitchCategorizedUncheckedKeys: postSwitchCategorizedUncheckedKeys,
      }).toJSON(),
    });

    const { searchInput, orderByKey, orderByAsc, startTime, lifecycleFilter, modelVersionFilter } =
      defaultParameters;

    instance.updateUrlWithViewState();

    expectSearchState(history.push.mock.calls[0][0], {
      searchInput,
      orderByKey,
      orderByAsc,
      startTime,
      lifecycleFilter,
      modelVersionFilter,
      categorizedUncheckedKeys: categorizedUncheckedKeys,
      diffSwitchSelected: true,
      preSwitchCategorizedUncheckedKeys: preSwitchCategorizedUncheckedKeys,
      postSwitchCategorizedUncheckedKeys: postSwitchCategorizedUncheckedKeys,
    });
  });
});

describe('filtersDidUpdate', () => {
  let wrapper;
  let instance;
  let prevState;
  beforeEach(() => {
    localStorage.clear();
    wrapper = getExperimentPageMock();
    instance = wrapper.instance();
    prevState = {
      persistedState: {
        searchInput: '',
        orderByKey: DEFAULT_ORDER_BY_KEY,
        orderByAsc: DEFAULT_ORDER_BY_ASC,
        startTime: DEFAULT_START_TIME,
        lifecycleFilter: DEFAULT_LIFECYCLE_FILTER,
        modelVersionFilter: DEFAULT_MODEL_VERSION_FILTER,
      },
    };
  });
  test('filtersDidUpdate returns true when filters were not updated', () => {
    expect(instance.filtersDidUpdate(prevState)).toEqual(false);
  });

  test('filtersDidUpdate returns false when searchinput was updated', () => {
    prevState.persistedState.searchInput = 'updated';
    expect(instance.filtersDidUpdate(prevState)).toEqual(true);
  });

  test('filtersDidUpdate returns false when orderByKey was updated', () => {
    prevState.persistedState.orderByKey = 'updated';
    expect(instance.filtersDidUpdate(prevState)).toEqual(true);
  });

  test('filtersDidUpdate returns false when orderByAsc was updated', () => {
    prevState.persistedState.orderByAsc = 'updated';
    expect(instance.filtersDidUpdate(prevState)).toEqual(true);
  });

  test('filtersDidUpdate returns false when startTime was updated', () => {
    prevState.persistedState.startTime = 'updated';
    expect(instance.filtersDidUpdate(prevState)).toEqual(true);
  });

  test('filtersDidUpdate returns false when lifecycleFilter was updated', () => {
    prevState.persistedState.lifecycleFilter = 'updated';
    expect(instance.filtersDidUpdate(prevState)).toEqual(true);
  });

  test('filtersDidUpdate returns false when modelVersionFilter was updated', () => {
    prevState.persistedState.modelVersionFilter = 'updated';
    expect(instance.filtersDidUpdate(prevState)).toEqual(true);
  });
});

describe('handleColumnSelectionCheck', () => {
  test('handleColumnSelectionCheck sets state correctly', () => {
    const wrapper = getExperimentPageMock();
    const instance = wrapper.instance();
    const updateUrlWithViewStateSpy = jest.fn();
    const snapshotComponentStateSpy = jest.fn();
    instance.updateUrlWithViewState = updateUrlWithViewStateSpy;
    instance.snapshotComponentState = snapshotComponentStateSpy;
    instance.handleColumnSelectionCheck({
      key: 'value',
    });
    expect(instance.state.persistedState.categorizedUncheckedKeys).toEqual({
      key: 'value',
    });
    expect(updateUrlWithViewStateSpy).toHaveBeenCalledTimes(1);
    expect(snapshotComponentStateSpy).toHaveBeenCalledTimes(1);
  });
});

describe('handleDiffSwitchChange', () => {
  test('handleDiffSwitchChange sets state correctly', () => {
    const wrapper = getExperimentPageMock();
    const instance = wrapper.instance();
    const updateUrlWithViewStateSpy = jest.fn();
    const snapshotComponentStateSpy = jest.fn();
    instance.updateUrlWithViewState = updateUrlWithViewStateSpy;
    instance.snapshotComponentState = snapshotComponentStateSpy;

    instance.handleDiffSwitchChange({
      categorizedUncheckedKeys: {
        key1: 'value1',
      },
      preSwitchCategorizedUncheckedKeys: {
        key2: 'value2',
      },
      postSwitchCategorizedUncheckedKeys: {
        key3: 'value3',
      },
    });

    expect(instance.state.persistedState.categorizedUncheckedKeys).toEqual({
      key1: 'value1',
    });
    expect(instance.state.persistedState.preSwitchCategorizedUncheckedKeys).toEqual({
      key2: 'value2',
    });
    expect(instance.state.persistedState.postSwitchCategorizedUncheckedKeys).toEqual({
      key3: 'value3',
    });
    expect(instance.state.persistedState.diffSwitchSelected).toEqual(true);
    expect(updateUrlWithViewStateSpy).toHaveBeenCalledTimes(1);
    expect(snapshotComponentStateSpy).toHaveBeenCalledTimes(1);

    instance.handleDiffSwitchChange({
      categorizedUncheckedKeys: {
        key4: 'value4',
      },
    });

    expect(instance.state.persistedState.categorizedUncheckedKeys).toEqual({
      key4: 'value4',
    });
    expect(instance.state.persistedState.preSwitchCategorizedUncheckedKeys).toEqual({
      key2: 'value2',
    });
    expect(instance.state.persistedState.postSwitchCategorizedUncheckedKeys).toEqual({
      key3: 'value3',
    });
    expect(instance.state.persistedState.diffSwitchSelected).toEqual(false);
    expect(updateUrlWithViewStateSpy).toHaveBeenCalledTimes(2);
    expect(snapshotComponentStateSpy).toHaveBeenCalledTimes(2);
  });
});

describe('sortRunsByPrimaryMetric', () => {
  test('sortRunsByPrimaryMetric sets state correctly', () => {
    const experiment = Fixtures.createExperiment({
      experiment_id: EXPERIMENT_ID,
      tags: [
        {
          key: MLFLOW_EXPERIMENT_PRIMARY_METRIC_NAME,
          value: 'metric1',
        },
        {
          key: MLFLOW_EXPERIMENT_PRIMARY_METRIC_GREATER_IS_BETTER,
          value: 'True',
        },
      ],
    });
    const wrapper = getExperimentPageMock({
      getExperimentApi: () =>
        Promise.resolve({
          action: {
            payload: {
              experiment,
            },
          },
        }),
      // BEGIN-EDGE
      batchGetExperimentsApi: () =>
        Promise.resolve({
          action: {
            payload: {
              experiments_databricks: [{ experiment }],
            },
          },
        }),
      experiments: [Fixtures.createExperiment(experiment)],
      // END-EDGE
    });
    const instance = wrapper.instance();
    return instance.loadData().then(() => {
      expect(instance.state.persistedState.orderByKey).toEqual('metrics.`metric1`');
      expect(instance.state.persistedState.orderByAsc).toEqual(false);
    });
  });
});
