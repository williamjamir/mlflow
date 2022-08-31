// Wrapper around the events textarea, to allow auto-scroll to the bottom on update.
import React from 'react';
import PropTypes from 'prop-types';
import Utils from '../../common/utils/Utils';

export class VersionEventsContainer extends React.Component {
  static propTypes = {
    events: PropTypes.array,
    selectedVersionName: PropTypes.string,
  };

  eventsTextarea = React.createRef();

  componentDidUpdate(prevProps) {
    if (this.props.events !== prevProps.events) {
      this.eventsTextarea.current.scrollTop = this.eventsTextarea.current.scrollHeight;
    }
  }

  render() {
    const { events, selectedVersionName } = this.props;
    if (selectedVersionName === undefined) {
      return 'No version is selected.';
    }
    const selected_events =
      events === undefined
        ? 'Loading...'
        : events
            .filter((x) => x.endpoint_version_name === selectedVersionName)
            .map((x) => [Utils.formatTimestamp(x.timestamp), x.message].join('\t'))
            .reverse()
            .join('\n');
    return (
      <div css={eventsContainerStyles}>
        <textarea
          ref={this.eventsTextarea}
          className={'serving-events-textarea'}
          readOnly
          value={selected_events}
        />
      </div>
    );
  }
}

const eventsContainerStyles = {
  '.serving-events-textarea': {
    height: '400px',
    width: '100%',
  },
};
