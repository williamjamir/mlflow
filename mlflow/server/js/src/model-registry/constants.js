import React from 'react';
import { Tag } from '@databricks/design-system';
// eslint-disable-next-line
import * as overrides from './constant-overrides'; // eslint-disable-line import/no-namespace
import { FormattedMessage } from 'react-intl';
import { ReadyIcon } from './utils';
// BEGIN-EDGE
import { FailedIcon } from './utils';
import { Spinner } from '@databricks/design-system';
// END-EDGE

export const Stages = {
  NONE: 'None',
  STAGING: 'Staging',
  PRODUCTION: 'Production',
  ARCHIVED: 'Archived',
};

export const ACTIVE_STAGES = [Stages.STAGING, Stages.PRODUCTION];

export const StageLabels = {
  [Stages.NONE]: 'None',
  [Stages.STAGING]: 'Staging',
  [Stages.PRODUCTION]: 'Production',
  [Stages.ARCHIVED]: 'Archived',
};

export const StageTagComponents = {
  [Stages.NONE]: <Tag>{StageLabels[Stages.NONE]}</Tag>,
  [Stages.STAGING]: <Tag color='lemon'>{StageLabels[Stages.STAGING]}</Tag>,
  [Stages.PRODUCTION]: <Tag color='lime'>{StageLabels[Stages.PRODUCTION]}</Tag>,
  [Stages.ARCHIVED]: <Tag color='charcoal'>{StageLabels[Stages.ARCHIVED]}</Tag>,
};

export const ActivityTypes = {
  APPLIED_TRANSITION: 'APPLIED_TRANSITION',
  REQUESTED_TRANSITION: 'REQUESTED_TRANSITION',
  SYSTEM_TRANSITION: 'SYSTEM_TRANSITION',
  CANCELLED_REQUEST: 'CANCELLED_REQUEST',
  APPROVED_REQUEST: 'APPROVED_REQUEST',
  REJECTED_REQUEST: 'REJECTED_REQUEST',
  NEW_COMMENT: 'NEW_COMMENT',
};

// BEGIN-EDGE
export const IconByActivityType = {
  [ActivityTypes.REQUESTED_TRANSITION]: (
    <i className='far fa-hand-o-right fa-sm request-icon activity-icon' aria-hidden='true' />
  ),
  [ActivityTypes.APPROVED_REQUEST]: <i className='fas fa-check fa-sm approve-icon activity-icon' />,
  [ActivityTypes.REJECTED_REQUEST]: <i className='fas fa-times fa-sm reject-icon activity-icon' />,
  [ActivityTypes.CANCELLED_REQUEST]: (
    <i className='far fa-trash-o fa-sm cancel-icon activity-icon' />
  ),
  [ActivityTypes.NEW_COMMENT]: <i className='far fa-comment-o comment-icon activity-icon' />,
  [ActivityTypes.APPLIED_TRANSITION]: (
    <i className='fas fa-check fa-sm approve-icon activity-icon' />
  ),
  [ActivityTypes.SYSTEM_TRANSITION]: (
    <i className='fas fa-arrow-right fa-sm arrow-right-icon activity-icon' />
  ),
};

// END-EDGE
export const EMPTY_CELL_PLACEHOLDER = <div style={{ marginTop: -12 }}>_</div>;

export const ModelVersionStatus = {
  READY: 'READY',
  // BEGIN-EDGE
  PENDING_REGISTRATION: 'PENDING_REGISTRATION',
  FAILED_REGISTRATION: 'FAILED_REGISTRATION',
  // END-EDGE
};

export const DefaultModelVersionStatusMessages = {
  [ModelVersionStatus.READY]: (
    <FormattedMessage
      defaultMessage='Ready.'
      description='Default status message for model versions that are ready'
    />
  ),
  // BEGIN-EDGE
  [ModelVersionStatus.PENDING_REGISTRATION]: (
    <FormattedMessage
      defaultMessage='Registration pending...'
      description='Default status message for model versions that are pending registration'
    />
  ),
  [ModelVersionStatus.FAILED_REGISTRATION]: (
    <FormattedMessage
      defaultMessage='Registration failed.'
      description='Default status message for model versions that have failed registration'
    />
  ),
  // END-EDGE
};

export const modelVersionStatusIconTooltips = {
  [ModelVersionStatus.READY]: (
    <FormattedMessage
      defaultMessage='Ready'
      description='Tooltip text for ready model version status icon in model view page'
    />
  ),
  // BEGIN-EDGE
  [ModelVersionStatus.PENDING_REGISTRATION]: (
    <FormattedMessage
      defaultMessage='Registration pending'
      description='Tooltip text for registration pending model version status icon in
         model view page'
    />
  ),
  [ModelVersionStatus.FAILED_REGISTRATION]: (
    <FormattedMessage
      defaultMessage='Registration failed'
      description='Tooltip text for registration failed model version status icon in
         model view page'
    />
  ),
  // END-EDGE
};

export const ModelVersionStatusIcons = {
  [ModelVersionStatus.READY]: <ReadyIcon />,
  // BEGIN-EDGE
  [ModelVersionStatus.PENDING_REGISTRATION]: <Spinner size='small' />,
  [ModelVersionStatus.FAILED_REGISTRATION]: <FailedIcon />,
  // END-EDGE
};

export const MODEL_VERSION_STATUS_POLL_INTERVAL = 10000;

export const REGISTERED_MODELS_PER_PAGE = 10;

// BEGIN-EDGE
export const MAX_RUNS_IN_SEARCH_MODEL_VERSIONS_FILTER = 200;
// END-EDGE
export const oss_MAX_RUNS_IN_SEARCH_MODEL_VERSIONS_FILTER = 75; // request size has a limit of 4KB

export const REGISTERED_MODELS_SEARCH_NAME_FIELD = 'name';

export const REGISTERED_MODELS_SEARCH_TIMESTAMP_FIELD = 'timestamp';

// BEGIN-EDGE
export const REGISTERED_MODELS_SEARCH_SERVING_FIELD = 'serving';

// END-EDGE
export const MODEL_SCHEMA_TENSOR_TYPE = 'tensor';

export const AntdTableSortOrder = {
  ASC: 'ascend',
  DESC: 'descend',
};

// BEGIN-EDGE
export const PermissionLevels = {
  CAN_MANAGE: 'CAN_MANAGE',
  CAN_MANAGE_PRODUCTION_VERSIONS: 'CAN_MANAGE_PRODUCTION_VERSIONS',
  CAN_MANAGE_STAGING_VERSIONS: 'CAN_MANAGE_STAGING_VERSIONS',
  CAN_EDIT: 'CAN_EDIT',
  CAN_READ: 'CAN_READ',
  // only applicable at the registry level, and even less powerful than CAN_READ
  CAN_CREATE_REGISTERED_MODEL: 'CAN_CREATE_REGISTERED_MODEL',
};

export const ActivityActions = {
  CANCEL_TRANSITION_REQUEST: 'CANCEL_TRANSITION_REQUEST',
  APPROVE_TRANSITION_REQUEST: 'APPROVE_TRANSITION_REQUEST',
  REJECT_TRANSITION_REQUEST: 'REJECT_TRANSITION_REQUEST',
  EDIT_COMMENT: 'EDIT_COMMENT',
  DELETE_COMMENT: 'DELETE_COMMENT',
};

export const DEFAULT_OUTPUT_TABLE_DIRECTORY = '/FileStore/batch-inference/';

// END-EDGE
export const MODEL_VERSION_DELETE_MENU_ITEM_DISABLED_TOOLTIP_TEXT = `You cannot delete a model
version in an active stage. To delete this model version, transition it to the 'Archived' stage.`;

export const REGISTERED_MODEL_DELETE_MENU_ITEM_DISABLED_TOOLTIP_TEXT = `You cannot delete a
registered model with versions in active stages ('Staging' or 'Production'). To delete this
registered model, transition versions in active stages to the 'Archived' stage.`;

export const archiveExistingVersionToolTipText = (currentStage) => (
  <FormattedMessage
    defaultMessage='Model versions in the `{currentStage}` stage will be moved to the
       `Archived` stage.'
    description='Tooltip text for transitioning existing model versions in stage to archived
       in the model versions page'
    values={{ currentStage: currentStage }}
  />
);
