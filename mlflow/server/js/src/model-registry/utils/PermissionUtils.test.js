import PermissionUtils from './PermissionUtils';
import { Stages, PermissionLevels } from '../constants';

test('permissionLevelCanManage', () => {
  expect(PermissionUtils.permissionLevelCanManage(PermissionLevels.CAN_MANAGE)).toEqual(true);
  expect(
    PermissionUtils.permissionLevelCanManage(PermissionLevels.CAN_MANAGE_PRODUCTION_VERSIONS),
  ).toEqual(false);
  expect(
    PermissionUtils.permissionLevelCanManage(PermissionLevels.CAN_MANAGE_STAGING_VERSIONS),
  ).toEqual(false);
  expect(PermissionUtils.permissionLevelCanManage(PermissionLevels.CAN_EDIT)).toEqual(false);
  expect(PermissionUtils.permissionLevelCanManage(PermissionLevels.CAN_READ)).toEqual(false);
  expect(PermissionUtils.permissionLevelCanManage('RANDOM_STRING')).toEqual(false);
});

test('permissionLevelCanEdit', () => {
  expect(PermissionUtils.permissionLevelCanEdit(PermissionLevels.CAN_MANAGE)).toEqual(true);
  expect(
    PermissionUtils.permissionLevelCanEdit(PermissionLevels.CAN_MANAGE_PRODUCTION_VERSIONS),
  ).toEqual(true);
  expect(
    PermissionUtils.permissionLevelCanEdit(PermissionLevels.CAN_MANAGE_STAGING_VERSIONS),
  ).toEqual(true);
  expect(PermissionUtils.permissionLevelCanEdit(PermissionLevels.CAN_EDIT)).toEqual(true);
  expect(PermissionUtils.permissionLevelCanEdit(PermissionLevels.CAN_READ)).toEqual(false);
  expect(PermissionUtils.permissionLevelCanEdit('RANDOM_STRING')).toEqual(false);
});

test('permissionLevelCanRead', () => {
  expect(PermissionUtils.permissionLevelCanRead(PermissionLevels.CAN_MANAGE)).toEqual(true);
  expect(
    PermissionUtils.permissionLevelCanRead(PermissionLevels.CAN_MANAGE_PRODUCTION_VERSIONS),
  ).toEqual(true);
  expect(
    PermissionUtils.permissionLevelCanRead(PermissionLevels.CAN_MANAGE_STAGING_VERSIONS),
  ).toEqual(true);
  expect(PermissionUtils.permissionLevelCanRead(PermissionLevels.CAN_EDIT)).toEqual(true);
  expect(PermissionUtils.permissionLevelCanRead(PermissionLevels.CAN_READ)).toEqual(true);
  expect(PermissionUtils.permissionLevelCanRead('RANDOM_STRING')).toEqual(false);
});

test('permissionLevelCanTransitionProductionStage', () => {
  expect(
    PermissionUtils.permissionLevelCanTransitionProductionStage(PermissionLevels.CAN_MANAGE),
  ).toEqual(true);
  expect(
    PermissionUtils.permissionLevelCanTransitionProductionStage(
      PermissionLevels.CAN_MANAGE_PRODUCTION_VERSIONS,
    ),
  ).toEqual(true);
  expect(
    PermissionUtils.permissionLevelCanTransitionProductionStage(
      PermissionLevels.CAN_MANAGE_STAGING_VERSIONS,
    ),
  ).toEqual(false);
  expect(
    PermissionUtils.permissionLevelCanTransitionProductionStage(PermissionLevels.CAN_EDIT),
  ).toEqual(false);
  expect(
    PermissionUtils.permissionLevelCanTransitionProductionStage(PermissionLevels.CAN_READ),
  ).toEqual(false);
  expect(PermissionUtils.permissionLevelCanTransitionProductionStage('RANDOM_STRING')).toEqual(
    false,
  );
});

test('permissionLevelCanTransitionStagingStage', () => {
  expect(
    PermissionUtils.permissionLevelCanTransitionStagingStage(PermissionLevels.CAN_MANAGE),
  ).toEqual(true);
  expect(
    PermissionUtils.permissionLevelCanTransitionStagingStage(
      PermissionLevels.CAN_MANAGE_PRODUCTION_VERSIONS,
    ),
  ).toEqual(true);
  expect(
    PermissionUtils.permissionLevelCanTransitionStagingStage(
      PermissionLevels.CAN_MANAGE_STAGING_VERSIONS,
    ),
  ).toEqual(true);
  expect(
    PermissionUtils.permissionLevelCanTransitionStagingStage(PermissionLevels.CAN_EDIT),
  ).toEqual(false);
  expect(
    PermissionUtils.permissionLevelCanTransitionStagingStage(PermissionLevels.CAN_READ),
  ).toEqual(false);
  expect(PermissionUtils.permissionLevelCanTransitionStagingStage('RANDOM_STRING')).toEqual(false);
});

test('permissionLevelCanTransitionStages', () => {
  expect(PermissionUtils.permissionLevelCanTransitionStages(PermissionLevels.CAN_MANAGE)).toEqual(
    true,
  );
  expect(
    PermissionUtils.permissionLevelCanTransitionStages(
      PermissionLevels.CAN_MANAGE_PRODUCTION_VERSIONS,
    ),
  ).toEqual(true);
  expect(
    PermissionUtils.permissionLevelCanTransitionStages(
      PermissionLevels.CAN_MANAGE_STAGING_VERSIONS,
    ),
  ).toEqual(true);
  expect(PermissionUtils.permissionLevelCanTransitionStages(PermissionLevels.CAN_EDIT)).toEqual(
    false,
  );
  expect(PermissionUtils.permissionLevelCanTransitionStages(PermissionLevels.CAN_READ)).toEqual(
    false,
  );
  expect(PermissionUtils.permissionLevelCanTransitionStages('RANDOM_STRING')).toEqual(false);
});

describe('permissionLevelCanTransitionToStage', () => {
  const runTest = (params, permissionLevel) => {
    params.forEach(([currentStage, toStage, expectedResult]) => {
      const result = PermissionUtils.permissionLevelCanTransitionToStage(
        permissionLevel,
        currentStage,
        toStage,
      );
      expect(
        `with ${permissionLevel} transition ${currentStage} -> ${toStage} is ${result}`,
      ).toEqual(
        `with ${permissionLevel} transition ${currentStage} -> ${toStage} is ${expectedResult}`,
      );
    });
  };

  test('with permissionLevel CAN_MANAGE and CAN_MANAGER_PRODUCTION_VERSIONS', () => {
    const params = [
      [Stages.NONE, Stages.NONE, false],
      [Stages.NONE, Stages.STAGING, true],
      [Stages.NONE, Stages.ARCHIVED, true],
      [Stages.NONE, Stages.PRODUCTION, true],

      [Stages.STAGING, Stages.NONE, true],
      [Stages.STAGING, Stages.STAGING, false],
      [Stages.STAGING, Stages.ARCHIVED, true],
      [Stages.STAGING, Stages.PRODUCTION, true],

      [Stages.PRODUCTION, Stages.NONE, true],
      [Stages.PRODUCTION, Stages.STAGING, true],
      [Stages.PRODUCTION, Stages.ARCHIVED, true],
      [Stages.PRODUCTION, Stages.PRODUCTION, false],

      [Stages.ARCHIVED, Stages.NONE, true],
      [Stages.ARCHIVED, Stages.STAGING, true],
      [Stages.ARCHIVED, Stages.ARCHIVED, false],
      [Stages.ARCHIVED, Stages.PRODUCTION, true],
    ];
    runTest(params, PermissionLevels.CAN_MANAGE);
    runTest(params, PermissionLevels.CAN_MANAGE_PRODUCTION_VERSIONS);
  });

  test('with permissionLevel CAN_READ', () => {
    const params = [
      [Stages.NONE, Stages.NONE, false],
      [Stages.NONE, Stages.STAGING, false],
      [Stages.NONE, Stages.ARCHIVED, false],
      [Stages.NONE, Stages.PRODUCTION, false],

      [Stages.STAGING, Stages.NONE, false],
      [Stages.STAGING, Stages.STAGING, false],
      [Stages.STAGING, Stages.ARCHIVED, false],
      [Stages.STAGING, Stages.PRODUCTION, false],

      [Stages.PRODUCTION, Stages.NONE, false],
      [Stages.PRODUCTION, Stages.STAGING, false],
      [Stages.PRODUCTION, Stages.ARCHIVED, false],
      [Stages.PRODUCTION, Stages.PRODUCTION, false],

      [Stages.ARCHIVED, Stages.NONE, false],
      [Stages.ARCHIVED, Stages.STAGING, false],
      [Stages.ARCHIVED, Stages.ARCHIVED, false],
      [Stages.ARCHIVED, Stages.PRODUCTION, false],
    ];
    runTest(params, PermissionLevels.CAN_READ);
  });

  test('with permissionLevel CAN_EDIT', () => {
    const params = [
      [Stages.NONE, Stages.NONE, false],
      [Stages.NONE, Stages.STAGING, false],
      [Stages.NONE, Stages.ARCHIVED, false],
      [Stages.NONE, Stages.PRODUCTION, false],

      [Stages.STAGING, Stages.NONE, false],
      [Stages.STAGING, Stages.STAGING, false],
      [Stages.STAGING, Stages.ARCHIVED, false],
      [Stages.STAGING, Stages.PRODUCTION, false],

      [Stages.PRODUCTION, Stages.NONE, false],
      [Stages.PRODUCTION, Stages.STAGING, false],
      [Stages.PRODUCTION, Stages.ARCHIVED, false],
      [Stages.PRODUCTION, Stages.PRODUCTION, false],

      [Stages.ARCHIVED, Stages.NONE, false],
      [Stages.ARCHIVED, Stages.STAGING, false],
      [Stages.ARCHIVED, Stages.ARCHIVED, false],
      [Stages.ARCHIVED, Stages.PRODUCTION, false],
    ];
    runTest(params, PermissionLevels.CAN_EDIT);
  });

  test('with permissionLevel CAN_MANAGE_STAGING_VERSIONS', () => {
    const params = [
      [Stages.NONE, Stages.NONE, false],
      [Stages.NONE, Stages.STAGING, true],
      [Stages.NONE, Stages.ARCHIVED, true],
      [Stages.NONE, Stages.PRODUCTION, false],

      [Stages.STAGING, Stages.NONE, true],
      [Stages.STAGING, Stages.STAGING, false],
      [Stages.STAGING, Stages.ARCHIVED, true],
      [Stages.STAGING, Stages.PRODUCTION, false],

      [Stages.PRODUCTION, Stages.NONE, false],
      [Stages.PRODUCTION, Stages.STAGING, false],
      [Stages.PRODUCTION, Stages.ARCHIVED, false],
      [Stages.PRODUCTION, Stages.PRODUCTION, false],

      [Stages.ARCHIVED, Stages.NONE, true],
      [Stages.ARCHIVED, Stages.STAGING, true],
      [Stages.ARCHIVED, Stages.ARCHIVED, false],
      [Stages.ARCHIVED, Stages.PRODUCTION, false],
    ];
    runTest(params, PermissionLevels.CAN_MANAGE_STAGING_VERSIONS);
  });
});
