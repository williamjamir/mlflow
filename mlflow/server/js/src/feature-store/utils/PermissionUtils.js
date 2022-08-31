import { PermissionLevels } from '../constants';

class PermissionUtils {
  static ALL_PERMISSIONS = [
    PermissionLevels.CAN_MANAGE,
    PermissionLevels.CAN_EDIT_METADATA,
    PermissionLevels.CAN_VIEW_METADATA,
  ];
  static MANAGE_PERMISSIONS = [PermissionLevels.CAN_MANAGE];
  static EDIT_PERMISSIONS = [PermissionLevels.CAN_MANAGE, PermissionLevels.CAN_EDIT_METADATA];

  static hasManagePermission(permissionLevel) {
    return this.MANAGE_PERMISSIONS.includes(permissionLevel);
  }

  static hasEditPermission(permissionLevel) {
    return this.EDIT_PERMISSIONS.includes(permissionLevel);
  }
}

export default PermissionUtils;
