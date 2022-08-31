import React from 'react';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Button, SyncIcon } from '@databricks/design-system';
import { LazyPlot } from '../../experiment-tracking/components/LazyPlot';
import PropTypes from 'prop-types';
import { getVersionMetricsApi } from '../actions';
import moment from 'moment';
import {
  ONE_HOUR_MS,
  getServingModelKey,
  suppressInvalidParameterValue,
  suppressResourceDoesNotExist,
} from '../utils';
import { LegacyDatePicker as DatePicker } from '@databricks/design-system';
import Utils from '../../common/utils/Utils';

const { RangePicker } = DatePicker;
const METRICS_POLL_INTERVAL = 60000;

export class MetricsViewImpl extends React.Component {
  static propTypes = {
    modelName: PropTypes.string.isRequired,
    endpointVersionName: PropTypes.string.isRequired,
    metrics: PropTypes.array.isRequired,
    getVersionMetricsApi: PropTypes.func.isRequired,
    bucketIntervalMs: PropTypes.number.isRequired,
    intl: PropTypes.shape({ formatMessage: PropTypes.func.isRequired }).isRequired,
  };

  state = {
    endTimestamp: Date.now(),
    startTimestamp: Date.now() - ONE_HOUR_MS,
    pollMetricsIntervalId: null,
  };

  refreshMetrics = () => {
    const { modelName, endpointVersionName } = this.props;
    this.props
      .getVersionMetricsApi(
        modelName,
        endpointVersionName,
        this.state.startTimestamp,
        this.state.endTimestamp,
      )
      .catch(suppressInvalidParameterValue)
      .catch(suppressResourceDoesNotExist)
      .catch(Utils.logErrorAndNotifyUser);
  };

  componentDidMount = () => {
    this.refreshMetrics();
    if (!this.state.pollMetricsIntervalId) {
      this.setState({
        pollMetricsIntervalId: setInterval(this.refreshMetricsIfRecent, METRICS_POLL_INTERVAL),
      });
    }
  };

  componentWillUnmount = () => {
    if (this.state.pollMetricsIntervalId) {
      clearInterval(this.state.pollMetricsIntervalId);
      this.setState({
        pollMetricsIntervalId: null,
      });
    }
  };

  refreshMetricsIfRecent = () => {
    // If the end timestamp is within the past 2 minutes, refresh metrics with same time interval
    // to show metrics up to the current time. This check is to prevent auto-updating metrics for
    // most recent time range when the user explicitly sets an earlier time range.
    if (this.state.endTimestamp >= Date.now() - METRICS_POLL_INTERVAL * 2) {
      const endTimestamp = Date.now();
      const timeInterval = this.state.endTimestamp - this.state.startTimestamp;
      this.setState(
        {
          endTimestamp: endTimestamp,
          startTimestamp: endTimestamp - timeInterval,
        },
        () => this.refreshMetrics(),
      );
    }
  };

  onChange = (dates, _) => {
    this.setState(
      {
        startTimestamp: dates[0].valueOf(),
        endTimestamp: dates[1].valueOf(),
      },
      () => this.refreshMetrics(),
    );
    this.refreshMetrics();
  };

  onRelayout = (data) => {
    this.setState({
      startTimestamp: data['xaxis.range[0]'],
      endTimestamp: data['xaxis.range[1]'],
    });
  };

  getGraphLayout = (title, tickSuffix = '') => {
    return {
      title: {
        text: title,
        x: 0.07,
      },
      font: {
        family: 'Helvetica Neue, Helvetica, Arial, sans-serif',
      },
      margin: { l: 90, r: 40, b: 5, t: 40, pad: 4 },
      width: 650,
      height: 350,
      showlegend: true,
      autosize: true,
      legend: { xanchor: 'center', x: 0.5, y: -0.15, orientation: 'h' },
      xaxis: {
        autorange: false,
        type: 'date',
        range: [this.state.startTimestamp, this.state.endTimestamp],
      },
      yaxis: {
        ticksuffix: tickSuffix,
        tickformat: '.2f',
        rangemode: 'tozero',
      },
    };
  };

  getLatencyData = (timestamps) => {
    return [
      {
        x: timestamps,
        y: this.props.metrics.map((m) => m.minLatency),
        type: 'scatter',
        mode: 'lines+markers',
        name: 'min',
        marker: {
          color: '#0ee671',
        },
      },
      {
        x: timestamps,
        y: this.props.metrics.map((m) => m.p50Latency),
        type: 'scatter',
        mode: 'lines+markers',
        name: 'p50',
        marker: {
          color: '#069a4a',
        },
      },
      {
        x: timestamps,
        y: this.props.metrics.map((m) => m.p75Latency),
        type: 'scatter',
        mode: 'lines+markers',
        name: 'p75',
        marker: {
          color: '#277de7',
        },
        visible: 'legendonly',
      },
      {
        x: timestamps,
        y: this.props.metrics.map((m) => m.p90Latency),
        type: 'scatter',
        mode: 'lines+markers',
        name: 'p90',
        marker: {
          color: '#7227e7',
        },
      },
      {
        x: timestamps,
        y: this.props.metrics.map((m) => m.p95Latency),
        type: 'scatter',
        mode: 'lines+markers',
        name: 'p95',
        marker: {
          color: '#eb4671',
        },
        visible: 'legendonly',
      },
      {
        x: timestamps,
        y: this.props.metrics.map((m) => m.p99Latency),
        type: 'scatter',
        mode: 'lines+markers',
        name: 'p99',
        marker: {
          color: '#e80711',
        },
      },
      {
        x: timestamps,
        y: this.props.metrics.map((m) => m.maxLatency),
        type: 'scatter',
        mode: 'lines+markers',
        name: 'max',
        marker: {
          color: '#6a0308',
        },
        visible: 'legendonly',
      },
    ];
  };

  getRequestsErrorsData = (timestamps) => {
    return [
      {
        x: timestamps,
        y: this.props.metrics.map((m) => m.requestRate),
        type: 'scatter',
        mode: 'lines+markers',
        name: 'QPS',
        marker: {
          color: '#069a4a',
        },
      },
      {
        x: timestamps,
        y: this.props.metrics.map((m) => m.errorRate4XX),
        type: 'scatter',
        mode: 'lines+markers',
        name: '4XX errors per second',
        marker: {
          color: '#f0ba0d',
        },
      },
      {
        x: timestamps,
        y: this.props.metrics.map((m) => m.errorRate5XX),
        type: 'scatter',
        mode: 'lines+markers',
        name: '5XX errors per second',
        marker: {
          color: '#f00d1b',
        },
      },
    ];
  };

  getCpuData = (timestamps) => {
    return [
      {
        x: timestamps,
        y: this.props.metrics.map((m) => m.avgCpuUsage),
        type: 'scatter',
        name: this.props.intl.formatMessage({
          defaultMessage: 'average across replicas',
          description: 'Label for line on cpu graph',
        }),
        marker: {
          color: '#277de7',
        },
      },
    ];
  };

  getMemData = (timestamps) => {
    return [
      {
        x: timestamps,
        y: this.props.metrics.map((m) => m.avgMemUsage),
        type: 'scatter',
        name: this.props.intl.formatMessage({
          defaultMessage: 'average across replicas',
          description: 'Label for line on memory graph',
        }),
        marker: {
          color: '#277de7',
        },
      },
    ];
  };

  getNumConcurrencyData = (timestamps) => {
    return [
      {
        x: timestamps,
        y: this.props.metrics.map((m) => m.numConcurrency),
        type: 'scatter',
        name: this.props.intl.formatMessage({
          defaultMessage: 'provisioned concurrency',
          description: 'Label for line on concurrency graph',
        }),
        marker: {
          color: '#277de7',
        },
      },
    ];
  };

  getTimestamps = () => {
    // convert timestamps to YYYY-MM-DD HH:mm:ss format in local time
    const tzOffset = new Date().getTimezoneOffset() * 60000;
    return this.props.metrics
      .map((m) => m.timestamp)
      .map((ts) => {
        return new Date(ts - tzOffset).toISOString().substr(0, 19).replace('T', ' ');
      });
  };

  getPlotConfig = () => {
    return {
      responsive: true,
      displaylogo: false,
      modeBarButtonsToRemove: ['sendDataToCloud'],
    };
  };

  render() {
    const timestamps = this.getTimestamps();
    const latencyData = this.getLatencyData(timestamps);
    const requestsErrorsData = this.getRequestsErrorsData(timestamps);
    const cpuUsageData = this.getCpuData(timestamps);
    const memUsageData = this.getMemData(timestamps);
    const numConcurrencyData = this.getNumConcurrencyData(timestamps);
    const latencyLayout = this.getGraphLayout(
      this.props.intl.formatMessage({
        defaultMessage: 'Latency (ms)',
        description: 'Graph title for latency metrics graph',
      }),
    );
    const requestsErrorsLayout = this.getGraphLayout(
      this.props.intl.formatMessage({
        defaultMessage: 'Request and error rates (per second)',
        description: 'Graph title for request and error rates metrics graph',
      }),
    );
    const cpuUsageLayout = this.getGraphLayout(
      this.props.intl.formatMessage({
        defaultMessage: 'CPU Usage (%)',
        description: 'Graph title for cpu usage metrics graph',
      }),
      '%',
    );
    const memUsageLayout = this.getGraphLayout(
      this.props.intl.formatMessage({
        defaultMessage: 'Memory Usage (%)',
        description: 'Graph title for memory usage metrics graph',
      }),
      '%',
    );
    const numConcurrencyLayout = this.getGraphLayout(
      this.props.intl.formatMessage({
        defaultMessage: 'Provisioned Concurrency',
        description: 'Graph title for provisioned concurrency metrics graph',
      }),
    );

    return (
      <div>
        <div css={styles.rangePicker}>
          <RangePicker
            showTime={{
              format: 'HH:mm',
            }}
            format='YYYY/MM/DD HH:mm'
            onChange={this.onChange}
            value={[moment(this.state.startTimestamp), moment(this.state.endTimestamp)]}
          />{' '}
          <Button
            className='submit-request-button'
            type='link'
            htmlType='button'
            onClick={this.refreshMetricsIfRecent}
            size='small'
          >
            <SyncIcon />
          </Button>
        </div>
        <div>
          <LazyPlot
            data={latencyData}
            layout={latencyLayout}
            config={this.getPlotConfig()}
            onRelayout={this.onRelayout}
          />
          <LazyPlot
            data={requestsErrorsData}
            layout={requestsErrorsLayout}
            config={this.getPlotConfig()}
            onRelayout={this.onRelayout}
          />
          <LazyPlot
            data={cpuUsageData}
            layout={cpuUsageLayout}
            config={this.getPlotConfig()}
            onRelayout={this.onRelayout}
          />
          <LazyPlot
            data={memUsageData}
            layout={memUsageLayout}
            config={this.getPlotConfig()}
            onRelayout={this.onRelayout}
          />
          <LazyPlot
            data={numConcurrencyData}
            layout={numConcurrencyLayout}
            config={this.getPlotConfig()}
            onRelayout={this.onRelayout}
          />
        </div>
      </div>
    );
  }
}

const styles = {
  rangePicker: {
    paddingBottom: 16,
  },
};

const mapStateToProps = (state, ownProps) => {
  const { modelName, endpointVersionName } = ownProps;
  const servingModelKey = getServingModelKey(null, modelName);
  const modelMetrics = state.entities.metricsByModelVersion[servingModelKey] || {};
  const modelVersionMetrics = modelMetrics[endpointVersionName] || {};
  return {
    modelName: modelName,
    endpointVersionName: endpointVersionName,
    metrics: modelVersionMetrics.data || [],
    bucketIntervalMs: modelVersionMetrics.bucket_interval_ms || 60000,
  };
};

const mapDispatchToProps = {
  getVersionMetricsApi,
};

export const MetricsView = connect(
  mapStateToProps,
  mapDispatchToProps,
)(injectIntl(MetricsViewImpl));
