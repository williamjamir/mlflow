import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import promiseMiddleware from 'redux-promise-middleware';
import { mockModelName, mockStoreV2, eventsViewWrapper, servingViewWrapper } from '../test-utils';
import { ModelEventsV2Table } from './ModelEventsV2Table';
import Utils from '../../common/utils/Utils';
import { EventsView } from './EventsView';

describe('EventsView', () => {
  let wrapper;
  let minimalProps;
  let minimalStore;

  const mockStore = configureStore([thunk, promiseMiddleware()]);

  beforeEach(() => {
    // TODO: remove global fetch mock by explicitly mocking all the service API calls
    global.fetch = jest.fn(() =>
      Promise.resolve({ ok: true, status: 200, text: () => Promise.resolve('') }),
    );
    minimalProps = {
      modelName: mockModelName,
      endpointVersionName: '1',
    };

    minimalStore = mockStore(mockStoreV2);
  });

  test('should render empty table', () => {
    wrapper = eventsViewWrapper(minimalStore, {
      ...minimalProps,
      endpointVersionName: 'does not exist',
    });
    expect(wrapper.find('.serving-event-v2-row').length).toBe(0);
  });

  test('should render events for endpoint version', () => {
    wrapper = eventsViewWrapper(minimalStore, minimalProps);
    expect(wrapper.find('.serving-event-v2-row').length).toBe(2);
  });

  test('Model events show correct message when events are not loaded when endpoint is V2', () => {
    const store = mockStore({
      entities: {
        ...minimalStore.getState().entities,
        endpointEventHistoryV2: undefined,
      },
    });
    wrapper = eventsViewWrapper(store, minimalProps);

    expect(wrapper.find(ModelEventsV2Table).text()).toBe('Loading...');
  });

  test('Version events show correct message when events are not loaded when endpoint is V2', () => {
    const store = mockStore({
      entities: {
        ...minimalStore.getState().entities,
        endpointEventHistoryV2: undefined,
      },
    });
    wrapper = servingViewWrapper(store, minimalProps);
    expect(wrapper.find(ModelEventsV2Table).text()).toBe('Loading...');
  });

  test('Model events display correctly when endpoint is V2', () => {
    const myProps = {
      ...minimalProps,
      endpointVersionName: undefined,
    };
    wrapper = eventsViewWrapper(minimalStore, myProps);
    const tableRows = wrapper.find(EventsView).find('table').find('tr.serving-event-v2-row');
    expect(tableRows.length).toBe(5);

    const header = wrapper.find(EventsView).find('table').find('th');
    expect(header.length).toBe(5);

    const row0 = tableRows.at(0).find('td');
    expect(row0.length).toBe(5);
    expect(row0.at(0).text()).toBe(Utils.formatTimestamp(127));
    expect(row0.at(1).text()).toBe('MODEL_SERVING_EVENT');
    expect(row0.at(2).text()).toBe('');
    expect(row0.at(3).text()).toBe('');
    expect(row0.at(4).text()).toBe('Model message 2');

    const row1 = tableRows.at(1).find('td');
    expect(row1.at(0).text()).toBe(Utils.formatTimestamp(125));
    expect(row1.at(1).text()).toBe('MODEL_SERVICE_EVENT');
    expect(row1.at(2).text()).toBe('4');
    expect(row1.at(3).text()).toBe('Staging');
    expect(row1.at(4).text()).toBe('Some message for version 4');

    const row2 = tableRows.at(2).find('td');
    expect(row2.length).toBe(5);
    expect(row2.at(0).text()).toBe(Utils.formatTimestamp(124));
    expect(row2.at(1).text()).toBe('MODEL_VERSION_SERVING_EVENT');
    expect(row2.at(2).text()).toBe('1');
    expect(row2.at(3).text()).toBe('Production');
    expect(row2.at(4).text()).toBe('Second message for version 1');

    const row3 = tableRows.at(3).find('td');
    expect(row3.length).toBe(5);
    expect(row3.at(0).text()).toBe(Utils.formatTimestamp(122));
    expect(row3.at(1).text()).toBe('MODEL_SERVING_EVENT');
    expect(row3.at(2).text()).toBe('');
    expect(row3.at(3).text()).toBe('');
    expect(row3.at(4).text()).toBe('Model message 1');

    const row4 = tableRows.at(4).find('td');
    expect(row4.length).toBe(5);
    expect(row4.at(0).text()).toBe(Utils.formatTimestamp(123));
    expect(row4.at(1).text()).toBe('CONTAINER_EVENT');
    expect(row4.at(2).text()).toBe('1');
    expect(row4.at(3).text()).toBe('Production');
    expect(row4.at(4).text()).toBe('First message for version 1');
  });

  test('Version events are filtered by current version when endpoint is V2', () => {
    wrapper = eventsViewWrapper(minimalStore, minimalProps);
    const tableRows = wrapper.find(EventsView).find('table').find('tr.serving-event-v2-row');
    expect(tableRows.length).toBe(2);

    const header = wrapper.find(EventsView).find('table').find('th');
    expect(header.length).toBe(4);

    const row0 = tableRows.at(0).find('td');
    expect(row0.length).toBe(4);
    expect(row0.at(0).text()).toBe(Utils.formatTimestamp(124));
    expect(row0.at(1).text()).toBe('MODEL_VERSION_SERVING_EVENT');
    expect(row0.at(2).text()).toBe('Production');
    expect(row0.at(3).text()).toBe('Second message for version 1');

    const row1 = tableRows.at(1).find('td');
    expect(row1.length).toBe(4);
    expect(row1.at(0).text()).toBe(Utils.formatTimestamp(123));
    expect(row1.at(1).text()).toBe('CONTAINER_EVENT');
    expect(row1.at(2).text()).toBe('Production');
    expect(row1.at(3).text()).toBe('First message for version 1');
  });
});
