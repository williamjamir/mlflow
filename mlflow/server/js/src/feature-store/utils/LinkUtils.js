import React from 'react';
import { FormattedMessage } from 'react-intl';
import Utils from '../../common/utils/Utils';
import DatabricksUtils from '../../common/utils/DatabricksUtils';
import { CloudProvider } from '../../shared/databricks_edge/constants-databricks';
import {
  DatabricksFeatureStoreDeleteTableDocUrl,
  DatabricksFeatureStoreDocUrl,
  DatabricksFeatureStoreScheduleJobDocUrl,
  DatabricksFeatureTableProfilingDocUrl,
} from '../constants';

class LinkUtils {
  /**
   * Renders the table source name and entry point into an HTML element. Used for display.
   */
  static renderTableSourceLink(tableSource) {
    if (tableSource.toLowerCase().startsWith('dbfs:/')) {
      return tableSource;
    } else {
      const tableSourceArr = tableSource.split('.');
      const dbName = tableSourceArr[0];
      const tableName = tableSourceArr[1];

      let url = Utils.setQueryParams(window.location.origin, Utils.getQueryParams());
      const tableSourceName = tableName ? `${dbName}.${tableName}` : dbName;
      url += `#table/${dbName}`;
      if (tableName) {
        url += `/${tableName}`;
      }

      return (
        <a title={tableSourceName} href={url} target='_top'>
          {tableSourceName}
        </a>
      );
    }
  }

  static renderPathSource(pathSource) {
    return pathSource;
  }

  static getCloudProvider() {
    // linked to AWS doc by default when cloud provider is not available
    return DatabricksUtils.getCloudProvider() || CloudProvider.AWS;
  }

  static getLearnMoreLinkUrl() {
    return DatabricksFeatureStoreDocUrl[LinkUtils.getCloudProvider()];
  }

  static getDeleteTableLearnMoreLinkUrl() {
    return DatabricksFeatureStoreDeleteTableDocUrl[LinkUtils.getCloudProvider()];
  }

  static getScheduleJobLearnMoreLinkUrl() {
    return DatabricksFeatureStoreScheduleJobDocUrl[LinkUtils.getCloudProvider()];
  }

  static getFeatureProfilingLearnMoreLinkUrl() {
    return DatabricksFeatureTableProfilingDocUrl[LinkUtils.getCloudProvider()];
  }

  static renderLearnMoreLink(linkUrl) {
    return (
      <FormattedMessage
        defaultMessage={'<link>Learn More</link>'}
        description={
          'Learn more link with cloud specific links to the feature store documentation.'
        }
        values={{
          link: (chunks) => (
            <a target='_blank' href={linkUrl} rel='noreferrer'>
              {chunks}
            </a>
          ),
        }}
      />
    );
  }

  static renderNoScheduleLink() {
    return (
      <FormattedMessage
        defaultMessage={'<link>No schedule</link>'}
        description={
          // eslint-disable-next-line max-len
          'Learn more link with cloud specific links to the feature store scheduled job documentation.'
        }
        values={{
          link: (chunks) => (
            <a target='_blank' href={LinkUtils.getScheduleJobLearnMoreLinkUrl()} rel='noreferrer'>
              {chunks}
            </a>
          ),
        }}
      />
    );
  }
}

export default LinkUtils;
