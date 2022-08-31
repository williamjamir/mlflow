import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { OnlineStoreView } from './OnlineStoreView';
import { mockOnlineStore } from '../utils/test-utils';
import Utils from '../../common/utils/Utils';
import { FeatureStoreRoutes, getTableDetailPageRoute } from '../routes';
import { mountWithIntl } from '../../common/utils/TestUtils';

const getDefaultOnlineStoreViewProps = (overrides = {}) => ({
  onlineStore: { name: 'online store name' },
  featureTableName: '',
  ...overrides,
});

const testDescription = (wrapper, id, expectedData) => {
  const items = wrapper.find(`${id} ${ANTD_DESCRIPTIONS_ITEM_CLS}`);
  expect(items.length).toEqual(Object.keys(expectedData).length);
  const labels = wrapper.find(`${id} ${ANTD_DESCRIPTIONS_ITEM_LABEL_CLS}`);
  const values = wrapper.find(`${id} ${ANTD_DESCRIPTIONS_ITEM_CONTENT_CLS}`);
  const expectedLabels = Object.keys(expectedData);
  const expectedValues = Object.values(expectedData);
  for (let i = 0; i < items.length; i++) {
    expect(labels.at(i).text()).toEqual(expectedLabels[i]);
    expect(values.at(i).text()).toEqual(expectedValues[i]);
  }
};

const ANTD_DESCRIPTIONS_ITEM_CLS = '.ant-descriptions-item';
const ANTD_DESCRIPTIONS_ITEM_LABEL_CLS = ANTD_DESCRIPTIONS_ITEM_CLS + '-label';
const ANTD_DESCRIPTIONS_ITEM_CONTENT_CLS = ANTD_DESCRIPTIONS_ITEM_CLS + '-content';

describe('OnlineStoreView', () => {
  it('renders with minimal props without exploding', () => {
    const wrapper = mountWithIntl(
      <BrowserRouter>
        <OnlineStoreView {...getDefaultOnlineStoreViewProps()} />
      </BrowserRouter>,
    );
    expect(wrapper.length).toBe(1);
  });

  it('has correct breadcrumbs', () => {
    const onlineStore = mockOnlineStore({
      name: 'a name',
      cloud: 'AWS',
      store_type: 'DYNAMODB',
      creation_timestamp: 1612208908702,
      dynamodb_metadata: { region: 'east', table_arn: '124abc' },
    });

    const featureTableName = 'user.all_features';
    const expectedFeatureStoreLink = FeatureStoreRoutes.BASE;
    const expectedFeatureTableLink = getTableDetailPageRoute(featureTableName);
    const wrapper = mountWithIntl(
      <BrowserRouter>
        <OnlineStoreView
          {...getDefaultOnlineStoreViewProps({
            onlineStore,
            featureTableName: featureTableName,
          })}
        />
      </BrowserRouter>,
    );
    const crumbs = wrapper.find('.ant-breadcrumb-link');
    expect(crumbs.length).toEqual(3);

    const featureStoreCrumb = crumbs.find('a').at(0);
    expect(featureStoreCrumb.text()).toEqual('Feature Store');
    expect(featureStoreCrumb.prop('href')).toEqual(expectedFeatureStoreLink);

    const featureTableCrumb = crumbs.find('a').at(1);
    expect(featureTableCrumb.text()).toEqual('user.all_features');
    expect(featureTableCrumb.prop('href')).toEqual(expectedFeatureTableLink);

    const onlineStoreCrumb = crumbs.at(2);
    expect(onlineStoreCrumb.text()).toEqual('a name');
  });

  it('renders correct data in description component', () => {
    const onlineStore = mockOnlineStore({
      name: 'a name',
      cloud: 'AWS',
      store_type: 'DYNAMODB',
      creation_timestamp: 1612208908702,
      creator_id: 'zq@db.com',
      last_updated_timestamp: 1612209936774,
      last_update_user_id: 'cd@db.com',
      features: ['feat1', 'feat2'],
      dynamodb_metadata: { table_arn: 'arn:1:2:3', region: 'us-east-1' },
    });

    const wrapper = mountWithIntl(
      <BrowserRouter>
        <OnlineStoreView
          {...getDefaultOnlineStoreViewProps({
            onlineStore,
            featureTableName: 'user.all_features',
          })}
        />
      </BrowserRouter>,
    );

    testDescription(wrapper, '#connection-data', {
      Cloud: 'AWS',
      Storage: 'DYNAMODB',
      Region: 'us-east-1',
      'Table ARN': 'arn:1:2:3',
    });

    testDescription(wrapper, '#meta-data', {
      Created: Utils.formatTimestamp(1612208908702),
      'Created by': 'zq@db.com',
      'Last published': Utils.formatTimestamp(1612209936774),
      'Last published by': 'cd@db.com',
    });

    const names = wrapper.find('[data-test-id="online-feature-name"]').map((r) => r.text());
    expect(names).toEqual(['feat1', 'feat2']);
  });

  it('renders correct DynamoDB metadata with TTL in description', () => {
    const onlineStore = mockOnlineStore({
      name: 'a name',
      cloud: 'AWS',
      store_type: 'DYNAMODB',
      creation_timestamp: 1612208908702,
      creator_id: 'zq@db.com',
      last_updated_timestamp: 1612209936774,
      last_update_user_id: 'cd@db.com',
      features: ['feat1', 'feat2'],
      dynamodb_metadata: { table_arn: 'arn:1:2:3', region: 'us-east-1', ttl: 5000 },
    });

    const wrapper = mountWithIntl(
      <BrowserRouter>
        <OnlineStoreView
          {...getDefaultOnlineStoreViewProps({
            onlineStore,
            featureTableName: 'user.all_features',
          })}
        />
      </BrowserRouter>,
    );

    testDescription(wrapper, '#connection-data', {
      Cloud: 'AWS',
      Storage: 'DYNAMODB',
      Region: 'us-east-1',
      'Table ARN': 'arn:1:2:3',
      'Time to live': '5,000 seconds',
    });
  });

  it('renders correct DynamoDB metadata without TTL in description', () => {
    const onlineStore = mockOnlineStore({
      name: 'a name',
      cloud: 'AWS',
      store_type: 'DYNAMODB',
      creation_timestamp: 1612208908702,
      creator_id: 'zq@db.com',
      last_updated_timestamp: 1612209936774,
      last_update_user_id: 'cd@db.com',
      features: ['feat1', 'feat2'],
      dynamodb_metadata: { table_arn: 'arn:1:2:3', region: 'us-east-1' },
    });

    const wrapper = mountWithIntl(
      <BrowserRouter>
        <OnlineStoreView
          {...getDefaultOnlineStoreViewProps({
            onlineStore,
            featureTableName: 'user.all_features',
          })}
        />
      </BrowserRouter>,
    );

    testDescription(wrapper, '#connection-data', {
      Cloud: 'AWS',
      Storage: 'DYNAMODB',
      Region: 'us-east-1',
      'Table ARN': 'arn:1:2:3',
    });
  });

  it('renders correct CosmosDB metadata in description', () => {
    const onlineStore = mockOnlineStore({
      name: 'a name',
      cloud: 'Azure',
      store_type: 'COSMOSDB',
      creation_timestamp: 1612208908702,
      creator_id: 'zq@db.com',
      last_updated_timestamp: 1612209936774,
      last_update_user_id: 'cd@db.com',
      features: ['feat1', 'feat2'],
      cosmosdb_metadata: {
        account_uri: 'www.account.com',
        container_uri: 'www.account.com/db/db_name/colls/container',
      },
    });
    const wrapper = mountWithIntl(
      <BrowserRouter>
        <OnlineStoreView
          {...getDefaultOnlineStoreViewProps({
            onlineStore,
            featureTableName: 'user.all_features',
          })}
        />
      </BrowserRouter>,
    );
    testDescription(wrapper, '#connection-data', {
      Cloud: 'Azure',
      Storage: 'COSMOSDB',
      'Account URI': 'www.account.com',
      'Container URI': 'www.account.com/db/db_name/colls/container',
    });
  });

  it('renders correct MySQL metadata in description', () => {
    const onlineStore = mockOnlineStore({
      name: 'a name',
      cloud: 'AWS',
      store_type: 'MYSQL',
      host: 'a host',
      port: 5678,
      creation_timestamp: 1612208908702,
      creator_id: 'zq@db.com',
      last_updated_timestamp: 1612209936774,
      last_update_user_id: 'cd@db.com',
      features: ['feat1', 'feat2'],
      mysql_metadata: {
        host: 'a host',
        port: 5678,
      },
    });
    const wrapper = mountWithIntl(
      <BrowserRouter>
        <OnlineStoreView
          {...getDefaultOnlineStoreViewProps({
            onlineStore,
            featureTableName: 'user.all_features',
          })}
        />
      </BrowserRouter>,
    );
    testDescription(wrapper, '#connection-data', {
      Cloud: 'AWS',
      Storage: 'MYSQL',
      Host: 'a host',
      Port: '5678',
    });
  });

  it('renders correct SQL Server metadata in description', () => {
    const onlineStore = mockOnlineStore({
      name: 'a name',
      cloud: 'AWS',
      store_type: 'SQL_SERVER',
      host: 'a host',
      port: 5678,
      creation_timestamp: 1612208908702,
      creator_id: 'zq@db.com',
      last_updated_timestamp: 1612209936774,
      last_update_user_id: 'cd@db.com',
      features: ['feat1', 'feat2'],
      sql_server_metadata: {
        host: 'a host',
        port: 5678,
      },
    });
    const wrapper = mountWithIntl(
      <BrowserRouter>
        <OnlineStoreView
          {...getDefaultOnlineStoreViewProps({
            onlineStore,
            featureTableName: 'user.all_features',
          })}
        />
      </BrowserRouter>,
    );
    testDescription(wrapper, '#connection-data', {
      Cloud: 'AWS',
      Storage: 'SQL_SERVER',
      Host: 'a host',
      Port: '5678',
    });
  });
});
