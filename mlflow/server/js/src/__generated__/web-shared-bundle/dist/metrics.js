import React, { useContext, useLayoutEffect, useState, useRef, useCallback, useMemo } from 'react';
import { a as useStableUID, u as useStable } from './useStableUID-922bf618.js';
import { R as RandomUtils } from './RandomUtils-95541717.js';
import { jsx } from '@emotion/react/jsx-runtime';

const exposures = {};
/**
 * Returns a randomly generated boolean value that is sticky throughout the JS runtime for a
 * given experimentName. This is ideal to study short term impact of a study such as performance
 * studies. It is however not suitable to studying longer term effects such as changes to
 * user behavior resulting from being exposed to an experiment or performance
 * improvement over a long period.
 *
 * Since the group is randomized on a per-load basis, it is however less susceptible
 * to where power-users get assigned in a randomized study of a small to medium population.
 */

function getCoinFlipABGroup(experimentName) {
  const prevValue = exposures[experimentName];

  if (prevValue !== undefined) {
    return prevValue;
  }

  const value = Math.random() < 0.5;
  exposures[experimentName] = value;
  return value;
}
/**
 * Returns the set of exposures that were generated for this SPA app session.
 * We're only interested in talking about exposures that the user has seen
 * in this session.
 */

function getCoinFlipExposures() {
  return { ...exposures
  };
}

function ReactMemoAB(expName, component) {
  if (getCoinFlipABGroup(expName)) {
    return /*#__PURE__*/React.memo(component);
  }

  return component;
}

function count(initiatorType, extension) {
  let size = 0;

  if (performance && performance.getEntriesByType) {
    performance.getEntriesByType('resource').forEach(entry => {
      const resource = entry;

      if (resource.initiatorType === initiatorType && resource.name.endsWith(extension)) {
        size += resource.decodedBodySize;
      }
    });
  }

  return size;
}
/**
 * Returns the total number of (decompressed) (includes cached loads) js bytes we have used in our
 * app at this point. This will include prefetching which may interferring with what you're intending
 * to measure. After 30s we currently prefetch the entire app which will cause a large spike.
 */


function getJSSize() {
  return count('script', '.js') + count('link', '.js');
}
/**
 * Returns the total number of (decompressed) (includes cached loads) css bytes we have used in our
 * app at this point.
 */

function getCSSSize() {
  return count('link', '.css');
}

let InteractionName;

(function (InteractionName) {
  InteractionName["REDASH_UNKNOWN"] = "redash.unknown";
  InteractionName["REDASH_EDITOR_ADD_EXISTING_QUERY_TAB"] = "redash.editor.existing.query.tab.add";
  InteractionName["REDASH_EDITOR_REMOVE_TAB"] = "redash.editor.tab.remove";
  InteractionName["REDASH_EDITOR_SWITCH_TAB"] = "redash.editor.tab.switch";
  InteractionName["REDASH_EDITOR_ADD_NEW_QUERY_TAB"] = "redash.editor.new.query.tab.add";
  InteractionName["REDASH_EDITOR_FORMAT_QUERY"] = "redash.editor.query.format";
  InteractionName["REDASH_EDITOR_UNDO_QUERY"] = "redash.editor.query.undo";
  InteractionName["REDASH_EDITOR_TYPING_QUERY"] = "redash.editor.query.typing";
  InteractionName["REDASH_EDITOR_RUN_QUERY"] = "redash.editor.query.run";
  InteractionName["REDASH_EDITOR_SAVE_QUERY"] = "redash.editor.query.save";
  InteractionName["REDASH_EDITOR_SWITCH_ENDPOINT"] = "redash.editor.endpoint.switch";
  InteractionName["REDASH_OLD_EDITOR_FORMAT_QUERY"] = "redash.old.editor.query.format";
  InteractionName["REDASH_OLD_EDITOR_UNDO_QUERY"] = "redash.old.editor.query.undo";
  InteractionName["REDASH_OLD_EDITOR_TYPING_QUERY"] = "redash.old.editor.query.typing";
  InteractionName["REDASH_OLD_EDITOR_RUN_QUERY"] = "redash.old.editor.query.run";
  InteractionName["REDASH_OLD_EDITOR_SAVE_QUERY"] = "redash.old.editor.query.save";
  InteractionName["WEBAPP_CLUSTERS"] = "webapp.clusters";
  InteractionName["WEBAPP_CLUSTERS_ATTACH"] = "webapp.clusters.attach";
  InteractionName["WEBAPP_CLUSTERS_CREATE"] = "webapp.clusters.create";
  InteractionName["WEBAPP_DASHBOARD"] = "webapp.dashboard";
  InteractionName["WEBAPP_DEPRECATED_TABLE_ENDPOINT"] = "webapp.deprecated_table_endpoint";
  InteractionName["WEBAPP_EMPTY"] = "webapp.empty";
  InteractionName["WEBAPP_EXPERIMENTAL"] = "webapp.experimental";
  InteractionName["WEBAPP_FOLDER"] = "webapp.folder";
  InteractionName["WEBAPP_HOME"] = "webapp.home";
  InteractionName["WEBAPP_JOB_CREATE"] = "webapp.job.create";
  InteractionName["WEBAPP_JOB_LIST"] = "webapp.job.list";
  InteractionName["WEBAPP_JOB_RUN"] = "webapp.job.run";
  InteractionName["WEBAPP_JOB_UNKNOWN"] = "webapp.job.unknown";
  InteractionName["WEBAPP_LIBRARY"] = "webapp.library";
  InteractionName["WEBAPP_NOTEBOOK"] = "webapp.notebook";
  InteractionName["WEBAPP_NOTEBOOK_FULLY_LOADED"] = "webapp.notebook.fully_loaded";
  InteractionName["WEBAPP_NOTEBOOK_ADD_COMMAND"] = "webapp.notebook.command.add";
  InteractionName["WEBAPP_NOTEBOOK_DASHBOARD"] = "webapp.notebook.dashboard";
  InteractionName["WEBAPP_NOTEBOOK_PASTE_COMMAND"] = "webapp.notebook.command.paste";
  InteractionName["WEBAPP_NOTEBOOK_RUN_ALL_COMMAND"] = "webapp.notebook.command.run_all";
  InteractionName["WEBAPP_NOTEBOOK_CLICK_INTO_CELL"] = "webapp.notebook.command.click_into";
  InteractionName["WEBAPP_NOTEBOOK_RESULT"] = "webapp.notebook.results_only";
  InteractionName["WEBAPP_NOTEBOOK_REVISION"] = "webapp.notebook.revision";
  InteractionName["WEBAPP_NOTEBOOK_REVISION_MFFLOW"] = "webapp.notebook.revision_mlflow_run";
  InteractionName["WEBAPP_NOTEBOOK_SIDEVIEW"] = "webapp.notebook.sideview";
  InteractionName["WEBAPP_NOTEBOOK_CANCEL_COMMAND"] = "webapp.notebook.cancel_command";
  InteractionName["WEBAPP_NOTEBOOK_DELETE_COMMAND"] = "webapp.notebook.delete_command";
  InteractionName["WEBAPP_REPO_GIT_MODAL_LOAD"] = "webapp.repo.load_git_modal";
  InteractionName["WEBAPP_REPO_GIT_DIFF_LOAD"] = "webapp.repo.load_git_diff";
  InteractionName["WEBAPP_SCHEMA_BROWSING_THREE_LEVEL"] = "webapp.scema_browsing.three_level";
  InteractionName["WEBAPP_SCHEMA_BROWSING_TWO_LEVEL"] = "webapp.scema_browsing.two_level";
  InteractionName["WEBAPP_SETTING"] = "webapp.setting";
  InteractionName["WEBAPP_SETTING_ACCOUNTS"] = "webapp.setting.accounts";
  InteractionName["WEBAPP_SHELL"] = "webapp.shell";
  InteractionName["WEBAPP_SUBROUTE"] = "webapp.subroute";
  InteractionName["WEBAPP_NOTEBOOK_RUN_COMMAND"] = "webapp.notebook.command.run";
  InteractionName["WEBAPP_UNKNOWN"] = "webapp.unknown";
  InteractionName["WEBAPP_WORKSPACE"] = "webapp.workspace";
  InteractionName["WEBAPP_OPEN_DATA_TAB"] = "webapp.sidebar.data_tab.open";
  InteractionName["WEBAPP_CLOSE_DATA_TAB"] = "webapp.sidebar.data_tab.close";
  InteractionName["WEBAPP_GENERIC_CLOSE_SIDEBAR"] = "webapp.sidebar.close";
  InteractionName["WEBAPP_DATA_TAB_TABLE_PANEL_CHANGE_DATABASE"] = "webapp.sidebar.data_tab.table_panel.database.change";
  InteractionName["WEBAPP_DATA_TAB_TABLE_PANEL_CHANGE_CATALOG"] = "webapp.sidebar.data_tab.table_panel.catalog.change";
  InteractionName["WEBAPP_TABLE_PAGE_REFRESH"] = "webapp.table.page.refresh";
  InteractionName["WEBAPP_TABLE_PAGE_REFRESH_ON_ERROR"] = "webapp.table.page.refresh.on.error";
  InteractionName["MLFLOW_EXPERIMENT_OBSERVATORY_LIST"] = "mlflow.experiment.observatory.list";
  InteractionName["MLFLOW_UNKNOWN"] = "mlflow.unknown";
  InteractionName["MLFLOW_EXPERIMENT_PAGE"] = "mlflow.experiment.details";
  InteractionName["MLFLOW_COMPARE_EXPERIMENTS_HOME_PAGE"] = "mlflow.experiment.compare";
  InteractionName["MLFLOW_RUN_PAGE"] = "mlflow.experiment.run.details";
  InteractionName["MLFLOW_COMPARE_RUN_PAGE"] = "mlflow.experiment.run.compare";
  InteractionName["MLFLOW_METRIC_PAGE"] = "mlflow.metric.details";
  InteractionName["MLFLOW_MODEL_LIST_PAGE"] = "mlflow.models.list";
  InteractionName["MLFLOW_MODEL_VERSION_PAGE"] = "mlflow.model.version.details";
  InteractionName["MLFLOW_MODEL_PAGE"] = "mlflow.model.details";
  InteractionName["MLFLOW_MODEL_PAGE_SUBPAGE"] = "mlflow.model.details.subpage";
  InteractionName["MLFLOW_MODEL_PAGE_SUBPAGE_WITH_NAME"] = "mlflow.model.details.subpage.name";
  InteractionName["MLFLOW_COMPARE_MODEL_VERSIONS_PAGE"] = "mlflow.model.version.compare";
  InteractionName["MLFLOW_CREATE_MODEL_PAGE"] = "mlflow.model.create";
  InteractionName["FEATURE_STORE_PAGE"] = "featurestore.list";
  InteractionName["FEATURE_STORE_TABLE_PAGE"] = "featurestore.table";
  InteractionName["FEATURE_STORE_STORE_PAGE"] = "featurestore.onlinestore";
  InteractionName["FILEBROWSER_INITIAL_OPEN"] = "filebrowser.initial_open";
  InteractionName["FILEBROWSER_NAVIGATE_FOLDER"] = "filebrowser.navigate.folder";
  InteractionName["FILEBROWSER_SHARE_MODAL_OPEN"] = "filebrowser.share_modal.open";
  InteractionName["EXPLORER_DATA_INDEX"] = "data_explorer.data.index";
  InteractionName["EXPLORER_DATA_CATALOG"] = "data_explorer.data.catalog";
  InteractionName["EXPLORER_DATA_DATABASE"] = "data_explorer.data.database";
  InteractionName["EXPLORER_DATA_TABLE"] = "data_explorer.data.table";
  InteractionName["EXPLORER_DATA_TABLE_COLUMN_TAB"] = "data_explorer.data.table_column_tab";
  InteractionName["EXPLORER_DATA_TABLE_SAMPLE_DATA_TAB"] = "data_explorer.data.table_sample_tab";
  InteractionName["EXPLORER_DATA_TABLE_METADATA_TAB"] = "data_explorer.data.table_metadata_tab";
  InteractionName["EXPLORER_DATA_TABLE_PERMISSIONS_TAB"] = "data_explorer.data.table_permissions_tab";
  InteractionName["EXPLORER_DATA_TABLE_HISTORY_TAB"] = "data_explorer.data.table_history_tab";
  InteractionName["EXPLORER_DATA_TABLE_LINEAGE_TAB"] = "data_explorer.data.table_lineage_tab";
  InteractionName["EXPLORER_UC_SEARCH_HOMEPAGE"] = "data_explorer.search.homepage";
  InteractionName["EXPLORER_UC_SEARCH_IN_MODAL"] = "data_explorer.search.in_modal";
  InteractionName["EXPLORER_UC_SEARCH_CHANGE_CATALOGS"] = "data_explorer.search.change_catalogs";
  InteractionName["EXPLORER_UC_SEARCH_CHANGE_DATABASES"] = "data_explorer.search.change_databases";
  InteractionName["EXPLORER_UC_SEARCH_CLEAR_FILTER"] = "data_explorer.search.clear_filter";
})(InteractionName || (InteractionName = {}));

let LoadingDescription;

(function (LoadingDescription) {
  LoadingDescription["GENERIC"] = "ReactInteractionHold";
  LoadingDescription["GENERIC_SUSPENSE"] = "DatabricksGenericSuspense";
  LoadingDescription["PERMISSIONS_LOADING"] = "Permissions Loading";
  LoadingDescription["CLUSTERS_ATTACH_LOADING"] = "Clusters Attach Loading";
  LoadingDescription["CLUSTERS_LOADING"] = "Clusters Loading";
  LoadingDescription["CLUSTER_LIST"] = "Cluster List";
  LoadingDescription["CLUSTER_COMMAND"] = "Cluster Command";
  LoadingDescription["TABLE_COMMAND_VIEW"] = "Table Command View";
  LoadingDescription["REQUIRE_CLUSTER_SETTINGS"] = "Require Cluster Settings";
  LoadingDescription["PENDING_COMMAND_SPINNER"] = "Pending Command Spinner";
  LoadingDescription["NOTEBOOK_COMMAND_LISTVIEW"] = "Notebook Command ListView";
  LoadingDescription["COMMAND_CANCELING"] = "Command Cancelling";
  LoadingDescription["NOTEBOOK_LOADING"] = "Notebook Loading";
  LoadingDescription["FETCHING_RESULTS"] = "Fetching results";
  LoadingDescription["CATALOG_LIST"] = "Data panel: Catalogs list";
  LoadingDescription["DATABASE_LIST"] = "Data panel: Databases list";
  LoadingDescription["TABLE_LIST"] = "Data panel: Tables list";
  LoadingDescription["TABLEGETVIEW_NAMES_LIST"] = "TableGetView NamesList";
  LoadingDescription["FETCHING_ACCOUNTS"] = "Fetching Accounts";
  LoadingDescription["JOBLIST_PERMISSIONS"] = "JobList Permissions";
  LoadingDescription["JOBLIST_LOADING"] = "JobList Loading";
  LoadingDescription["APP_INTL_PROVIDER"] = "AppIntlProvider";
  LoadingDescription["REQUIRE_DATABRICKS_SESSION"] = "RequireDatabricksSession";
  LoadingDescription["CODE_SPLIT_ROOT"] = "Code Split Root";
  LoadingDescription["FULL_APPLICATION_LAYOUT"] = "Code Split FullApplicationLayout";
  LoadingDescription["EMBEDDED_APPLICATION_LAYOUT"] = "Code Split EmbeddedApplicationLayout";
  LoadingDescription["ITEMS_TABLE_LOADING"] = "ItemsTableLoading";
  LoadingDescription["PIPELINES_TABLE_LOADING"] = "Pipelines Table Loading";
  LoadingDescription["LOADING_JOB"] = "Loading Job";
  LoadingDescription["JOBS_RUNS_LOADING"] = "Jobs Runs Loading";
  LoadingDescription["REFRESH_TABLE_METADATA"] = "Refresh Table Metadata";
  LoadingDescription["REFRESH_TABLE_METADATA_ON_ERROR"] = "Refresh table metadata on error";
  LoadingDescription["FETCHING_RECENT_NOTEBOOKS"] = "Fetching Recent Notebooks";
  LoadingDescription["NOTEBOOK_RUN_ALL"] = "Notebook run all commands";
  LoadingDescription["NOTEBOOK_RUN_ALL_CANCELED"] = "Notebook run all commands canceled";
  LoadingDescription["GIT_MODAL_LOADING"] = "Git Modal Loading";
  LoadingDescription["GIT_DIFF_LOADING"] = "Git Diff Loading";
  LoadingDescription["REQUIRE_REDASH_USER_SESSION"] = "Require Redash User Session";
  LoadingDescription["NEW_QUERY_TAB_LOADING"] = "New Query Tab Loading";
  LoadingDescription["NEW_EXISTING_QUERY_TAB_LOADING"] = "New Existing Query Tab Loading";
  LoadingDescription["RUN_QUERY_EXECUTING"] = "Run Query Executing";
  LoadingDescription["SAVE_QUERY_EXECUTING"] = "Save Query Executing";
  LoadingDescription["MLFLOW_IFRAME"] = "MLFlow main MFE iframe";
  LoadingDescription["MLFLOW_EXPERIMENT_LIST"] = "List of experiments loading";
  LoadingDescription["MLFLOW_EXPERIMENT_DETAILS_PAGE"] = "Experiment details loading";
  LoadingDescription["MLFLOW_EXPERIMENT_PAGE_EXPERIMENTS"] = "Experiment details page - experiment details";
  LoadingDescription["MLFLOW_EXPERIMENT_PAGE_EXPERIMENT_RUNS"] = "Experiment details page - experiment runs";
  LoadingDescription["MLFLOW_HOME_PAGE"] = "Experiment details loading";
  LoadingDescription["MLFLOW_ARTIFACT_PAGE"] = "Artifacts loading";
  LoadingDescription["MLFLOW_COMPARE_RUN_PAGE"] = "Compared runs details loading";
  LoadingDescription["MLFLOW_METRIC_DETAILS_PAGE"] = "Metric details loading";
  LoadingDescription["MLFLOW_METRIC_PLOT_PANEL"] = "Metric plot panel loading";
  LoadingDescription["MLFLOW_RUN_PAGE"] = "Run details loading";
  LoadingDescription["MLFLOW_MODEL_VERSIONS_COMPARE_PAGE"] = "Compared model versions loading";
  LoadingDescription["MLFLOW_MODEL_LIST_PAGE"] = "List of models loading";
  LoadingDescription["MLFLOW_MODEL_PENDING_REQUEST_TABLE"] = "Pending model requests loading";
  LoadingDescription["MLFLOW_MODEL_DETAILS_PAGE"] = "Model details loading";
  LoadingDescription["MLFLOW_MODEL_VERSION_DETAILS_PAGE"] = "Model version details loading";
  LoadingDescription["EXPERIMENT_LIST"] = "List of experiments";
  LoadingDescription["FEATURE_STORE_IFRAME"] = "Feature store MFE iframe";
  LoadingDescription["FEATURE_STORE_PAGE"] = "Feature store list loading";
  LoadingDescription["FEATURE_STORE_TABLE_PAGE"] = "Feature store table page loading";
  LoadingDescription["FEATURE_STORE_ONLINE_STORE_PAGE"] = "Feature online store entry loading";
  LoadingDescription["FILEBROWSER_FOLDER_LOADING"] = "Filebrowser Folder Loading";
  LoadingDescription["FILEBROWSER_SHARE_LOADING"] = "Filebrowser Share Modal Loading";
  LoadingDescription["DATA_PAGE"] = "Data page loading";
  LoadingDescription["CATALOGS_LIST"] = "Data index catalogs list loading";
  LoadingDescription["DATA_SCHEMA_BROWSER"] = "Data schema browser loading";
  LoadingDescription["CATALOG_DETAIL"] = "Catalog detail loading";
  LoadingDescription["CATALOG_DETAIL_DATABASES_LIST"] = "Catalog detail databases list loading";
  LoadingDescription["DATABASE_DETAIL"] = "Database detail loading";
  LoadingDescription["DATABASE_DETAIL_TABLES_LIST"] = "Database detail tables list loading";
  LoadingDescription["TABLE_DETAIL"] = "Table detail loading";
  LoadingDescription["TABLE_DETAIL_COLUMNS_LIST"] = "Table detail column list loading";
  LoadingDescription["TABLE_DETAIL_SAMPLE_DATA"] = "Table detail sample data loading";
  LoadingDescription["TABLE_DETAIL_METADATA"] = "Table detail metadata tab loading";
  LoadingDescription["TABLE_DETAIL_HISTORY_LIST"] = "Table detail history tab list loading";
  LoadingDescription["ENTITY_PERMISSIONS_LIST"] = "Entity permission list";
  LoadingDescription["LINEAGE_TABULAR_VIEW_TABLE_ENTITY"] = "Lineage tabular view table entity loading";
  LoadingDescription["DATA_SOURCES"] = "Data sources loading";
  LoadingDescription["UC_SEARCH"] = "UC search loading";
})(LoadingDescription || (LoadingDescription = {}));

const defaultValue = {
  trackLoading: () => {},
  startInteraction: () => null
};
const ReactInteractionContext = /*#__PURE__*/React.createContext(defaultValue);

/**
 * Track the current interaction ID under a different context. This is important because
 * 1) Interaction ID may not be consistent between a parent and child component during the render phase.
 * 2) We want to limit the number of components that re-render when the interaction ID changes because
 *    this happens during performance sensitive periods such as quick tab switches.
 */
const ReactInteractionIDContext = /*#__PURE__*/React.createContext(null);

const isSSR$1 = typeof window === 'undefined';
const useLayoutEffectSSRSafe = isSSR$1 ? () => {} : useLayoutEffect;
function useReactInteractionHold(loading, description, options) {
  const holdUID = useStableUID();
  const interactionID = useContext(ReactInteractionIDContext);
  const interactionTracingContext = useContext(ReactInteractionContext);
  const {
    allowlist
  } = options !== null && options !== void 0 ? options : {}; // Only report loading when we're in the commit phase

  useLayoutEffectSSRSafe(() => {
    interactionTracingContext.trackLoading(interactionID, holdUID, loading ? description || LoadingDescription.GENERIC : null, allowlist);
  }, [interactionID, interactionTracingContext, holdUID, loading, description, allowlist]); // Clean-up on un-mount or when we change the interaction. Move the loading state to the newly tracked interaction

  useLayoutEffectSSRSafe(() => () => {
    interactionTracingContext.trackLoading(interactionID, holdUID, null);
  }, [interactionID, holdUID, interactionTracingContext]);
}

/**
 * Used when your view has a loading state that would for example block page load.
 * Simply put this component in your render tree with loading=true and a description
 * that explains what we are waiting on for debugging and aggregating purposes.
 *
 * When loading is complete either re-render with loading=false OR unmount this component.
 *
 * See `useReactInteractionHold` for more documentation.
 */
function ReactInteractionHold(_ref) {
  let {
    loading,
    description,
    allowlist
  } = _ref;
  useReactInteractionHold(loading, description, {
    allowlist
  });
  return null;
}

let UserTimingsV3Supported = false;

try {
  performance.measure('a', {
    start: 0,
    end: 0
  });
  performance.clearMeasures('a');
  UserTimingsV3Supported = true; // eslint-disable-next-line no-empty
} catch (e) {}
/**
 * Add a visible measure (block/span) in devtools for this duration.
 * This is helpful when trying to validate performance metrics against
 * screenshots.
 */


function measure(name, start, end) {
  if (UserTimingsV3Supported) {
    // UserTimings V3 shipped a non backwards compatible API
    performance.measure(name, {
      start,
      end
    });
  }
}
const performanceNow = typeof performance !== 'undefined' ? performance.now.bind(performance) : Date.now.bind(Date);

// This type is wrong for webapp, we should migrate away from this.
// This code is shared, we can't import from globals.ts, so we redefine it here.
// eslint-disable-next-line no-undef
let currentEvent;
let isInit = false;
let timeout;
function eventTrackerInit() {
  if (isInit) {
    return;
  }

  isInit = true;

  const eventTracker = event => {
    currentEvent = event;

    if (!timeout) {
      timeout = setTimeout(() => {
        // This might not be the same event we set in the closure,
        // but if we're in a setTimeout, we're not processing an event
        // so clearing that one is safe.
        currentEvent = null;
        timeout = null;
      }, 0);
    }
  };

  document.body.addEventListener('click', eventTracker, true);
}
/**
 * If we're currently in an event handler, such as a click, return
 * the time at which the event started. In the case of hardware events
 * like a press, we will use the most accurate timestamp for the event
 * dispatch provided by the OS/Browser. This will include time to dispatch
 * the event to us if for example we blocked the main thread.
 */

function getCurrentEventStart() {
  if (!currentEvent || currentEvent.eventPhase === 0) {
    return null;
  }

  return currentEvent.timeStamp;
}

function calculateStallTime(entry) {
  // Any time which is spent before the request is actually sent
  // (the request bytes are written to the network stream) is considered stalled time
  // irrespective of the underlying reason - dns lookup, establishing connection, SSL
  // neg, etc.
  // information about the sequence can be found here:
  // https://developer.mozilla.org/en-US/docs/Web/API/Resource_Timing_API/Using_the_Resource_Timing_API
  // Certain resource entries doesn't behave well - their requestStart time is 0, which breaks the total
  // time
  return Math.max(0, entry.requestStart - entry.startTime);
}

function getStalledRequestsStats(startTime, endTime) {
  let stalledRequestsTime = 0;
  let stalledRequestsCount = 0;

  if (performance && performance.getEntriesByType) {
    performance.getEntriesByType('resource').forEach(entry => {
      const resource = entry;

      if (resource.startTime < startTime || resource.responseEnd > endTime) {
        // ignore entries which had their request sent before the time barrier (interaction start)
        // or have finished after the time barrier
        return;
      }

      stalledRequestsTime += calculateStallTime(resource);
      stalledRequestsCount++;
    });
  }

  return {
    stalledRequestsTime,
    stalledRequestsCount
  };
}

let InteractionStatus;

(function (InteractionStatus) {
  InteractionStatus["SUCCESSFUL"] = "SUCCESSFUL";
  InteractionStatus["CANCELLED"] = "CANCELLED";
  InteractionStatus["FAILED"] = "FAILED";
})(InteractionStatus || (InteractionStatus = {}));

let InteractionType;

(function (InteractionType) {
  InteractionType["INITIAL_LOAD"] = "INITIAL_LOAD";
  InteractionType["NAVIGATION"] = "NAVIGATION";
  InteractionType["INTERACTION"] = "INTERACTION";
})(InteractionType || (InteractionType = {}));

const isSSR = typeof window === 'undefined';
const visitedInteractions = new Set();
let notifyList = [];
/**
 * The interaction starts much before we start a React render. Typically it starts on the hardware
 * event being received by the OS (event.timestamp), or on the navigation start. We have to grab
 * the timestamp imperatively before ReactInteractionTracingImpl mounts.
 */

const interactions = {};

function getActiveInteraction(interaction1, interaction2) {
  if (interaction1 && interaction2) {
    // Grab the one that was started the latest
    if (interaction1.startTime > interaction2.startTime) {
      return interaction1;
    }

    return interaction2;
  } else if (interaction1) {
    return interaction1;
  }

  return interaction2;
}

function ReactInteractionTracingImpl(_ref) {
  let {
    children,
    interaction: renderTimeInteraction
  } = _ref;
  const [internalInteraction, setInternalInteraction] = useState(renderTimeInteraction);
  const pendingLoadingStates = useStable(() => ({}));
  const completionRAFCheckRef = useRef(0);
  const completionIOCheckRef = useRef(null);
  const activeInteraction = getActiveInteraction(renderTimeInteraction, internalInteraction);
  const clearCompletionCheck = useCallback(() => {
    var _completionIOCheckRef;

    (_completionIOCheckRef = completionIOCheckRef.current) === null || _completionIOCheckRef === void 0 ? void 0 : _completionIOCheckRef.disconnect();
    completionIOCheckRef.current = null;
    cancelAnimationFrame(completionRAFCheckRef.current);
    completionRAFCheckRef.current = 0;
  }, []);
  const checkCompletion = useCallback(interaction => {
    if (!interaction || completionRAFCheckRef.current || completionIOCheckRef.current || Object.values(pendingLoadingStates[interaction.id] || {}).length !== 0) {
      return;
    } // Intersection Observer gives us the exact timestamp that a frame occured on.
    // We exploit this to know when we might have painted and used this to mark
    // the interaction end.
    // eslint-disable-next-line compat/compat


    completionIOCheckRef.current = new IntersectionObserver(intersection => {
      clearCompletionCheck();

      if (interaction !== null && Object.values(pendingLoadingStates[interaction.id] || {}).length === 0) {
        const paintTime = intersection[0].time;
        stopInteraction(interaction, InteractionStatus.SUCCESSFUL, paintTime);
      }
    });
    completionIOCheckRef.current.observe(document.body); // Since this is called during the commit phase, we're (1) not done painting
    // and (2) there may be pending loading states that will register later in
    // commit phase. We wait the interaction to complete as close as possible to
    // the paint. One requestAnimationFrame would fire at the start of the browser
    // paint event. The second will start at the start of the next browser paint
    // event. Ideally IntersectionObserver has fired first but otherwise we
    // stop the interaction after the next frame. It's unclear if it mandatory
    // for IntersectionObserver to always fire by then. It appears in some cases
    // it doesn't. More investigation is required here.

    completionRAFCheckRef.current = requestAnimationFrame(() => {
      completionRAFCheckRef.current = requestAnimationFrame(() => {
        clearCompletionCheck();

        if (interaction !== null && Object.values(pendingLoadingStates[interaction.id] || {}).length === 0) {
          stopInteraction(interaction, InteractionStatus.SUCCESSFUL);
        }
      });
    });
  }, [pendingLoadingStates, clearCompletionCheck]);
  useLayoutEffect(() => {
    // Check if we mount without any pending placeholders
    checkCompletion(activeInteraction);
    return () => {
      clearCompletionCheck(); // On unmount or an interaction change, cancel the interaction

      stopInteraction(activeInteraction, InteractionStatus.CANCELLED);
    };
  }, [activeInteraction, checkCompletion, clearCompletionCheck]);
  const interactionContext = useMemo(() => ({
    trackLoading: (interaction, holdUID, loadingDescription, allowlist) => {
      if (!interaction) {
        return;
      }

      if (!interaction || interaction.endTime !== undefined) {
        return;
      }

      const pendingLoadingStatesForThisInteraction = pendingLoadingStates[interaction.id] || {};
      pendingLoadingStates[interaction.id] = pendingLoadingStatesForThisInteraction;
      const prevLoadingState = pendingLoadingStatesForThisInteraction[holdUID];
      const allowed = allowlist === undefined || allowlist.find(allow => allow === interaction.name); // If the client isn't careful they may cause unnessary tracking. i.e. creating
      // a new allowlist every re-render. Let's fail safe and avoid retracking
      // identical loading states.

      if (prevLoadingState && allowed && prevLoadingState.description === loadingDescription) {
        return;
      }

      delete pendingLoadingStatesForThisInteraction[holdUID];

      if (prevLoadingState) {
        var _interactions$interac;

        prevLoadingState.endTime = performanceNow();
        measure('React Loading State: ' + prevLoadingState.description, prevLoadingState.startTime, prevLoadingState.endTime);
        (_interactions$interac = interactions[interaction.id]) === null || _interactions$interac === void 0 ? void 0 : _interactions$interac.completedLoadingStates.push(prevLoadingState);
      }

      if (allowed && loadingDescription) {
        pendingLoadingStatesForThisInteraction[holdUID] = {
          description: loadingDescription,
          startTime: performanceNow()
        }; // If we added a new loading state we need to reset the completion check which
        // relies on waiting for a full frame without any loading states.

        clearCompletionCheck();
      } else {
        checkCompletion(interaction);
      }
    },
    startInteraction: (interactionName, metadata, startTime) => {
      const newInteraction = startInteraction(InteractionType.INTERACTION, interactionName, metadata, startTime); // Kick off a re-rendering of the root component that will track the new interaction

      setInternalInteraction(newInteraction);
      return newInteraction;
    }
  }), [pendingLoadingStates, checkCompletion, clearCompletionCheck]);
  return jsx(ReactInteractionContext.Provider, {
    value: interactionContext,
    children: jsx(ReactInteractionIDContext.Provider, {
      value: activeInteraction,
      children: children
    })
  });
}

function waitForInteractive(cb) {
  /**
   * It's hard to get a good definition of interactive. But we frequently complete an interaction
   * and do a lot of post-processing immediately after. So we'll grab the duration of two round
   * trip through the event queue which should approximate how long it takes us to respond to
   * user input and penalize interactions that do a lot of work that blocks interactictivity.
   */
  setTimeout(() => {
    setTimeout(() => {
      cb();
    });
  });
}

function stopInteraction(interactionInitial, completionStatus, endTimeInitial) {
  // Make mutable
  const interaction = interactionInitial;

  if (!interaction) {
    return;
  }

  if (!interaction || interaction.endTime !== undefined) {
    return;
  }

  const endTime = endTimeInitial !== null && endTimeInitial !== void 0 ? endTimeInitial : performanceNow();
  interaction.status = completionStatus;
  interaction.endTime = endTime;
  measure('React Interaction ' + interaction.name + ':' + completionStatus, interaction.startTime, endTime);
  waitForInteractive(() => {
    var _window, _window$prefs;

    const completedInteraction = {
      id: interaction.id,
      startTime: interaction.startTime,
      endTime: endTime,
      status: completionStatus,
      completedLoadingStates: interaction.completedLoadingStates,
      isRevisit: interaction.isRevisit,
      type: interaction.type,
      name: interaction.name,
      backgrounded: interaction.backgrounded,
      exposures: getCoinFlipExposures(),
      metadata: interaction.metadata,
      timeToInteractive: performanceNow(),
      jsBytesLoaded: getJSSize() - interaction.jsBytesStart,
      cssBytesLoaded: getCSSSize() - interaction.cssBytesStart,
      ...getStalledRequestsStats(interaction.startTime, endTime)
    };
    interaction.resolve(completedInteraction);
    notifyList.forEach(callback => callback(completedInteraction));

    if ((_window = window) !== null && _window !== void 0 && (_window$prefs = _window.prefs) !== null && _window$prefs !== void 0 && _window$prefs.get('logReactInteractionTracing')) {
      // eslint-disable-next-line no-console -- see go/js/lint/no-console
      console.log('Completed React Interaction', completedInteraction);
    }
  });
}
function ReactInteractionTracing(props) {
  var _window2, _window2$prefs;

  if (!isSSR && (props.enabled === true || props.enabled === undefined && (_window2 = window) !== null && _window2 !== void 0 && (_window2$prefs = _window2.prefs) !== null && _window2$prefs !== void 0 && _window2$prefs.get('reactInteractionTracing'))) {
    return jsx(ReactInteractionTracingImpl, { ...props
    });
  }

  return props.children;
}
/**
 * This is the start of the interaction. This typically happen for an
 * imperative event handler or the browser's navigation start event.
 * This should be triggered before the React render starts because
 * this is often late into the interaction.
 *
 * This will internally start an interaction and return the ID. This ID
 * should be passed to a <ReactInteractionTracing> component. When that
 * component renders & commits without any loading state then the
 * interaction will be automatically completed. You may use
 * `waitForInteraction` to await and use the interaction results to log.
 */

function startInteraction(type, name, metadata, startTime) {
  var _ref2;

  const uid = RandomUtils.generateUUID();

  let interactionResolve = _ => {};

  const completionPromise = new Promise(resolve => {
    interactionResolve = resolve;
  });
  const isRevisit = visitedInteractions.has(name);
  visitedInteractions.add(name);
  interactions[uid] = {
    id: String(uid),
    startTime: (_ref2 = startTime !== null && startTime !== void 0 ? startTime : getCurrentEventStart()) !== null && _ref2 !== void 0 ? _ref2 : performanceNow(),
    completionPromise,
    resolve: interactionResolve,
    completedLoadingStates: [],
    type,
    name,
    isRevisit,
    backgrounded: isSSR || document.visibilityState !== 'visible',
    metadata,
    jsBytesStart: type === InteractionType.INITIAL_LOAD ? 0 : getJSSize(),
    cssBytesStart: type === InteractionType.INITIAL_LOAD ? 0 : getCSSSize()
  };

  if (!isSSR) {
    const visibilityCallback = function () {
      if (document.visibilityState !== 'visible') {
        interactions[uid].backgrounded = true;
      }
    };

    document.addEventListener('visibilitychange', visibilityCallback);
    completionPromise.finally(() => {
      document.removeEventListener('visibilitychange', visibilityCallback);
    });
    eventTrackerInit();
  }

  return interactions[uid];
}
/**
 * Helper to start the first navigation interaction. This should only be
 * called once.
 */

function startInteractionInitialLoad(name) {
  return startInteraction(InteractionType.INITIAL_LOAD, name, undefined, 0);
}
/**
 * Use to wait on and get the results of an interaction. If given a valid
 * interaction ID then you'll receive a promise of the interaction results
 * that can be used to log the results.
 *
 * NOTE: It is NOT recommended to make any behavioral changes to the
 * application based on this metrics. For instance it may be tempting to
 * trigger background work only after a page load. After this is a bad idea
 * because 1) performance metrics are not always correct, 2) you may cause
 * the metric not to complete if you accidental form a loading cycle,
 * 3) you may hurt performance.
 */

function waitForInteraction(interaction) {
  if (!interaction) {
    return null;
  }

  return interaction.completionPromise;
}
/**
 * Subscribe to all interaction completion event. This is useful to log all
 * results.
 */

function notifyOnInteractionComplete(callback) {
  notifyList.push(callback);
  return () => {
    notifyList = notifyList.filter(cb => cb !== callback);
  };
}

const activeImperativeInteractions = new Map();
function startImperativeInteraction(type, name, metadata) {
  var _activeImperativeInte;

  let startTime = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : performance.now();
  const interaction = startInteraction(type, name, metadata, startTime);
  const interactionMapByType = (_activeImperativeInte = activeImperativeInteractions.get(type)) !== null && _activeImperativeInte !== void 0 ? _activeImperativeInte : new Map();
  activeImperativeInteractions.set(type, interactionMapByType);
  const prevInteraction = interactionMapByType.get(name);
  interactionMapByType.set(name, interaction);

  if (prevInteraction) {
    stopInteraction(prevInteraction, InteractionStatus.CANCELLED);
  }

  interactionMapByType.set(name, interaction);
}
function stopImperativeInteraction(type, name) {
  var _activeImperativeInte2;

  let endTimeInitial = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : performance.now();
  const interactionMapByType = (_activeImperativeInte2 = activeImperativeInteractions.get(type)) !== null && _activeImperativeInte2 !== void 0 ? _activeImperativeInte2 : new Map();
  const interaction = interactionMapByType.get(name);

  if (!interaction) {
    return null;
  }

  stopInteraction(interaction, InteractionStatus.SUCCESSFUL, endTimeInitial);
  return interaction;
}
function testReset() {
  activeImperativeInteractions.clear();
}

async function paintCompleteAndInteractive() {
  const waitRAF = () => new Promise(resolve => requestAnimationFrame(resolve));

  const waitSetTimeout = () => new Promise(resolve => setTimeout(resolve));

  await waitRAF();
  await waitRAF(); // Wait for interactive

  await waitSetTimeout();
  await waitSetTimeout();
}

/**
 * This module serves as the 'public API' for observability.
 */
let recordEventFunc;

let jsExceptionMeasurementTagsFunc = a => a !== null && a !== void 0 ? a : {};

const bufferRecordEvent = [];
/**
 * Log the error to our error exception service and the Chrome DevTools console.
 *
 * Usage:
 *   * logError(ex);
 *   * logError("Failed to init MFE", ex);
 *   * logError("Unexpected");
 */

function logError(messageOrError, error, additionalTags) {
  logJSException(messageOrError, error, additionalTags); // eslint-disable-next-line no-console -- Accepted usage

  console.error(messageOrError, error);
}
/**
 * Log the error to our error exception service and the Chrome DevTools console.
 *
 * A warning does not raise an ES ticket unlike a logError(...). It should be used as an FYI
 * that certain code paths or recoverable flows are hit. For instance if performance optimizations
 * like preloading aren't working we can use warning observability to track it.
 */

function logWarning(messageOrError, error, additionalTags) {
  logJSException(messageOrError, error, { ...additionalTags,
    jsExceptionSeverity: 'warning'
  }); // eslint-disable-next-line no-console -- Accepted usage

  console.warn(messageOrError, error);
}
/**
 * Log an event to logfood under usage_logs.
 *
 * Differs from window.recordEvent in that 1) its always define, 2) buffers before init,
 * 3) reduces window.* API usage which will minimize the MFE API surface.
 */

function recordEvent(eventName, additionalTags, eventData) {
  const recordEventImpl = () => {
    var _recordEventFunc;

    (_recordEventFunc = recordEventFunc) === null || _recordEventFunc === void 0 ? void 0 : _recordEventFunc(eventName, {
      mfeId: DATABRICKS_MFE_ID,
      ...additionalTags
    }, eventData);
  };

  if (!recordEventFunc) {
    // Bufer for later
    bufferRecordEvent.push(recordEventImpl);
    return;
  }

  recordEventImpl();
}
/**
 * Only use in App init to provide a logger module. recordEvent will buffer until this is called.
 */

function registerRecordEvent(recordEventFuncParam, jsExceptionMeasurementTagsFuncParam) {
  recordEventFunc = recordEventFuncParam;
  jsExceptionMeasurementTagsFunc = jsExceptionMeasurementTagsFuncParam; // Flush pending startup logs

  bufferRecordEvent.forEach(cb => cb());
  bufferRecordEvent.length = 0;
}
function unregisterRecordEvent() {
  recordEventFunc = undefined;

  jsExceptionMeasurementTagsFunc = a => a !== null && a !== void 0 ? a : {};
}

function logJSException(messageOrError, errorIn, additionalTags) {
  let error;

  if (messageOrError instanceof Error) {
    error = messageOrError;
  } else if (errorIn instanceof Error) {
    error = errorIn;
  } else if (!messageOrError && errorIn) {
    error = new Error(String(errorIn));
  } else {
    error = new Error(String(messageOrError));
  }

  let message;

  if (typeof messageOrError === 'string') {
    message = messageOrError;
  } else if (messageOrError instanceof Error) {
    message = messageOrError.message;
  } else {
    message = 'No error message provided';
  }

  const tags = jsExceptionMeasurementTagsFunc({
    eventType: 'jsExceptionV3',
    ...additionalTags,
    jsExceptionMessage: message
  });
  recordEvent('jsException', tags, error && error.stack && error.stack.toString());
}

export { InteractionName, InteractionStatus, InteractionType, LoadingDescription, ReactInteractionContext, ReactInteractionHold, ReactInteractionIDContext, ReactInteractionTracing, ReactMemoAB, getCSSSize, getCoinFlipABGroup, getCoinFlipExposures, getJSSize, logError, logWarning, measure, notifyOnInteractionComplete, paintCompleteAndInteractive, performanceNow, recordEvent, registerRecordEvent, startImperativeInteraction, startInteraction, startInteractionInitialLoad, stopImperativeInteraction, testReset, unregisterRecordEvent, waitForInteraction };
//# sourceMappingURL=metrics.js.map
