import { PropTypes } from 'prop-types';

export const FeatureTableProps = PropTypes.shape({
  name: PropTypes.string.isRequired,
  features: PropTypes.arrayOf(PropTypes.string),
});

export const ModelMonitoringConfigurationProps = PropTypes.shape({
  features: PropTypes.arrayOf(PropTypes.string),
  window_granularities: PropTypes.arrayOf(PropTypes.string),
  refresh_mode: PropTypes.string,
});
