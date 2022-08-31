import React from 'react';
import { Tooltip } from 'antd';
import { Spacer } from '../../shared/building_blocks/Spacer';
import IconUtils from './IconUtils';
import Utils from '../../common/utils/Utils';
import { ProducerTypes } from '../constants';
import LinkUtils from './LinkUtils';
import ExpandableList from '../../common/components/ExpandableList';
import { ClassNames } from '@emotion/react';

class TableUtils {
  static stringFieldComparator(field) {
    return (a, b) => a[field].localeCompare(b[field]);
  }

  static getProducerName(producer) {
    if (!producer) {
      return TableUtils.renderEmptyCellText();
    }
    switch (producer.type) {
      case ProducerTypes.JOB:
        return (
          producer.name ||
          Utils.getDefaultJobRunName(producer.job_id, producer.run_id, producer.job_workspace_id)
        );
      case ProducerTypes.NOTEBOOK:
        return (
          producer.name ||
          Utils.getDefaultNotebookRevisionName(
            producer.notebook_id,
            producer.revision_id,
            producer.notebook_workspace_id,
          )
        );
      case ProducerTypes.PIPELINE:
        return producer.name || Utils.getDefaultPipelineUpdateName(producer.pipeline_id);
      default:
        return TableUtils.renderEmptyCellText();
    }
  }

  // TODO(ML-22692): Design a better UI to display data sources.
  static renderDataSources(sources, showLines = 1) {
    if (!sources || sources.length === 0) {
      return null;
    }
    const tableSources = sources
      .filter((dataSource) => !!dataSource.table)
      .map((dataSource, index) => (
        <div key={index}>{LinkUtils.renderTableSourceLink(dataSource.table)}</div>
      ));
    const pathSources = sources
      .filter((dataSource) => !!dataSource.path)
      .map((dataSource, index) => (
        <div key={index}>{LinkUtils.renderPathSource(dataSource.path)}</div>
      ));
    const customSources = sources
      .filter((dataSource) => !!dataSource.custom_source)
      .map((dataSource, index) => (
        <div key={index}>{LinkUtils.renderPathSource(dataSource.custom_source)}</div>
      ));
    const allDataSources = tableSources.concat(pathSources).concat(customSources);
    return <ExpandableList showLines={showLines}>{allDataSources}</ExpandableList>;
  }

  static renderNotebookCell(
    notebook_id,
    revision_id,
    run_uuid,
    name,
    workspace_url,
    workspace_id = null,
  ) {
    return (
      <Spacer direction='horizontal' size='small'>
        {IconUtils.getNotebookIcon()}
        {Utils.renderNotebookSource(
          Utils.addQueryParams(Utils.getQueryParams(), { o: workspace_id }),
          notebook_id,
          revision_id,
          run_uuid,
          name || Utils.getDefaultNotebookRevisionName(notebook_id, revision_id, workspace_id),
          workspace_url,
        )}
      </Spacer>
    );
  }

  static renderJobCell = (job_id, run_id, name, workspace_url, workspace_id = null) => (
    <Spacer direction='horizontal' size='small'>
      {IconUtils.getJobIcon()}
      {Utils.renderJobSource(
        Utils.addQueryParams(Utils.getQueryParams(), { o: workspace_id }),
        job_id,
        run_id,
        name || Utils.getDefaultJobRunName(job_id, run_id, workspace_id),
        workspace_url,
      )}
    </Spacer>
  );

  static renderPipelineCell = (pipeline_id, name, update_id = null) => (
    <Spacer direction='horizontal' size='small'>
      {IconUtils.getJobIcon()}
      {Utils.renderPipelineSource(Utils.getQueryParams(), pipeline_id, name)}
    </Spacer>
  );

  static renderEmptyCellText = () => '-';

  static renderTitleWithIcon = (
    title,
    overlay,
    icon = IconUtils.getInfoIcon(),
    iconPosition = 'right',
  ) => {
    if (iconPosition.toLowerCase() === 'left') {
      return (
        <ClassNames>
          {({ css }) => (
            <Spacer direction='horizontal' size='small'>
              <Tooltip overlayClassName={css(styles.tooltip)} overlay={overlay} placement='top'>
                {icon}
              </Tooltip>
              <div>{title}</div>
            </Spacer>
          )}
        </ClassNames>
      );
    }
    return (
      <ClassNames>
        {({ css }) => (
          <Spacer direction='horizontal' size='small'>
            <div>{title}</div>
            <Tooltip overlayClassName={css(styles.tooltip)} overlay={overlay} placement='top'>
              {icon}
            </Tooltip>
          </Spacer>
        )}
      </ClassNames>
    );
  };
}

const styles = {
  tooltip: {
    maxWidth: '500px',
  },
};

export default TableUtils;
