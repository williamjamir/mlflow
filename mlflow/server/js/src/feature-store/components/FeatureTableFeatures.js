import React from 'react';
import { PropTypes } from 'prop-types';
import { WithDesignSystemThemeHoc } from '@databricks/design-system';
import TableUtils from '../utils/TableUtils';
import { Spacer } from '../../shared/building_blocks/Spacer';
import Utils from '../../common/utils/Utils';
import { getModelPageServingRoute, getModelVersionPageRoute } from '../../model-registry/routes';
import { getFeaturePageRoute } from '../routes';
import { TrimmedText } from '../../common/components/TrimmedText';
import ExpandableList from '../../common/components/ExpandableList';
import { Table } from 'antd';
import IconUtils from '../utils/IconUtils';
import { ClassNames } from '@emotion/react';
import { ComplexDataTypeUtils } from '../utils/ComplexDataTypeUtils';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';

class FeatureTableFeaturesImpl extends React.Component {
  static propTypes = {
    features: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    notebookConsumers: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    jobConsumers: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    modelVersionsByFeature: PropTypes.shape({}).isRequired,
    designSystemThemeApi: PropTypes.any.isRequired,
  };

  // TODO: replace this function with a shared component once we have it
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
      <ExpandableList showLines={1}>
        {consumers.map((consumer, index) => (
          <div key={index}>{renderLinkedConsumer(consumer)}</div>
        ))}
      </ExpandableList>
    );
  }

  getFeatureColumns(cssFactory) {
    const { theme } = this.props.designSystemThemeApi;
    return [
      {
        title: (
          <FormattedMessage
            defaultMessage={'Feature'}
            description={'Title text for the feature name column.'}
          />
        ),
        key: 'name',
        sorter: TableUtils.stringFieldComparator('name'),
        defaultSortOrder: 'ascend',
        width: '18%',
        render: (feature) => {
          return (
            <div data-test-id='feature-link'>
              <Link to={getFeaturePageRoute(feature.table, feature.name)}>{feature.name}</Link>
            </div>
          );
        },
      },
      {
        title: (
          <FormattedMessage
            defaultMessage={'Data Type'}
            description={'Title text for the feature data type column.'}
          />
        ),
        sorter: TableUtils.stringFieldComparator('data_type'),
        key: 'data_type',
        width: '10%',
        render: (feature) => {
          const { data_type, data_type_details } = feature;
          let type = data_type.toUpperCase();
          if (data_type_details) {
            try {
              const parsedDataTypeDetails = JSON.parse(data_type_details);
              type = ComplexDataTypeUtils.parse(parsedDataTypeDetails);
            } catch {
              // parsing error, fallback to data_type
            }
          }
          return (
            <TrimmedText
              text={type}
              maxSize={15}
              className='feature-type'
              data-test-id='feature-type'
              allowShowMore
            />
          );
        },
      },
      {
        title: (
          <FormattedMessage
            defaultMessage={'Consumers'}
            description={'Title text for the feature consumers column.'}
          />
        ),
        className: cssFactory({
          // Adds a solid 1px border to the cell, by default antd has a deeper css selector that
          // forces the cell to not have border, override that here. #e8e8e8 is the default color of
          // all border in antd table
          borderBottom: `1px solid ${theme?.colors?.border} !important`,
        }),
        children: [
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
        ],
      },
    ];
  }

  render() {
    const { features } = this.props;
    return (
      <ClassNames>
        {({ css }) => (
          <Table
            columns={this.getFeatureColumns(css)}
            dataSource={features}
            rowKey='name'
            locale={{
              emptyText: (
                <FormattedMessage
                  defaultMessage={'No features found.'}
                  description={'Text describing no features exists for the feature table.'}
                />
              ),
            }}
            size='middle'
            pagination={{ hideOnSinglePage: true, size: 'default' }}
            showSorterTooltip={false}
          />
        )}
      </ClassNames>
    );
  }
}

export const FeatureTableFeatures = WithDesignSystemThemeHoc(FeatureTableFeaturesImpl);
