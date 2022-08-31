import React from 'react';
import { connect } from 'react-redux';
import { PropTypes } from 'prop-types';
import { getUUID } from '../../common/utils/ActionUtils';
import { ErrorView } from '../../common/components/ErrorView';
import RequestStateWrapper from '../../common/components/RequestStateWrapper';
import { Spinner } from '../../common/components/Spinner';

import { FeatureTableView } from './FeatureTableView';
import {
  getFeatureTableApi,
  getFeaturesApi,
  updateFeatureTableApi,
  deleteFeatureTableApi,
  getConsumersApi,
  getJobApi,
  getPipelineApi,
  getNotebooks,
  searchModelVersionsByFeatureApi,
  listModelEndpointsApi,
  getLatestRunForJobApi,
  getTagsForFeatureTableApi,
  setTagsForFeatureTableApi,
  deleteTagsForFeatureTableApi,
} from '../actions';
import {
  getFeatureTableDetails,
  getFeaturesByTable,
  getJobConsumers,
  getNotebookConsumers,
  getJobProducers,
  getPipelineProducers,
  getNotebookProducers,
  getModelVersionsByFeature,
  getFeatureTableTags,
} from '../selectors';
import DatabricksUtils from '../../common/utils/DatabricksUtils';
import { NotebookFetcher } from '../../shared/NotebookFetcher';
import { MAX_NUMBER_OF_FEATURES_PER_REQUEST } from '../constants';
import _ from 'lodash';
import Utils from '../../common/utils/Utils';
import { PageContainer } from '../../common/components/PageContainer';
import { LoadingDescription } from '@databricks/web-shared-bundle/metrics';
import { AssetType } from '@databricks/web-shared-bundle/recents';
import { UniverseFrontendApis } from '../../common/utils/UniverseFrontendApis';

export class FeatureTablePageImpl extends React.Component {
  static propTypes = {
    history: PropTypes.shape({}),
    // selectors
    featureTableName: PropTypes.string.isRequired,
    features: PropTypes.arrayOf(PropTypes.shape({})),
    jobConsumers: PropTypes.arrayOf(PropTypes.shape({})),
    notebookConsumers: PropTypes.arrayOf(PropTypes.shape({})),
    jobProducers: PropTypes.arrayOf(PropTypes.shape({})),
    pipelineProducers: PropTypes.arrayOf(PropTypes.shape({})),
    notebookProducers: PropTypes.arrayOf(PropTypes.shape({})),
    featureTable: PropTypes.shape({}),
    modelVersionsByFeature: PropTypes.shape({}),
    featureTableTags: PropTypes.shape({}),
    // apis
    getFeatureTableApi: PropTypes.func.isRequired,
    updateFeatureTableApi: PropTypes.func.isRequired,
    deleteFeatureTableApi: PropTypes.func.isRequired,
    getFeaturesApi: PropTypes.func.isRequired,
    getConsumersApi: PropTypes.func.isRequired,
    getJobApi: PropTypes.func.isRequired,
    getPipelineApi: PropTypes.func.isRequired,
    getNotebooks: PropTypes.func.isRequired,
    searchModelVersionsByFeatureApi: PropTypes.func.isRequired,
    listModelEndpointsApi: PropTypes.func.isRequired,
    getLatestRunForJobApi: PropTypes.func.isRequired,
    getTagsForFeatureTableApi: PropTypes.func.isRequired,
    setTagsForFeatureTableApi: PropTypes.func.isRequired,
    deleteTagsForFeatureTableApi: PropTypes.func.isRequired,
  };

  getFeatureTableId = getUUID();
  getFeaturesId = getUUID();

  handleEditDescription = (description) => {
    const { featureTableName } = this.props;
    return this.props
      .updateFeatureTableApi(featureTableName, description)
      .catch(() =>
        Utils.logErrorAndNotifyUser('Failed to update description of the feature table.'),
      );
  };

  handleDeleteFeatureTable = () => {
    const { featureTableName } = this.props;
    return this.props
      .deleteFeatureTableApi(featureTableName)
      .catch(() => Utils.logErrorAndNotifyUser('Failed to delete feature table.'));
  };

  showEditPermissionModal = () => {
    const { featureTable } = this.props;
    UniverseFrontendApis.editFeatureTablePermission({
      featureTable: featureTable,
    }).then(() => {
      const { featureTableName } = this.props;
      this.props
        .getFeatureTableApi(featureTableName, this.getFeatureTableId)
        .catch(() =>
          Utils.logErrorAndNotifyUser('Failed to get feature table with new permission settings.'),
        );
    });
  };

  handleSetFeatureTableTags = (tags) => {
    const { featureTable } = this.props;
    return (
      this.props
        // Reported during ESLint upgrade
        // eslint-disable-next-line react/prop-types
        .setTagsForFeatureTableApi(featureTable.name, featureTable.id, tags)
        .catch(() => Utils.logErrorAndNotifyUser('Failed to set tags for the feature table.'))
    );
  };

  handleDeleteFeatureTableTags = (keys) => {
    const { featureTable } = this.props;
    return (
      this.props
        // Reported during ESLint upgrade
        // eslint-disable-next-line react/prop-types
        .deleteTagsForFeatureTableApi(featureTable.name, featureTable.id, keys)
        .catch(() => Utils.logErrorAndNotifyUser('Failed to delete tags for the feature table.'))
    );
  };

  loadFeatures = (featureTableName) => {
    this.props
      .getFeaturesApi(featureTableName, this.getFeaturesId)
      .catch(() => Utils.logErrorAndNotifyUser('Failed to load some metadata for features.'));
  };

  loadFeatureTableTags = (featureTableName, id) => {
    this.props
      .getTagsForFeatureTableApi(featureTableName, id)
      .catch(() => Utils.logErrorAndNotifyUser('Failed to load tags for the feature tables.'));
  };

  loadJobProducers = (jobProducers) => {
    if (jobProducers) {
      jobProducers
        .filter(({ job_workspace_id }) => Utils.isCurrentWorkspace(job_workspace_id))
        .forEach(({ job_id }) => {
          this.props.getJobApi(job_id).catch((error) => {
            // only render error toast when jobs service is unavailable,
            // error such as 404 resource does not exist should not be surfaced to the user.
            if (error.getStatus() >= 500) {
              Utils.logErrorAndNotifyUser('Failed to load some job producers.');
            }
          });
          this.props.getLatestRunForJobApi(job_id).catch((error) => {
            // only render error toast when jobs service is unavailable,
            // error such as 404 resource does not exist should not be surfaced to the user.
            if (error.getStatus() >= 500) {
              Utils.logErrorAndNotifyUser('Failed to load latest run for some job producers.');
            }
          });
        });
    }
  };

  loadPipelineProducers = (pipelineProducers) => {
    if (pipelineProducers) {
      pipelineProducers
        // we do not yet support multi workspace for DLT pipeline producers
        .forEach(({ pipeline_id }) => {
          this.props.getPipelineApi(pipeline_id).catch((error) => {
            // only render error toast when pipelines service is unavailable,
            // error such as 404 resource does not exist should not be surfaced to the user.
            if (error.getStatus() >= 500) {
              Utils.logErrorAndNotifyUser('Failed to load some pipeline producers.');
            }
          });
        });
    }
  };

  loadNotebookProducers = (notebookProducers) => {
    if (!!notebookProducers && window.self !== window.top) {
      const notebookIds = notebookProducers
        .filter(({ notebook_workspace_id }) => Utils.isCurrentWorkspace(notebook_workspace_id))
        .map(({ notebook_id }) => notebook_id);
      if (notebookIds.length === 0) return;
      const { conn, treeCollection } = window.top;
      const treeObjectFetcher = new NotebookFetcher(conn, treeCollection);
      this.props
        .getNotebooks(notebookIds, treeObjectFetcher)
        .catch(() =>
          Utils.logErrorAndNotifyUser(
            'Failed to load some notebook producers for the feature table.',
          ),
        );
    }
  };

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

  componentDidMount() {
    const { featureTableName } = this.props;
    this.props.getFeatureTableApi(featureTableName, this.getFeatureTableId).then((response) => {
      const { value } = response;
      if (!value || !value.feature_table) return;
      const { name, id, features, job_producers, notebook_producers, dlt_pipeline_producers } =
        value.feature_table;
      if (!name || !features) return;
      this.loadFeatures(featureTableName);
      this.loadFeatureTableTags(featureTableName, id);
      // producers
      this.loadJobProducers(job_producers);
      this.loadNotebookProducers(notebook_producers);
      this.loadPipelineProducers(dlt_pipeline_producers);
      // consumers
      this.loadFeatureLineage(featureTableName, features);
      this.loadModelEndpoints();
      this.loadConsumers(featureTableName);
      this.addToRecents();
    });
  }

  componentDidUpdate(prevProps) {
    const { featureTable } = this.props;
    // Reported during ESLint upgrade
    // eslint-disable-next-line react/prop-types
    const currentId = featureTable && featureTable.id;
    // Reported during ESLint upgrade
    // eslint-disable-next-line react/prop-types
    const prevId = prevProps.featureTable && prevProps.featureTable.id;
    if (currentId !== prevId) {
      this.addToRecents();
    }
  }

  addToRecents() {
    const { featureTable } = this.props;
    // Reported during ESLint upgrade
    // eslint-disable-next-line react/prop-types
    if (featureTable && featureTable.id) {
      // Reported during ESLint upgrade
      // eslint-disable-next-line react/prop-types
      const tableId = featureTable.id;
      DatabricksUtils.addToRecents('featureTable', tableId);
      DatabricksUtils.registerRecent({ id: tableId, type: AssetType.FEATURE_TABLE });
    }
  }

  render() {
    const {
      history,
      featureTable,
      features,
      modelVersionsByFeature,
      notebookConsumers,
      jobConsumers,
      notebookProducers,
      jobProducers,
      pipelineProducers,
      featureTableTags,
    } = this.props;
    const requestIds = [this.getFeatureTableId, this.getFeaturesId];
    return (
      <PageContainer data-test-id='feature-table-page'>
        <RequestStateWrapper
          requestIds={requestIds}
          // eslint-disable-next-line no-trailing-spaces
          // BEGIN-EDGE
          description={LoadingDescription.FEATURE_STORE_TABLE_PAGE}
          // END-EDGE
        >
          {(isLoading, hasError, requests) => {
            if (isLoading) {
              return <Spinner />;
            }

            if (hasError) {
              const request = requests.find((r) => r.id === this.getFeatureTableId);
              const { error } = request;

              if (error) {
                return (
                  <ErrorView statusCode={error.getStatus()} subMessage={error.getMessageField()} />
                );
              }

              return <ErrorView statusCode={404} />;
            }

            return (
              <FeatureTableView
                history={history}
                featureTable={featureTable}
                features={features}
                notebookConsumers={notebookConsumers}
                jobConsumers={jobConsumers}
                notebookProducers={notebookProducers}
                jobProducers={jobProducers}
                pipelineProducers={pipelineProducers}
                modelVersionsByFeature={modelVersionsByFeature}
                featureTableTags={featureTableTags}
                handleEditDescription={this.handleEditDescription}
                handleDeleteFeatureTable={this.handleDeleteFeatureTable}
                showEditPermissionModal={this.showEditPermissionModal}
                handleSetFeatureTableTags={this.handleSetFeatureTableTags}
                handleDeleteFeatureTableTags={this.handleDeleteFeatureTableTags}
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
  const featureTable = getFeatureTableDetails(state, featureTableName);
  const features = getFeaturesByTable(state, featureTableName);
  const jobConsumers = getJobConsumers(state, featureTableName);
  const notebookConsumers = getNotebookConsumers(state, featureTableName);
  const jobProducers = getJobProducers(state, featureTableName);
  const pipelineProducers = getPipelineProducers(state, featureTableName);
  const notebookProducers = getNotebookProducers(state, featureTableName);
  const modelVersionsByFeature = getModelVersionsByFeature(state, featureTableName);
  const featureTableTags = getFeatureTableTags(state, featureTableName);
  return {
    featureTableName,
    featureTable,
    features,
    jobConsumers,
    notebookConsumers,
    jobProducers,
    pipelineProducers,
    notebookProducers,
    modelVersionsByFeature,
    featureTableTags,
  };
};

const mapDispatchToProps = {
  getFeatureTableApi,
  getFeaturesApi,
  updateFeatureTableApi,
  deleteFeatureTableApi,
  getConsumersApi,
  getJobApi,
  getPipelineApi,
  getNotebooks,
  searchModelVersionsByFeatureApi,
  listModelEndpointsApi,
  getLatestRunForJobApi,
  getTagsForFeatureTableApi,
  setTagsForFeatureTableApi,
  deleteTagsForFeatureTableApi,
};

export const FeatureTablePage = connect(mapStateToProps, mapDispatchToProps)(FeatureTablePageImpl);
