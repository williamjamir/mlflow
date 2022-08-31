import {
  getInitialWindowGranularity,
  getInitialDisableGlobalCheckboxState,
} from './UpdateDataProfileConfigForm';

describe('UpdateDataProfileConfigForm', () => {
  describe('getInitialWindowGranularity', () => {
    it('maps an array to a single granulitfy value', () => {
      expect(getInitialWindowGranularity(['GLOBAL'])).toEqual('GLOBAL');
    });

    it('ignores the GLOBAL key in the array if there are other granularities included', () => {
      expect(getInitialWindowGranularity(['1 month', 'GLOBAL'])).toEqual('1 month');
    });
  });

  describe('getInitialDisableGlobalCheckboxState', () => {
    it('disables checkbox if global is the only value in granularities array', () => {
      const config = { window_granularities: ['GLOBAL'] };
      expect(getInitialDisableGlobalCheckboxState(config)).toEqual(true);
    });

    it('allows the checkbox if there are multiple granularties', () => {
      const config = { window_granularities: ['GLOBAL', '1 hour'] };
      expect(getInitialDisableGlobalCheckboxState(config)).toEqual(false);
    });
  });
});
