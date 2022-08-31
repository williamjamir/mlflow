import React, { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
// BEGIN-EDGE
import { Link } from 'react-router-dom';
import Routes from '../../../../routes';
// END-EDGE
import { PageHeader } from '../../../../../shared/building_blocks/PageHeader';
import { ExperimentViewHeaderShareButton } from './ExperimentViewHeaderShareButton';
import { ExperimentEntity } from '../../../../types';

/**
 * Header for experiment compare page. Displays title and breadcrumbs.
 */
export const ExperimentViewHeaderCompare = React.memo(
  ({ experiments }: { experiments: ExperimentEntity[] }) => {
    const pageTitle = useMemo(
      () => (
        <FormattedMessage
          defaultMessage='Displaying Runs from {numExperiments} Experiments'
          description='Message shown when displaying runs from multiple experiments'
          values={{
            numExperiments: experiments.length,
          }}
        />
      ),
      [experiments.length],
    );

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
        <FormattedMessage
          defaultMessage='Displaying Runs from {numExperiments} Experiments'
          description='Message shown when displaying runs from multiple experiments'
          values={{
            numExperiments: experiments.length,
          }}
        />,
      ],
      [experiments.length],
    );
    // END-EDGE

    /* eslint-disable prettier/prettier */
    return (
      <PageHeader title={pageTitle} breadcrumbs={breadcrumbs}>
        <ExperimentViewHeaderShareButton />
      </PageHeader>
    );
    /* eslint-enable prettier/prettier */
  },
);
