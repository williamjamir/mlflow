import { Button } from '@databricks/design-system';
import { useCallback } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { UniverseFrontendApis } from '../../../../../common/utils/UniverseFrontendApis';
import { ExperimentEntity } from '../../../../types';
import {
  isExperimentTypeDefault,
  isExperimentTypeNotebook,
} from '../../utils/experiment-page.utils';

/**
 * Experiment page header part responsible for displaying button
 * that invokes edit permission modal
 */
export const ExperimentViewHeaderEditPermissions = ({
  experiment,
}: {
  experiment: ExperimentEntity;
}) => {
  const intl = useIntl();

  const showEditPermissionModal = useCallback(() => {
    if (isExperimentTypeDefault(experiment)) {
      UniverseFrontendApis.editExperimentPermission({
        experiment: experiment.experiment_id,
        experimentUrl: window.top?.location.href || window.location.href,
      });
    } else if (isExperimentTypeNotebook(experiment)) {
      UniverseFrontendApis.editNotebookPermission({
        notebook: experiment.experiment_id,
        experimentUrl: window.top?.location.href || window.location.href,
        helperText: intl.formatMessage({
          defaultMessage:
            // eslint-disable-next-line no-multi-str
            'Note: This action will also modify the permissions on the notebook \
                that corresponds to this experiment.',
          description: 'Experiment permission: in a notebook experiment',
        }),
      });
    }
  }, [experiment, intl]);

  /* TODO: ensure that E2E tests are working after refactor is complete */
  return (
    <Button onClick={showEditPermissionModal} data-test-id='share-button'>
      <FormattedMessage
        defaultMessage='Share'
        description='Text for share button on experiment view page header'
      />
    </Button>
  );
};
