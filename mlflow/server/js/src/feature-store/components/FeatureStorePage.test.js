import React from 'react';
import { shallowWithInjectIntl, shallowWithIntl } from '../../common/utils/TestUtils';
import { FeatureStorePageImpl } from './FeatureStorePage';
import { mockFeatureTable, mockJobProducer, error404, error500 } from '../utils/test-utils';
import DatabricksUtils from '../../common/utils/DatabricksUtils';
import Utils from '../../common/utils/Utils';
import { ErrorView } from '../../common/components/ErrorView';

const getDefaultFeatureStoreProps = (overrides = {}) => ({
  featureTables: [],
  scheduledJobsForFeatureTables: {},
  searchFeatureTablesApi: jest.fn(() => Promise.resolve({})),
  getJobApi: jest.fn(() => Promise.resolve({})),
  getFeatureStoreWidePermissionsApi: jest.fn(() => Promise.resolve({})),
  history: {
    push: jest.fn(),
  },
  ...overrides,
});

const flushPromises = () => new Promise(setImmediate);

describe('FeatureStorePage', () => {
  let mockErrorToast;
  let errorApi;

  beforeEach(() => {
    mockErrorToast = jest.fn();
    Utils.logErrorAndNotifyUser = mockErrorToast;
    errorApi = jest.fn(() => Promise.reject(error500));
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('renders with minimal props and store without exploding', () => {
    const wrapper = shallowWithInjectIntl(
      <FeatureStorePageImpl {...getDefaultFeatureStoreProps()} />,
    );

    expect(wrapper.find('[data-test-id="feature-store-page"]').length).toBe(1);
  });

  it('searchFeatureTablesApi failure is captured and displayed as error toast', async () => {
    const wrapper = shallowWithInjectIntl(
      <FeatureStorePageImpl
        {...getDefaultFeatureStoreProps({ searchFeatureTablesApi: errorApi })}
      />,
    );
    await flushPromises();
    expect(mockErrorToast).toHaveBeenCalledTimes(1);
    expect(wrapper.find(ErrorView).length).toBe(0);
  });

  it('calls getJobApi to get latest job runs', async () => {
    const searchFeatureTablesApiMock = jest.fn(() =>
      Promise.resolve({
        value: {
          feature_tables: [
            mockFeatureTable({ jobProducers: null }),
            mockFeatureTable({ jobProducers: [mockJobProducer(123)] }),
            mockFeatureTable({ jobProducers: [mockJobProducer(456), mockJobProducer(789)] }),
          ],
        },
      }),
    );

    const props = {
      ...getDefaultFeatureStoreProps({ searchFeatureTablesApi: searchFeatureTablesApiMock }),
    };
    shallowWithInjectIntl(<FeatureStorePageImpl {...props} />);

    await flushPromises();
    expect(props.getJobApi.mock.calls.length).toEqual(3);
    expect(props.getJobApi.mock.calls[0]).toEqual([123]);
    expect(props.getJobApi.mock.calls[1]).toEqual([456]);
    expect(props.getJobApi.mock.calls[2]).toEqual([789]);
  });

  it('getJobApi 5XX error is captured and displayed as error toast', async () => {
    errorApi = jest.fn((jobId) => {
      if (jobId === 123) {
        return Promise.reject(error500);
      }
      return Promise.resolve({});
    });
    const searchFeatureTablesApiMock = jest.fn(() =>
      Promise.resolve({
        value: {
          feature_tables: [
            mockFeatureTable({ jobProducers: [mockJobProducer(123)] }),
            mockFeatureTable({ jobProducers: [mockJobProducer(456), mockJobProducer(789)] }),
          ],
        },
      }),
    );
    const props = {
      ...getDefaultFeatureStoreProps({
        searchFeatureTablesApi: searchFeatureTablesApiMock,
        getJobApi: errorApi,
      }),
    };
    const wrapper = shallowWithInjectIntl(<FeatureStorePageImpl {...props} />);

    await flushPromises();
    expect(mockErrorToast).toHaveBeenCalledTimes(1);
    expect(wrapper.find(ErrorView).length).toBe(0);
    expect(errorApi.mock.calls.length).toEqual(3);
  });

  it('non-5XX external API errors should not be surfaced to user', async () => {
    errorApi = jest.fn(() => Promise.reject(error404));
    const searchFeatureTablesApiMock = jest.fn(() =>
      Promise.resolve({
        value: {
          feature_tables: [mockFeatureTable({ jobProducers: [mockJobProducer(123)] })],
        },
      }),
    );

    const props = {
      ...getDefaultFeatureStoreProps({
        searchFeatureTablesApi: searchFeatureTablesApiMock,
        getJobApi: errorApi,
      }),
    };
    const wrapper = shallowWithInjectIntl(<FeatureStorePageImpl {...props} />);

    await flushPromises();
    expect(mockErrorToast).toHaveBeenCalledTimes(0);
    expect(wrapper.find(ErrorView).length).toBe(0);
    expect(errorApi.mock.calls.length).toEqual(1);
  });

  it('calls getJobApi only for job producers in the current workspace', async () => {
    const workspaceId1 = '6666666';
    const workspaceId2 = '1234567';
    const workspaceId3 = '9876543';
    DatabricksUtils.getCurrentWorkspaceId = jest.fn().mockReturnValue(workspaceId1);
    const searchFeatureTablesApiMock = jest.fn(() =>
      Promise.resolve({
        value: {
          feature_tables: [
            mockFeatureTable({
              jobProducers: [
                mockJobProducer(666, 1, 111, 'a@b', undefined, undefined, undefined, workspaceId1),
              ],
            }),
            mockFeatureTable({
              jobProducers: [
                // from a different workspace
                mockJobProducer(123, 2, 222, 'a@b', undefined, undefined, undefined, workspaceId2),
              ],
            }),
            mockFeatureTable({
              jobProducers: [
                mockJobProducer(456, 3, 333, 'a@b', undefined, undefined, undefined, workspaceId1),
                // from a different workspace
                mockJobProducer(789, 4, 444, 'a@b', undefined, undefined, undefined, workspaceId3),
              ],
            }),
          ],
        },
      }),
    );

    const props = {
      ...getDefaultFeatureStoreProps({ searchFeatureTablesApi: searchFeatureTablesApiMock }),
    };
    shallowWithInjectIntl(<FeatureStorePageImpl {...props} />);

    await flushPromises();
    expect(props.getJobApi.mock.calls.length).toEqual(2);
    expect(props.getJobApi.mock.calls[0]).toEqual([666]);
    expect(props.getJobApi.mock.calls[1]).toEqual([456]);
  });

  it('calls getFeatureStoreWidePermissions to get permission', async () => {
    const getFeatureStoreWidePermissionsApiMock = jest.fn(() =>
      Promise.resolve({
        value: {
          permission_level: 'CAN_VIEW_METADATA',
        },
      }),
    );

    const props = {
      ...getDefaultFeatureStoreProps({
        getFeatureStoreWidePermissionsApi: getFeatureStoreWidePermissionsApiMock,
      }),
    };
    shallowWithInjectIntl(<FeatureStorePageImpl {...props} />);

    await flushPromises();
    expect(props.getFeatureStoreWidePermissionsApi.mock.calls.length).toEqual(1);
  });

  it('issues search based on query params', async () => {
    const location = {
      search: `?searchInput=abc`,
    };

    const props = {
      ...getDefaultFeatureStoreProps({ location: location }),
    };
    shallowWithInjectIntl(<FeatureStorePageImpl {...props} />);

    expect(props.searchFeatureTablesApi.mock.calls.length).toEqual(1);
    expect(props.searchFeatureTablesApi.mock.calls[0][0]).toEqual('abc');
  });

  it('updates query params on search', async () => {
    const props = {
      ...getDefaultFeatureStoreProps(),
    };
    const wrapper = shallowWithIntl(<FeatureStorePageImpl {...props} />).dive();

    // When you type in a search for def and click search, then the URL is modified
    const instance = wrapper.instance();
    instance.handleSearch('def');

    expect(props.history.push.mock.calls.length).toEqual(1);
    expect(props.history.push.mock.calls[0][0]).toEqual({ search: '?searchInput=def' });
  });
});
