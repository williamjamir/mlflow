import React, { useMemo } from 'react';
import { CollapsibleSection } from '../../../../common/components/CollapsibleSection';
import DatabricksUtils from '../../../../common/utils/DatabricksUtils';
import { ExperimentEntity } from '../../../types';
import {
  AutoMLExperimentPanelPage,
  AUTOML_TAG_PREFIX,
} from '../../automl/AutoMLExperimentPanelPage';
import { AutoMLExtractResult, extractAutoMLData } from '../utils/extractAutoMLData';

/**
 * This fixes TS typings until AutoMLExperimentPanelPage is not migrated to TS
 */
const AutoMLExperimentPanelPageTS = AutoMLExperimentPanelPage as any as React.ComponentType<{
  experimentId: string;
  automlExperimentData?: AutoMLExtractResult;
  automlWarnings?: AutoMLExtractResult['warnings'];
}>;

/**
 * AutoML section for a single experiment page. Apart from displaying proper component,
 * enables polling for evaluation metrics and sets proper sort filter if necessary.
 */
export const ExperimentViewAutoML = React.memo(
  ({ experiment }: { experiment: ExperimentEntity }) => {
    const shouldRenderAutoML = useMemo(
      () =>
        experiment &&
        DatabricksUtils.autoMLEnabled() &&
        experiment.tags.find((tag) => tag.key === AUTOML_TAG_PREFIX),
      [experiment],
    );

    /**
     * Check if AutoMLService is in use. If not, extract
     * AutoML tags from experiment.
     */
    const extractedAutoMLDataProps = useMemo(() => {
      if (!shouldRenderAutoML || DatabricksUtils.getConf('autoMLServiceAPIUsed')) {
        return {};
      }
      const automlExperimentData = extractAutoMLData(experiment);
      return {
        automlExperimentData,
        automlWarnings: automlExperimentData.warnings,
      };
    }, [experiment, shouldRenderAutoML]);

    if (!shouldRenderAutoML) {
      return null;
    }

    return (
      <CollapsibleSection title='AutoML' data-test-id='experiment-automl-section'>
        <AutoMLExperimentPanelPageTS
          data-test-id='automl-enabled'
          experimentId={experiment.experiment_id}
          {...extractedAutoMLDataProps}
        />
      </CollapsibleSection>
    );
  },
);
