import React from 'react';
import Utils from '../../../../../../common/utils/Utils';
import { RunRowVersionInfo } from '../ExperimentViewRuns.types';

export const VersionCellRenderer = React.memo(
  ({
    value: {
      // Run row version object parameters
      // BEGIN-EDGE
      databricksRepoGitContext,
      // END-EDGE
      version,
      name,
      type,
    },
  }: {
    value: RunRowVersionInfo;
  }) =>
    Utils.renderSourceVersion(
      // Using function from utils to render the source link
      // BEGIN-EDGE
      databricksRepoGitContext,
      // END-EDGE
      version,
      name,
      type,
    ) || <>-</>,
);
