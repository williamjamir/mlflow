import React from 'react';
import { PropTypes } from 'prop-types';
import TableUtils from '../utils/TableUtils';
import { Table } from 'antd';
import { ClassNames } from '@emotion/react';
import { FormattedMessage } from 'react-intl';
import { CollapsibleSection } from '../../common/components/CollapsibleSection';
import ExpandableList from '../../common/components/ExpandableList';
import { Spacer } from '../../shared/building_blocks/Spacer';
import Utils from '../../common/utils/Utils';
import { getModelPageServingRoute, getModelVersionPageRoute } from '../../model-registry/routes';
import { TrimmedText } from '../../common/components/TrimmedText';
import IconUtils from '../utils/IconUtils';

export class FeatureConsumers extends React.Component {
  static propTypes = {
    feature: PropTypes.shape({}).isRequired,
    notebookConsumers: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    jobConsumers: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    modelVersionsByFeature: PropTypes.shape({}).isRequired,
  };

  // TODO (ML-23165): https://databricks.atlassian.net/browse/ML-23165
  // Extract functions for rendering consumers (from FeatureTableFeatures) into utils file
  renderLinkedModelVersionConsumer(modelVersion) {
    const { name, version } = modelVersion;
    return (
      <Spacer direction='horizontal' size='small'>
        {IconUtils.getRegisteredModelIcon()}
        <a
          href={Utils.getIframeCorrectedRoute(getModelVersionPageRoute(name, version))}
          title={`${name}, v${version}`}
          target='_blank'
          rel='noopener noreferrer'
        >
          <TrimmedText text={name} maxSize={100} className='model-name' />
          {`/${version}`}
        </a>
      </Spacer>
    );
  }

  renderLinkedEndpointConsumer(modelVersion) {
    const { name, version } = modelVersion;
    return (
      <Spacer direction='horizontal' size='small'>
        {IconUtils.getModelServingEndpointIcon()}
        <a
          href={Utils.getIframeCorrectedRoute(getModelPageServingRoute(name))}
          title={`${name}, v${version}`}
          target='_blank'
          rel='noopener noreferrer'
        >
          <TrimmedText text={name} maxSize={100} className='model-name' />
          {`/${version}`}
        </a>
      </Spacer>
    );
  }

  renderLinkedNotebookConsumer(notebookConsumer) {
    const { name, notebook } = notebookConsumer;
    const { notebook_id, revision_id, notebook_workspace_id, notebook_workspace_url } = notebook;
    return TableUtils.renderNotebookCell(
      notebook_id,
      revision_id,
      null,
      name,
      notebook_workspace_url,
      notebook_workspace_id,
    );
  }

  renderLinkedJobConsumer(jobConsumer) {
    const { name, job_run } = jobConsumer;
    const { job_id, run_id, job_workspace_id, job_workspace_url } = job_run;
    return TableUtils.renderJobCell(job_id, run_id, name, job_workspace_url, job_workspace_id);
  }

  getLinkedConsumerCell(consumers, renderLinkedConsumer) {
    if (!consumers || consumers.length === 0) {
      return TableUtils.renderEmptyCellText();
    }
    return (
      <ExpandableList showLines={10}>
        {consumers.map((consumer, index) => (
          <div key={index}>{renderLinkedConsumer(consumer)}</div>
        ))}
      </ExpandableList>
    );
  }

  getFeatureColumns(cssFactory) {
    return [
      {
        title: (
          <FormattedMessage
            defaultMessage={'Models'}
            description={'Title text for the feature model consumers column.'}
          />
        ),
        dataIndex: 'name',
        key: 'model_versions',
        width: '18%',
        render: (name) => {
          return (
            <div data-test-id='feature-models'>
              {this.getLinkedConsumerCell(
                this.props.modelVersionsByFeature[name],
                this.renderLinkedModelVersionConsumer,
              )}
            </div>
          );
        },
      },
      {
        title: (
          <FormattedMessage
            defaultMessage={'Endpoints'}
            description={'Title text for the feature endpoint consumers column.'}
          />
        ),
        dataIndex: 'name',
        key: 'endpoints',
        width: '18%',
        render: (name) => {
          const modelVersions = this.props.modelVersionsByFeature[name] || [];
          const modelVersionsWithServingEnabled = modelVersions.filter(
            (modelVersion) => modelVersion.serving_enabled,
          );
          return (
            <div data-test-id='feature-endpoints'>
              {this.getLinkedConsumerCell(
                modelVersionsWithServingEnabled,
                this.renderLinkedEndpointConsumer,
              )}
            </div>
          );
        },
      },
      {
        title: (
          <FormattedMessage
            defaultMessage={'Jobs'}
            description={'Title text for the feature job consumers column.'}
          />
        ),
        key: 'jobs',
        width: '18%',
        render: ({ name: featureName }) => {
          const consumers = this.props.jobConsumers.filter(({ features }) =>
            features.includes(featureName),
          );
          return (
            <div data-test-id='feature-jobs'>
              {this.getLinkedConsumerCell(consumers, this.renderLinkedJobConsumer)}
            </div>
          );
        },
      },
      {
        title: (
          <FormattedMessage
            defaultMessage={'Notebooks'}
            description={'Title text for the feature notebook consumer column.'}
          />
        ),
        key: 'notebooks',
        width: '18%',
        render: ({ name: featureName }) => {
          const consumers = this.props.notebookConsumers.filter(({ features }) =>
            features.includes(featureName),
          );
          return (
            <div data-test-id='feature-notebooks'>
              {this.getLinkedConsumerCell(consumers, this.renderLinkedNotebookConsumer)}
            </div>
          );
        },
      },
    ];
  }

  render() {
    const { feature } = this.props;
    return (
      <CollapsibleSection
        title={
          <span>
            <FormattedMessage
              defaultMessage={'Consumers'}
              description={'Title text for the feature consumers section in feature page.'}
            />
          </span>
        }
        data-test-id='feature-consumers-section'
      >
        <ClassNames>
          {({ css }) => (
            <Table
              columns={this.getFeatureColumns(css)}
              dataSource={[feature]}
              rowKey='name'
              size='middle'
              pagination={{ hideOnSinglePage: true, size: 'default' }}
              showSorterTooltip={false}
            />
          )}
        </ClassNames>
      </CollapsibleSection>
    );
  }
}
