import React, { Component } from 'react';
import './AppErrorBoundary.css';
import defaultErrorImg from '../../static/default-error.svg';
import PropTypes from 'prop-types';
import Utils from '../../utils/Utils';

class AppErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static propTypes = {
    // BEGIN-EDGE
    service: PropTypes.string,
    // END-EDGE
    children: PropTypes.node,
  };

  componentDidCatch(error, errorInfo) {
    this.setState({ hasError: true });
    // BEGIN-EDGE
    Utils.propagateErrorToParentFrame({
      errorMessage: error.message,
      error: error,
      jsExceptionService: this.props.service,
    });
    // END-EDGE
    console.error(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div>
          <img className='error-image' alt='Error' src={defaultErrorImg} />
          <h1 className={'center'}>Something went wrong</h1>
          <h4 className={'center'}>
            If this error persists, please report an issue {/* Reported during ESLint upgrade */}
            {/* eslint-disable-next-line react/jsx-no-target-blank */}
            <a href={Utils.getSupportPageUrl()} target='_blank'>
              here
            </a>
            .
          </h4>
        </div>
      );
    }
    return this.props.children;
  }
}

export default AppErrorBoundary;
