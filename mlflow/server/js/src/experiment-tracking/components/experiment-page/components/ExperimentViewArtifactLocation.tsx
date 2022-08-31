import React from 'react';
// BEGIN-EDGE
import { Tooltip } from '@databricks/design-system';
import { FormattedMessage } from 'react-intl';
import { DatabricksArtifactPermissionsDocUrl } from '../../../../common/constants-databricks';
import DatabricksUtils from '../../../../common/utils/DatabricksUtils';
import { CloudProvider } from '../../../../shared/constants-databricks';
// END-EDGE

export interface ExperimentViewArtifactLocationProps {
  artifactLocation: string;
}

// BEGIN-EDGE
const getArtifactPermissionsLearnMoreLinkUrl = () => {
  // Resolve the workspace's cloud provider. If it is undefined or absent for
  // some reason, default to AWS
  const cloudProvider = DatabricksUtils.getCloudProvider() || CloudProvider.AWS;
  return DatabricksArtifactPermissionsDocUrl[cloudProvider];
};

export const ExperimentViewArtifactLocation = ({
  artifactLocation,
}: React.PropsWithChildren<ExperimentViewArtifactLocationProps>) => {
  if (DatabricksUtils.isArtifactAclsEnabled()) {
    const isPublicArtifactLoc =
      artifactLocation &&
      artifactLocation.startsWith('dbfs:/') &&
      !artifactLocation.startsWith('dbfs:/databricks/mlflow-tracking');
    if (isPublicArtifactLoc) {
      return (
        <>
          {artifactLocation}
          <Tooltip
            title={
              <div>
                <FormattedMessage
                  defaultMessage='This artifact root location is open to all users of the workspace'
                  description='Popover text to explain more about the artifact location'
                />
                <br />
                <FormattedMessage
                  defaultMessage='<link>Learn more</link>'
                  description='Popover link to learn more about the artifact root location'
                  values={{
                    link: (chunks: any) => (
                      <a
                        href={getArtifactPermissionsLearnMoreLinkUrl()}
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        {chunks}
                      </a>
                    ),
                  }}
                />
              </div>
            }
            placement='bottom'
          >
            <span css={(theme) => ({ paddingLeft: theme.spacing.sm })}>
              <i className='fa fa-unlock' style={{ fontSize: 13 }} />
            </span>
          </Tooltip>
        </>
      );
    }
  }

  return <>{artifactLocation}</>;
};
// END-EDGE
export const oss_ExperimentViewArtifactLocation = ({
  artifactLocation,
}: ExperimentViewArtifactLocationProps) => {
  return <>{artifactLocation}</>;
};
