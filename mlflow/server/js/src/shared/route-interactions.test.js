import { getMappedInteractionName } from './route-interactions';

describe('Route interactions', () => {
  const testInteractionMap = {
    '/route1': 'ROUTE1_INTERACTION',

    '/route2/:version': 'ROUTE2_INTERACTION',
    '/route2/abc': 'ROUTE2_ALTERNATIVE_INTERACTION',

    '/route3/abc': 'ROUTE3_ALTERNATIVE_INTERACTION',
    '/route3/:version': 'ROUTE3_INTERACTION',
  };
  const testGetInteractionMap = (location) =>
    getMappedInteractionName(location, testInteractionMap, 'DEFAULT');
  it('getMappedInteractionName', () => {
    expect(testGetInteractionMap('/route1')).toBe('ROUTE1_INTERACTION');
    expect(testGetInteractionMap('/route2/aaa')).toBe('ROUTE2_INTERACTION');
    expect(testGetInteractionMap('/route2/abc')).toBe('ROUTE2_INTERACTION');

    expect(testGetInteractionMap('/route3/aaa')).toBe('ROUTE3_INTERACTION');
    expect(testGetInteractionMap('/route3/abc')).toBe('ROUTE3_ALTERNATIVE_INTERACTION');

    expect(testGetInteractionMap('/route4')).toBe('DEFAULT');
  });
});
