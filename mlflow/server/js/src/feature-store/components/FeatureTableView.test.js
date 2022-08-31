import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Breadcrumb, DesignSystemProvider } from '@databricks/design-system';
import { FeatureTableView } from './FeatureTableView';
import {
  mockFeatureTable,
  mockFeaturesForKeys,
  mockNotebookProducer,
  mockJobProducer,
  mockJobRun,
  mockOnlineStore,
} from '../utils/test-utils';
import { FeatureStoreRoutes } from '../routes';
import { PermissionLevels, ProducerActions } from '../constants';
import Utils from '../../common/utils/Utils';
import { mountWithIntl } from '../../common/utils/TestUtils';
import DatabricksUtils from '../../common/utils/DatabricksUtils';

const getDefaultFeatureTableViewProps = (overrides = {}) => ({
  history: { push: jest.fn() },
  features: [],
  featureTable: { name: 'feature table name' },
  notebookConsumers: [],
  jobConsumers: [],
  notebookProducers: [],
  jobProducers: [],
  pipelineProducers: [],
  modelVersionsByFeature: {},
  featureTableTags: {},
  handleEditDescription: jest.fn(),
  handleDeleteFeatureTable: jest.fn(),
  showEditPermissionModal: jest.fn(),
  handleSetFeatureTableTags: jest.fn(),
  handleDeleteFeatureTableTags: jest.fn(),
  ...overrides,
});

const ANTD_DESCRIPTIONS_ITEM_CLS = '.ant-descriptions-item';
const ANTD_DESCRIPTIONS_ITEM_LABEL_CLS = ANTD_DESCRIPTIONS_ITEM_CLS + '-label';
const ANTD_DESCRIPTIONS_ITEM_CONTENT_CLS = ANTD_DESCRIPTIONS_ITEM_CLS + '-content';

const flushPromises = () => new Promise(setImmediate);

const generateFeatureTableWrapper = (props) =>
  mountWithIntl(
    <BrowserRouter>
      <DesignSystemProvider>
        <FeatureTableView {...props} />
      </DesignSystemProvider>
    </BrowserRouter>,
  );

describe('FeatureTableView', () => {
  it('renders with minimal props without exploding', () => {
    const wrapper = generateFeatureTableWrapper(getDefaultFeatureTableViewProps());
    expect(wrapper.length).toBe(1);
  });

  it('should render correct information if tables are empty', () => {
    const wrapper = generateFeatureTableWrapper(getDefaultFeatureTableViewProps());
    const tables = wrapper.find('table');
    expect(tables.map((table) => table.text())).toEqual(
      expect.arrayContaining([
        expect.stringContaining('No tags found.'),
        expect.stringContaining('No producers found.'),
        expect.stringContaining('No online stores found.'),
        expect.stringContaining('No features found.'),
      ]),
    );
  });

  it('has correct breadcrumbs', () => {
    const mockedFeatureTable = mockFeatureTable();
    const expectedFeatureTableName = mockedFeatureTable.name;
    const expectedFeatureStoreLink = FeatureStoreRoutes.BASE;
    const wrapper = generateFeatureTableWrapper(
      getDefaultFeatureTableViewProps({
        featureTable: mockedFeatureTable,
      }),
    );
    const crumbs = wrapper.find(Breadcrumb.Item);
    expect(crumbs.length).toEqual(2);

    const featureStoreCrumb = crumbs.find('a');
    expect(featureStoreCrumb.text()).toEqual('Feature Store');
    expect(featureStoreCrumb.prop('href')).toEqual(expectedFeatureStoreLink);

    const featureTableCrumb = crumbs.at(1);
    expect(featureTableCrumb.text()).toEqual(expectedFeatureTableName);
  });

  it('have n rows in online stores table', () => {
    const wrapper = generateFeatureTableWrapper(
      getDefaultFeatureTableViewProps({
        featureTable: mockFeatureTable({
          onlineStores: [
            mockOnlineStore({
              name: 'DynamoDB_1',
              store_type: 'DynamoDB',
              cloud: 'AWS',
              last_updated_timestamp: 1000,
              last_update_user_id: 'foo.bar@databricks.com',
              dynamodb_metadata: { region: 'us-west-2', table_arn: '123abcd' },
            }),
            mockOnlineStore({
              name: 'DynamoDB_2',
              store_type: 'DynamoDB',
              cloud: 'AWS',
              last_updated_timestamp: 1500,
              last_update_user_id: 'bar.foo@databricks.com',
              // does not have region
              dynamodb_metadata: { table_arn: 'xxxx' },
            }),
            mockOnlineStore({
              name: 'MySQL_1',
              store_type: 'MySQL',
              cloud: 'GCP',
              last_updated_timestamp: 2000,
              last_update_user_id: 'foo.baz@databricks.com',
              mysql_metadata: { host: 'http://example.com', port: 2001 },
            }),
            mockOnlineStore({
              name: 'CosmosDB_1',
              store_type: 'CosmosDB',
              cloud: 'Azure',
              last_updated_timestamp: 2000,
              last_update_user_id: 'baz.foo@databricks.com',
              cosmosdb_metadata: {
                account_uri: 'www.account.com',
                container_uri: 'www.account.com/dbs/db_name/colls/container',
              },
            }),
          ],
        }),
      }),
    );

    const stores = wrapper.find('[data-test-id="online-store-name"]').map((r) => r.text());
    expect(stores).toEqual(['DynamoDB_1', 'DynamoDB_2', 'MySQL_1', 'CosmosDB_1']);

    const clouds = wrapper.find('[data-test-id="online-store-cloud"]').map((r) => r.text());
    expect(clouds).toEqual(['AWS', 'AWS', 'GCP', 'Azure']);

    const storages = wrapper.find('[data-test-id="online-store-storage"]').map((r) => r.text());
    expect(storages).toEqual(['DynamoDB', 'DynamoDB', 'MySQL', 'CosmosDB']);

    const store_links = wrapper
      .find('[data-test-id="online-store-name"]')
      .map((r) => r.find('a').prop('href'));
    expect(store_links).toEqual([
      '/feature-store/online-stores/get?featureTableName=prod.user_activity_features&name=DynamoDB_1&cloud=AWS&storeType=DynamoDB&tableArn=123abcd',
      '/feature-store/online-stores/get?featureTableName=prod.user_activity_features&name=DynamoDB_2&cloud=AWS&storeType=DynamoDB&tableArn=xxxx',
      '/feature-store/online-stores/get?featureTableName=prod.user_activity_features&name=MySQL_1&cloud=GCP&storeType=MySQL',
      '/feature-store/online-stores/get?featureTableName=prod.user_activity_features&name=CosmosDB_1&cloud=Azure&storeType=CosmosDB&containerUri=www.account.com%252Fdbs%252Fdb_name%252Fcolls%252Fcontainer',
    ]);

    const regions = wrapper.find('[data-test-id="online-store-region"]').map((r) => r.text());
    expect(regions).toEqual(['us-west-2', '-', '-', '-']);

    const lastPublishedTimestamps = wrapper
      .find('[data-test-id="online-store-last-published-timestamp"]')
      .map((r) => r.text());
    expect(lastPublishedTimestamps).toEqual([
      Utils.formatTimestamp(1000),
      Utils.formatTimestamp(1500),
      Utils.formatTimestamp(2000),
      Utils.formatTimestamp(2000),
    ]);

    const lastPublishers = wrapper
      .find('[data-test-id="online-store-last-published-user-id"]')
      .map((r) => r.text());
    expect(lastPublishers).toEqual([
      'foo.bar@databricks.com',
      'bar.foo@databricks.com',
      'foo.baz@databricks.com',
      'baz.foo@databricks.com',
    ]);
  });

  it('hide region column if there are no dynamodb online stores', () => {
    const wrapper = generateFeatureTableWrapper(
      getDefaultFeatureTableViewProps({
        featureTable: mockFeatureTable({
          onlineStores: [
            mockOnlineStore({
              name: 'MySQL_1',
              store_type: 'MySQL',
              cloud: 'AWS',
              last_updated_timestamp: 2000,
              last_update_user_id: 'foo.baz@databricks.com',
              mysql_metadata: { host: 'http://example.com', port: 2001 },
            }),
            mockOnlineStore({
              name: 'SqlServer_1',
              store_type: 'SqlServer',
              cloud: 'AZURE',
              last_updated_timestamp: 2000,
              last_update_user_id: 'foo.baz@databricks.com',
              sql_server_metadata: { host: 'http://example.com', port: 2001 },
            }),
          ],
        }),
      }),
    );
    expect(wrapper.find('[data-test-id="online-store-region"]').length).toEqual(0);
  });

  it('should render feature table tags correctly', () => {
    const featureTableTags = {
      'some random key': { key: 'some random key', value: 'random value' },
      'sOME sPeCiAl Key': { key: 'sOME sPeCiAl Key', value: 'notSO speCIal ValUe' },
    };
    const wrapper = generateFeatureTableWrapper(
      getDefaultFeatureTableViewProps({
        featureTable: mockFeatureTable(),
        featureTableTags: featureTableTags,
      }),
    );
    Object.values(featureTableTags).forEach((tag) => {
      expect(wrapper.find('[data-test-id="feature-table-tags-section"]').html()).toContain(tag.key);
      expect(wrapper.find('[data-test-id="feature-table-tags-section"]').html()).toContain(
        tag.value,
      );
    });
  });

  it('correctly render edit description form based on user permissions', () => {
    let mockedFeatureTable = mockFeatureTable({
      permissionLevel: PermissionLevels.CAN_EDIT_METADATA,
    });
    let wrapper = generateFeatureTableWrapper(
      getDefaultFeatureTableViewProps({
        featureTable: mockedFeatureTable,
      }),
    );

    // should display text editor after the edit icon is clicked
    wrapper.find('[data-test-id="edit-icon-button"]').hostNodes().simulate('click');
    wrapper.update();
    expect(wrapper.find('[data-test-id="edit-icon-button"]').length > 0).toBe(false);

    Object.values(PermissionLevels).forEach((permission) => {
      mockedFeatureTable = mockFeatureTable({ permissionLevel: permission });
      wrapper = generateFeatureTableWrapper(
        getDefaultFeatureTableViewProps({
          featureTable: mockedFeatureTable,
        }),
      );
      // users with CAN_VIEW_METADATA permission should not see the edit icon
      if (
        permission === PermissionLevels.CAN_VIEW_METADATA ||
        permission === PermissionLevels.CAN_CREATE
      ) {
        expect(wrapper.find('[data-test-id="edit-icon-button"]').length > 0).toBe(false);
      } else {
        expect(wrapper.find('[data-test-id="edit-icon-button"]').length > 0).toBe(true);
      }
    });
  });

  it('should render menu breadcrumb based on user permissions', () => {
    DatabricksUtils.isAclCheckEnabledForWorkspace = jest.fn().mockReturnValue(true);
    Object.values(PermissionLevels).forEach((permission) => {
      const mockedFeatureTable = mockFeatureTable({
        permissionLevel: permission,
      });
      const wrapper = generateFeatureTableWrapper(
        getDefaultFeatureTableViewProps({
          featureTable: mockedFeatureTable,
        }),
      );
      // only users with CAN_MANAGE permission can see the menu dropdown / permissions button
      expect(wrapper.find('[data-test-id="permissions-button"]').length > 0).toBe(
        permission === PermissionLevels.CAN_MANAGE,
      );
      expect(wrapper.find('button[data-test-id="overflow-menu-trigger"]').length > 0).toBe(
        permission === PermissionLevels.CAN_MANAGE,
      );
    });
  });

  it('should render permission only when the workspace ACL is enabled and user has CAN_MANAGE permission', () => {
    Object.values(PermissionLevels).forEach((permission) => {
      [true, false].forEach((isAclCheckEnabledForWorkspace) => {
        DatabricksUtils.isAclCheckEnabledForWorkspace = jest
          .fn()
          .mockReturnValue(isAclCheckEnabledForWorkspace);
        const wrapper = generateFeatureTableWrapper(
          getDefaultFeatureTableViewProps({
            featureTable: mockFeatureTable({
              permissionLevel: permission,
            }),
          }),
        );
        // As long as the user has `CAN_MANAGE` permission, a dropdown button will be rendered.
        if (permission === PermissionLevels.CAN_MANAGE) {
          // After clicking on the dropdown button, `isAclCheckEnabledForWorkspace` decides if
          // we should render the permission menu or not.
          expect(wrapper.find('[data-test-id="permissions-button"]').length > 0).toEqual(
            isAclCheckEnabledForWorkspace,
          );
        } else {
          expect(wrapper.find('[data-test-id="permissions-button"]').length).toEqual(0);
        }
      });
    });
  });

  it('should render delete button when user has CAN_MANAGE permission', () => {
    Object.values(PermissionLevels).forEach((permission) => {
      const mockedFeatureTable = mockFeatureTable({
        permissionLevel: permission,
      });
      const wrapper = generateFeatureTableWrapper(
        getDefaultFeatureTableViewProps({
          featureTable: mockedFeatureTable,
        }),
      );
      // render deletion modal only when
      // 1. user has CAN_MANAGE permission
      // 2. user clicks on the menu dropdown
      // 3. user clicks on delete button
      if (permission === PermissionLevels.CAN_MANAGE) {
        // if the user has CAN_MANAGE permission, deletion modal is hidden by default
        expect(wrapper.find('[data-test-id="feature-table-deletion-modal"]').at(0).text()).toEqual(
          '',
        );
        // clicking menu dropdown
        wrapper.find('[data-test-id="overflow-menu-trigger"]').hostNodes().simulate('click');
        // clicking delete button
        wrapper.find('[data-test-id="deletion-dropdown"]').hostNodes().simulate('click');
        wrapper.update();
        // deletion modal is now visible
        expect(
          wrapper
            .find('[data-test-id="feature-table-deletion-modal"]')
            .at(0)
            .text()
            .includes('Delete Feature Table'),
        ).toEqual(true);
      } else {
        expect(wrapper.find('[data-test-id="deletion-dropdown"]').length).toEqual(0);
        // if the user does NOT have CAN_MANAGE permission, deletion modal will not be rendered
        expect(wrapper.find('[data-test-id="feature-table-deletion-modal"]').length).toEqual(0);
      }
    });
  });

  it('deletion modal delete buttons work as expect', async () => {
    const mockedFeatureTable = mockFeatureTable({
      permissionLevel: PermissionLevels.CAN_MANAGE,
    });
    const handleDeleteFeatureTableMock = jest.fn(() => Promise.resolve({}));
    const props = {
      ...getDefaultFeatureTableViewProps({
        featureTable: mockedFeatureTable,
        handleDeleteFeatureTable: handleDeleteFeatureTableMock,
      }),
    };
    const wrapper = generateFeatureTableWrapper(props);
    // clicking menu dropdown
    wrapper.find('button[data-test-id="overflow-menu-trigger"]').simulate('click');
    // clicking delete button in menu
    wrapper.find('[data-test-id="deletion-dropdown"]').hostNodes().simulate('click');
    // clicking confirm delete button in modal
    wrapper
      .find('[data-test-id="feature-table-deletion-modal"]')
      .find('button')
      .at(2)
      .simulate('click');
    wrapper.update();

    await flushPromises();
    // trigger handleDeleteFeatureTable and redirect to main landing page on success
    expect(props.handleDeleteFeatureTable.mock.calls.length).toEqual(1);
    expect(props.history.push).toHaveBeenCalledWith(FeatureStoreRoutes.BASE);
  });

  describe('Descriptions component section', () => {
    const validateDescriptionFields = (wrapper, expectedItems) => {
      const expectedLabels = Object.keys(expectedItems);
      const expectedContents = Object.values(expectedItems);
      const descriptionItemsLabel = wrapper.find(ANTD_DESCRIPTIONS_ITEM_LABEL_CLS);
      const descriptionItemsContent = wrapper.find(ANTD_DESCRIPTIONS_ITEM_CONTENT_CLS);

      expect(descriptionItemsLabel.length).toEqual(expectedLabels.length);
      for (let i = 0; i < descriptionItemsLabel.length; i++) {
        expect(descriptionItemsLabel.at(i).text()).toEqual(expectedLabels[i]);
        expect(descriptionItemsContent.at(i).text()).toEqual(expectedContents[i]);
      }
    };

    it('renders correctly with fully populated data', () => {
      // Time zone issue, therefore switching to stringContaining() for date fields.
      const expectedItems = {
        Created: expect.stringContaining('2021'),
        'Last written': expect.stringContaining('1982'),
        'Last modified': expect.stringContaining('2021'),
        'Primary Keys': 'user_id (INTEGER) ',
        'Created by': 'jane@doe.ml',
        'Last written by': 'job 2 creator',
        'Last modified by': 'john@doe.ml',
        'Partition Keys': 'user_type (INTEGER) , YYYY_MM_DD (TIMESTAMP) ',
        'Data Sources': 'table_8881table_8798',
      };

      const notebook1 = mockNotebookProducer(1234, 1, 100000000000, 'notebook 1 creator');
      const notebook2 = mockNotebookProducer(2345, 2, 200000000000, 'notebook 2 creator');
      const job1 = mockJobProducer(
        1234,
        1,
        300000000000,
        'job 1 creator',
        mockJobRun({ jobId: 1234 }),
      );
      const job2 = mockJobProducer(
        2345,
        23,
        400000000000,
        'job 2 creator',
        mockJobRun({ jobId: 2345 }),
      );

      const wrapper = mountWithIntl(
        <BrowserRouter>
          <DesignSystemProvider>
            <FeatureTableView
              {...getDefaultFeatureTableViewProps({
                featureTable: mockFeatureTable({
                  notebookProducers: [notebook1, notebook2],
                  jobProducers: [job1, job2],
                  partitionKeys: ['user_type', 'YYYY_MM_DD'],
                  timestampKeys: [],
                }),
                features: mockFeaturesForKeys(),
                notebookProducers: [
                  { ...notebook1, name: 'notebook1' },
                  { ...notebook2, name: 'notebook2' },
                ],
                jobProducers: [
                  { ...job1, name: 'my 1st job' },
                  { ...job2, name: 'job 2' },
                ],
              })}
            />
          </DesignSystemProvider>
        </BrowserRouter>,
      );
      validateDescriptionFields(wrapper, expectedItems);
    });

    it('renders correctly with timestamp keys', () => {
      const expectedItems = {
        Created: expect.stringContaining('2021'),
        'Last written': '',
        'Last modified': expect.stringContaining('2021'),
        'Primary Keys': 'user_id (INTEGER) ',
        'Created by': 'jane@doe.ml',
        'Last written by': '',
        'Last modified by': 'john@doe.ml',
        'Timestamp Keys': 'ts (TIMESTAMP) ',
        'Data Sources': 'table_8881table_8798',
      };

      const wrapper = generateFeatureTableWrapper(
        getDefaultFeatureTableViewProps({
          featureTable: mockFeatureTable({
            notebookProducers: [],
            jobProducers: [],
            timestampKeys: ['ts'],
          }),
          features: mockFeaturesForKeys(),
        }),
      );
      validateDescriptionFields(wrapper, expectedItems);
    });

    it('renders correctly with more than 3 mixed datasources', () => {
      // Time zone issue, therefore switching to stringContaining() for date fields.
      const expectedItems = {
        Created: expect.stringContaining('2021'),
        'Last written': expect.stringContaining('1973'),
        'Last modified': expect.stringContaining('2021'),
        'Primary Keys': 'user_id (INTEGER) ',
        'Created by': 'jane@doe.ml',
        'Last written by': 'notebook 1 creator',
        'Last modified by': 'john@doe.ml',
        'Partition Keys': 'user_type (INTEGER) , YYYY_MM_DD (TIMESTAMP) ',
        'Data Sources': 'x.ydbfs:/a.bcustom:/a.b+1 more',
      };
      const notebook1 = mockNotebookProducer(1234, 1, 100000000000, 'notebook 1 creator');
      const mockFeatureTableData = {
        dataSources: [
          { path: 'dbfs:/a.b' },
          { custom_source: 'custom:/a.b' },
          { table: 'x.y' },
          { custom_source: 'dbfs:/aye.bee' },
        ],
        notebookProducers: [notebook1],
        jobProducers: [],
        timestampKeys: [],
      };

      const wrapper = generateFeatureTableWrapper(
        getDefaultFeatureTableViewProps({
          featureTable: mockFeatureTable(mockFeatureTableData),
          features: mockFeaturesForKeys(),
          notebookProducers: [{ ...notebook1, name: 'notebook 1' }],
          jobProducers: [],
        }),
      );
      validateDescriptionFields(wrapper, expectedItems);
    });

    it('renders correctly in the absence of datasources and timestampKeys', () => {
      const expectedItems = {
        Created: expect.stringContaining('2021'),
        'Last written': '',
        'Last modified': expect.stringContaining('2021'),
        'Primary Keys': 'user_id (INTEGER) ',
        'Created by': 'jane@doe.ml',
        'Last written by': '',
        'Last modified by': 'john@doe.ml',
        'Partition Keys': 'user_type (INTEGER) , YYYY_MM_DD (TIMESTAMP) ',
        'Data Sources': '',
      };
      const mockInput = {
        dataSources: [],
        notebookProducers: [],
        jobProducers: [],
        timestampKeys: [],
      };

      const wrapper = generateFeatureTableWrapper(
        getDefaultFeatureTableViewProps({
          featureTable: mockFeatureTable(mockInput),
          features: mockFeaturesForKeys(),
        }),
      );
      validateDescriptionFields(wrapper, expectedItems);
    });

    it('renders correctly when feature table only have importer producer', () => {
      const expectedItems = {
        Imported: expect.stringContaining('2021'),
        'Last written': '',
        'Last modified': expect.stringContaining('2021'),
        'Primary Keys': 'user_id (INTEGER) ',
        'Imported by': 'jane@doe.ml',
        'Last written by': '',
        'Last modified by': 'john@doe.ml',
        'Partition Keys': 'user_type (INTEGER) , YYYY_MM_DD (TIMESTAMP) ',
        'Data Sources': '',
      };
      const importerNotebook = mockNotebookProducer(
        1234,
        1,
        100000000000,
        'notebook 1 creator',
        undefined,
        undefined,
        undefined,
        ProducerActions.REGISTER,
      );
      const importerJob = mockJobProducer(
        1234,
        1,
        300000000000,
        'job 1 creator',
        mockJobRun({ jobId: 1234 }),
        undefined,
        undefined,
        undefined,
        undefined,
        ProducerActions.REGISTER,
      );
      const mockInput = {
        dataSources: [],
        notebookProducers: [importerNotebook],
        jobProducers: [importerJob],
        timestampKeys: [],
        isImported: true,
      };

      const wrapper = generateFeatureTableWrapper(
        getDefaultFeatureTableViewProps({
          featureTable: mockFeatureTable(mockInput),
          features: mockFeaturesForKeys(),
        }),
      );
      validateDescriptionFields(wrapper, expectedItems);
    });
  });

  describe('Monitoring tab', () => {
    it('should only include the details pane by default', () => {
      const wrapper = generateFeatureTableWrapper(getDefaultFeatureTableViewProps());
      expect(wrapper.find('[role="tab"]').length).toBe(1);
      const activeTab = wrapper.find('[role="tab"][aria-selected=true]');
      expect(activeTab.text()).toBe('Details');
    });

    it('shows the monitoring tab if the feature flag is on', () => {
      jest
        .spyOn(DatabricksUtils, 'getConf')
        .mockImplementation((key) => key === 'enableFeatureProfiling');
      const wrapper = generateFeatureTableWrapper(getDefaultFeatureTableViewProps());
      const tabs = wrapper.find('[role="tab"]');
      expect(tabs.length).toBe(2);
      expect(tabs.last().text()).toEqual(expect.stringContaining('Data profiles'));
    });
  });
});
