import { ATTRIBUTE_COLUMN_LABELS } from '../../../../constants';
import { SearchExperimentRunsFacetsState } from '../../models/SearchExperimentRunsFacetsState';
import {
  createRunsColumnDefinitions,
  EXPERIMENT_CELL_RENDERER_KEYS,
  EXPERIMENT_FIELD_PREFIX_METRIC,
  EXPERIMENT_FIELD_PREFIX_PARAM,
  EXPERIMENT_FIELD_PREFIX_TAG,
} from './ExperimentViewRuns.column-utils';

describe('ExperimentViewRuns column utils', () => {
  test('it creates proper column definitions with attributes', () => {
    const facetsState = new SearchExperimentRunsFacetsState();

    const columnDefinitions = createRunsColumnDefinitions(
      facetsState,
      () => {},
      () => {},
      false,
      [],
      [],
      [],
    );

    // Assert existence of regular attribute columns
    expect(columnDefinitions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          headerName: ATTRIBUTE_COLUMN_LABELS.DATE,
          cellRenderer: EXPERIMENT_CELL_RENDERER_KEYS.DateCellRenderer,
        }),
        expect.objectContaining({
          headerName: ATTRIBUTE_COLUMN_LABELS.DURATION,
        }),
        expect.objectContaining({
          headerName: ATTRIBUTE_COLUMN_LABELS.RUN_NAME,
        }),
        expect.objectContaining({
          headerName: ATTRIBUTE_COLUMN_LABELS.USER,
        }),
        expect.objectContaining({
          headerName: ATTRIBUTE_COLUMN_LABELS.SOURCE,
          cellRenderer: EXPERIMENT_CELL_RENDERER_KEYS.SourceCellRenderer,
        }),
        expect.objectContaining({
          headerName: ATTRIBUTE_COLUMN_LABELS.VERSION,
          cellRenderer: EXPERIMENT_CELL_RENDERER_KEYS.VersionCellRenderer,
        }),
        expect.objectContaining({
          headerName: ATTRIBUTE_COLUMN_LABELS.MODELS,
          cellRenderer: EXPERIMENT_CELL_RENDERER_KEYS.ModelsCellRenderer,
        }),
      ]),
    );

    // Assert not having experiment name when not comparing experiments
    expect(columnDefinitions).toEqual(
      expect.not.arrayContaining([
        expect.objectContaining({
          headerName: ATTRIBUTE_COLUMN_LABELS.EXPERIMENT_NAME,
          cellRenderer: EXPERIMENT_CELL_RENDERER_KEYS.ExperimentNameCellRenderer,
        }),
      ]),
    );
  });
  test('it creates experiment name column definition for comparing experiments', () => {
    const facetsState = new SearchExperimentRunsFacetsState();

    const columnDefinitions = createRunsColumnDefinitions(
      facetsState,
      () => {},
      () => {},
      true,
      [],
      [],
      [],
    );

    expect(columnDefinitions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          headerName: ATTRIBUTE_COLUMN_LABELS.EXPERIMENT_NAME,
          cellRenderer: EXPERIMENT_CELL_RENDERER_KEYS.ExperimentNameCellRenderer,
        }),
      ]),
    );
  });
  test('it creates proper column definitions with metric and params', () => {
    const facetsState = new SearchExperimentRunsFacetsState();

    const columnDefinitions = createRunsColumnDefinitions(
      facetsState,
      () => {},
      () => {},
      false,
      ['metric1', 'metric2'],
      ['param1', 'param2'],
      ['tag1', 'tag2'],
    );

    expect(columnDefinitions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          children: expect.arrayContaining([
            expect.objectContaining({
              field: `${EXPERIMENT_FIELD_PREFIX_PARAM}-param1`,
            }),
            expect.objectContaining({
              field: `${EXPERIMENT_FIELD_PREFIX_PARAM}-param2`,
            }),
          ]),
        }),
        expect.objectContaining({
          children: expect.arrayContaining([
            expect.objectContaining({
              field: `${EXPERIMENT_FIELD_PREFIX_METRIC}-metric1`,
            }),
            expect.objectContaining({
              field: `${EXPERIMENT_FIELD_PREFIX_METRIC}-metric2`,
            }),
          ]),
        }),
        expect.objectContaining({
          children: expect.arrayContaining([
            expect.objectContaining({
              field: `${EXPERIMENT_FIELD_PREFIX_TAG}-tag1`,
            }),
            expect.objectContaining({
              field: `${EXPERIMENT_FIELD_PREFIX_TAG}-tag2`,
            }),
          ]),
        }),
      ]),
    );
  });

  test('it disables attribute columns basing on sort filter state', () => {
    const facetsState = new SearchExperimentRunsFacetsState();

    facetsState.categorizedUncheckedKeys.attributes = [
      ATTRIBUTE_COLUMN_LABELS.DATE,
      ATTRIBUTE_COLUMN_LABELS.DURATION,
      ATTRIBUTE_COLUMN_LABELS.SOURCE,
    ];

    const columnDefinitions = createRunsColumnDefinitions(
      facetsState,
      () => {},
      () => {},
      false,
      [],
      [],
      [],
    );

    // Assert that disabled attribute columns are *not* being displayed
    expect(columnDefinitions).toEqual(
      expect.not.arrayContaining([
        expect.objectContaining({
          headerName: ATTRIBUTE_COLUMN_LABELS.DATE,
          cellRenderer: EXPERIMENT_CELL_RENDERER_KEYS.DateCellRenderer,
        }),
        expect.objectContaining({
          headerName: ATTRIBUTE_COLUMN_LABELS.DURATION,
        }),
        expect.objectContaining({
          headerName: ATTRIBUTE_COLUMN_LABELS.SOURCE,
          cellRenderer: EXPERIMENT_CELL_RENDERER_KEYS.SourceCellRenderer,
        }),
      ]),
    );

    // Assert that remaining attribute columns are being displayed
    expect(columnDefinitions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          headerName: ATTRIBUTE_COLUMN_LABELS.RUN_NAME,
        }),
        expect.objectContaining({
          headerName: ATTRIBUTE_COLUMN_LABELS.USER,
        }),

        expect.objectContaining({
          headerName: ATTRIBUTE_COLUMN_LABELS.VERSION,
          cellRenderer: EXPERIMENT_CELL_RENDERER_KEYS.VersionCellRenderer,
        }),
        expect.objectContaining({
          headerName: ATTRIBUTE_COLUMN_LABELS.MODELS,
          cellRenderer: EXPERIMENT_CELL_RENDERER_KEYS.ModelsCellRenderer,
        }),
      ]),
    );
  });
});
