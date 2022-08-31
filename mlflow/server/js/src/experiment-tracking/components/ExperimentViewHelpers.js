import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
// eslint-disable-next-line no-unused-vars
import { Descriptions } from 'antd';
import { Button } from '@databricks/design-system';

import './ExperimentView.css';
import { CollapsibleSection } from '../../common/components/CollapsibleSection';
import { EditableNote } from '../../common/components/EditableNote';
import { Experiment } from '../sdk/MlflowMessages';
// BEGIN-EDGE
import DatabricksUtils from '../../common/utils/DatabricksUtils';
import { AutoMLExperimentPanelPage } from './automl/AutoMLExperimentPanelPage';
import { spacingSmall } from '../../common/styles/styleConstants';
import { Popover } from '@databricks/design-system';

export function AutoMLExperimentPanel(props) {
  const { automlExperimentData, automlWarnings, experiment } = props;

  return (
    <div className='ExperimentView-info'>
      <CollapsibleSection title='AutoML' data-test-id='experiment-automl-section'>
        <AutoMLExperimentPanelPage
          data-test-id='automl-enabled'
          experimentId={experiment.experiment_id}
          automlExperimentData={automlExperimentData}
          automlWarnings={automlWarnings}
        />
      </CollapsibleSection>
    </div>
  );
}

AutoMLExperimentPanel.propTypes = {
  automlExperimentData: PropTypes.object,
  automlWarnings: PropTypes.array,
  experiment: PropTypes.instanceOf(Experiment).isRequired,
};

export class ArtifactLocation extends Component {
  static propTypes = {
    experiment: PropTypes.instanceOf(Experiment).isRequired,
    intl: PropTypes.shape({ formatMessage: PropTypes.func.isRequired }).isRequired,
    permissionsLearnMoreLinkUrl: PropTypes.string,
  };
  render() {
    const { artifact_location } = this.props.experiment;
    if (DatabricksUtils.isArtifactAclsEnabled()) {
      const isPublicArtifactLoc =
        artifact_location &&
        artifact_location.startsWith('dbfs:/') &&
        !artifact_location.startsWith('dbfs:/databricks/mlflow-tracking');
      if (isPublicArtifactLoc) {
        return renderPublicArtifactLocationInfo(this.props, artifact_location);
      }
    }
    // If artifact ACLs disabled, artifact location is outside DBFS, or
    // location is ACL'd, fall back to default logic for rendering artifact location
    return <oss_ArtifactLocation {...this.props} />;
  }
}

function renderPublicArtifactLocationInfo(props, artifactLocation) {
  const learnMoreLink = (
    <FormattedMessage
      defaultMessage='<link>Learn more</link>'
      description='Popover link to learn more about the artifact root location'
      values={{
        link: (chunks) => (
          <a href={props.permissionsLearnMoreLinkUrl} target='_blank' rel='noopener noreferrer'>
            {chunks}
          </a>
        ),
      }}
    />
  );
  const openArtifactRootContents = (
    <div>
      <FormattedMessage
        defaultMessage='This artifact root location is open to all users of the workspace'
        description='Popover text to explain more about the artifact location'
      />
      <br />
      {learnMoreLink}
    </div>
  );
  const label = props.intl.formatMessage({
    defaultMessage: 'Artifact Location',
    description: 'Label for the popover explaining access level for the artifact',
  });
  return (
    <Descriptions.Item label={label}>
      {artifactLocation}
      <Popover
        overlayClassName='artifact-location-public-tooltip'
        content={openArtifactRootContents}
        placement='bottom'
      >
        <span style={{ paddingLeft: spacingSmall }}>
          <i className='fa fa-unlock' style={{ fontSize: 13 }} />
        </span>
      </Popover>
    </Descriptions.Item>
  );
}

renderPublicArtifactLocationInfo.propTypes = {
  intl: PropTypes.shape({ formatMessage: PropTypes.func.isRequired }).isRequired,
  permissionsLearnMoreLinkUrl: PropTypes.string.isRequired,
};

// END-EDGE

export function ExperimentNoteSection(props) {
  const {
    handleCancelEditNote,
    handleSubmitEditNote,
    startEditingDescription,
    noteInfo,
    showNotesEditor,
  } = props;
  const content = noteInfo && noteInfo.content;

  return (
    <CollapsibleSection
      title={
        <span className='ExperimentView-editDescriptionHeader'>
          <FormattedMessage
            defaultMessage='Description'
            description='Header for displaying notes for the experiment table'
          />
          {!showNotesEditor && (
            <>
              {' '}
              <Button type='link' onClick={startEditingDescription}>
                <FormattedMessage
                  defaultMessage='Edit'
                  // eslint-disable-next-line max-len
                  description='Text for the edit button next to the description section title on the experiment view page'
                />
              </Button>
            </>
          )}
        </span>
      }
      forceOpen={showNotesEditor}
      defaultCollapsed={!content}
      data-test-id='experiment-notes-section'
    >
      <EditableNote
        defaultMarkdown={content}
        onSubmit={handleSubmitEditNote}
        onCancel={handleCancelEditNote}
        showEditor={showNotesEditor}
      />
    </CollapsibleSection>
  );
}

ExperimentNoteSection.propTypes = {
  startEditingDescription: PropTypes.func.isRequired,
  handleSubmitEditNote: PropTypes.func.isRequired,
  handleCancelEditNote: PropTypes.func.isRequired,
  showNotesEditor: PropTypes.bool,
  noteInfo: PropTypes.object,
};
export class oss_ArtifactLocation extends Component {
  static propTypes = {
    experiment: PropTypes.instanceOf(Experiment).isRequired,
    intl: PropTypes.shape({ formatMessage: PropTypes.func.isRequired }).isRequired,
    permissionsLearnMoreLinkUrl: PropTypes.string,
  };
  render() {
    const { artifact_location } = this.props.experiment;
    const label = this.props.intl.formatMessage({
      defaultMessage: 'Artifact Location',
      description: 'Label for displaying the experiment artifact location',
    });
    return <Descriptions.Item label={label}>{artifact_location}</Descriptions.Item>;
  }
}
