import React from 'react';
import {
  CircleIcon as DuboisCircleIcon,
  CheckCircleBorderIcon,
  useDesignSystemTheme,
  WarningFillIcon,
} from '@databricks/design-system';
import { PropTypes } from 'prop-types';
// BEGIN-EDGE
import DatabricksUtils from '../common/utils/DatabricksUtils';
import { DatabricksModelRegistryEmailDocUrl } from '../common/constants-databricks';
import { FormattedMessage } from 'react-intl';
import { CloudProvider } from '../shared/constants-databricks';

// END-EDGE
/**
 * Get a unique key for a model version object.
 * @param modelName
 * @param version
 * @returns {string}
 */
export const getModelVersionKey = (modelName, version) => `${modelName}_${version}`;

// BEGIN-EDGE
// Our proto API for the Databricks version of Get/List calls appends "_databricks" to
// the end, for no particular reason.
export const getProtoField = (fieldName) => `${fieldName}_databricks`;

export const getModelVersionFollowSubscriptionTooltip = (user_id, window) => {
  if (window && window.top && window.top.settings && window.top.settings.user === user_id) {
    return (
      <FormattedMessage
        defaultMessage='You are following this model version because you created it.'
        description='Tooltip text message for model version creator in model registry'
      />
    );
  } else {
    return (
      <FormattedMessage
        defaultMessage='You are following this model version because you interacted with
           it (via comments, transition requests, etc.)'
        description='Tooltip text message for user that interacted with the model version
           in the model registry'
      />
    );
  }
};

export const getModelRegistryEmailNotificationsDocsUri = () => {
  const cloudProvider = DatabricksUtils.getCloudProvider() || CloudProvider.AWS;
  return DatabricksModelRegistryEmailDocUrl[cloudProvider];
};
// END-EDGE
export const oss_getProtoField = (fieldName) => `${fieldName}`;

export function ReadyIcon() {
  const { theme } = useDesignSystemTheme();
  return <CheckCircleBorderIcon css={{ color: theme.colors.textValidationSuccess }} />;
}

export function FailedIcon() {
  const { theme } = useDesignSystemTheme();
  return <WarningFillIcon css={{ color: theme.colors.textValidationDanger }} />;
}

export function CircleIcon({ type }) {
  const { theme } = useDesignSystemTheme();
  let color;
  switch (type) {
    case 'FAILED': {
      color = theme.colors.textValidationDanger;
      break;
    }
    case 'PENDING': {
      color = theme.colors.yellow400; // textValidationWarning was too dark/red
      break;
    }
    case 'READY':
    default: {
      color = theme.colors.green500;
      break;
    }
  }
  return <DuboisCircleIcon css={{ color, fontSize: 16 }} />;
}
CircleIcon.propTypes = {
  type: PropTypes.oneOf(['FAILED', 'PENDING', 'READY']).isRequired,
};
