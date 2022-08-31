import { Typography } from '@databricks/design-system';
import { useIntl } from 'react-intl';
import { ExperimentEntity } from '../../../../types';

/**
 * Experiment page header part responsible for copying
 * the title after clicking on the icon
 */
export const ExperimentViewCopyTitle = ({ experiment }: { experiment: ExperimentEntity }) => {
  const intl = useIntl();

  return (
    <Typography.Text
      size='xl'
      dangerouslySetAntdProps={{
        copyable: {
          text: experiment.name,
          tooltips: [
            intl.formatMessage({
              defaultMessage: 'Copy',
              description: 'Copy tooltip to copy experiment name from experiment runs table header',
            }),
          ],
        },
      }}
    />
  );
};
