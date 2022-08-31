import React from 'react';
import PropTypes from 'prop-types';
import { Alert } from '@databricks/design-system';
import Utils from '../../common/utils/Utils';
import { FormattedMessage } from 'react-intl';

export class MonitoringErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static propTypes = {
    children: PropTypes.node,
  };

  componentDidCatch(error, errorInfo) {
    this.setState({ hasError: true });
    Utils.propagateErrorToParentFrame({errorMessage: error.message, error: error});
    console.error(error, errorInfo);
  }

  render() {
    return this.state.hasError ? (
      <Alert
        closable={false}
        type='error'
        message={
          <FormattedMessage
            defaultMessage='Something went wrong'
            description='Page level error boundary alert header.'
          />
        }
        description={
          <FormattedMessage
            defaultMessage='Unable to load the page. Try again later.'
            description='Page level error boundary alert description'
          />
        }
      />
    ) : (
      this.props.children
    );
  }
}
