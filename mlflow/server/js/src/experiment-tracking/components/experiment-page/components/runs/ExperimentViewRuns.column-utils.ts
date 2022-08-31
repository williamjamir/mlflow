import { ColDef } from '@ag-grid-community/core';
import { Spinner } from '@databricks/design-system';
import { isEqual } from 'lodash';
import { ExperimentRunsTableEmptyOverlay } from '../../../../../common/components/ExperimentRunsTableEmptyOverlay';
import Utils from '../../../../../common/utils/Utils';
import {
  ATTRIBUTE_COLUMN_LABELS,
  ATTRIBUTE_COLUMN_SORT_KEY,
  COLUMN_TYPES,
} from '../../../../constants';
import { SearchExperimentRunsFacetsState } from '../../models/SearchExperimentRunsFacetsState';
import { ColumnHeaderCell } from './cells/ColumnHeaderCell';
import { DateCellRenderer } from './cells/DateCellRenderer';
import { ExperimentNameCellRenderer } from './cells/ExperimentNameCellRenderer';
import { ModelsCellRenderer } from './cells/ModelsCellRenderer';
import { SourceCellRenderer } from './cells/SourceCellRenderer';
import { VersionCellRenderer } from './cells/VersionCellRenderer';
import { RunRowType } from './ExperimentViewRuns.types';

/**
 * Creates canonical sort key name for metrics and params
 */
export const makeCanonicalSortKey = (keyType: string, keyName: string) =>
  keyType + '.`' + keyName + '`';

/*
 * Functions used to generate grid field names for params, metrics and prefixes
 */
const createParamFieldName = (key: string) => `${EXPERIMENT_FIELD_PREFIX_PARAM}-${key}`;
const createMetricFieldName = (key: string) => `${EXPERIMENT_FIELD_PREFIX_METRIC}-${key}`;
const createTagFieldName = (key: string) => `${EXPERIMENT_FIELD_PREFIX_TAG}-${key}`;

/**
 * Functions returns all framework components to be used by agGrid
 */
export const getFrameworkComponents = () => ({
  agColumnHeader: ColumnHeaderCell,
  noRowsOverlayComponent: ExperimentRunsTableEmptyOverlay,
  loadingOverlayComponent: Spinner,

  [EXPERIMENT_CELL_RENDERER_KEYS.ModelsCellRenderer]: ModelsCellRenderer,
  [EXPERIMENT_CELL_RENDERER_KEYS.SourceCellRenderer]: SourceCellRenderer,
  [EXPERIMENT_CELL_RENDERER_KEYS.ExperimentNameCellRenderer]: ExperimentNameCellRenderer,
  [EXPERIMENT_CELL_RENDERER_KEYS.VersionCellRenderer]: VersionCellRenderer,
  [EXPERIMENT_CELL_RENDERER_KEYS.DateCellRenderer]: DateCellRenderer,
});

/**
 * Function returns unique row ID to be used in runs table
 */
export const getRowId = ({ data }: { data: RunRowType }) => data.runUuid;

/**
 * Function creates agGrid-compatible column definitions basing on currently
 * used sort-filter model and provided list of metrics, params and tags.
 *
 * @param sortFilterState actually used sort-filter model
 * @param onSortBy
 * @param onExpand
 * @param compareExperiments
 * @param metricKeyList
 * @param paramKeyList
 * @param tagKeyList
 * @returns
 */
export const createRunsColumnDefinitions = (
  facetsState: SearchExperimentRunsFacetsState,
  onSortBy: (newOrderByKey: string, newOrderByAsc: boolean) => void,
  onExpand: (parentUuid: string, childrenIds: string[]) => void,
  compareExperiments: boolean,
  metricKeyList: string[],
  paramKeyList: string[],
  tagKeyList: string[],
) => {
  const { categorizedUncheckedKeys, orderByAsc, orderByKey } = facetsState;
  const commonSortOrderProps = { orderByKey, orderByAsc, onSortBy };

  const getOrderedByClassName = (key: string) => (key === orderByKey ? 'is-ordered-by' : undefined);

  const getHeaderClassName = (key: string) => getOrderedByClassName(key);
  const getCellClassName = ({ colDef }: { colDef: ColDef }) =>
    getOrderedByClassName(colDef.headerComponentParams.canonicalSortKey);

  const columns: ColDefWithChildren[] = [];

  const addVisibleColumn = (columnDefinition: ColDefWithChildren) => {
    if (!categorizedUncheckedKeys.attributes.includes(columnDefinition.headerName || '')) {
      columns.push(columnDefinition);
    }
  };

  // Add columns one by one, depending on visibility:

  // Checkbox selection column
  addVisibleColumn({
    field: '',
    checkboxSelection: true,
    headerCheckboxSelection: true,
    pinned: 'left',
    initialWidth: 50,
  });

  // Date and expander selection column
  addVisibleColumn({
    headerName: ATTRIBUTE_COLUMN_LABELS.DATE,
    field: 'runDateAndNestInfo',
    pinned: 'left',
    initialWidth: 150,
    cellRenderer: EXPERIMENT_CELL_RENDERER_KEYS.DateCellRenderer,
    cellRendererParams: { onExpand },
    equals: (dateInfo1, dateInfo2) => isEqual(dateInfo1, dateInfo2),
    sortable: true,
    headerComponentParams: {
      ...commonSortOrderProps,
      canonicalSortKey: ATTRIBUTE_COLUMN_SORT_KEY.DATE,
      getClassName: getHeaderClassName,
    },
    cellClass: getCellClassName,
  });

  // Experiment name column
  if (compareExperiments) {
    addVisibleColumn({
      headerName: ATTRIBUTE_COLUMN_LABELS.EXPERIMENT_NAME,
      field: 'experimentName',
      cellRenderer: EXPERIMENT_CELL_RENDERER_KEYS.ExperimentNameCellRenderer,
      equals: (experimentName1, experimentName2) => isEqual(experimentName1, experimentName2),
      pinned: 'left',
      initialWidth: 140,
      cellClass: getCellClassName,
    });
  }
  // Duration column
  addVisibleColumn({
    headerName: ATTRIBUTE_COLUMN_LABELS.DURATION,
    field: 'duration',
    pinned: 'left',
    initialWidth: 80,
    cellClass: getCellClassName,
  });

  // Run name column
  addVisibleColumn({
    headerName: ATTRIBUTE_COLUMN_LABELS.RUN_NAME,
    pinned: 'left',
    field: 'runName',
    sortable: true,
    headerComponentParams: {
      ...commonSortOrderProps,
      canonicalSortKey: ATTRIBUTE_COLUMN_SORT_KEY.RUN_NAME,
      getClassName: getHeaderClassName,
    },
    cellClass: getCellClassName,
  });

  // User column
  addVisibleColumn({
    headerName: ATTRIBUTE_COLUMN_LABELS.USER,
    field: 'user',
    sortable: true,
    headerComponentParams: {
      ...commonSortOrderProps,
      canonicalSortKey: ATTRIBUTE_COLUMN_SORT_KEY.USER,
      getClassName: getHeaderClassName,
    },
    cellClass: getCellClassName,
  });

  // Source column
  addVisibleColumn({
    headerName: ATTRIBUTE_COLUMN_LABELS.SOURCE,
    field: 'tags',
    cellRenderer: EXPERIMENT_CELL_RENDERER_KEYS.SourceCellRenderer,
    equals: (tags1, tags2) => Utils.getSourceName(tags1) === Utils.getSourceName(tags2),
    sortable: true,
    headerComponentParams: {
      ...commonSortOrderProps,
      canonicalSortKey: ATTRIBUTE_COLUMN_SORT_KEY.SOURCE,
      getClassName: getHeaderClassName,
    },
    cellClass: getCellClassName,
  });

  // Version column
  addVisibleColumn({
    headerName: ATTRIBUTE_COLUMN_LABELS.VERSION,
    field: 'version',
    cellRenderer: EXPERIMENT_CELL_RENDERER_KEYS.VersionCellRenderer,
    equals: (version1, version2) => isEqual(version1, version2),
    sortable: true,
    headerComponentParams: {
      ...commonSortOrderProps,
      canonicalSortKey: ATTRIBUTE_COLUMN_SORT_KEY.VERSION,
      getClassName: getHeaderClassName,
    },
    cellClass: getCellClassName,
  });

  // Models column
  addVisibleColumn({
    headerName: ATTRIBUTE_COLUMN_LABELS.MODELS,
    field: 'models',
    cellRenderer: EXPERIMENT_CELL_RENDERER_KEYS.ModelsCellRenderer,
    initialWidth: 200,
    equals: (models1, models2) => isEqual(models1, models2),
  });

  // Metrics columns
  columns.push({
    headerName: 'Metrics',
    // Add filtered metrics only:
    children: metricKeyList.map((metricKey, i) => {
      const columnKey = makeCanonicalSortKey(COLUMN_TYPES.METRICS, metricKey);
      return {
        headerName: metricKey,
        headerTooltip: metricKey,
        field: createMetricFieldName(metricKey),
        columnGroupShow: i >= MAX_METRICS_COLS && columnKey !== orderByKey ? 'open' : undefined,
        sortable: true,
        headerComponentParams: {
          ...commonSortOrderProps,
          canonicalSortKey: columnKey,
          getClassName: getHeaderClassName,
        },
        cellClass: getCellClassName,
      };
    }),
  });

  // Parameters columns
  columns.push({
    headerName: 'Parameters',
    // Add filtered params only:
    children: paramKeyList.map((paramKey, i) => {
      const columnKey = makeCanonicalSortKey(COLUMN_TYPES.PARAMS, paramKey);
      return {
        headerName: paramKey,
        headerTooltip: paramKey,
        field: createParamFieldName(paramKey),
        columnGroupShow: i >= MAX_PARAMS_COLS && columnKey !== orderByKey ? 'open' : undefined,
        sortable: true,
        headerComponentParams: {
          ...commonSortOrderProps,
          canonicalSortKey: columnKey,
          getClassName: getHeaderClassName,
        },
        cellClass: getCellClassName,
      };
    }),
  });

  // Tags columns
  columns.push({
    headerName: 'Tags',
    // Add filtered tags only:
    children: tagKeyList.map((tagKey, i) => ({
      headerName: tagKey,
      headerTooltip: tagKey,
      field: createTagFieldName(tagKey),
      columnGroupShow: i >= MAX_TAG_COLS ? 'open' : undefined,
    })),
  });

  return columns;
};

type ColDefWithChildren = ColDef & {
  children?: ColDef[];
};

/*
 * Enum for all usable cell renderers
 */
export const EXPERIMENT_CELL_RENDERER_KEYS = {
  ModelsCellRenderer: 'ModelsCellRenderer',
  SourceCellRenderer: 'SourceCellRenderer',
  ExperimentNameCellRenderer: 'ExperimentNameCellRenderer',
  VersionCellRenderer: 'VersionCellRenderer',
  DateCellRenderer: 'DateCellRenderer',
};

export const EXPERIMENTS_DEFAULT_COLUMN_SETUP = {
  initialWidth: 100,
  autoSizePadding: 0,
  headerComponentParams: { menuIcon: 'fa-bars' },
  resizable: true,
  filter: true,
  suppressMenu: true,
  suppressMovable: true,
};

const MAX_PARAMS_COLS = 3;
const MAX_METRICS_COLS = 3;
const MAX_TAG_COLS = 3;

export const EXPERIMENT_FIELD_PREFIX_PARAM = '$$$param$$$';
export const EXPERIMENT_FIELD_PREFIX_METRIC = '$$$metric$$$';
export const EXPERIMENT_FIELD_PREFIX_TAG = '$$$tag$$$';
