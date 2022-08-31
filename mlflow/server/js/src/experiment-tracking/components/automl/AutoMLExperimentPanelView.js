import React from 'react';
import PropTypes from 'prop-types';
import { Steps, Tag } from 'antd';
import { FormattedMessage } from 'react-intl';
import {
  Tabs,
  Typography,
  useDesignSystemTheme,
  CheckCircleBorderIcon,
  MinusCircleBorderIcon,
  LoadingIcon,
} from '@databricks/design-system';

import { Countdown } from './Countdown';
import { AutoMLWarningDashboard } from './AutoMLWarningDashboard';
import { Button } from '@databricks/design-system';
import openInNewSvg from '../../../common/static/open-in-new.svg';
import { LoadForecastPredictionTableView } from './AutoMLExampleView';

const { Step } = Steps;
const { TabPane } = Tabs;
const { Text } = Typography;

const OpenInNewSvg = () => (
  <img alt='' title='Open in new' src={openInNewSvg} height={24} width={24} />
);

// eslint-disable-next-line complexity
export function AutoMLExperimentPanelView({
  automlExperimentData,
  automlWarnings,
  cancelJobRun,
  jobLink,
}) {
  const { theme } = useDesignSystemTheme();
  const finishTime =
    automlExperimentData.startTimeSeconds &&
    automlExperimentData.timeoutMinutes &&
    (parseInt(automlExperimentData.startTimeSeconds, 10) +
      parseInt(automlExperimentData.timeoutMinutes, 10) * 60) *
      1000;
  const countdown = finishTime ? <Countdown finishTime={finishTime} /> : null;

  const numberOfWarnings = automlWarnings ? automlWarnings.length : 0;

  const explorationNotebookUrl = `${window.location.origin}#notebook/${parseInt(
    automlExperimentData.explorationNotebookId,
    10,
  )}`;

  const stepParams = {
    title: {
      configure: (
        <FormattedMessage defaultMessage='Configure' description='AutoML Step title configure' />
      ),
      train: <FormattedMessage defaultMessage='Train' description='AutoML Step title train' />,
      evaluate: (
        <FormattedMessage defaultMessage='Evaluate' description='AutoML Step title evaluate' />
      ),
    },

    subTitle: {
      pendingTrain: (
        <FormattedMessage
          defaultMessage='Starting AutoML...'
          description='AutoML Step subtitle pending training'
        />
      ),
      runningTrain: countdown,
    },

    description: {
      pendingTrain: (
        <FormattedMessage
          defaultMessage='We’re getting things ready for training'
          description='AutoML Step description pending training'
        />
      ),
      canceledTrain: (
        <FormattedMessage
          defaultMessage='Canceled'
          description='AutoML Step description canceled training'
        />
      ),
    },
  };

  const trainStep = {
    PENDING: (
      <Step
        title={stepParams.title.train}
        status='process'
        icon={<LoadingIcon spin />}
        subTitle={stepParams.subTitle.pendingTrain}
        description={stepParams.description.pendingTrain}
        data-test-id='train-step'
      />
    ),
    RUNNING: (
      <Step
        title={stepParams.title.train}
        status='process'
        icon={<LoadingIcon spin />}
        subTitle={stepParams.subTitle.runningTrain}
        data-test-id='train-step'
      />
    ),
    SUCCESS: <Step title={stepParams.title.train} status='finish' data-test-id='train-step' />,
    FAILED: <Step title={stepParams.title.train} status='error' data-test-id='train-step' />,
    CANCELED: (
      <Step
        title={stepParams.title.train}
        status='error'
        description={stepParams.description.canceledTrain}
        data-test-id='train-step'
      />
    ),
  };

  const cancelButton = cancelJobRun && (
    <Button
      type='danger'
      css={styles.button}
      onClick={cancelJobRun}
      size='large'
      data-test-id='cancel-button'
    >
      <FormattedMessage
        defaultMessage='Stop experiment'
        description='Button to stop an AutoML run'
      />
    </Button>
  );

  const dataExplorationButton = (
    <Button
      type='default'
      href={explorationNotebookUrl}
      target='_blank'
      css={styles.button}
      disabled={!automlExperimentData.explorationNotebookId}
      size='large'
      data-test-id='data-exploration-button'
    >
      <OpenInNewSvg />
      <FormattedMessage
        defaultMessage='View data exploration notebook'
        description='Button to navigate to the data exploration notebook'
      />
    </Button>
  );

  const bestNotebookButton = (
    <Button
      type='default'
      href={`${window.location.origin}#notebook/${parseInt(
        automlExperimentData.bestTrialNotebookId,
        10,
      )}`}
      target='_blank'
      css={styles.button}
      disabled={!automlExperimentData.bestTrialNotebookId}
      size='large'
      data-test-id='model-edit-button'
    >
      <OpenInNewSvg />
      <FormattedMessage
        defaultMessage='View notebook for best model'
        description='Button to navigate to the notebook with the best AutoML trial'
      />
    </Button>
  );

  const samplingInfo = (
    <FormattedMessage
      // eslint-disable-next-line max-len
      defaultMessage="The dataset was sampled to {samplePercentage}% with {sampleType} sampling using pyspark's <code>{sampleMethod}</code> method"
      description='Indicate sampling method details'
      values={{
        samplePercentage: (automlExperimentData.sampleFraction * 100).toPrecision(3),
        sampleType:
          automlExperimentData.problemType === 'CLASSIFICATION' ? 'stratified' : 'simple random',
        sampleMethod: automlExperimentData.problemType === 'CLASSIFICATION' ? 'sampleBy' : 'sample',
        code: (chunks) => <code>{chunks}</code>,
      }}
    />
  );

  const sampleWarning = automlExperimentData.sampleFraction && (
    <div css={styles.sampleWarning}>
      <Tag key='warning' color='orange' data-test-id='sample-warning-badge'>
        <FormattedMessage
          defaultMessage='Warning'
          description='Tag text for dataset sampling warning'
        />
      </Tag>
      {automlExperimentData.state === 'RUNNING' && (
        <span data-test-id='sample-warning-state-running'>
          <FormattedMessage
            // eslint-disable-next-line max-len
            defaultMessage='AutoML is running data exploration and trials on a sample of the original dataset.'
            description='Text for dataset sampled when running'
          />{' '}
          {samplingInfo}
        </span>
      )}
      {['FAILED', 'CANCELED', 'SUCCESS'].includes(automlExperimentData.state) &&
        automlExperimentData.explorationNotebookId && (
          <span data-test-id='sample-warning-after-exploration'>
            <FormattedMessage
              // eslint-disable-next-line max-len
              defaultMessage='AutoML ran data exploration and trials on a sample of the original dataset.'
              description='Text for dataset sampled before exploration'
            />{' '}
            {samplingInfo}
          </span>
        )}
      {['FAILED', 'CANCELED', 'SUCCESS'].includes(automlExperimentData.state) &&
        !automlExperimentData.explorationNotebookId && (
          <span data-test-id='sample-warning-before-exploration'>
            <FormattedMessage
              // eslint-disable-next-line max-len
              defaultMessage='AutoML tried to run data exploration and trials on a sample of the original dataset.'
              description='Text for dataset sampled after exploration'
            />{' '}
            {samplingInfo}
          </span>
        )}
    </div>
  );

  return (
    <React.Fragment>
      <Steps size='small'>
        <Step title={stepParams.title.configure} status='finish' />
        {trainStep[automlExperimentData.state]}
        <Step
          title={stepParams.title.evaluate}
          status={automlExperimentData.state === 'SUCCESS' ? 'process' : 'wait'}
          data-test-id='evaluate-step'
        />
      </Steps>
      <Tabs defaultActiveKey='1'>
        <TabPane
          tab={
            <FormattedMessage
              defaultMessage='Overview'
              description='Tab title for AutoML status overview'
            />
          }
          key='1'
        >
          {automlExperimentData.state === 'RUNNING' && (
            <React.Fragment>
              <div css={styles.container} data-test-id='automl-running-text'>
                <Text strong>
                  <FormattedMessage
                    defaultMessage='AutoML is training the model'
                    description='Title text about AutoML running'
                  />
                </Text>
                <br />
                <FormattedMessage
                  // eslint-disable-next-line max-len
                  defaultMessage='Databricks AutoML will train models targeting "{targetCol}"{timeoutMinutes}. {cancelJobRun} As runs complete, models with the best {evaluationMetric} will populate at the top of the runs table.'
                  description='Info text about AutoML running'
                  values={{
                    targetCol: automlExperimentData.targetCol,
                    timeoutMinutes: automlExperimentData.timeoutMinutes ? (
                      <>
                        <FormattedMessage
                          defaultMessage=' for {numMinutes} minutes'
                          description='Time limit for AutoML experiment'
                          values={{ numMinutes: automlExperimentData.timeoutMinutes }}
                        />
                      </>
                    ) : (
                      ''
                    ),
                    cancelJobRun: cancelJobRun ? (
                      <>
                        <FormattedMessage
                          // eslint-disable-next-line max-len
                          defaultMessage='If the experiment is taking too long, you can stop the experiment.'
                          description='Info text about canceling AutoML'
                        />{' '}
                      </>
                    ) : (
                      ' '
                    ),
                    evaluationMetric: automlExperimentData.evaluationMetric,
                  }}
                />
                {sampleWarning}
              </div>
              <div css={styles.container}>
                {cancelButton}
                {dataExplorationButton}
              </div>
            </React.Fragment>
          )}
          {automlExperimentData.state === 'FAILED' && (
            <React.Fragment>
              <div css={styles.container} data-test-id='automl-failed-text'>
                <Text strong>
                  <FormattedMessage
                    defaultMessage='Model training failed'
                    description='Title text about AutoML failed'
                  />
                </Text>
                <br />
                {jobLink && (
                  <>
                    <FormattedMessage
                      defaultMessage='For more information, visit the <link>AutoML job run.</link>'
                      // eslint-disable-next-line max-len
                      description='Info text about AutoML failed with details about finding more information'
                      values={{
                        link: (text) => (
                          <a href={jobLink} target='_blank' rel='noopener noreferrer'>
                            {text}
                          </a>
                        ),
                      }}
                    />
                    <br />
                  </>
                )}
                {automlExperimentData.jobRunErrorMessage}
                {sampleWarning}
              </div>
              <div css={styles.container}>{dataExplorationButton}</div>
            </React.Fragment>
          )}
          {['SUCCESS'].includes(automlExperimentData.state) && (
            <React.Fragment>
              <div css={styles.container} data-test-id='evaluation-details-text'>
                <Text strong>
                  <FormattedMessage
                    defaultMessage='AutoML Evaluation'
                    description='Title to indicate AutoML evaluation is complete'
                  />
                </Text>{' '}
                <span css={{ color: theme.colors.textValidationSuccess }}>
                  <CheckCircleBorderIcon />{' '}
                  <FormattedMessage
                    defaultMessage='complete'
                    description='Icon text to indicate AutoML evaluation is complete'
                  />
                </span>
                <br />
                <FormattedMessage
                  // eslint-disable-next-line max-len
                  defaultMessage='All runs have completed, and have been added to the table below. Click a specific run to view details or review the <link>data exploration notebook.</link>'
                  // eslint-disable-next-line max-len
                  description='Info text about AutoML evaluation completion and instructions for next steps'
                  values={{
                    link: (text) => (
                      <a href={explorationNotebookUrl} target='_blank' rel='noopener noreferrer'>
                        {text}
                      </a>
                    ),
                  }}
                />
                {sampleWarning}
                {automlExperimentData.outputTableName && (
                  <LoadForecastPredictionTableView
                    dataPath={automlExperimentData.outputTableName}
                  />
                )}
              </div>
              <div css={styles.container} data-test-id='best-model-text'>
                <Text strong>
                  <FormattedMessage
                    defaultMessage='Model with best {evaluationMetric}'
                    description='Title to indicate the best AutoML model'
                    values={{ evaluationMetric: automlExperimentData.evaluationMetric }}
                  />
                </Text>
                <br />
                <FormattedMessage
                  // eslint-disable-next-line max-len
                  defaultMessage='The model is ready to be registered and deployed. Or, access the source code for the model training to make modifications by clicking a notebook under the Source column in the table below.'
                  // eslint-disable-next-line max-len
                  description='Info text about how to register and deploy a trained model or edit a model'
                />
              </div>
              <div css={styles.container}>
                {bestNotebookButton}
                {dataExplorationButton}
              </div>
            </React.Fragment>
          )}
          {['CANCELED'].includes(automlExperimentData.state) && (
            <React.Fragment>
              <div css={styles.container} data-test-id='cancel-details-text'>
                <Text strong>
                  <FormattedMessage
                    defaultMessage='AutoML Canceled'
                    description='Title to indicate AutoML is canceled'
                  />
                </Text>{' '}
                <span css={{ color: theme.colors.textValidationWarning }}>
                  <MinusCircleBorderIcon />
                </span>
                <br />
                <FormattedMessage
                  // eslint-disable-next-line max-len
                  defaultMessage='AutoML run canceled. The data exploration notebook and some trials may be complete. See links below for more details.'
                  // eslint-disable-next-line max-len
                  description='Info text about AutoML is canceled and instructions for next steps'
                />
                {sampleWarning}
                {automlExperimentData.outputTableName && (
                  <LoadForecastPredictionTableView
                    dataPath={automlExperimentData.outputTableName}
                  />
                )}
              </div>
              <div css={styles.container}>
                {bestNotebookButton}
                {dataExplorationButton}
              </div>
            </React.Fragment>
          )}
        </TabPane>
        <TabPane
          tab={
            <>
              <FormattedMessage
                defaultMessage='Warnings'
                description='Tab header for AutoML Warnings dashboard'
              />
              {` (${numberOfWarnings})`}
            </>
          }
          disabled={!numberOfWarnings}
          key='2'
          data-test-id='warnings-tab-pane'
        >
          <AutoMLWarningDashboard
            warnings={automlWarnings}
            dataExplorationButton={dataExplorationButton}
            explorationNotebookUrl={explorationNotebookUrl}
          />
        </TabPane>
      </Tabs>
    </React.Fragment>
  );
}

AutoMLExperimentPanelView.propTypes = {
  automlExperimentData: PropTypes.object.isRequired,
  automlWarnings: PropTypes.array,
  cancelJobRun: PropTypes.func,
  jobLink: PropTypes.string,
};

const styles = {
  container: {
    marginTop: 20,
  },
  button: {
    marginRight: 4,
  },
  sampleWarning: {
    marginTop: 8,
  },
};
