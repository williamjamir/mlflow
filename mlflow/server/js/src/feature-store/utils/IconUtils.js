import React from 'react';
import { useDesignSystemTheme, QuestionMarkFillIcon } from '@databricks/design-system';
import { RunFailureStates, RunRunningStates, RunSuccessStates } from '../constants';
import loadingSvg from '../../common/static/loading.svg';
import checkCircleSvg from '../../common/static/check_circle.svg';
import errorCircleSvg from '../../common/static/error_circle.svg';
import jobSvg from '../../common/static/jobIcon.svg';
import notebookSvg from '../../common/static/notebookIcon.svg';
import registeredModelGreySvg from '../../common/static/registered-model-grey.svg';
import modelServingEndpointSvg from '../../common/static/model-serving-endpoint.svg';
import warningSvg from '../../common/static/warning.svg';

function QuestionMarkIcon() {
  const { theme } = useDesignSystemTheme();
  return (
    <QuestionMarkFillIcon
      css={{
        ...styles.icon,
        color: theme.colors.textSecondary,
      }}
    />
  );
}
class IconUtils {
  static getJobIcon() {
    return <img css={styles.icon} data-test-id='job-icon' alt='Job Icon' src={jobSvg} />;
  }

  static getNotebookIcon() {
    return (
      <img css={styles.icon} data-test-id='notebook-icon' alt='Notebook Icon' src={notebookSvg} />
    );
  }

  static getRegisteredModelIcon() {
    return (
      <img
        css={styles.icon}
        data-test-id='registered-model-icon'
        alt='MLflow Model Registry Icon'
        src={registeredModelGreySvg}
      />
    );
  }

  static getModelServingEndpointIcon() {
    return (
      <img
        css={styles.icon}
        data-test-id='model-serving-endpoint-icon'
        alt='MLflow Model Serving Endpoint Icon'
        src={modelServingEndpointSvg}
      />
    );
  }

  static getWarningIcon() {
    return (
      <img css={styles.icon} data-test-id='warning-icon' alt='Warning icon' src={warningSvg} />
    );
  }

  static getInfoIcon() {
    return (
      <span>
        <QuestionMarkIcon />
      </span>
    );
  }

  /**
   * Returns an icon depending on job run status.
   */
  static getJobRunStatusIcon(status) {
    if (RunFailureStates.includes(status.toUpperCase())) {
      return (
        <img
          css={styles.icon}
          data-test-id='job-run-error-icon'
          alt='Job run error icon'
          src={errorCircleSvg}
        />
      );
    } else if (RunSuccessStates.includes(status.toUpperCase())) {
      return (
        <img
          css={styles.icon}
          data-test-id='job-run-success-icon'
          alt='Job run success icon'
          src={checkCircleSvg}
        />
      );
    } else if (RunRunningStates.includes(status.toUpperCase())) {
      return (
        <img
          css={styles.icon}
          data-test-id='job-run-loading-icon'
          alt='Job run loading icon'
          src={loadingSvg}
        />
      );
    }
    return <i />;
  }
}

const styles = {
  icon: {
    height: '16px',
    width: '16px',
  },
};

export default IconUtils;
