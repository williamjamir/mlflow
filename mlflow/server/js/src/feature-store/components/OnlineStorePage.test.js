import React from 'react';
import { shallow } from 'enzyme';

import { OnlineStorePageImpl } from './OnlineStorePage';
import { mockOnlineStore } from '../utils/test-utils';

const flushPromises = () => new Promise(setImmediate);

const getDefaultOnlineStoreProps = (overrides = {}) => ({
  onlineStore: {},
  featureTableName: '',
  onlineTableName: '',
  cloud: '',
  storeType: '',
  getOnlineStoreApi: jest.fn(() => Promise.resolve({})),
  ...overrides,
});

describe('OnlineStorePage', () => {
  it('renders with minimal props and store without exploding', () => {
    const wrapper = shallow(<OnlineStorePageImpl {...getDefaultOnlineStoreProps()} />);

    expect(wrapper.find('[data-test-id="online-store-page"]').length).toBe(1);
  });

  it('calls getOnlineStoreApi API with DynamoDB store', async () => {
    const getOnlineStoreApiMock = jest.fn(() =>
      Promise.resolve({
        value: {
          online_store: mockOnlineStore(),
        },
      }),
    );
    const props = {
      ...getDefaultOnlineStoreProps({
        featureTableName: 'feature_tableX',
        onlineTableName: 'a name',
        cloud: 'AWS',
        storeType: 'DYNAMODB',
        tableArn: '124abc',
        getOnlineStoreApi: getOnlineStoreApiMock,
      }),
    };
    shallow(<OnlineStorePageImpl {...props} />);

    await flushPromises();
    expect(props.getOnlineStoreApi.mock.calls[0][0]).toEqual('feature_tableX');
    expect(props.getOnlineStoreApi.mock.calls[0][1]).toEqual('a name');
    expect(props.getOnlineStoreApi.mock.calls[0][2]).toEqual('AWS');
    expect(props.getOnlineStoreApi.mock.calls[0][3]).toEqual('DYNAMODB');
    expect(props.getOnlineStoreApi.mock.calls[0][4]).toEqual('124abc');
  });

  it('calls getOnlineStoreApi API with CosmosDB store', async () => {
    const getOnlineStoreApiMock = jest.fn(() =>
      Promise.resolve({
        value: {
          online_store: mockOnlineStore(),
        },
      }),
    );
    const props = {
      ...getDefaultOnlineStoreProps({
        featureTableName: 'feature_tableX',
        onlineTableName: 'a name',
        cloud: 'Azure',
        storeType: 'COSMOSDB',
        tableArn: undefined,
        containerUri: 'account.com/container',
        getOnlineStoreApi: getOnlineStoreApiMock,
      }),
    };
    shallow(<OnlineStorePageImpl {...props} />);

    await flushPromises();
    expect(props.getOnlineStoreApi.mock.calls[0][0]).toEqual('feature_tableX');
    expect(props.getOnlineStoreApi.mock.calls[0][1]).toEqual('a name');
    expect(props.getOnlineStoreApi.mock.calls[0][2]).toEqual('Azure');
    expect(props.getOnlineStoreApi.mock.calls[0][3]).toEqual('COSMOSDB');
    expect(props.getOnlineStoreApi.mock.calls[0][5]).toEqual('account.com/container');
  });

  it('calls getOnlineStoreApi API with SQL store', async () => {
    const getOnlineStoreApiMock = jest.fn(() =>
      Promise.resolve({
        value: {
          online_store: mockOnlineStore(),
        },
      }),
    );
    const props = {
      ...getDefaultOnlineStoreProps({
        featureTableName: 'feature_tableX',
        onlineTableName: 'a name',
        cloud: 'AZURE',
        storeType: 'MYSQL',
        tableArn: undefined,
        getOnlineStoreApi: getOnlineStoreApiMock,
      }),
    };
    shallow(<OnlineStorePageImpl {...props} />);

    await flushPromises();
    expect(props.getOnlineStoreApi.mock.calls[0][0]).toEqual('feature_tableX');
    expect(props.getOnlineStoreApi.mock.calls[0][1]).toEqual('a name');
    expect(props.getOnlineStoreApi.mock.calls[0][2]).toEqual('AZURE');
    expect(props.getOnlineStoreApi.mock.calls[0][3]).toEqual('MYSQL');
  });
});
