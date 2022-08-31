import { getActiveModelMonitoringTags } from './utils';

describe('model monitoring utilities', () => {
  describe('getActiveModelMonitoringTags', () => {
    it('returns only active model monitoring tags with valid json', () => {
      const nonModelMonitoringTag = {
        key: 'irrelevant-tag',
        value: '{ "valid": "json" }',
      };
      const modelMonitoringTag = {
        key: 'mlflow.model_monitoring.some_key',
        value: '{ "valid": "json", "info": { "status": "active" } }',
      };
      const nonActiveModelMonitoringTag = {
        key: 'mlflow.model_monitoring.some_inactive_key',
        value: '{ "valid": "json", "info": { "status": "zombie" } }',
      };
      const nonValidJsonMonitoringTag = {
        key: 'mlflow.model_monitoring.some_inactive_key',
        value: '{ invalid: (json", "info": { "status": "active" } }',
      };

      const tags = getActiveModelMonitoringTags([
        nonModelMonitoringTag,
        modelMonitoringTag,
        nonActiveModelMonitoringTag,
        nonValidJsonMonitoringTag,
      ]);

      expect(tags).toHaveLength(1);
      expect(tags).toEqual(
        expect.arrayContaining([expect.objectContaining({ key: modelMonitoringTag.key })]),
      );
    });
  });
});
