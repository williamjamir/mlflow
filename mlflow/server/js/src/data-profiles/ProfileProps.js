import { PropTypes } from 'prop-types';

export const ProfileProps = PropTypes.shape({
  column_profiles: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.shape({}), PropTypes.string])),
  profile_id: PropTypes.string,
  window_granularity: PropTypes.string,
  window_start_timestamp: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  creation_timestamp: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
});
