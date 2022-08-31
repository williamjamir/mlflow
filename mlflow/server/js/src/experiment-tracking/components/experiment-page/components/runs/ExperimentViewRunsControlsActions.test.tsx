import { useState } from 'react';
import { IntlProvider } from 'react-intl';
import { Provider } from 'react-redux';
import { applyMiddleware } from 'redux';
import { compose } from 'redux';
import { createStore } from 'redux';
import promiseMiddleware from 'redux-promise-middleware';
import { mountWithIntl } from '../../../../../common/utils/TestUtils';
import { EXPERIMENT_RUNS_MOCK_STORE } from '../../fixtures/experiment-runs.fixtures';
import { useRunSortOptions } from '../../hooks/useRunSortOptions';
import { SearchExperimentRunsFacetsState } from '../../models/SearchExperimentRunsFacetsState';
import { SearchExperimentRunsViewState } from '../../models/SearchExperimentRunsViewState';
import { experimentRunsSelector } from '../../utils/experimentRuns.selector';
import {
  ExperimentViewRunsControlsActions,
  ExperimentViewRunsControlsActionsProps,
} from './ExperimentViewRunsControlsActions';

const MOCK_EXPERIMENT = EXPERIMENT_RUNS_MOCK_STORE.entities.experimentsById['123456789'];

const MOCK_RUNS_DATA = experimentRunsSelector(EXPERIMENT_RUNS_MOCK_STORE, {
  experiments: [MOCK_EXPERIMENT],
});

const DEFAULT_VIEW_STATE = new SearchExperimentRunsViewState();

const doMock = (additionalProps: Partial<ExperimentViewRunsControlsActionsProps> = {}) => {
  const mockUpdateSearchFacets = jest.fn();
  let currentState: any;

  const getCurrentState = () => currentState;

  const Component = () => {
    const [searchFacetsState, setSearchFacetsState] = useState<SearchExperimentRunsFacetsState>(
      new SearchExperimentRunsFacetsState(),
    );

    currentState = searchFacetsState;

    const updateSearchFacets = (
      updatedFacetsState: Partial<SearchExperimentRunsFacetsState>,
      forceRefresh?: boolean,
    ) => {
      mockUpdateSearchFacets(updatedFacetsState, forceRefresh);
      setSearchFacetsState((s: any) => ({ ...s, ...updatedFacetsState }));
    };

    const props: ExperimentViewRunsControlsActionsProps = {
      runsData: MOCK_RUNS_DATA,
      updateSearchFacets,
      searchFacetsState,
      onDownloadCsv: () => {
        window.console.log('Downloading CSV!');
      },
      sortOptions: useRunSortOptions(
        searchFacetsState.categorizedUncheckedKeys,
        MOCK_RUNS_DATA.metricKeyList,
        MOCK_RUNS_DATA.paramKeyList,
      ),
      viewState: DEFAULT_VIEW_STATE,
      ...additionalProps,
    };
    return (
      <Provider
        store={createStore(
          (s) => s as any,
          EXPERIMENT_RUNS_MOCK_STORE,
          compose(applyMiddleware(promiseMiddleware())),
        )}
      >
        <IntlProvider locale='en'>
          <ExperimentViewRunsControlsActions {...props} />
        </IntlProvider>
      </Provider>
    );
  };
  return {
    wrapper: mountWithIntl(<Component />),
    mockUpdateSearchFacets,
    getCurrentState,
  };
};

describe('ExperimentViewRunsControlsFilters', () => {
  test('should render with given search facets model properly', () => {
    const { wrapper } = doMock();
    expect(wrapper).toBeTruthy();
  });
  test('should refresh runs when necessary', () => {
    const { wrapper, mockUpdateSearchFacets } = doMock();

    const refreshButton = wrapper.find("button[data-testid='runs-refresh-button']");
    expect(mockUpdateSearchFacets).not.toBeCalled();
    refreshButton.simulate('click');
    expect(mockUpdateSearchFacets).toBeCalledWith(expect.anything(), true);
  });

  test('should disable compare and delete buttons when no runs are selected', () => {
    const { wrapper } = doMock();

    const deleteButton = wrapper.find("button[data-testid='runs-delete-button']");
    const compareButton = wrapper.find("button[data-testid='runs-compare-button']");
    expect(deleteButton.getDOMNode().getAttribute('disabled')).not.toBeNull();
    expect(compareButton.getDOMNode().getAttribute('disabled')).not.toBeNull();
  });

  test('should enable delete buttons when there is single row selected', () => {
    const { wrapper } = doMock({
      viewState: { runsSelected: { '123': true }, hiddenChildRunsSelected: {} },
    });

    const deleteButton = wrapper.find("button[data-testid='runs-delete-button']");
    const compareButton = wrapper.find("button[data-testid='runs-compare-button']");
    expect(deleteButton.getDOMNode().getAttribute('disabled')).toBeNull();
    expect(compareButton.getDOMNode().getAttribute('disabled')).not.toBeNull();
  });

  test('should enable delete and compare buttons when there are multiple rows selected', () => {
    const { wrapper } = doMock({
      viewState: { runsSelected: { '123': true, '321': true }, hiddenChildRunsSelected: {} },
    });

    const deleteButton = wrapper.find("button[data-testid='runs-delete-button']");
    const compareButton = wrapper.find("button[data-testid='runs-compare-button']");
    expect(deleteButton.getDOMNode().getAttribute('disabled')).toBeNull();
    expect(compareButton.getDOMNode().getAttribute('disabled')).toBeNull();
  });
});
