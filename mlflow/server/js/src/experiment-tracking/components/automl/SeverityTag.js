import { Tag } from '@databricks/design-system';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import React from 'react';

export const SEVERITY = {
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW',
};

export const severitySorter = (a, b) => {
  const severityPriority = {
    [SEVERITY.HIGH]: 3,
    [SEVERITY.MEDIUM]: 2,
    [SEVERITY.LOW]: 1,
  };
  return severityPriority[a.severity] - severityPriority[b.severity];
};

export const SeverityTag = ({ severity }) => {
  switch (severity) {
    case SEVERITY.HIGH:
      return (
        <Tag color='coral'>
          <span>
            <FormattedMessage
              defaultMessage='High'
              description='Text describing a high severity AutoML warning'
            />
          </span>
        </Tag>
      );
    case SEVERITY.MEDIUM:
      return (
        <Tag color='lemon'>
          <span>
            <FormattedMessage
              defaultMessage='Medium'
              description='Text describing a medium severity AutoML warning'
            />
          </span>
        </Tag>
      );
    case SEVERITY.LOW:
      return (
        <Tag color='turquoise'>
          <span>
            <FormattedMessage
              defaultMessage='Low'
              description='Text describing a low severity AutoML warning'
            />
          </span>
        </Tag>
      );
    default:
      return null;
  }
};

SeverityTag.propTypes = {
  severity: PropTypes.oneOf(Object.values(SEVERITY)).isRequired,
};
