import { useCallback, useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import { UniverseFrontendApis } from '../../../../../common/utils/UniverseFrontendApis';
import { OverflowMenu } from '../../../../../shared/building_blocks/PageHeader';
import { ExperimentEntity } from '../../../../types';
import { getExperimentType } from '../../utils/experiment-page.utils';

const currentTopWindow = window.top || window;

/**
 * Experiment page header part responsible for displaying menu
 * with rename and delete buttons
 */
export const ExperimentViewManagementMenu = ({ experiment }: { experiment: ExperimentEntity }) => {
  /**
   * Extract the last part of the experiment name
   */
  const normalizedExperimentName = useMemo(
    () => experiment.name.split('/').pop(),
    [experiment.name],
  );

  const showRenameModal = useCallback(() => {
    UniverseFrontendApis.renameExperiment({
      id: experiment.experiment_id,
      name: normalizedExperimentName,
      fullLocation: experiment.name,
      experimentType: getExperimentType(experiment),
    }).then(() => {
      window.location.reload();
    });
  }, [experiment, normalizedExperimentName]);

  const showDeleteModal = useCallback(() => {
    UniverseFrontendApis.deleteExperiment({
      id: experiment.experiment_id,
      name: normalizedExperimentName,
      fullLocation: experiment.name,
      experimentType: getExperimentType(experiment),
    }).then(() => {
      /**
       * This is a somewhat obscure, but currently used method to navigate to the
       * experiment observatory path. Will be replaced with proper IPC handler in the future.
       */
      const observatoryPath = currentTopWindow.location.href.split('/').slice(0, -1).join('/');
      currentTopWindow.location.assign(observatoryPath);
    });
  }, [experiment, normalizedExperimentName]);

  const experimentOverflowItems = useMemo(() => {
    const menuItems: any[] = [];
    const { allowed_actions } = experiment;

    if (allowed_actions.includes('RENAME')) {
      menuItems.push({
        id: 'rename',
        itemName: (
          <FormattedMessage
            defaultMessage='Rename'
            description='Text for rename button on experiment view page header'
          />
        ),
        onClick: showRenameModal,
      });
    }

    if (allowed_actions.includes('DELETE')) {
      menuItems.push({
        id: 'delete',
        itemName: (
          <FormattedMessage
            defaultMessage='Delete'
            description='Text for delete button on experiment view page header'
          />
        ),
        onClick: showDeleteModal,
      });
    }

    return menuItems;
  }, [experiment, showDeleteModal, showRenameModal]);

  /* TODO: ensure that E2E tests are working after refactor is complete */
  return <OverflowMenu data-test-id='experiment-view-page-header' menu={experimentOverflowItems} />;
};
