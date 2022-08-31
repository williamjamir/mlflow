import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { getCreateClusterPermissions } from '../actions';

/**
 * Higher-order component for injecting cluster permission state to a component
 * @param ClusterComponent
 * @returns wrapper class that injects the cluster permission state and renders the ClusterComponent
 */
export function ClusterPermissionHOC(ClusterComponent) {
  return class ClusterComponentWrapper extends React.Component {
    static propTypes = {
      canCreateServingClusters: PropTypes.bool,
      canCreateServingClustersErrorMessage: PropTypes.string,
      getCreateClusterPermissions: PropTypes.func,
    };

    componentDidMount() {
      this.props.getCreateClusterPermissions();
    }

    componentDidUpdate(prevProps) {
      if (prevProps.canCreateServingClusters !== this.props.canCreateServingClusters) {
        this.props.getCreateClusterPermissions();
      }
    }

    render() {
      return <ClusterComponent {...this.props} />;
    }
  };
}

const mapStateToProps = (state, ownProps) => {
  const canCreateServingClusters = state.entities.clusterPermissions
    ? state.entities.clusterPermissions.canCreateServingClusters
    : undefined;
  const error = state.entities.clusterPermissions.error
    ? state.entities.clusterPermissions.error.message
    : undefined;

  return {
    canCreateServingClusters,
    canCreateServingClustersErrorMessage: error,
  };
};

const mapDispatchToProps = {
  getCreateClusterPermissions,
};

export const withClusterPermissions = (ClusterComponent) =>
  connect(mapStateToProps, mapDispatchToProps)(ClusterPermissionHOC(ClusterComponent));
