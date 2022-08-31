import React from 'react';
import { connect } from 'react-redux';
import { PropTypes } from 'prop-types';
import qs from 'qs';

import { getUUID } from '../../common/utils/ActionUtils';
import { ErrorView } from '../../common/components/ErrorView';
import RequestStateWrapper from '../../common/components/RequestStateWrapper';
import { Spinner } from '../../common/components/Spinner';
import { PageContainer } from '../../common/components/PageContainer';
import { OnlineStoreView } from './OnlineStoreView';
import { getOnlineStoreApi } from '../actions';
import { getOnlineStore } from '../selectors';
// BEGIN-EDGE
import { LoadingDescription } from '@databricks/web-shared-bundle/metrics';
// END-EDGE
export class OnlineStorePageImpl extends React.Component {
  getOnlineStoreId = getUUID();

  static propTypes = {
    onlineStore: PropTypes.shape({}).isRequired,
    featureTableName: PropTypes.string.isRequired,
    onlineTableName: PropTypes.string.isRequired,
    cloud: PropTypes.string.isRequired,
    storeType: PropTypes.string.isRequired,
    tableArn: PropTypes.string,
    containerUri: PropTypes.string,
    getOnlineStoreApi: PropTypes.func.isRequired,
  };

  componentDidMount() {
    const { featureTableName, onlineTableName, cloud, storeType, tableArn, containerUri } =
      this.props;
    this.props.getOnlineStoreApi(
      featureTableName,
      onlineTableName,
      cloud,
      storeType,
      tableArn,
      containerUri,
      this.getOnlineStoreId,
    );
  }

  render() {
    const { featureTableName, onlineStore } = this.props;

    return (
      <PageContainer data-test-id='online-store-page'>
        <RequestStateWrapper
          requestIds={[this.getOnlineStoreId]}
          // eslint-disable-next-line no-trailing-spaces
          // BEGIN-EDGE
          description={LoadingDescription.FEATURE_STORE_ONLINE_STORE_PAGE}
          // END-EDGE
        >
          {(isLoading, hasError, requests) => {
            if (isLoading) {
              return <Spinner />;
            }

            if (hasError) {
              const request = requests.find((r) => r.id === this.getOnlineStoreId);
              const { error } = request;

              if (error) {
                return (
                  <ErrorView statusCode={error.getStatus()} subMessage={error.getMessageField()} />
                );
              }

              return <ErrorView statusCode={404} />;
            }

            return (
              <OnlineStoreView featureTableName={featureTableName} onlineStore={onlineStore} />
            );
          }}
        </RequestStateWrapper>
      </PageContainer>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  const params = qs.parse(ownProps.location.search, { ignoreQueryPrefix: true });
  const featureTableName = decodeURIComponent(params.featureTableName);
  const onlineTableName = decodeURIComponent(params.name);
  const { cloud, storeType } = params;
  const tableArn = params.tableArn && decodeURIComponent(params.tableArn);
  const containerUri = params.containerUri && decodeURIComponent(params.containerUri);
  // Reported during ESLint upgrade
  // eslint-disable-next-line max-len
  const onlineStore = getOnlineStore(
    state,
    featureTableName,
    onlineTableName,
    cloud,
    storeType,
    tableArn,
    containerUri,
  );
  return {
    onlineStore,
    featureTableName,
    onlineTableName,
    cloud,
    storeType,
    tableArn,
    containerUri,
  };
};

const mapDispatchToProps = {
  getOnlineStoreApi,
};

export const OnlineStorePage = connect(mapStateToProps, mapDispatchToProps)(OnlineStorePageImpl);
