import React from 'react';
import { act } from 'react-dom/test-utils';
import { MlflowInteractionTracker } from './MlflowInteractionTracker';
import { mount } from 'enzyme';
import { ReactInteractionTracing } from '@databricks/web-shared-bundle/metrics';

let mockedHistory = {};
let originalLocationObject;

const dummyRouteMapping = {
  '/route1/1234': 'INTERACTION_ROUTE1',
  '/route2': 'INTERACTION_ROUTE2',
  '/route3': 'INTERACTION_ROUTE3',
};

jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useHistory: () => mockedHistory,
}));

jest.mock('../../shared/route-interactions', () => ({
  getMlflowInteractionName: (locationPathname) => dummyRouteMapping[locationPathname] || 'UNKNOWN',
}));

describe('InteractionTracing', () => {
  Object.defineProperty(window, 'IntersectionObserver', {
    value: class {
      observe() {}
      disconnect() {}
    },
  });

  beforeEach(() => {
    mockHistory();
    originalLocationObject = Object.getOwnPropertyDescriptor('window', location);
    Object.defineProperty(window, 'location', {
      get() {
        return mockedHistory.location;
      },
    });
  });

  afterEach(() => {
    if (originalLocationObject) {
      Object.defineProperty(window, 'location', originalLocationObject);
    }
  });

  const mockHistory = (initialPathname = '/route1/1234') => {
    const history = new (class {
      callbacks = [];
      location = {
        pathname: initialPathname,
        hash: `#${initialPathname}`,
      };
      listen(cb) {
        this.callbacks.push(jest.fn().mockImplementation(cb));
      }
      push(path) {
        this.location.pathname = path;
        this.callbacks.forEach((cb) => cb(this.location));
      }
    })();

    mockedHistory = history;

    return history;
  };

  const createWrapper = () =>
    mount(
      <MlflowInteractionTracker>
        <div />
      </MlflowInteractionTracker>,
    );

  test('should populate initial load interaction', () => {
    const wrapper = createWrapper();
    wrapper.update();
    expect(wrapper.find(ReactInteractionTracing).prop('interaction')).toMatchObject({
      type: 'INITIAL_LOAD',
      name: 'INTERACTION_ROUTE1',
    });
  });

  test('should populate subsequent navigation interactions', () => {
    const wrapper = createWrapper();

    act(() => {
      mockedHistory.push('/route2');
    });

    wrapper.update();

    expect(wrapper.find(ReactInteractionTracing).props().interaction).toMatchObject({
      type: 'NAVIGATION',
      name: 'INTERACTION_ROUTE2',
    });

    act(() => {
      mockedHistory.push('/route3');
    });

    wrapper.update();

    expect(wrapper.find(ReactInteractionTracing).props().interaction).toMatchObject({
      type: 'NAVIGATION',
      name: 'INTERACTION_ROUTE3',
    });
  });

  test('should populate initial load interaction ignoring query string', () => {
    mockHistory('/route1/1234?someQueryString=123');
    expect(createWrapper().find(ReactInteractionTracing).prop('interaction')).toMatchObject({
      type: 'INITIAL_LOAD',
      name: 'INTERACTION_ROUTE1',
    });
  });

  test('should yield generic interaction on unknown route', () => {
    mockHistory('/route_not_existing');
    const wrapper = createWrapper();

    expect(wrapper.find(ReactInteractionTracing).props().interaction).toMatchObject({
      type: 'INITIAL_LOAD',
      name: 'UNKNOWN',
    });
  });
});
