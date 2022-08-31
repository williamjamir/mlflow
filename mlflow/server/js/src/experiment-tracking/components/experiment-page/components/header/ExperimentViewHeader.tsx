import React, { useMemo } from 'react';
// BEGIN-EDGE
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';
import Routes from '../../../../routes';
import { ExperimentViewManagementMenu } from './ExperimentViewManagementMenu';
// END-EDGE
import { PageHeader } from '../../../../../shared/building_blocks/PageHeader';
import { canModifyExperiment } from '../../utils/experiment-page.utils';
import { ExperimentViewCopyTitle } from './ExperimentViewCopyTitle';
import { ExperimentViewHeaderEditPermissions } from './ExperimentViewHeaderEditPermissions';
import { ExperimentViewHeaderShareButton } from './ExperimentViewHeaderShareButton';
import { ExperimentEntity } from '../../../../types';

/**
 * Header for a single experiment page. Displays title, breadcrumbs and provides
 * controls for renaming, deleting and editing permissions.
 */
export const ExperimentViewHeader = React.memo(
  ({ experiment }: { experiment: ExperimentEntity }) => {
    // eslint-disable-next-line prefer-const
    let breadcrumbs: React.ReactNode[] = [];
    // BEGIN-EDGE
    breadcrumbs = useMemo(
      () => [
        <Link to={Routes.experimentsObservatoryRoute} data-test-id='experiment-observatory-link'>
          <FormattedMessage
            defaultMessage='Experiments'
            description='Breadcrumb nav item to link to the list of experiments page'
          />
        </Link>,
        experiment.name,
      ],
      [experiment.name],
    );
    // END-EDGE

    /* eslint-disable prettier/prettier */
    return (
      <PageHeader
        title={
          <>
            {experiment.name} <ExperimentViewCopyTitle experiment={experiment} />
          </>
        }
        breadcrumbs={breadcrumbs}
      >
        {/* BEGIN-EDGE */}
        {/* Management menu is available only in Databricks context */}
        <ExperimentViewManagementMenu experiment={experiment} />
        {canModifyExperiment(experiment) ? (
          <ExperimentViewHeaderEditPermissions experiment={experiment} />
        ) : (
          // END-EDGE
          <ExperimentViewHeaderShareButton />
          // BEGIN-EDGE
        )}
        {/* END-EDGE */}
      </PageHeader>
    );
    /* eslint-enable prettier/prettier */
  },
);
