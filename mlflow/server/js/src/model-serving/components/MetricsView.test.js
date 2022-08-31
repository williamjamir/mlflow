import { MetricsView, MetricsViewImpl } from './MetricsView';
import { metricsViewWrapper } from '../test-utils';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import promiseMiddleware from 'redux-promise-middleware';
import { getServingModelKey } from '../utils';
import { LazyPlot } from '../../experiment-tracking/components/LazyPlot';

describe('MetricsView', () => {
  let wrapper;
  let instance;
  let minimalProps;
  let minimalStore;

  const testMetrics = [
    {
      errorRate4XX: 0,
      errorRate5XX: 0.1,
      maxLatency: 798,
      minLatency: 40,
      p50Latency: 203,
      p75Latency: 206,
      p90Latency: 208,
      p95Latency: 208,
      p99Latency: 600,
      requestRate: 0.9,
      minCpuUsage: 2.0,
      avgCpuUsage: 2.5,
      maxCpuUsage: 3.0,
      minMemUsage: 5.0,
      avgMemUsage: 5.5,
      maxMemUsage: 6.0,
      numReplicas: 2, // TODO [ML-22986] (Anirudh):  Delete this once we are completely switched
      //                                                   over to concurrency compute config
      timestamp: 1631122140000,
      numConcurrency: 8,
    },
    {
      errorRate4XX: 0,
      errorRate5XX: 0.03,
      maxLatency: 502,
      minLatency: 100,
      p50Latency: 105,
      p75Latency: 180,
      p90Latency: 228,
      p95Latency: 209,
      p99Latency: 278,
      requestRate: 0.5,
      minCpuUsage: 2.1,
      avgCpuUsage: 2.5,
      maxCpuUsage: 2.9,
      minMemUsage: 6.0,
      avgMemUsage: 6.5,
      maxMemUsage: 7.0,
      numReplicas: 2, // TODO [ML-22986] (Anirudh):  Delete this once we are completely switched
      //                                                   over to concurrency compute config
      timestamp: 1631122200000,
      numConcurrency: 8,
    },
    {
      errorRate4XX: 0.02,
      errorRate5XX: 0,
      maxLatency: 998,
      minLatency: 124,
      p50Latency: 230,
      p75Latency: 340,
      p90Latency: 408,
      p95Latency: 470,
      p99Latency: 550,
      requestRate: 0.5,
      minCpuUsage: 2.4,
      avgCpuUsage: 2.4,
      maxCpuUsage: 2.4,
      minMemUsage: 7.0,
      avgMemUsage: 7.0,
      maxMemUsage: 7.0,
      numReplicas: 1, // TODO [ML-22986] (Anirudh):  Delete this once we are completely switched
      //                                                   over to concurrency compute config
      timestamp: 1631123880000,
      numConcurrency: 4,
    },
  ];
  const timestamps = ['2021-09-08 17:29:00', '2021-09-08 17:30:00', '2021-09-08 17:58:00'];

  const modelName = 'modelName';
  const endpointVersionName = '1';
  const modelKey = getServingModelKey(null, modelName);
  const mockStore = configureStore([thunk, promiseMiddleware()]);

  beforeEach(() => {
    // TODO: remove global fetch mock by explicitly mocking all the service API calls
    global.fetch = jest.fn(() =>
      Promise.resolve({ ok: true, status: 200, text: () => Promise.resolve('') }),
    );
    minimalProps = {
      modelName: modelName,
      endpointVersionName: endpointVersionName,
      getVersionMetricsApi: jest.fn(),
      metrics: testMetrics,
      bucketIntervalMs: 60000,
    };

    minimalStore = mockStore({
      entities: {
        metricsByModelVersion: {
          [[modelKey]]: {
            [[endpointVersionName]]: {
              data: testMetrics,
              bucket_interval_ms: 60000,
            },
          },
        },
      },
    });
  });

  test('should render with minimal props and no metrics without exploding', () => {
    const myProps = {
      ...minimalProps,
      metrics: [],
    };
    wrapper = metricsViewWrapper(minimalStore, myProps);
    instance = wrapper.find(MetricsViewImpl).instance();
    expect(instance.state.pollMetricsIntervalId).not.toBe(null);
    expect(wrapper.find(MetricsView).length).toBe(1);
    expect(wrapper.find(LazyPlot).length).toBe(5);
  });

  test('getLatencyData', () => {
    wrapper = metricsViewWrapper(minimalStore, minimalProps);
    instance = wrapper.find(MetricsViewImpl).instance();
    const data = instance.getLatencyData(timestamps, testMetrics);
    expect(data.length).toBe(7);
    expect(data.map((d) => d.x)).toEqual(Array(7).fill(timestamps));
    expect(data.map((d) => d.y)).toEqual([
      [40, 100, 124],
      [203, 105, 230],
      [206, 180, 340],
      [208, 228, 408],
      [208, 209, 470],
      [600, 278, 550],
      [798, 502, 998],
    ]);
    expect(data.map((d) => d.type)).toEqual(Array(7).fill('scatter'));
    expect(data.map((d) => d.name)).toEqual(['min', 'p50', 'p75', 'p90', 'p95', 'p99', 'max']);
  });

  test('getRequestsErrorsData', () => {
    wrapper = metricsViewWrapper(minimalStore, minimalProps);
    instance = wrapper.find(MetricsViewImpl).instance();
    const data = instance.getRequestsErrorsData(timestamps, testMetrics);
    expect(data.length).toBe(3);
    expect(data.map((d) => d.x)).toEqual(Array(3).fill(timestamps));
    expect(data.map((d) => d.y)).toEqual([
      [0.9, 0.5, 0.5],
      [0, 0, 0.02],
      [0.1, 0.03, 0],
    ]);
    expect(data.map((d) => d.type)).toEqual(Array(3).fill('scatter'));
    expect(data.map((d) => d.name)).toEqual([
      'QPS',
      '4XX errors per second',
      '5XX errors per second',
    ]);
  });

  test('getCpuData', () => {
    wrapper = metricsViewWrapper(minimalStore, minimalProps);
    instance = wrapper.find(MetricsViewImpl).instance();
    const data = instance.getCpuData(timestamps, testMetrics);
    expect(data.length).toBe(1);
    expect(data.map((d) => d.x)).toEqual(Array(1).fill(timestamps));
    expect(data.map((d) => d.y)).toEqual([[2.5, 2.5, 2.4]]);
    expect(data.map((d) => d.type)).toEqual(Array(1).fill('scatter'));
    expect(data.map((d) => d.name)).toEqual(['average across replicas']);
  });

  test('getMemData', () => {
    wrapper = metricsViewWrapper(minimalStore, minimalProps);
    instance = wrapper.find(MetricsViewImpl).instance();
    const data = instance.getMemData(timestamps, testMetrics);
    expect(data.length).toBe(1);
    expect(data.map((d) => d.x)).toEqual(Array(1).fill(timestamps));
    expect(data.map((d) => d.y)).toEqual([[5.5, 6.5, 7.0]]);
    expect(data.map((d) => d.type)).toEqual(Array(1).fill('scatter'));
    expect(data.map((d) => d.name)).toEqual(['average across replicas']);
  });

  test('getConcurrencyData', () => {
    wrapper = metricsViewWrapper(minimalStore, minimalProps);
    instance = wrapper.find(MetricsViewImpl).instance();
    const data = instance.getNumConcurrencyData(timestamps, testMetrics);
    expect(data.length).toBe(1);
    expect(data.map((d) => d.x)).toEqual(Array(1).fill(timestamps));
    expect(data.map((d) => d.y)).toEqual([[8, 8, 4]]);
    expect(data.map((d) => d.type)).toEqual(Array(1).fill('scatter'));
    expect(data.map((d) => d.name)).toEqual(['provisioned concurrency']);
  });
});
