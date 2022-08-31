import _ from 'lodash';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { OnlineStores, FeatureStoreView } from './FeatureStoreView';
import {
  mockFeatureTable,
  mockJobProducer,
  mockNotebookProducer,
  mockSchedule,
} from '../utils/test-utils';
import { SearchBox } from '../../shared/building_blocks/SearchBox';
import DatabricksUtils from '../../common/utils/DatabricksUtils';
import { mountWithIntl } from '../../common/utils/TestUtils';
import { CloudProvider } from '../../shared/constants-databricks';
import { Alert } from 'antd';
import { ProducerActions, SchedulePauseStatus } from '../constants';
import Utils from '../../common/utils/Utils';
import LinkUtils from '../utils/LinkUtils';
import { PermissionLevels } from '../constants';

const getDefaultFeatureStoreViewProps = (overrides = {}) => ({
  featureTables: [],
  scheduledJobsForFeatureTables: {},
  searchInput: '',
  currentPage: 1,
  nextPageToken: null, // no next page
  onSearch: jest.fn(),
  onSearchChange: jest.fn(),
  onClickNext: jest.fn(),
  onClickPrev: jest.fn(),
  onSetMaxResult: jest.fn(),
  getMaxResultValue: jest.fn().mockReturnValue(10),
  isLoading: false,
  permissionLevel: PermissionLevels.CAN_CREATE,
  showEditPermissionModal: jest.fn(),
  ...overrides,
});

const ANTD_TABLE_PLACEHOLDER_CLS = 'tr.ant-table-placeholder';

describe('FeatureStoreView', () => {
  it('renders with minimal props without exploding', () => {
    const wrapper = mountWithIntl(<FeatureStoreView {...getDefaultFeatureStoreViewProps()} />);
    expect(wrapper.length).toBe(1);
  });

  test('should display onboarding helper modal', () => {
    const wrapper = mountWithIntl(<FeatureStoreView {...getDefaultFeatureStoreViewProps()} />);
    expect(wrapper.find(Alert).length).toBe(1);
  });

  test('should not display onboarding help modal if disabled', () => {
    FeatureStoreView.showOnboardingHelper = jest.fn().mockReturnValue(false);
    const wrapper = mountWithIntl(<FeatureStoreView {...getDefaultFeatureStoreViewProps()} />);
    expect(wrapper.find(Alert).length).toBe(0);
  });

  test('should render permission modal based on user permissions', () => {
    /* eslint-disable no-restricted-globals */
    top.settings = {
      enableFeatureStoreWidePermissions: true,
    };
    DatabricksUtils.isAclCheckEnabledForWorkspace = jest.fn().mockReturnValue(true);

    // Renders when permission is CAN_MANAGE
    let wrapper = mountWithIntl(
      <FeatureStoreView
        {...getDefaultFeatureStoreViewProps({ permissionLevel: PermissionLevels.CAN_MANAGE })}
      />,
    );
    expect(wrapper.find('[data-test-id="permissions-button"]').hostNodes().length).toBe(1);

    // Do not render for other permissions
    [
      PermissionLevels.CAN_VIEW_METADATA,
      PermissionLevels.CAN_EDIT_METADATA,
      PermissionLevels.CAN_CREATE,
    ].forEach((permission) => {
      wrapper = mountWithIntl(
        <FeatureStoreView {...getDefaultFeatureStoreViewProps({ permissionLevel: permission })} />,
      );
      expect(wrapper.find('[data-test-id="permissions-button"]').hostNodes().length).toBe(0);
    });
  });

  test('should not render permission modal when feature store wide permission is not enabled', () => {
    /* eslint-disable no-restricted-globals */
    top.settings = {
      enableFeatureStoreWidePermissions: false,
    };
    DatabricksUtils.isAclCheckEnabledForWorkspace = jest.fn().mockReturnValue(true);

    const wrapper = mountWithIntl(
      <FeatureStoreView
        {...getDefaultFeatureStoreViewProps({ permissionLevel: PermissionLevels.CAN_MANAGE })}
      />,
    );
    expect(wrapper.find('[data-test-id="permissions-button"]').hostNodes().length).toBe(0);
  });

  test('should not render permission modal when workspace acl is not enabled', () => {
    /* eslint-disable no-restricted-globals */
    top.settings = {
      enableFeatureStoreWidePermissions: true,
    };
    DatabricksUtils.isAclCheckEnabledForWorkspace = jest.fn().mockReturnValue(false);

    const wrapper = mountWithIntl(
      <FeatureStoreView
        {...getDefaultFeatureStoreViewProps({ permissionLevel: PermissionLevels.CAN_MANAGE })}
      />,
    );
    expect(wrapper.find('[data-test-id="permissions-button"]').hostNodes().length).toBe(0);
  });

  test('should render correct information if table is empty', () => {
    FeatureStoreView.showOnboardingHelper = jest.fn().mockReturnValue(false);
    Object.values(CloudProvider).forEach((provider) => {
      DatabricksUtils.getCloudProvider = jest.fn().mockReturnValue(provider);
      const wrapper = mountWithIntl(<FeatureStoreView {...getDefaultFeatureStoreViewProps()} />);
      expect(wrapper.find(`a[href="${LinkUtils.getLearnMoreLinkUrl()}"]`)).toHaveLength(1);
      expect(wrapper.find(ANTD_TABLE_PLACEHOLDER_CLS).text()).toBe(
        'No feature tables yet.' +
          'Databricks Feature Store is a centralized repository ' +
          'that enables you to manage and share features. Learn More',
      );
    });
    DatabricksUtils.getCloudProvider = jest.fn().mockReturnValue(undefined);
    let wrapper = mountWithIntl(<FeatureStoreView {...getDefaultFeatureStoreViewProps()} />);
    expect(wrapper.find(`a[href="${LinkUtils.getLearnMoreLinkUrl()}"]`)).toHaveLength(1);

    // show 'No feature tables found.' when emptiness is caused by search filtering
    wrapper = mountWithIntl(
      <FeatureStoreView {...getDefaultFeatureStoreViewProps({ searchInput: 'xyz' })} />,
    );
    expect(wrapper.find(ANTD_TABLE_PLACEHOLDER_CLS).text()).toBe('No feature tables found.');

    // DOES NOT show empty text when there are feature tables
    wrapper = mountWithIntl(
      <BrowserRouter>
        <FeatureStoreView
          {...getDefaultFeatureStoreViewProps({
            featureTables: [mockFeatureTable()],
          })}
        />
      </BrowserRouter>,
    );
    expect(wrapper.find(ANTD_TABLE_PLACEHOLDER_CLS).length).toBe(0);
  });

  it('has n feature table rows', () => {
    const n = _.random(10);

    const wrapper = mountWithIntl(
      <BrowserRouter>
        <FeatureStoreView
          {...getDefaultFeatureStoreViewProps({
            featureTables: _.fill(Array(n)).map(() => mockFeatureTable()),
          })}
        />
      </BrowserRouter>,
    );
    const rows = wrapper.find('[data-test-id="feature-table-name"]');
    expect(rows.length).toEqual(n);
  });

  test('the search input is called with prop searchInput value', () => {
    const wrapper = mountWithIntl(<FeatureStoreView {...getDefaultFeatureStoreViewProps()} />);
    expect(wrapper.find(SearchBox).props().value).toBe('');

    wrapper.setProps({ searchInput: 'xyz' });
    expect(wrapper.find(SearchBox).props().value).toBe('xyz');
  });
});

describe('Online Stores', () => {
  const mockStores = [
    { store_type: 'MYSQL', host: 'host_6657' },
    { store_type: 'MYSQL', host: 'host_6657' },
    { store_type: 'Redis', host: 'host_6657' },
    { store_type: 'MYSQL', host: 'host_6657' },
  ];

  it('returns null if empty', () => {
    const nullWrapper = mountWithIntl(<OnlineStores />);
    expect(nullWrapper.isEmptyRender()).toBe(true);

    const emptyWrapper = mountWithIntl(<OnlineStores stores={[]} />);
    expect(emptyWrapper.isEmptyRender()).toBe(true);
  });

  it('groups store types', () => {
    const wrapper = mountWithIntl(<OnlineStores stores={mockStores} />);
    expect(wrapper.text()).toContain('MYSQL (3)');
    expect(wrapper.text()).toContain('Redis (1)');
  });
});

describe('Data sources', () => {
  const featureTables = [
    mockFeatureTable({ name: 'feature_table_a', dataSources: [] }),
    mockFeatureTable({ name: 'feature_table_b', dataSources: [{ table: 'test_db.test_table' }] }),
    mockFeatureTable({
      name: 'feature_table_c',
      dataSources: [{ table: 'some_db.some_table', path: 'dbfs:/xxx/yyy/zzz' }],
    }),
  ];

  let wrapper;

  beforeEach(() => {
    wrapper = mountWithIntl(
      <BrowserRouter>
        <FeatureStoreView {...getDefaultFeatureStoreViewProps({ featureTables })} />
      </BrowserRouter>,
    );
  });

  it('display only 1 data source for each table', () => {
    const dataSources = wrapper
      .find('[data-test-id="feature-table-data-sources"]')
      .map((r) => r.text());
    expect(dataSources.length).toEqual(3);
    expect(dataSources).toEqual(['', 'test_db.test_table', 'some_db.some_table+1 more']);
  });

  it('contains correct links', () => {
    const dataSources = wrapper
      .find('[data-test-id="feature-table-data-sources"]')
      .map((r) => (r.find('a').length > 0 ? r.find('a').prop('href') : ''));
    expect(dataSources.length).toEqual(3);
    expect(dataSources).toEqual([
      '',
      'http://localhost/#table/test_db/test_table',
      'http://localhost/#table/some_db/some_table',
    ]);
  });
});

describe('Scheduled jobs', () => {
  const featureTables = [
    mockFeatureTable({ name: 'feature_table_a' }),
    mockFeatureTable({ name: 'feature_table_b' }),
    mockFeatureTable({ name: 'feature_table_c' }),
  ];
  const scheduledJobsForFeatureTables = {
    feature_table_a: [
      mockJobProducer(
        123,
        1,
        111,
        'a@b.com',
        undefined,
        undefined,
        mockSchedule({
          cronExpression: '0 15 22 ? * *',
          timezone: 'America/Chicago',
          pauseStatus: SchedulePauseStatus.UNPAUSED,
        }),
        undefined,
        'https://dogfood.staging.cloud.databricks.com',
      ),
      mockJobProducer(
        456,
        2,
        222,
        'a@b.com',
        undefined,
        undefined,
        mockSchedule({
          cronExpression: '46 0 22 * * ?',
          timezone: 'America/Los_Angeles',
          pauseStatus: SchedulePauseStatus.PAUSED,
        }),
      ),
    ],
    feature_table_b: [
      mockJobProducer(
        666,
        5,
        333,
        'a@b.com',
        undefined,
        undefined,
        mockSchedule({
          cronExpression: '46 0 22 * * ?',
          timezone: 'America/Los_Angeles',
          pauseStatus: SchedulePauseStatus.UNPAUSED,
        }),
      ),
    ],
  };
  let wrapper;

  beforeEach(() => {
    wrapper = mountWithIntl(
      <BrowserRouter>
        <FeatureStoreView
          {...getDefaultFeatureStoreViewProps({ featureTables, scheduledJobsForFeatureTables })}
        />
      </BrowserRouter>,
    );
  });

  it('displays the correct job names', () => {
    const scheduledJobNames = wrapper
      .find('[data-test-id="feature-table-scheduled-jobs"]')
      .map((r) => r.text());
    expect(scheduledJobNames.length).toEqual(3);
    expect(scheduledJobNames).toEqual([
      'At 10:15 PM (America/Chicago)+1 more',
      'At 10:00 PM (America/Los_Angeles)',
      'No schedule',
    ]);
  });

  it('contains the correct links', () => {
    const scheduledJobLinks = wrapper
      .find('[data-test-id="feature-table-scheduled-jobs"]')
      .map((r) => r.find('a').prop('href'));
    expect(scheduledJobLinks.length).toEqual(3);
    expect(scheduledJobLinks).toEqual([
      'https://dogfood.staging.cloud.databricks.com/#job/123',
      'http://localhost/#job/666',
      LinkUtils.getScheduleJobLearnMoreLinkUrl(),
    ]);
  });
});

describe('Last written', () => {
  const jobProducers = [
    mockJobProducer(111, 2, 1626500655781),
    mockJobProducer(
      222,
      3,
      1612345655936,
      'creator',
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      null,
    ),
  ];
  const notebookProducers = [
    // some producer might have null for producer action
    mockNotebookProducer(111, 2, 1618759356936, 'creator', undefined, undefined, undefined, null),
    mockNotebookProducer(222, 3, 1621357069456),
  ];
  const notebookImporter = mockNotebookProducer(
    666,
    1,
    1612347657836,
    'creator',
    undefined,
    undefined,
    undefined,
    ProducerActions.REGISTER,
  );
  const featureTables = [
    // has only job producers
    mockFeatureTable({
      name: 'feature_table_a',
      jobProducers: jobProducers,
      notebookProducers: [],
    }),
    // has only notebook producer
    mockFeatureTable({
      name: 'feature_table_b',
      jobProducers: [],
      notebookProducers: notebookProducers,
    }),
    // has both job and notebook producers
    mockFeatureTable({
      name: 'feature_table_c',
      jobProducers: jobProducers,
      notebookProducers: notebookProducers,
    }),
    // has only a notebook importer
    mockFeatureTable({
      name: 'feature_table_d',
      jobProducers: [],
      notebookProducers: [notebookImporter],
    }),
    // has only a notebook importer and some other producers
    mockFeatureTable({
      name: 'feature_table_e',
      jobProducers: jobProducers,
      notebookProducers: [...notebookProducers, notebookImporter],
    }),
  ];

  it('includes the correct times it was written', () => {
    const wrapper = mountWithIntl(
      <BrowserRouter>
        <FeatureStoreView {...getDefaultFeatureStoreViewProps({ featureTables })} />
      </BrowserRouter>,
    );
    const lastWritten = wrapper
      .find('[data-test-id="feature-table-last-written"]')
      .map((r) => r.text());
    expect(lastWritten.length).toEqual(5);
    expect(lastWritten).toEqual([
      mountWithIntl(Utils.timeSinceStr(1626500655781)).text(),
      mountWithIntl(Utils.timeSinceStr(1621357069456)).text(),
      mountWithIntl(Utils.timeSinceStr(1626500655781)).text(),
      '',
      mountWithIntl(Utils.timeSinceStr(1626500655781)).text(),
    ]);
  });
});
