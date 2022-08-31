import React from 'react';
import { Link } from 'react-router-dom';
import { PropTypes } from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Descriptions } from 'antd';
import Utils from '../../common/utils/Utils';
import TableUtils from '../utils/TableUtils';
import PermissionUtils from '../utils/PermissionUtils';
import { FeatureStoreRoutes, getTableDetailPageRoute } from '../routes';
import { PageHeader } from '../../shared/building_blocks/PageHeader';
import { Spacer } from '../../shared/building_blocks/Spacer';
import { CollapsibleSection } from '../../common/components/CollapsibleSection';
import { EditableNote } from '../../common/components/EditableNote';
import { FeatureConsumers } from './FeatureConsumers';
import { Button, WithDesignSystemThemeHoc } from '@databricks/design-system';
import { EditableTagsTableView } from '../../common/components/EditableTagsTableView';

export class FeatureViewImpl extends React.Component {
  static propTypes = {
    featureTableName: PropTypes.string.isRequired,
    featureName: PropTypes.string.isRequired,
    featureTable: PropTypes.shape({}).isRequired,
    feature: PropTypes.shape({}).isRequired,
    notebookConsumers: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    jobConsumers: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    modelVersionsByFeature: PropTypes.shape({}).isRequired,
    featureTags: PropTypes.shape({}).isRequired,
    handleEditDescription: PropTypes.func.isRequired,
    handleSetFeatureTags: PropTypes.func.isRequired,
    handleDeleteFeatureTags: PropTypes.func.isRequired,
    designSystemThemeApi: PropTypes.any.isRequired,
  };

  state = {
    showDescriptionEditor: false,
    isSetTagsForFeatureRequestPending: false,
  };

  formRef = React.createRef();

  startEditingDescription = (e) => {
    e.stopPropagation();
    this.setState({ showDescriptionEditor: true });
  };

  handleSubmitEditDescription = (description) => {
    return this.props.handleEditDescription(description).then(() => {
      this.setState({ showDescriptionEditor: false });
    });
  };

  handleCancelEditDescription = () => {
    this.setState({ showDescriptionEditor: false });
  };

  handleAddFeatureTag = (values) => {
    const form = this.formRef.current;
    this.setState({ isSetTagsForFeatureRequestPending: true });
    this.props
      .handleSetFeatureTags([{ key: values.name, value: values.value }])
      .then(() => {
        this.setState({ isSetTagsForFeatureRequestPending: false });
        form.resetFields();
      })
      .catch((ex) => {
        this.setState({ isSetTagsForFeatureRequestPending: false });
        Utils.logErrorAndNotifyUser('Failed to add tag. Error: ' + ex.getUserVisibleError());
      });
  };

  handleSaveEditFeatureTag = ({ name, value }) => {
    return this.props.handleSetFeatureTags([{ key: name, value: value }]).catch((ex) => {
      Utils.logErrorAndNotifyUser('Failed to set tag. Error: ' + ex.getUserVisibleError());
    });
  };

  handleDeleteFeatureTag = ({ name }) => {
    return this.props.handleDeleteFeatureTags([name]).catch((ex) => {
      Utils.logErrorAndNotifyUser('Failed to delete tag. Error: ' + ex.getUserVisibleError());
    });
  };

  render() {
    const {
      featureTableName,
      featureTable,
      featureName,
      feature,
      jobConsumers,
      notebookConsumers,
      modelVersionsByFeature,
      featureTags,
    } = this.props;
    const { showDescriptionEditor, isSetTagsForFeatureRequestPending } = this.state;

    const breadcrumbs = [
      <FormattedMessage
        defaultMessage={'<link>Feature Store</link>'}
        description={
          'Text link on the breadcrumbs section that links to the feature store home page.'
        }
        values={{ link: (chunks) => <Link to={FeatureStoreRoutes.BASE}>{chunks}</Link> }}
      />,
      <Link to={getTableDetailPageRoute(featureTableName)}>{featureTableName}</Link>,
      featureName,
    ];

    return (
      <>
        <PageHeader
          title={'Feature: ' + featureName}
          breadcrumbs={breadcrumbs}
          feedbackForm={'https://databricks.sjc1.qualtrics.com/jfe/form/SV_cux5mX6egOMfJ8G'}
        />
        <Spacer size={3} direction='vertical'>
          <div
            css={{
              ...styles.container,
              borderBottom: `1px solid ${this.props.designSystemThemeApi.theme.colors.border}`,
            }}
          >
            <div css={styles.metadataCol}>
              <Descriptions column={{ md: 2, sm: 1 }}>
                <Descriptions.Item
                  label={
                    // Reported during ESLint upgrade
                    // eslint-disable-next-line react/prop-types
                    featureTable.is_imported ? (
                      <FormattedMessage
                        defaultMessage={'Imported'}
                        description={'Title text for the feature page imported timestamp field.'}
                      />
                    ) : (
                      <FormattedMessage
                        defaultMessage={'Created'}
                        description={'Title text for the feature page created timestamp field.'}
                      />
                    )
                  }
                  css={styles.descriptionItemWrapper}
                >
                  {/* Reported during ESLint upgrade */}
                  {/* eslint-disable-next-line react/prop-types */}
                  {Utils.formatTimestamp(feature.creation_timestamp)}
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <span>
                      {TableUtils.renderTitleWithIcon(
                        <FormattedMessage
                          defaultMessage={'Last modified'}
                          description={
                            'Title text for the feature page last modified metadata field.'
                          }
                        />,
                        <FormattedMessage
                          defaultMessage={'Last time the metadata of this feature was updated.'}
                          description={
                            // eslint-disable-next-line max-len
                            'Text on the tooltip describing the definition of last modified timestamp field.'
                          }
                        />,
                      )}
                    </span>
                  }
                  css={styles.descriptionItemWrapper}
                >
                  {/* Reported during ESLint upgrade */}
                  {/* eslint-disable-next-line react/prop-types */}
                  {Utils.formatTimestamp(feature.last_updated_timestamp)}
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    // Reported during ESLint upgrade
                    // eslint-disable-next-line react/prop-types
                    featureTable.is_imported ? (
                      <FormattedMessage
                        defaultMessage={'Imported by'}
                        description={'Title text for the feature page imported by field.'}
                      />
                    ) : (
                      <FormattedMessage
                        defaultMessage={'Created by'}
                        description={'Title text for the feature page created by field.'}
                      />
                    )
                  }
                  css={styles.descriptionItemWrapper}
                >
                  {/* Reported during ESLint upgrade */}
                  {/* eslint-disable-next-line react/prop-types */}
                  {feature.creator_id}
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <FormattedMessage
                      defaultMessage={'Last modified by'}
                      description={
                        'Title text for the feature page last modified by metadata field.'
                      }
                    />
                  }
                  css={styles.descriptionItemWrapper}
                >
                  {/* Reported during ESLint upgrade */}
                  {/* eslint-disable-next-line react/prop-types */}
                  {feature.last_update_user_id}
                </Descriptions.Item>
              </Descriptions>
            </div>
          </div>
          <CollapsibleSection
            title={
              <Spacer size='small' direction='horizontal'>
                <span>
                  <FormattedMessage
                    defaultMessage={'Description'}
                    description={'Title text for the feature page description section field.'}
                  />
                </span>
                {!showDescriptionEditor &&
                  // Reported during ESLint upgrade
                  // eslint-disable-next-line react/prop-types
                  PermissionUtils.hasEditPermission(featureTable.permission_level) && (
                    <Button
                      data-test-id='edit-icon-button'
                      type='link'
                      onClick={this.startEditingDescription}
                    >
                      <FormattedMessage
                        defaultMessage='Edit'
                        description={
                          // eslint-disable-next-line max-len
                          'Text for the edit button next to the description section title on the feature view page.'
                        }
                      />
                    </Button>
                  )}
              </Spacer>
            }
            forceOpen={showDescriptionEditor}
            data-test-id='feature-page-description-section'
          >
            <EditableNote
              // Reported during ESLint upgrade
              // eslint-disable-next-line react/prop-types
              defaultMarkdown={feature.description}
              onSubmit={this.handleSubmitEditDescription}
              onCancel={this.handleCancelEditDescription}
              showEditor={showDescriptionEditor}
            />
          </CollapsibleSection>
          <CollapsibleSection
            title={
              <span>
                <FormattedMessage
                  defaultMessage={'Tags ({length})'}
                  description={'Title text for the feature page tags section.'}
                  values={{ length: Object.values(featureTags).length }}
                />
              </span>
            }
            data-test-id='feature-page-tags-section'
          >
            <EditableTagsTableView
              innerRef={this.formRef}
              handleAddTag={this.handleAddFeatureTag}
              handleDeleteTag={this.handleDeleteFeatureTag}
              handleSaveEdit={this.handleSaveEditFeatureTag}
              tags={featureTags}
              isRequestPending={isSetTagsForFeatureRequestPending}
            />
          </CollapsibleSection>
          <FeatureConsumers
            feature={feature}
            jobConsumers={jobConsumers}
            notebookConsumers={notebookConsumers}
            modelVersionsByFeature={modelVersionsByFeature}
          />
        </Spacer>
      </>
    );
  }
}

const styles = {
  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  metadataCol: {
    flex: '3 3 480px',
  },
  descriptionItemWrapper: {
    verticalAlign: 'top',
    'span.ant-descriptions-item-label, span.ant-descriptions-item-content': {
      verticalAlign: 'top',
    },
    overflowWrap: 'anywhere',
  },
  deletionModalText: {
    padding: '0px 8px',
  },
  tableCellTextWrapper: {
    overflowWrap: 'anywhere',
  },
};

export const FeatureView = WithDesignSystemThemeHoc(FeatureViewImpl);
