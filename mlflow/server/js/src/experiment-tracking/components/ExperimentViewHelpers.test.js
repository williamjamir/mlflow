import React from 'react';
// BEGIN-EDGE
import { AutoMLExperimentPanel, ArtifactLocation } from './ExperimentViewHelpers';
import Fixtures from '../utils/test-utils/Fixtures';
import DatabricksUtils from '../../common/utils/DatabricksUtils';
import { createIntl } from 'react-intl';
// END-EDGE
import { ExperimentNoteSection } from './ExperimentViewHelpers';
import { shallow } from 'enzyme';
// BEGIN-EDGE
const getDefaultAutoMLTags = () => {
  return {
    startTime: 100,
    timeoutMinutes: 20,
    explorationNotebookId: 'mock-notebook-id',
    state: undefined, // should be overridden
    dataset: 'mock-dataset',
    targetCol: 'mock-target-col',
    evaluationMetric: 'mock-evaluation-metric',
    errorMessage: 'mock-error-message',
    bestTrialNotebookId: 'mock-best-trial-notebook-id',
  };
};

const getAutoMLExperimentPanelMock = (componentProps = {}) => {
  const mergedProps = {
    automlTags: getDefaultAutoMLTags(),
    experiment: Fixtures.createExperiment(),
    ...componentProps,
  };
  return shallow(<AutoMLExperimentPanel {...mergedProps} />);
};

describe('AutoML', () => {
  test('Automl panel appears', () => {
    const wrapper = getAutoMLExperimentPanelMock();
    expect(wrapper.exists('[data-test-id="automl-enabled"]')).toBe(true);
  });
});

const getArtifactLocationMock = (componentProps = {}) => {
  const mergedProps = {
    permissionsLearnMoreLinkUrl: 'mock-url',
    intl: createIntl({ locale: 'en' }),
    experiment: Fixtures.createExperiment(),
    ...componentProps,
  };
  return shallow(<ArtifactLocation {...mergedProps} />);
};

test('Artifact location shows unlocked icon when artifact location is not ACL-d', () => {
  jest.spyOn(DatabricksUtils, 'isArtifactAclsEnabled').mockImplementation(() => true);
  const experiment = Fixtures.createExperiment({ artifact_location: 'dbfs:/my-fun-loc' });
  const wrapper = getArtifactLocationMock({ experiment: experiment });
  // Expect presence of 'unlocked' icon indicating un-ACL'd artifact location
  expect(wrapper.find('.fa-unlock').length).toEqual(1);
});

test('Artifact location does not show unlocked icon when artifact location is ACL-d or outside DBFS', () => {
  jest.spyOn(DatabricksUtils, 'isArtifactAclsEnabled').mockImplementation(() => true);
  ['dbfs:/databricks/mlflow-tracking/0', 's3://my-sweet-bucket'].forEach((artifactLoc) => {
    const experiment = Fixtures.createExperiment({ artifact_location: artifactLoc });
    const wrapper = getArtifactLocationMock({ experiment: experiment });
    expect(wrapper.find('.fa-unlock').length).toEqual(0);
  });
});

test('Artifact location does not show unlocked icon when artifact ACL feature flag is off', () => {
  // Mock disabling artifact ACLs feature flag
  jest.spyOn(DatabricksUtils, 'isArtifactAclsEnabled').mockImplementation(() => false);
  const experiment = Fixtures.createExperiment({ artifact_location: 'dbfs:/my-fun-loc' });
  const wrapper = getArtifactLocationMock({ experiment: experiment });
  // User should not see the 'unlocked' icon
  expect(wrapper.find('.fa-unlock').length).toEqual(0);
});
// END-EDGE

const getDefaultExperimentNoteProps = () => {
  return {
    showNotesEditor: true,
    noteInfo: {
      content: 'mock-content',
    },
    handleCancelEditNote: jest.fn(),
    handleSubmitEditNote: jest.fn(),
    startEditingDescription: jest.fn(),
  };
};

const getExperimentNotebookPanelMock = (componentProps = {}) => {
  const mergedProps = {
    ...getDefaultExperimentNoteProps(),
    ...componentProps,
  };
  return shallow(<ExperimentNoteSection {...mergedProps} />);
};

describe('Experiment Notes', () => {
  test('Notes panel appears', () => {
    const wrapper = getExperimentNotebookPanelMock();
    expect(wrapper.exists('[data-test-id="experiment-notes-section"]')).toBe(true);
  });
});
