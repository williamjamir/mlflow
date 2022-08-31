import React from 'react';
import { connect } from 'react-redux';
import { PropTypes } from 'prop-types';
import { getUUID } from '../../common/utils/ActionUtils';
import { ErrorView } from '../../common/components/ErrorView';
import Utils from '../../common/utils/Utils';
import RequestStateWrapper from '../../common/components/RequestStateWrapper';
import { Spinner } from '../../common/components/Spinner';
import { PageContainer } from '../../common/components/PageContainer';
import { FeatureView } from './FeatureView';
import {
  getFeatureTableApi,
  getFeatureApi,
  updateFeatureApi,
  getConsumersApi,
  getJobApi,
  getNotebooks,
  searchModelVersionsByFeatureApi,
  listModelEndpointsApi,
  getTagsForFeatureApi,
  setTagsForFeatureApi,
  deleteTagsForFeatureApi,
} from '../actions';
import {
  getFeatureTableDetails,
  getFeatureByTableAndName,
  getJobConsumers,
  getNotebookConsumers,
  getModelVersionsByFeature,
  getFeatureTags,
} from '../selectors';
import DatabricksUtils from '../../common/utils/DatabricksUtils';
import { NotebookFetcher } from '../../shared/NotebookFetcher';
import { MAX_NUMBER_OF_FEATURES_PER_REQUEST } from '../constants';
import _ from 'lodash';

export class FeaturePageImpl extends React.Component {
  static propTypes = {
    featureTableName: PropTypes.string.isRequired,
    featureName: PropTypes.string.isRequired,
    featureTable: PropTypes.shape({}).isRequired,
    feature: PropTypes.shape({}).isRequired,
    jobConsumers: PropTypes.arrayOf(PropTypes.shape({})),
    notebookConsumers: PropTypes.arrayOf(PropTypes.shape({})),
    modelVersionsByFeature: PropTypes.shape({}),
    featureTags: PropTypes.shape({}),
    // apis
    getFeatureTableApi: PropTypes.func.isRequired,
    getFeatureApi: PropTypes.func.isRequired,
    updateFeatureApi: PropTypes.func.isRequired,
    getConsumersApi: PropTypes.func.isRequired,
    getJobApi: PropTypes.func.isRequired,
    getNotebooks: PropTypes.func.isRequired,
    searchModelVersionsByFeatureApi: PropTypes.func.isRequired,
    listModelEndpointsApi: PropTypes.func.isRequired,
    getTagsForFeatureApi: PropTypes.func.isRequired,
    setTagsForFeatureApi: PropTypes.func.isRequired,
    deleteTagsForFeatureApi: PropTypes.func.isRequired,
  };

  getFeatureTableId = getUUID();
  getFeatureId = getUUID();

  handleEditDescription = (description) => {
    const { featureTableName, featureName } = this.props;
    return this.props
      .updateFeatureApi(featureTableName, featureName, description)
      .catch(() => Utils.logErrorAndNotifyUser('Failed to update description of the feature.'));
  };

  handleSetFeatureTags = (tags) => {
    const { featureTable, feature } = this.props;
    return (
      this.props
        // Reported during ESLint upgrade
        // eslint-disable-next-line react/prop-types
        .setTagsForFeatureApi(featureTable.name, feature.name, feature.id, tags)
        .catch(() => Utils.logErrorAndNotifyUser('Failed to set tags for the feature page.'))
    );
  };

  handleDeleteFeatureTags = (keys) => {
    const { featureTable, feature } = this.props;
    return (
      this.props
        // Reported during ESLint upgrade
        // eslint-disable-next-line react/prop-types
        .deleteTagsForFeatureApi(featureTable.name, feature.name, feature.id, keys)
        .catch(() => Utils.logErrorAndNotifyUser('Failed to delete tags for the feature page.'))
    );
  };

  // TODO (ML-23165): https://databricks.atlassian.net/browse/ML-23165
  // Extract functions for loading consumers (from FeatureTablePage) into utils file
  loadFeatureLineage = (featureTableName, features) => {
    // only fetch MAX_NUMBER_OF_FEATURES_PER_REQUEST features per request
    _.chunk(features, MAX_NUMBER_OF_FEATURES_PER_REQUEST).forEach((batch) => {
      this.props
        .searchModelVersionsByFeatureApi({
          featureTableName: featureTableName,
          featureNames: batch,
        })
        .catch((error) => {
          if (error.getStatus() >= 500) {
            // only render error toast when model registry service is unavailable
            Utils.logErrorAndNotifyUser(
              'Failed to load some model consumers for the feature table.',
            );
          }
        });
    });
  };

  loadConsumers = (featureTableName) => {
    this.props
      .getConsumersApi(featureTableName)
      .then((response) => {
        if (!response || !response.value || !response.value.consumers) return;
        const { consumers } = response.value;
        // we only want to fetch notebooks and jobs that are in the current workspace
        // because notebook fetcher and jobs API does not support cross workspace queries.
        // Job consumers
        const jobIds = consumers
          .filter((c) => c.job_run && Utils.isCurrentWorkspace(c.job_run.job_workspace_id))
          .map((c) => c.job_run.job_id);
        jobIds.forEach((jobId) =>
          this.props.getJobApi(jobId).catch((error) => {
            // only render error toast when jobs service is unavailable
            if (error.getStatus() >= 500) {
              Utils.logErrorAndNotifyUser(
                'Failed to load some job consumers for the feature table.',
              );
            }
          }),
        );
        // Notebook consumers
        const notebookIds = consumers
          .filter((c) => c.notebook && Utils.isCurrentWorkspace(c.notebook.notebook_workspace_id))
          .map((c) => c.notebook.notebook_id);
        if (window.self !== window.top && notebookIds.length > 0) {
          const { conn, treeCollection } = window.top;
          const notebookFetcher = new NotebookFetcher(conn, treeCollection);
          this.props
            .getNotebooks(notebookIds, notebookFetcher)
            .catch(() =>
              Utils.logErrorAndNotifyUser(
                'Failed to load some notebook consumers for the feature table.',
              ),
            );
        }
      })
      .catch(() =>
        Utils.logErrorAndNotifyUser(
          'Failed to load some notebook/job consumers for the feature table.',
        ),
      );
  };

  loadModelEndpoints = () => {
    // TODO(zeroqu) Load only endpoints relevant to the retrieved model versions
    if (DatabricksUtils.isModelServingEnabled()) {
      this.props.listModelEndpointsApi().catch((error) => {
        if (error.getStatus() >= 500) {
          // only render error toast when model registry service is unavailable
          Utils.logErrorAndNotifyUser(
            'Failed to load some endpoint consumers for the feature table.',
          );
        }
      });
    }
  };

  loadFeatureTags = (feature) => {
    this.props
      .getTagsForFeatureApi(this.props.featureTableName, feature.name, feature.id)
      .catch(() => Utils.logErrorAndNotifyUser('Failed to load tags for the feature page.'));
  };

  componentDidMount() {
    const { featureTableName, featureName } = this.props;
    this.props.getFeatureTableApi(featureTableName, this.getFeatureTableId).then((response) => {
      const { value } = response;
      if (!value || !value.feature_table) return;
      const { name, features } = value.feature_table;
      if (!name || !features) return;
      this.props
        .getFeatureApi(featureTableName, featureName, this.getFeatureId)
        .then((getFeatureResponse) => {
          if (!getFeatureResponse.value || !getFeatureResponse.value.feature) return;
          const { feature } = getFeatureResponse.value;
          this.loadFeatureTags(feature);
        });
      // consumers
      this.loadFeatureLineage(featureTableName, features);
      this.loadModelEndpoints();
      this.loadConsumers(featureTableName);
    });
  }

  render() {
    const {
      featureTableName,
      featureName,
      feature,
      featureTable,
      notebookConsumers,
      jobConsumers,
      modelVersionsByFeature,
      featureTags,
    } = this.props;

    return (
      <PageContainer data-test-id='feature-page'>
        <RequestStateWrapper requestIds={[this.getFeatureTableId, this.getFeatureId]}>
          {(isLoading, hasError, requests) => {
            if (isLoading) {
              return <Spinner />;
            }

            if (hasError) {
              const request = requests.find((r) => r.id === this.getFeatureId);
              const { error } = request;

              if (error) {
                return (
                  <ErrorView statusCode={error.getStatus()} subMessage={error.getMessageField()} />
                );
              }

              return <ErrorView statusCode={404} />;
            }

            return (
              <FeatureView
                featureTableName={featureTableName}
                featureName={featureName}
                featureTable={featureTable}
                feature={feature}
                notebookConsumers={notebookConsumers}
                jobConsumers={jobConsumers}
                modelVersionsByFeature={modelVersionsByFeature}
                featureTags={featureTags}
                handleEditDescription={this.handleEditDescription}
                handleSetFeatureTags={this.handleSetFeatureTags}
                handleDeleteFeatureTags={this.handleDeleteFeatureTags}
              />
            );
          }}
        </RequestStateWrapper>
      </PageContainer>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  const featureTableName = decodeURIComponent(ownProps.match.params.tableName);
  const featureName = decodeURIComponent(ownProps.match.params.featureName);
  const featureTable = getFeatureTableDetails(state, featureTableName);
  const feature = getFeatureByTableAndName(state, featureTableName, featureName);
  const jobConsumers = getJobConsumers(state, featureTableName);
  const notebookConsumers = getNotebookConsumers(state, featureTableName);
  const modelVersionsByFeature = getModelVersionsByFeature(state, featureTableName);
  const featureTags = getFeatureTags(state, featureTableName, featureName);

  return {
    featureTableName,
    featureTable,
    featureName,
    feature,
    jobConsumers,
    notebookConsumers,
    modelVersionsByFeature,
    featureTags,
  };
};

const mapDispatchToProps = {
  getFeatureTableApi,
  getFeatureApi,
  updateFeatureApi,
  getConsumersApi,
  getJobApi,
  getNotebooks,
  searchModelVersionsByFeatureApi,
  listModelEndpointsApi,
  getTagsForFeatureApi,
  setTagsForFeatureApi,
  deleteTagsForFeatureApi,
};

export const FeaturePage = connect(mapStateToProps, mapDispatchToProps)(FeaturePageImpl);
