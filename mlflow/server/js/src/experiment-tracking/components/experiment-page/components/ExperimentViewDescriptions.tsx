import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Descriptions } from '../../../../common/components/Descriptions';
import { ExperimentEntity } from '../../../types';
import { ExperimentViewArtifactLocation } from './ExperimentViewArtifactLocation';

export const ExperimentViewDescriptions = React.memo(
  ({ experiment }: { experiment: ExperimentEntity }) => {
    const intl = useIntl();

    return (
      <Descriptions columns={2}>
        <Descriptions.Item
          label={intl.formatMessage({
            defaultMessage: 'Experiment ID',
            description: 'Label for displaying the current experiment in view',
          })}
        >
          {experiment.experiment_id}
        </Descriptions.Item>
        <Descriptions.Item
          label={
            <FormattedMessage
              defaultMessage='Artifact Location'
              description='Label for displaying the experiment artifact location'
            />
          }
        >
          <ExperimentViewArtifactLocation artifactLocation={experiment.artifact_location} />
        </Descriptions.Item>
      </Descriptions>
    );
  },
);
