import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { FeatureView } from './FeatureView';
import { FeatureStoreRoutes, getTableDetailPageRoute } from '../routes';
import { PermissionLevels } from '../constants';
import { mountWithIntl } from '../../common/utils/TestUtils';
import { mockFeatureTable, mockFeature } from '../utils/test-utils';
import { Breadcrumb, DesignSystemProvider } from '@databricks/design-system';

const getDefaultFeatureViewProps = (overrides = {}) => ({
  featureTableName: '',
  featureName: '',
  featureTable: {},
  feature: {},
  featureTags: {},
  notebookConsumers: [],
  jobConsumers: [],
  modelVersionsByFeature: {},
  handleEditDescription: jest.fn(),
  handleSetFeatureTags: jest.fn(),
  handleDeleteFeatureTags: jest.fn(),
  ...overrides,
});

const ANTD_DESCRIPTIONS_ITEM_CLS = '.ant-descriptions-item';
const ANTD_DESCRIPTIONS_ITEM_LABEL_CLS = ANTD_DESCRIPTIONS_ITEM_CLS + '-label';
const ANTD_DESCRIPTIONS_ITEM_CONTENT_CLS = ANTD_DESCRIPTIONS_ITEM_CLS + '-content';

const mountComponentStack = (node) =>
  mountWithIntl(
    <DesignSystemProvider>
      <BrowserRouter>{node}</BrowserRouter>
    </DesignSystemProvider>,
  );

describe('FeatureView', () => {
  it('renders with minimal props without exploding', () => {
    const wrapper = mountComponentStack(<FeatureView {...getDefaultFeatureViewProps()} />);
    expect(wrapper.length).toBe(1);
  });

  it('has correct breadcrumbs', () => {
    const featureTableName = 'user.all_features';
    const featureName = 'feature_name';
    const expectedFeatureStoreLink = FeatureStoreRoutes.BASE;
    const expectedFeatureTableLink = getTableDetailPageRoute(featureTableName);
    const wrapper = mountComponentStack(
      <FeatureView
        {...getDefaultFeatureViewProps({
          featureTableName: featureTableName,
          featureName: featureName,
        })}
      />,
    );
    const crumbs = wrapper.find(Breadcrumb.Item);
    expect(crumbs.length).toEqual(3);

    const featureStoreCrumb = crumbs.find('a').at(0);
    expect(featureStoreCrumb.text()).toEqual('Feature Store');
    expect(featureStoreCrumb.prop('href')).toEqual(expectedFeatureStoreLink);

    const featureTableCrumb = crumbs.find('a').at(1);
    expect(featureTableCrumb.text()).toEqual('user.all_features');
    expect(featureTableCrumb.prop('href')).toEqual(expectedFeatureTableLink);

    const onlineStoreCrumb = crumbs.at(2);
    expect(onlineStoreCrumb.text()).toEqual('feature_name');
  });

  it('correctly render edit description form based on user permissions', () => {
    let mockedFeatureTable = mockFeatureTable({
      permissionLevel: PermissionLevels.CAN_EDIT_METADATA,
    });

    const featureTableName = 'prod.user_activity_features';
    const featureName = 'count_items_7d';
    const feature = mockFeature({
      table: featureTableName,
      name: featureName,
      data_type: 'INTEGER',
      description: 'This is feature 1.',
    });

    let wrapper = mountComponentStack(
      <FeatureView
        {...getDefaultFeatureViewProps({
          featureTableName: featureTableName,
          featureName: featureName,
          featureTable: mockedFeatureTable,
          feature: feature,
        })}
      />,
    );

    // should display text editor after the edit icon is clicked
    wrapper.find('[data-test-id="edit-icon-button"]').hostNodes().simulate('click');
    wrapper.update();
    expect(wrapper.find('[data-test-id="edit-icon-button"]').length > 0).toBe(false);

    Object.values(PermissionLevels).forEach((permission) => {
      mockedFeatureTable = mockFeatureTable({ permissionLevel: permission });
      wrapper = mountComponentStack(
        <FeatureView
          {...getDefaultFeatureViewProps({
            featureTableName: featureTableName,
            featureName: featureName,
            featureTable: mockedFeatureTable,
            feature: feature,
          })}
        />,
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

  it('renders consumers section', () => {
    const wrapper = mountComponentStack(<FeatureView {...getDefaultFeatureViewProps()} />);
    expect(wrapper.find('[data-test-id="feature-consumers-section"]').length).toBe(1);
  });

  it('metadata section renders correctly', () => {
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

    // Time zone issue, therefore switching to stringContaining() for date fields.
    const expectedItems = {
      Created: expect.stringContaining('2021'),
      'Last modified': expect.stringContaining('2022'),
      'Created by': 'jane@doe.ml',
      'Last modified by': 'john@doe.ml',
    };

    const wrapper = mountComponentStack(
      <FeatureView
        {...getDefaultFeatureViewProps({
          featureTable: mockFeatureTable(),
          feature: mockFeature(),
        })}
      />,
    );
    validateDescriptionFields(wrapper, expectedItems);
  });

  it('should render feature tags correctly', () => {
    const featureTags = {
      'some random key': { key: 'some random key', value: 'random value' },
      'sOME sPeCiAl Key': { key: 'sOME sPeCiAl Key', value: 'notSO speCIal ValUe' },
    };
    const wrapper = mountComponentStack(
      <FeatureView
        {...getDefaultFeatureViewProps({
          featureTable: mockFeatureTable(),
          feature: mockFeature(),
          featureTags: featureTags,
        })}
      />,
    );
    Object.values(featureTags).forEach((tag) => {
      expect(wrapper.find('[data-test-id="feature-page-tags-section"]').html()).toContain(tag.key);
      expect(wrapper.find('[data-test-id="feature-page-tags-section"]').html()).toContain(
        tag.value,
      );
    });
  });
});
