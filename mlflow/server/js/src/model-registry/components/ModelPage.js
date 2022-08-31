import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {
  searchModelVersionsApi,
  getRegisteredModelApi,
  updateRegisteredModelApi,
  deleteRegisteredModelApi,
} from '../actions';
import { ModelView } from './ModelView';
import { getModelVersions } from '../reducers';
import { MODEL_VERSION_STATUS_POLL_INTERVAL as POLL_INTERVAL } from '../constants';
import { PageContainer } from '../../common/components/PageContainer';
import RequestStateWrapper, { triggerError } from '../../common/components/RequestStateWrapper';
import { Spinner } from '../../common/components/Spinner';
import { ErrorView } from '../../common/components/ErrorView';
import { modelListPageRoute } from '../routes';
import Utils from '../../common/utils/Utils';
import { getUUID } from '../../common/utils/ActionUtils';
import { injectIntl } from 'react-intl';
// BEGIN-EDGE
import DatabricksUtils from '../../common/utils/DatabricksUtils';
import {
  setEmailSubscriptionStatusApi,
  getEmailSubscriptionStatusApi,
  getUserLevelEmailSubscriptionStatusApi,
} from '../actions';
import { LoadingDescription } from '@databricks/web-shared-bundle/metrics';
import { UniverseFrontendApis } from '../../common/utils/UniverseFrontendApis';

export const ModelLevelEmailSubscriptionStatus = {
  SUBSCRIBED: 'SUBSCRIBED',
  UNSUBSCRIBED: 'UNSUBSCRIBED',
  DEFAULT: 'DEFAULT',
  ALL_EVENTS: 'ALL_EVENTS',
};
// END-EDGE

export class ModelPageImpl extends React.Component {
  static propTypes = {
    // own props
    history: PropTypes.object.isRequired,
    match: PropTypes.object.isRequired,
    // connected props
    modelName: PropTypes.string.isRequired,
    model: PropTypes.object,
    modelVersions: PropTypes.array,
    // BEGIN-EDGE
    emailSubscriptionStatus: PropTypes.string,
    userLevelEmailSubscriptionStatus: PropTypes.string,
    // END-EDGE
    searchModelVersionsApi: PropTypes.func.isRequired,
    getRegisteredModelApi: PropTypes.func.isRequired,
    updateRegisteredModelApi: PropTypes.func.isRequired,
    deleteRegisteredModelApi: PropTypes.func.isRequired,
    // BEGIN-EDGE
    setEmailSubscriptionStatusApi: PropTypes.func.isRequired,
    getEmailSubscriptionStatusApi: PropTypes.func.isRequired,
    getUserLevelEmailSubscriptionStatusApi: PropTypes.func.isRequired,
    // END-EDGE
    intl: PropTypes.any,
  };

  initSearchModelVersionsApiRequestId = getUUID();
  initgetRegisteredModelApiRequestId = getUUID();
  // BEGIN-EDGE
  initgetEmailSubscriptionStatusApiId = getUUID();
  initgetUserLevelEmailSubscriptionStatusApiId = getUUID();
  // END-EDGE
  updateRegisteredModelApiId = getUUID();
  deleteRegisteredModelApiId = getUUID();
  // BEGIN-EDGE
  setEmailSubscriptionStatusApiId = getUUID();
  // END-EDGE

  criticalInitialRequestIds = [
    this.initSearchModelVersionsApiRequestId,
    this.initgetRegisteredModelApiRequestId,
  ];

  handleEditDescription = (description) => {
    const { model } = this.props;
    return this.props
      .updateRegisteredModelApi(model.name, description, this.updateRegisteredModelApiId)
      .then(this.loadData);
  };

  handleDelete = () => {
    const { model } = this.props;
    return this.props.deleteRegisteredModelApi(model.name, this.deleteRegisteredModelApiId);
  };

  // BEGIN-EDGE
  // Launch edit permission modal from Databricks window
  showEditPermissionModal = () => {
    const { model } = this.props;
    UniverseFrontendApis.editRegisteredModelPermission({
      registeredModel: model,
    }).then(() => {
      // TODO(sueann): apply UI changes based on permission changes
    });
  };

  // Handle changes in email subscription status for the registered model
  handleEmailSubscriptionStatusChangeForModel = (subscriptionType) =>
    this.props.setEmailSubscriptionStatusApi(
      this.props.modelName,
      subscriptionType,
      this.setEmailSubscriptionStatusApiId,
    );

  // END-EDGE
  loadData = (isInitialLoading) => {
    const { modelName } = this.props;
    this.hasUnfilledRequests = true;
    const promiseValues = [
      this.props.getRegisteredModelApi(
        modelName,
        isInitialLoading === true ? this.initgetRegisteredModelApiRequestId : null,
      ),
      this.props.searchModelVersionsApi(
        { name: modelName },
        isInitialLoading === true ? this.initSearchModelVersionsApiRequestId : null,
      ),
    ];
    // BEGIN-EDGE
    if (DatabricksUtils.modelRegistryEmailNotificationsEnabled()) {
      promiseValues.push(
        this.props.getEmailSubscriptionStatusApi(
          this.props.modelName,
          isInitialLoading === true ? this.initgetEmailSubscriptionStatusApiId : null,
        ),
        this.props.getUserLevelEmailSubscriptionStatusApi(
          isInitialLoading === true ? this.initgetUserLevelEmailSubscriptionStatusApiId : null,
        ),
      );
      if (isInitialLoading) {
        this.criticalInitialRequestIds.push(
          this.initgetEmailSubscriptionStatusApiId,
          this.initgetUserLevelEmailSubscriptionStatusApiId,
        );
      }
    }
    // END-EDGE
    return Promise.all(promiseValues).then(() => {
      this.hasUnfilledRequests = false;
    });
  };

  pollData = () => {
    const { modelName, history } = this.props;
    if (!this.hasUnfilledRequests && Utils.isBrowserTabVisible()) {
      return this.loadData().catch((e) => {
        if (e.getErrorCode() === 'RESOURCE_DOES_NOT_EXIST') {
          Utils.logErrorAndNotifyUser(e);
          this.props.deleteRegisteredModelApi(modelName, undefined, true);
          history.push(modelListPageRoute);
        } else {
          console.error(e);
        }
        this.hasUnfilledRequests = false;
      });
    }
    return Promise.resolve();
  };

  componentDidMount() {
    this.loadData(true).catch(console.error);
    this.hasUnfilledRequests = false;
    this.pollIntervalId = setInterval(this.pollData, POLL_INTERVAL);
    // BEGIN-EDGE
    DatabricksUtils.logClientSideEvent('mlflowModelDetailsPageAction', 'pageView');
    // END-EDGE
  }

  componentWillUnmount() {
    clearInterval(this.pollIntervalId);
  }

  render() {
    const { model, modelVersions, history, modelName } = this.props;
    return (
      <PageContainer>
        <RequestStateWrapper
          requestIds={this.criticalInitialRequestIds}
          // eslint-disable-next-line no-trailing-spaces
          // BEGIN-EDGE
          description={LoadingDescription.MLFLOW_MODEL_DETAILS_PAGE}
          // END-EDGE
        >
          {(loading, hasError, requests) => {
            if (hasError) {
              clearInterval(this.pollIntervalId);
              if (Utils.shouldRender404(requests, [this.initgetRegisteredModelApiRequestId])) {
                return (
                  <ErrorView
                    statusCode={404}
                    subMessage={this.props.intl.formatMessage(
                      {
                        defaultMessage: 'Model {modelName} does not exist',
                        description: 'Sub-message text for error message on overall model page',
                      },
                      {
                        modelName: modelName,
                      },
                    )}
                    fallbackHomePageReactRoute={modelListPageRoute}
                  />
                );
              }
              // TODO(Zangr) Have a more generic boundary to handle all errors, not just 404.
              triggerError(requests);
            } else if (loading) {
              return <Spinner />;
            } else if (model) {
              // Null check to prevent NPE after delete operation
              return (
                <ModelView
                  model={model}
                  modelVersions={modelVersions}
                  handleEditDescription={this.handleEditDescription}
                  handleDelete={this.handleDelete}
                  showEditPermissionModal={this.showEditPermissionModal}
                  // BEGIN-EDGE
                  activePane={this.props.match.params.subpage}
                  emailSubscriptionStatus={this.props.emailSubscriptionStatus}
                  userLevelEmailSubscriptionStatus={this.props.userLevelEmailSubscriptionStatus}
                  handleEmailNotificationPreferenceChange={
                    this.handleEmailSubscriptionStatusChangeForModel
                  }
                  // END-EDGE
                  history={history}
                />
              );
            }
            return null;
          }}
        </RequestStateWrapper>
      </PageContainer>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  const modelName = decodeURIComponent(ownProps.match.params.modelName);
  const model = state.entities.modelByName[modelName];
  const modelVersions = getModelVersions(state, modelName);
  // BEGIN-EDGE
  const userLevelEmailSubscriptionStatus =
    state.entities.userLevelSubscriptionStatus['subscriptionType'] ||
    ModelLevelEmailSubscriptionStatus.UNSUBSCRIBED;
  const emailSubscriptionStatus =
    state.entities.subscriptionStatusByModelName[modelName] ||
    ModelLevelEmailSubscriptionStatus.DEFAULT;
  // END-EDGE
  return {
    modelName,
    model,
    modelVersions,
    // BEGIN-EDGE
    emailSubscriptionStatus,
    userLevelEmailSubscriptionStatus,
    // END-EDGE
  };
};

const mapDispatchToProps = {
  searchModelVersionsApi,
  getRegisteredModelApi,
  updateRegisteredModelApi,
  deleteRegisteredModelApi,
  // BEGIN-EDGE
  setEmailSubscriptionStatusApi,
  getEmailSubscriptionStatusApi,
  getUserLevelEmailSubscriptionStatusApi,
  // END-EDGE
};

export const ModelPage = connect(mapStateToProps, mapDispatchToProps)(injectIntl(ModelPageImpl));
