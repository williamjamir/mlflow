import PermissionUtils from './PermissionUtils';
import { PermissionLevels } from '../constants';

describe('PermissionUtils.test', () => {
  test('permissionLevelCanManage', () => {
    expect(PermissionUtils.hasManagePermission(PermissionLevels.CAN_MANAGE)).toEqual(true);
    expect(PermissionUtils.hasManagePermission(PermissionLevels.CAN_EDIT_METADATA)).toEqual(false);
    expect(PermissionUtils.hasManagePermission(PermissionLevels.CAN_VIEW_METADATA)).toEqual(false);
    expect(PermissionUtils.hasManagePermission('RANDOM_STRING')).toEqual(false);
  });

  test('permissionLevelCanEdit', () => {
    expect(PermissionUtils.hasEditPermission(PermissionLevels.CAN_MANAGE)).toEqual(true);
    expect(PermissionUtils.hasEditPermission(PermissionLevels.CAN_EDIT_METADATA)).toEqual(true);
    expect(PermissionUtils.hasEditPermission(PermissionLevels.CAN_VIEW_METADATA)).toEqual(false);
    expect(PermissionUtils.hasEditPermission('RANDOM_STRING')).toEqual(false);
  });
});
