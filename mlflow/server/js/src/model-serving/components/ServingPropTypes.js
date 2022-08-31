import PropTypes from 'prop-types';
import { InferenceServiceState } from '../utils';

export const computeConfigSpecType = PropTypes.shape({
  node_type_id: PropTypes.string.isRequired,
  min_replicas: PropTypes.number.isRequired,
  max_replicas: PropTypes.number.isRequired,
});

export const computeConfigType = PropTypes.shape({
  stage: PropTypes.string.isRequired,
  version: PropTypes.number.isRequired,
  creation_timestamp: PropTypes.number,
  user_id: PropTypes.number,
  spec: computeConfigSpecType,
});

export const inferenceServiceStatesType = PropTypes.oneOf(Object.values(InferenceServiceState));

export const endpointV1Type = PropTypes.shape({
  state: PropTypes.string.isRequired,
  message: PropTypes.string,
  actual_cluster_config: PropTypes.object,
  serving_version: PropTypes.string,
});

export const endpointV2Type = PropTypes.shape({
  state: PropTypes.string.isRequired,
  state_message: PropTypes.string,
  compute_config: PropTypes.arrayOf(computeConfigType),
});

export const endpointVersionV1Type = PropTypes.shape({
  endpoint_version_name: PropTypes.string.isRequired,
  state: PropTypes.string.isRequired,
  state_message: PropTypes.string,
});

export const endpointVersionsV1Type = PropTypes.arrayOf(endpointVersionV1Type);

export const completeInferenceServiceStatus = PropTypes.shape({
  state: inferenceServiceStatesType,
  message: PropTypes.string,
  config: computeConfigType,
});

export const endpointVersionV2Type = PropTypes.shape({
  endpoint_version_name: PropTypes.string.isRequired,
  service_status: completeInferenceServiceStatus,
  config_update_status: completeInferenceServiceStatus,
});

export const endpointVersionsV2Type = PropTypes.arrayOf(endpointVersionV2Type);

export const aliasType = PropTypes.shape({
  alias: PropTypes.string.isRequired,
  endpoint_version_name: PropTypes.string.isRequired,
});
