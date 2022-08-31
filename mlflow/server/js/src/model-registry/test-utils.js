// BEGIN-EDGE
export const mockRegisteredModelDetailed = (
  name,
  latestVersions = [],
  tags = [],
  permissionLevel = 'CAN_EDIT',
  lastUpdatedTimestamp = 1573581360069,
) => {
  return {
    creation_timestamp: 1571344731467,
    last_updated_timestamp: lastUpdatedTimestamp,
    latest_versions: latestVersions,
    name,
    id: 'abcdefghijklmnop12345',
    permission_level: permissionLevel,
    tags,
  };
};

// END-EDGE
export const oss_mockRegisteredModelDetailed = (name, latestVersions = [], tags = []) => {
  return {
    creation_timestamp: 1571344731467,
    last_updated_timestamp: 1573581360069,
    latest_versions: latestVersions,
    name,
    tags,
  };
};

// BEGIN-EDGE
export const mockModelVersionDetailed = (
  name,
  version,
  stage,
  status,
  tags = [],
  open_requests = [],
  permissionLevel = 'CAN_MANAGE',
  run_link = undefined,
  run_id = 'b99a0fc567ae4d32994392c800c0b6ce',
  user_id = 'richard@example.com',
) => {
  return {
    name,
    // Use version-based timestamp to make creation_timestamp differ across model versions
    // and prevent React duplicate key warning.
    creation_timestamp: version,
    last_updated_timestamp: version + 1,
    user_id: user_id,
    current_stage: stage,
    description: '',
    source: 'path/to/model',
    run_id: run_id,
    run_link: run_link,
    status,
    version,
    open_requests,
    permission_level: permissionLevel,
    tags,
  };
};

// END-EDGE
export const oss_mockModelVersionDetailed = (
  name,
  version,
  stage,
  status,
  tags = [],
  run_link = undefined,
  run_id = 'b99a0fc567ae4d32994392c800c0b6ce',
  user_id = 'richard@example.com',
) => {
  return {
    name,
    // Use version-based timestamp to make creation_timestamp differ across model versions
    // and prevent React duplicate key warning.
    creation_timestamp: version.toString(),
    last_updated_timestamp: (version + 1).toString(),
    user_id: user_id,
    current_stage: stage,
    description: '',
    source: 'path/to/model',
    run_id: run_id,
    run_link: run_link,
    status,
    version,
    tags,
  };
};

// BEGIN-EDGE
export const mockTransitionRequest = (
  type,
  toStage,
  availableActions = [],
  timestamp = new Date().getTime(),
) => {
  return {
    timestamp,
    user_id: 'richard@example.com',
    activity_type: type,
    to_stage: toStage,
    available_actions: availableActions,
  };
};

export const mockActivity = (
  type,
  fromStage = undefined,
  toStage = undefined,
  creation_timestamp = new Date().getTime(),
  systemComment = '',
  comment = '',
  available_actions = [],
) => {
  if (fromStage || toStage) {
    return {
      creation_timestamp,
      id: 'some-id',
      user_id: 'richard@example.com',
      activity_type: type,
      from_stage: fromStage,
      to_stage: toStage,
      system_comment: systemComment,
      comment: comment,
      available_actions: available_actions,
    };
  } else {
    return {
      creation_timestamp,
      id: 'some-id',
      user_id: 'richard@example.com',
      activity_type: type,
      system_comment: systemComment,
      comment: comment,
      available_actions: available_actions,
    };
  }
};

// END-EDGE
export const mockGetFieldValue = (comment, archive) => {
  return (key) => {
    if (key === 'comment') {
      return comment;
    } else if (key === 'archiveExistingVersions') {
      return archive;
    }
    throw new Error('Missing mockGetFieldValue key');
  };
};
