import { PermissionLevels, Stages } from '../constants';

class PermissionUtils {
  static permissionLevelCanManage(permissionLevel) {
    return permissionLevel === PermissionLevels.CAN_MANAGE;
  }

  static permissionLevelCanEdit(permissionLevel) {
    return (
      permissionLevel === PermissionLevels.CAN_MANAGE ||
      permissionLevel === PermissionLevels.CAN_MANAGE_PRODUCTION_VERSIONS ||
      permissionLevel === PermissionLevels.CAN_MANAGE_STAGING_VERSIONS ||
      permissionLevel === PermissionLevels.CAN_EDIT
    );
  }

  static permissionLevelCanRead(permissionLevel) {
    return (
      permissionLevel === PermissionLevels.CAN_MANAGE ||
      permissionLevel === PermissionLevels.CAN_MANAGE_PRODUCTION_VERSIONS ||
      permissionLevel === PermissionLevels.CAN_MANAGE_STAGING_VERSIONS ||
      permissionLevel === PermissionLevels.CAN_EDIT ||
      permissionLevel === PermissionLevels.CAN_READ
    );
  }

  static permissionLevelCanTransitionProductionStage(permissionLevel) {
    return (
      permissionLevel === PermissionLevels.CAN_MANAGE ||
      permissionLevel === PermissionLevels.CAN_MANAGE_PRODUCTION_VERSIONS
    );
  }

  static permissionLevelCanTransitionStagingStage(permissionLevel) {
    return (
      permissionLevel === PermissionLevels.CAN_MANAGE ||
      permissionLevel === PermissionLevels.CAN_MANAGE_PRODUCTION_VERSIONS ||
      permissionLevel === PermissionLevels.CAN_MANAGE_STAGING_VERSIONS
    );
  }

  /**
   * Checks whether the permssionLevel can transition to any stage at all.
   */
  static permissionLevelCanTransitionStages(permissionLevel) {
    // Assumes that permission order is CAN_MANAGE_STAGING < CAN_MANAGE_PRODUCTION < CAN_MANAGE
    return (
      permissionLevel === PermissionLevels.CAN_MANAGE ||
      permissionLevel === PermissionLevels.CAN_MANAGE_PRODUCTION_VERSIONS ||
      permissionLevel === PermissionLevels.CAN_MANAGE_STAGING_VERSIONS
    );
  }

  /**
   * Checks whether the permissionLevel can execute a transition from currentStage to toStage
   */
  static permissionLevelCanTransitionToStage(permissionLevel, currentStage, toStage) {
    if (currentStage === toStage) {
      return false;
    }
    if (currentStage === Stages.PRODUCTION || toStage === Stages.PRODUCTION) {
      return this.permissionLevelCanTransitionProductionStage(permissionLevel);
    } else {
      return this.permissionLevelCanTransitionStagingStage(permissionLevel);
    }
  }
}

export default PermissionUtils;
