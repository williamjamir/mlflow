// Wrapper around the logs textarea, to allow auto-scroll to the bottom on update.
import React from 'react';
import PropTypes from 'prop-types';

export class LogsContainer extends React.Component {
  static propTypes = {
    versionLogs: PropTypes.string,
  };

  logsTextarea = React.createRef();

  componentDidUpdate(prevProps) {
    if (this.props.versionLogs !== prevProps.versionLogs) {
      this.logsTextarea.current.scrollTop = this.logsTextarea.current.scrollHeight;
    }
  }

  render() {
    const { versionLogs } = this.props;
    return (
      <div css={servingLogsContainerStyles}>
        <div>
          <textarea
            ref={this.logsTextarea}
            className='serving-logs-textarea'
            aria-label='serving logs'
            readOnly
            value={versionLogs || 'Loading...'}
          />
        </div>
      </div>
    );
  }
}

const servingLogsContainerStyles = {
  '.serving-logs-textarea': {
    height: '400px',
    width: '100%',
  },
};
