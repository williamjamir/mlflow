import React from 'react';
import { Link } from 'react-router-dom';
import { PropTypes } from 'prop-types';
import { Divider, Descriptions, Table } from 'antd';
import { FormattedMessage } from 'react-intl';

import Utils from '../../common/utils/Utils';
import { FeatureStoreRoutes, getTableDetailPageRoute } from '../routes';
import { PageHeader } from '../../shared/building_blocks/PageHeader';
import { Spacer } from '../../shared/building_blocks/Spacer';
import { CollapsibleSection } from '../../common/components/CollapsibleSection';

export class OnlineStoreView extends React.Component {
  static propTypes = {
    onlineStore: PropTypes.shape({}).isRequired,
    featureTableName: PropTypes.string.isRequired,
  };

  getFeatureColumns() {
    return [
      {
        title: (
          <FormattedMessage
            defaultMessage={'Feature'}
            description={'Title text for the online store published feature column.'}
          />
        ),
        sorter: (a, b) => a.localeCompare(b),
        key: 'feature',
        defaultSortOrder: 'ascend',
        render: (name) => {
          return <div data-test-id='online-feature-name'>{name}</div>;
        },
      },
    ];
  }

  renderSqlMetadata(metadata) {
    return (
      <>
        <Descriptions.Item
          label={
            <FormattedMessage
              defaultMessage={'Host'}
              description={'Title text for the online store host metadata field.'}
            />
          }
        >
          {metadata.host}
        </Descriptions.Item>
        <Descriptions.Item
          label={
            <FormattedMessage
              defaultMessage={'Port'}
              description={'Title text for the online store port metadata field.'}
            />
          }
        >
          {metadata.port}
        </Descriptions.Item>
      </>
    );
  }

  renderDynamoDbMetadata(metadata) {
    // Include the time to live only if it's defined
    return (
      <>
        <Descriptions.Item
          label={
            <FormattedMessage
              defaultMessage={'Region'}
              description={'Title text for the online store region metadata field.'}
            />
          }
        >
          {metadata.region}
        </Descriptions.Item>
        <Descriptions.Item
          label={
            <FormattedMessage
              defaultMessage={'Table ARN'}
              description={'Title text for the online store table ARN metadata field.'}
            />
          }
        >
          {metadata.table_arn}
        </Descriptions.Item>
        {metadata.ttl && (
          <Descriptions.Item
            label={
              <FormattedMessage
                defaultMessage={'Time to live'}
                description={'Title text for the online store time to live metadata field.'}
              />
            }
          >
            <FormattedMessage
              defaultMessage={'{ttl, plural, one {# second} other {# seconds}}'}
              description={
                'Text content for the online store table time to live metadata field in seconds.'
              }
              values={{ ttl: metadata.ttl }}
            />
          </Descriptions.Item>
        )}
      </>
    );
  }

  renderCosmosDbMetadata(metadata) {
    return (
      <>
        <Descriptions.Item
          label={
            <FormattedMessage
              defaultMessage={'Account URI'}
              description={'Title text for the online store account uri metadata field.'}
            />
          }
        >
          {metadata.account_uri}
        </Descriptions.Item>
        <Descriptions.Item
          label={
            <FormattedMessage
              defaultMessage={'Container URI'}
              description={'Title text for the online store container uri field.'}
            />
          }
        >
          {metadata.container_uri}
        </Descriptions.Item>
      </>
    );
  }

  render() {
    const { onlineStore, featureTableName } = this.props;

    const breadcrumbs = [
      <FormattedMessage
        defaultMessage={'<link>Feature Store</link>'}
        description={
          'Text link on the breadcrumbs section that links to the feature store home page.'
        }
        values={{ link: (chunks) => <Link to={FeatureStoreRoutes.BASE}>{chunks}</Link> }}
      />,
      <Link to={getTableDetailPageRoute(featureTableName)}>{featureTableName}</Link>,
      // Reported during ESLint upgrade
      // eslint-disable-next-line react/prop-types
      onlineStore.name,
    ];

    // Reported during ESLint upgrade
    // eslint-disable-next-line react/prop-types
    const features = onlineStore.features || [];

    return (
      <>
        <PageHeader
          // Reported during ESLint upgrade
          // eslint-disable-next-line react/prop-types
          title={onlineStore.name}
          breadcrumbs={breadcrumbs}
          feedbackForm={'https://databricks.sjc1.qualtrics.com/jfe/form/SV_cux5mX6egOMfJ8G'}
        />
        <Spacer size={3} direction='vertical'>
          <Descriptions column={2} id={'meta-data'}>
            <Descriptions.Item
              label={
                <FormattedMessage
                  defaultMessage={'Created'}
                  description={'Title text for the online store created metadata field.'}
                />
              }
            >
              {/* Reported during ESLint upgrade */}
              {/* eslint-disable-next-line react/prop-types */}
              {Utils.formatTimestamp(onlineStore.creation_timestamp)}
            </Descriptions.Item>
            <Descriptions.Item
              label={
                <FormattedMessage
                  defaultMessage={'Created by'}
                  description={'Title text for the online store created by metadata field.'}
                />
              }
            >
              {/* Reported during ESLint upgrade */}
              {/* eslint-disable-next-line react/prop-types */}
              {onlineStore.creator_id}
            </Descriptions.Item>
            <Descriptions.Item
              label={
                <FormattedMessage
                  defaultMessage={'Last published'}
                  description={'Title text for the online store last published metadata field.'}
                />
              }
            >
              {/* Reported during ESLint upgrade */}
              {/* eslint-disable-next-line react/prop-types */}
              {Utils.formatTimestamp(onlineStore.last_updated_timestamp)}
            </Descriptions.Item>
            <Descriptions.Item
              label={
                <FormattedMessage
                  defaultMessage={'Last published by'}
                  description={'Title text for the online store last published by metadata field.'}
                />
              }
            >
              {/* Reported during ESLint upgrade */}
              {/* eslint-disable-next-line react/prop-types */}
              {onlineStore.last_update_user_id}
            </Descriptions.Item>
          </Descriptions>
          <Divider />
          <Descriptions column={2} id={'connection-data'}>
            <Descriptions.Item
              label={
                <FormattedMessage
                  defaultMessage={'Cloud'}
                  description={'Title text for the online store cloud metadata field.'}
                />
              }
            >
              {/* Reported during ESLint upgrade */}
              {/* eslint-disable-next-line react/prop-types */}
              {onlineStore.cloud}
            </Descriptions.Item>
            <Descriptions.Item
              label={
                <FormattedMessage
                  defaultMessage={'Storage'}
                  description={'Title text for the online store storage metadata field.'}
                />
              }
            >
              {/* Reported during ESLint upgrade */}
              {/* eslint-disable-next-line react/prop-types */}
              {onlineStore.store_type}
            </Descriptions.Item>
            {/* One of these fragments will render since they are nested in a oneof proto */}
            {/* Reported during ESLint upgrade */}
            {/* eslint-disable-next-line react/prop-types */}
            {onlineStore.mysql_metadata && this.renderSqlMetadata(onlineStore.mysql_metadata)}
            {/* Reported during ESLint upgrade */}
            {/* eslint-disable-next-line react/prop-types */}
            {onlineStore.sql_server_metadata &&
              // Reported during ESLint upgrade
              // eslint-disable-next-line react/prop-types
              this.renderSqlMetadata(onlineStore.sql_server_metadata)}
            {/* Reported during ESLint upgrade */}
            {/* eslint-disable-next-line react/prop-types */}
            {onlineStore.dynamodb_metadata &&
              // Reported during ESLint upgrade
              // eslint-disable-next-line react/prop-types
              this.renderDynamoDbMetadata(onlineStore.dynamodb_metadata)}
            {/* Reported during ESLint upgrade */}
            {/* eslint-disable-next-line react/prop-types */}
            {onlineStore.cosmosdb_metadata &&
              // Reported during ESLint upgrade
              // eslint-disable-next-line react/prop-types
              this.renderCosmosDbMetadata(onlineStore.cosmosdb_metadata)}
          </Descriptions>
          <Divider />
          <CollapsibleSection
            title={
              <span>
                <FormattedMessage
                  defaultMessage={'Published Features ({length})'}
                  description={'Title text for the online store published features section.'}
                  values={{ length: features.length }}
                />
              </span>
            }
            data-test-id='published-features-section'
          >
            <Table
              css={styles.tableWrapper}
              columns={this.getFeatureColumns()}
              dataSource={features}
              rowKey={(feature) => feature}
              locale={{
                emptyText: (
                  <FormattedMessage
                    defaultMessage={'No features found.'}
                    description={'Text describing no feature exists for the online store.'}
                  />
                ),
              }}
              size='middle'
              pagination={{ hideOnSinglePage: true, size: 'default' }}
              showSorterTooltip={false}
            />
          </CollapsibleSection>
        </Spacer>
      </>
    );
  }
}

const styles = {
  tableWrapper: {
    maxWidth: '20%',
  },
};
