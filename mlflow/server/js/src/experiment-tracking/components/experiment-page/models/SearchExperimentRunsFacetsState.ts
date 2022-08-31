import {
  DEFAULT_CATEGORIZED_UNCHECKED_KEYS,
  DEFAULT_DIFF_SWITCH_SELECTED,
  DEFAULT_LIFECYCLE_FILTER,
  DEFAULT_MODEL_VERSION_FILTER,
  DEFAULT_ORDER_BY_ASC,
  DEFAULT_ORDER_BY_KEY,
  DEFAULT_START_TIME,
} from '../../../constants';
import { ExperimentCategorizedUncheckedKeys } from '../../../types';

/**
 * Defines persistable model respresenting sort and filter values
 * used by runs table and controls
 */
export class SearchExperimentRunsFacetsState {
  /**
   * SQL-like query string used to filter runs, e.g. "params.alpha = '0.5'"
   */
  searchFilter = '';

  /**
   * Canonical order_by key like "params.`alpha`". May be null to indicate the table
   * should use the natural row ordering provided by the server.
   */
  orderByKey = DEFAULT_ORDER_BY_KEY;

  /**
   * Whether the order imposed by orderByKey should be ascending or descending.
   */
  orderByAsc = DEFAULT_ORDER_BY_ASC;

  /**
   * Filter key to show results based on start time
   */
  startTime = DEFAULT_START_TIME;

  /**
   * Lifecycle filter of runs to display
   */
  lifecycleFilter = DEFAULT_LIFECYCLE_FILTER;

  /**
   * Filter of model versions to display
   */
  modelVersionFilter = DEFAULT_MODEL_VERSION_FILTER;

  /**
   * Unchecked keys in the columns dropdown
   */
  categorizedUncheckedKeys =
    // forced typecast due to TS<->JS mismatch
    DEFAULT_CATEGORIZED_UNCHECKED_KEYS as any as ExperimentCategorizedUncheckedKeys;

  /**
   * Switch to select only columns with differences
   */
  diffSwitchSelected = DEFAULT_DIFF_SWITCH_SELECTED;

  /**
   * Columns unselected before turning on the diff-view switch
   */
  preSwitchCategorizedUncheckedKeys = DEFAULT_CATEGORIZED_UNCHECKED_KEYS;

  /**
   * Columns unselected as the result of turning on the diff-view switch
   */
  postSwitchCategorizedUncheckedKeys = DEFAULT_CATEGORIZED_UNCHECKED_KEYS;

  /**
   * Object mapping run UUIDs (strings) to booleans, where a boolean value of true indicates that
   * a run has been expanded (its child runs are visible).
   */
  runsExpanded: Record<string, boolean> = {};

  static restore(/* experimentIds: string[] */) {
    // TODO: to be properly implemented later
    // const store = LocalStorageUtils.getStoreForComponent('ExperimentPage', JSON.stringify(experimentIds.sort()));
    // const persistedState = new ExperimentPagePersistedState(store.loadComponentState());
    // return persistedState.toJS() as SearchExperimentRunsSortFilterState;
    return new SearchExperimentRunsFacetsState() as any;
  }

  static persist(/* model: SearchExperimentRunsSortFilterState, experimentIds: string[] */) {
    // TODO: to be properly implemented later
    // const persistedState = new ExperimentPagePersistedState(model);
    // const store = LocalStorageUtils.getStoreForComponent('ExperimentPage', JSON.stringify(experimentIds.sort()));
    // store.saveComponentState(persistedState);
  }
}
