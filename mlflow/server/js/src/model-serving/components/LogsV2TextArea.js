import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { getServingModelKey, LogTypes } from '../utils';

export class LogsV2TextAreaImpl extends React.Component {
  static propTypes = {
    modelName: PropTypes.string.isRequired,
    endpointVersionName: PropTypes.string.isRequired,
    activeReplica: PropTypes.string.isRequired,
    logs: PropTypes.string.isRequired,
    // Value that is displayed when logs are not present.
    defaultString: PropTypes.string,
  };

  static defaultProps = {
    defaultString: 'Loading...',
  };

  render() {
    const { activeReplica, logs } = this.props;
    const replica = activeReplica === null ? 'all' : activeReplica;
    return (
      <div>
        <textarea
          className={`serving-logs-textarea ${replica}`}
          aria-label='serving v2 logs'
          style={{ fontFamily: 'Courier New, monospace' }}
          readOnly
          value={logs || this.props.defaultString}
        />
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  const { modelName, endpointVersionName, activeReplica, logType } = ownProps;
  let logs = '';
  const servingModelKey = getServingModelKey(null, modelName);
  if (logType === LogTypes.SERVICE_LOGS) {
    const modelLogs = state.entities.endpointV2LogsByModelVersion[servingModelKey] || {};
    const modelVersionLogs = modelLogs[endpointVersionName] || {};
    logs = modelVersionLogs[activeReplica] || '';
  } else if (logType === LogTypes.BUILD_LOGS) {
    const modelLogs = state.entities.endpointV2BuildLogsByModelVersion[servingModelKey] || {};
    logs = modelLogs[endpointVersionName] || '';
  }
  return {
    modelName: modelName,
    endpointVersionName: endpointVersionName,
    activeReplica: activeReplica,
    logs: logs,
  };
};

export const LogsV2TextArea = connect(mapStateToProps, {})(LogsV2TextAreaImpl);
