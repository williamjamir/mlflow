import React from 'react';
import { shallow } from 'enzyme';
import { ModelStageTransitionDropdown } from './ModelStageTransitionDropdown';
import { Stages } from '../constants';
import { Dropdown } from '@databricks/design-system';
import { mockGetFieldValue } from '../test-utils';
import { mountWithIntl } from '../../common/utils/TestUtils';
// BEGIN-EDGE
import { PermissionLevels } from '../constants';
import { oss_test } from '../../common/utils/DatabricksTestUtils';
// END-EDGE

describe('ModelStageTransitionDropdown', () => {
  let wrapper;
  let minimalProps;
  let commonProps;

  beforeEach(() => {
    minimalProps = {
      currentStage: Stages.NONE,
    };
    commonProps = {
      ...minimalProps,
      // BEGIN-EDGE
      permissionLevel: PermissionLevels.CAN_MANAGE,
      // END-EDGE
    };
  });

  test('should render with minimal props without exploding', () => {
    wrapper = mountWithIntl(<ModelStageTransitionDropdown {...minimalProps} />);
    expect(wrapper.length).toBe(1);
  });

  test('should omit current stage in dropdown', () => {
    const props = {
      ...commonProps,
      currentStage: Stages.STAGING,
    };
    wrapper = mountWithIntl(<ModelStageTransitionDropdown {...props} />);
    wrapper.find('.stage-transition-dropdown').first().simulate('click');
    const menuHtml = mountWithIntl(wrapper.find(Dropdown).props().overlay).html();

    expect(menuHtml).not.toContain(Stages.STAGING);
    expect(menuHtml).toContain(Stages.PRODUCTION);
    expect(menuHtml).toContain(Stages.NONE);
    expect(menuHtml).toContain(Stages.ARCHIVED);
  });

  // BEGIN-EDGE
  describe('should render menu item "transition to {stage}"', () => {
    const getTransitionToStagesHtml = (props) => {
      wrapper = mountWithIntl(<ModelStageTransitionDropdown {...props} />);
      wrapper.find('.stage-transition-dropdown').first().simulate('click');
      const menuHtml = mountWithIntl(wrapper.find(Dropdown).props().overlay).html();
      const transitionToStagesHtml = menuHtml.slice(
        menuHtml.indexOf('transition-menu-item-divider'),
      );
      return transitionToStagesHtml;
    };

    describe('with currentStage: NONE', () => {
      const props = {
        ...commonProps,
        currentStage: Stages.NONE,
      };
      test('with user permissionLevel: CAN_MANAGE', () => {
        const transitionToStagesHtml = getTransitionToStagesHtml({
          ...props,
          permissionLevel: PermissionLevels.CAN_MANAGE,
        });
        expect(transitionToStagesHtml).toContain(Stages.STAGING);
        expect(transitionToStagesHtml).toContain(Stages.PRODUCTION);
        expect(transitionToStagesHtml).not.toContain(Stages.NONE);
        expect(transitionToStagesHtml).toContain(Stages.ARCHIVED);
      });
      test('with user permissionLevel: CAN_EDIT', () => {
        const transitionToStagesHtml = getTransitionToStagesHtml({
          ...props,
          permissionLevel: PermissionLevels.CAN_EDIT,
        });
        expect(transitionToStagesHtml).not.toContain(Stages.STAGING);
        expect(transitionToStagesHtml).not.toContain(Stages.PRODUCTION);
        expect(transitionToStagesHtml).not.toContain(Stages.NONE);
        expect(transitionToStagesHtml).not.toContain(Stages.ARCHIVED);
      });
      test('with user permissionLevel: CAN_READ', () => {
        const transitionToStagesHtml = getTransitionToStagesHtml({
          ...props,
          permissionLevel: PermissionLevels.CAN_READ,
        });
        expect(transitionToStagesHtml).not.toContain(Stages.STAGING);
        expect(transitionToStagesHtml).not.toContain(Stages.PRODUCTION);
        expect(transitionToStagesHtml).not.toContain(Stages.NONE);
        expect(transitionToStagesHtml).not.toContain(Stages.ARCHIVED);
      });
      test('with user permissionLevel: CAN_MANAGE_STAGING_VERSIONS', () => {
        const transitionToStagesHtml = getTransitionToStagesHtml({
          ...props,
          permissionLevel: PermissionLevels.CAN_MANAGE_STAGING_VERSIONS,
        });
        expect(transitionToStagesHtml).toContain(Stages.STAGING);
        expect(transitionToStagesHtml).not.toContain(Stages.PRODUCTION);
        expect(transitionToStagesHtml).not.toContain(Stages.NONE);
        expect(transitionToStagesHtml).toContain(Stages.ARCHIVED);
      });
      test('with user permissionLevel: CAN_MANAGE_PRODUCTION_VERSIONS', () => {
        const transitionToStagesHtml = getTransitionToStagesHtml({
          ...props,
          permissionLevel: PermissionLevels.CAN_MANAGE_PRODUCTION_VERSIONS,
        });
        expect(transitionToStagesHtml).toContain(Stages.STAGING);
        expect(transitionToStagesHtml).toContain(Stages.PRODUCTION);
        expect(transitionToStagesHtml).not.toContain(Stages.NONE);
        expect(transitionToStagesHtml).toContain(Stages.ARCHIVED);
      });
    });

    describe('with currentStage: STAGING', () => {
      const props = {
        ...commonProps,
        currentStage: Stages.STAGING,
      };
      test('with user permissionLevel: CAN_MANAGE', () => {
        const transitionToStagesHtml = getTransitionToStagesHtml({
          ...props,
          permissionLevel: PermissionLevels.CAN_MANAGE,
        });
        expect(transitionToStagesHtml).not.toContain(Stages.STAGING);
        expect(transitionToStagesHtml).toContain(Stages.PRODUCTION);
        expect(transitionToStagesHtml).toContain(Stages.NONE);
        expect(transitionToStagesHtml).toContain(Stages.ARCHIVED);
      });
      test('with user permissionLevel: CAN_EDIT', () => {
        const transitionToStagesHtml = getTransitionToStagesHtml({
          ...props,
          permissionLevel: PermissionLevels.CAN_EDIT,
        });
        expect(transitionToStagesHtml).not.toContain(Stages.STAGING);
        expect(transitionToStagesHtml).not.toContain(Stages.PRODUCTION);
        expect(transitionToStagesHtml).not.toContain(Stages.NONE);
        expect(transitionToStagesHtml).not.toContain(Stages.ARCHIVED);
      });
      test('with user permissionLevel: CAN_READ', () => {
        const transitionToStagesHtml = getTransitionToStagesHtml({
          ...props,
          permissionLevel: PermissionLevels.CAN_READ,
        });
        expect(transitionToStagesHtml).not.toContain(Stages.STAGING);
        expect(transitionToStagesHtml).not.toContain(Stages.PRODUCTION);
        expect(transitionToStagesHtml).not.toContain(Stages.NONE);
        expect(transitionToStagesHtml).not.toContain(Stages.ARCHIVED);
      });
      test('with user permissionLevel: CAN_MANAGE_STAGING_VERSIONS', () => {
        const transitionToStagesHtml = getTransitionToStagesHtml({
          ...props,
          permissionLevel: PermissionLevels.CAN_MANAGE_STAGING_VERSIONS,
        });
        expect(transitionToStagesHtml).not.toContain(Stages.STAGING);
        expect(transitionToStagesHtml).not.toContain(Stages.PRODUCTION);
        expect(transitionToStagesHtml).toContain(Stages.NONE);
        expect(transitionToStagesHtml).toContain(Stages.ARCHIVED);
      });
      test('with user permissionLevel: CAN_MANAGE_PRODUCTION_VERSIONS', () => {
        const transitionToStagesHtml = getTransitionToStagesHtml({
          ...props,
          permissionLevel: PermissionLevels.CAN_MANAGE_PRODUCTION_VERSIONS,
        });
        expect(transitionToStagesHtml).not.toContain(Stages.STAGING);
        expect(transitionToStagesHtml).toContain(Stages.PRODUCTION);
        expect(transitionToStagesHtml).toContain(Stages.NONE);
        expect(transitionToStagesHtml).toContain(Stages.ARCHIVED);
      });
    });

    describe('with currentStage: PRODUCTION', () => {
      const props = {
        ...commonProps,
        currentStage: Stages.PRODUCTION,
      };
      test('with user permissionLevel: CAN_MANAGE', () => {
        const transitionToStagesHtml = getTransitionToStagesHtml({
          ...props,
          permissionLevel: PermissionLevels.CAN_MANAGE,
        });
        expect(transitionToStagesHtml).toContain(Stages.STAGING);
        expect(transitionToStagesHtml).not.toContain(Stages.PRODUCTION);
        expect(transitionToStagesHtml).toContain(Stages.NONE);
        expect(transitionToStagesHtml).toContain(Stages.ARCHIVED);
      });
      test('with user permissionLevel: CAN_EDIT', () => {
        const transitionToStagesHtml = getTransitionToStagesHtml({
          ...props,
          permissionLevel: PermissionLevels.CAN_EDIT,
        });
        expect(transitionToStagesHtml).not.toContain(Stages.STAGING);
        expect(transitionToStagesHtml).not.toContain(Stages.PRODUCTION);
        expect(transitionToStagesHtml).not.toContain(Stages.NONE);
        expect(transitionToStagesHtml).not.toContain(Stages.ARCHIVED);
      });
      test('with user permissionLevel: CAN_READ', () => {
        const transitionToStagesHtml = getTransitionToStagesHtml({
          ...props,
          permissionLevel: PermissionLevels.CAN_READ,
        });
        expect(transitionToStagesHtml).not.toContain(Stages.STAGING);
        expect(transitionToStagesHtml).not.toContain(Stages.PRODUCTION);
        expect(transitionToStagesHtml).not.toContain(Stages.NONE);
        expect(transitionToStagesHtml).not.toContain(Stages.ARCHIVED);
      });
      test('with user permissionLevel: CAN_MANAGE_STAGING_VERSIONS', () => {
        const transitionToStagesHtml = getTransitionToStagesHtml({
          ...props,
          permissionLevel: PermissionLevels.CAN_MANAGE_STAGING_VERSIONS,
        });
        expect(transitionToStagesHtml).not.toContain(Stages.STAGING);
        expect(transitionToStagesHtml).not.toContain(Stages.PRODUCTION);
        expect(transitionToStagesHtml).not.toContain(Stages.NONE);
        expect(transitionToStagesHtml).not.toContain(Stages.ARCHIVED);
      });
      test('with user permissionLevel: CAN_MANAGE_PRODUCTION_VERSIONS', () => {
        const transitionToStagesHtml = getTransitionToStagesHtml({
          ...props,
          permissionLevel: PermissionLevels.CAN_MANAGE_PRODUCTION_VERSIONS,
        });
        expect(transitionToStagesHtml).toContain(Stages.STAGING);
        expect(transitionToStagesHtml).not.toContain(Stages.PRODUCTION);
        expect(transitionToStagesHtml).toContain(Stages.NONE);
        expect(transitionToStagesHtml).toContain(Stages.ARCHIVED);
      });
    });

    describe('with currentStage: ARCHIVED', () => {
      const props = {
        ...commonProps,
        currentStage: Stages.ARCHIVED,
      };
      test('with user permissionLevel: CAN_MANAGE', () => {
        const transitionToStagesHtml = getTransitionToStagesHtml({
          ...props,
          permissionLevel: PermissionLevels.CAN_MANAGE,
        });
        expect(transitionToStagesHtml).toContain(Stages.STAGING);
        expect(transitionToStagesHtml).toContain(Stages.PRODUCTION);
        expect(transitionToStagesHtml).toContain(Stages.NONE);
        expect(transitionToStagesHtml).not.toContain(Stages.ARCHIVED);
      });
      test('with user permissionLevel: CAN_EDIT', () => {
        const transitionToStagesHtml = getTransitionToStagesHtml({
          ...props,
          permissionLevel: PermissionLevels.CAN_EDIT,
        });
        expect(transitionToStagesHtml).not.toContain(Stages.STAGING);
        expect(transitionToStagesHtml).not.toContain(Stages.PRODUCTION);
        expect(transitionToStagesHtml).not.toContain(Stages.NONE);
        expect(transitionToStagesHtml).not.toContain(Stages.ARCHIVED);
      });
      test('with user permissionLevel: CAN_READ', () => {
        const transitionToStagesHtml = getTransitionToStagesHtml({
          ...props,
          permissionLevel: PermissionLevels.CAN_READ,
        });
        expect(transitionToStagesHtml).not.toContain(Stages.STAGING);
        expect(transitionToStagesHtml).not.toContain(Stages.PRODUCTION);
        expect(transitionToStagesHtml).not.toContain(Stages.NONE);
        expect(transitionToStagesHtml).not.toContain(Stages.ARCHIVED);
      });
      test('with user permissionLevel: CAN_MANAGE_STAGING_VERSIONS', () => {
        const transitionToStagesHtml = getTransitionToStagesHtml({
          ...props,
          permissionLevel: PermissionLevels.CAN_MANAGE_STAGING_VERSIONS,
        });
        expect(transitionToStagesHtml).toContain(Stages.STAGING);
        expect(transitionToStagesHtml).not.toContain(Stages.PRODUCTION);
        expect(transitionToStagesHtml).toContain(Stages.NONE);
        expect(transitionToStagesHtml).not.toContain(Stages.ARCHIVED);
      });
      test('with user permissionLevel: CAN_MANAGE_PRODUCTION_VERSIONS', () => {
        const transitionToStagesHtml = getTransitionToStagesHtml({
          ...props,
          permissionLevel: PermissionLevels.CAN_MANAGE_PRODUCTION_VERSIONS,
        });
        expect(transitionToStagesHtml).toContain(Stages.STAGING);
        expect(transitionToStagesHtml).toContain(Stages.PRODUCTION);
        expect(transitionToStagesHtml).toContain(Stages.NONE);
        expect(transitionToStagesHtml).not.toContain(Stages.ARCHIVED);
      });
    });
  });

  test('handleMenuItemClick - archiveExistingVersions', () => {
    const mockOnSelect = jest.fn();
    const props = {
      ...commonProps,
      onSelect: mockOnSelect,
    };
    const activity = {};
    const comment = 'comment';
    wrapper = shallow(<ModelStageTransitionDropdown {...props} />);
    const mockArchiveFieldValues = [true, false, undefined];
    mockArchiveFieldValues.forEach((fieldValue) => {
      const expectArchiveFieldValue = Boolean(fieldValue); // undefined should become false also
      const instance = wrapper.instance();
      instance.transitionFormRef = {
        current: {
          getFieldValue: mockGetFieldValue(comment, fieldValue),
          resetFields: () => {},
        },
      };
      instance.handleMenuItemClick(activity);
      instance.state.handleConfirm();
      expect(mockOnSelect).toHaveBeenCalledWith(activity, comment, expectArchiveFieldValue);
    });
  });

  // END-EDGE
  oss_test('handleMenuItemClick - archiveExistingVersions', () => {
    const mockOnSelect = jest.fn();
    const props = {
      ...commonProps,
      onSelect: mockOnSelect,
    };
    const activity = {};
    wrapper = shallow(<ModelStageTransitionDropdown {...props} />);
    const mockArchiveFieldValues = [true, false, undefined];
    mockArchiveFieldValues.forEach((fieldValue) => {
      const expectArchiveFieldValue = Boolean(fieldValue); // undefined should become false also
      const instance = wrapper.instance();
      instance.transitionFormRef = {
        current: {
          getFieldValue: mockGetFieldValue('', fieldValue),
          resetFields: () => {},
        },
      };
      instance.handleMenuItemClick(activity);
      instance.state.handleConfirm();
      expect(mockOnSelect).toHaveBeenCalledWith(activity, expectArchiveFieldValue);
    });
  });
});
