import yaml from 'js-yaml';
import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { Popover } from 'antd';
import { Button } from '@databricks/design-system';
import { setInputExampleForModelVersion, setInputExampleTypeForModelVersion } from '../actions';
import { ErrorWrapper } from '../../common/utils/ErrorWrapper';
import { getModelVersionArtifactUriApi, getDbfsFileApi } from '../../model-registry/actions';
import { getServingModelKey, VersionDataType, ENDPOINT_VERSIONS } from '../utils';

const mapStateToProps = (state, ownProps) => {
  const { modelName, version, servingVersion } = ownProps;
  const servingModelKey = getServingModelKey(null, modelName);
  const versions = state.entities.inputExampleByModelVersion[servingModelKey] || {};
  return {
    modelName: modelName,
    version: version,
    servingVersion: servingVersion,
    inputExample: versions[version],
  };
};

const mapDispatchToProps = {
  getModelVersionArtifactUriApi,
  getDbfsFileApi,
  setInputExampleForModelVersion,
  setInputExampleTypeForModelVersion,
};

/*
 * ShowExampleButton loads input examples per model version and displays a button that performs a
 * given action with the example content as argument (e.g. populate the request content with the
 * example) when clicked.
 *
 * The input examples are assumed to be static and are fetched exactly once per model version and
 * cached in the Redux store. The example fetch is initiated lazily the first time a given model
 * version is selected. Failed example fetches will not be retried unless user reloads the page.
 *
 * The button is displayed in loading state while the example is being fetched from the backend. If
 * the fetching fails, the button will be displayed as disabled and the tooltip will display the
 * error message (including 'Model has no example' situation).
 */
export class ShowExampleButtonImpl extends React.Component {
  static propTypes = {
    modelName: PropTypes.string.isRequired,
    version: PropTypes.string.isRequired,
    servingVersion: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
    inputExample: PropTypes.shape({
      content: PropTypes.string, // example content; set iff example has been fetched ok.
      error: PropTypes.string, // error message; set iff example fetching has failed.
    }),
    getModelVersionArtifactUriApi: PropTypes.func.isRequired,
    getDbfsFileApi: PropTypes.func.isRequired,
    setInputExampleForModelVersion: PropTypes.func.isRequired,
    setInputExampleTypeForModelVersion: PropTypes.func.isRequired,
  };

  parseDataframeJson(example) {
    // Example data is expected to be in orient='split' format and have the following fields:
    //   - columns: array of optional column names
    //   - data: 2d matrix with the example data, stored row wise.
    // We want to show example in 'records' orientation - list like:
    //   [{column -> value}, ..., {column -> value}]
    // or if the example has no column names:
    //   [[value, value ,...]]
    // Therefore, if the example has column names, we will need to convert it to 'records', if
    // it has no column names, we can return data matrix directly.
    // For models served with V2, we want to nest the pandas records format input in a key in a dict
    // called 'dataframe_records'
    if (example.hasOwnProperty('columns')) {
      // we need to convert from orient='split' to orient='records'
      const exampleRecords = example.data.map((data_ary) => {
        const row = {};
        data_ary.forEach((val, index) => {
          row[example.columns[index]] = val;
        });
        return row;
      });
      if (this.props.servingVersion === ENDPOINT_VERSIONS.V1) {
        return JSON.stringify(exampleRecords, null, '  ');
      } else {
        return JSON.stringify(
          {
            dataframe_records: exampleRecords,
          },
          null,
          '  ',
        );
      }
    } else {
      // example.data matrix is a valid DF representation in orient='records' format.
      const exampleRecords = example.data.map((row) => '  ' + JSON.stringify(row)).join(',\n');
      if (this.props.servingVersion === ENDPOINT_VERSIONS.V1) {
        return '[\n' + exampleRecords + '\n]';
      } else {
        return '{"dataframe_records": [\n' + exampleRecords + '\n]}';
      }
    }
  }

  parseTensorJson(example) {
    return JSON.stringify(example, null, 2);
  }

  maybeFetchExample() {
    const { modelName, version, inputExample } = this.props;

    if (inputExample === undefined) {
      // Example is not in redux store which means it has not been loaded yet.
      // We will fetch the example in the following steps:
      //   0. Insert a placeholder example into the redux store so that we don't start loading it
      //      again if the component updates or user clicks or something.
      //   1. call getModelVersionArtifactUriApi to get the model uri
      //   2. read MLmodel file from the dbfs and YAML parse it.
      //   3. check if the model version has an example, if so read it from Dbfs
      //   4. Convert the example into desired format and update the redux store
      this.props.setInputExampleForModelVersion(modelName, version, {});
      let artifactRoot;
      let modelConf;
      return this.props
        .getModelVersionArtifactUriApi(modelName, version)
        .then((uri) => {
          artifactRoot = uri.value.artifact_uri.replace('dbfs:/', '');
          return this.props.getDbfsFileApi(artifactRoot + '/MLmodel');
        })
        .then((modelConfRaw) => {
          modelConf = yaml.safeLoad(modelConfRaw.value);
          if (!modelConf.hasOwnProperty('saved_input_example_info')) {
            const message =
              'This model was not logged with an example.\n' +
              'You can save example of model input data with the model when ' +
              'logging the model with MLflow.';

            throw new Error(message);
          }
          if (
            ![VersionDataType.DATAFRAME, VersionDataType.TENSOR].includes(
              modelConf.saved_input_example_info.type,
            )
          ) {
            const message = 'Unsupported example type: ' + modelConf.saved_input_example_info.type;
            throw new Error(message);
          }
          return this.props.setInputExampleTypeForModelVersion(
            modelName,
            version,
            modelConf.saved_input_example_info.type,
          );
        })
        .then(() => {
          const artifactPath =
            artifactRoot + '/' + modelConf.saved_input_example_info.artifact_path;
          return this.props.getDbfsFileApi(artifactPath);
        })
        .then((parsedExample) => {
          if (modelConf.saved_input_example_info.type === 'ndarray') {
            return this.parseTensorJson(parsedExample.value);
          } else {
            return this.parseDataframeJson(parsedExample.value);
          }
        })
        .then((content) => {
          // finally update the redux store with the fetched example
          const oneMeg = 1024 * 1024;
          const exampleLimit = 5 * oneMeg;
          if (content.length > exampleLimit) {
            throw new Error(
              'The example logged with this model is too large to be displayed. Examples must be ' +
                'smaller than 5MB. The size of this example is ' +
                Math.round(content.length / oneMeg) +
                'MB.',
            );
          }
          this.props.setInputExampleForModelVersion(modelName, version, { content });
        })
        .catch((err) => {
          // Example fetching failed. Update the redux store with the error message.
          let message;
          if (err instanceof ErrorWrapper) {
            message = err.getUserVisibleError();
          } else if (err instanceof Error) {
            ({ message } = err);
          } else {
            message = err;
          }
          this.props.setInputExampleForModelVersion(modelName, version, { error: message });
        });
    } else {
      return Promise.resolve();
    }
  }

  componentDidMount() {
    this.maybeFetchExample();
  }

  componentDidUpdate() {
    this.maybeFetchExample();
  }

  render() {
    const { inputExample, onClick } = this.props;
    const { content, error } = inputExample || {};
    const disabled = content === undefined;
    const failed = error !== undefined;
    const loading = disabled && !failed;
    const messageContent = failed ? (
      error.split('\n').map((x, i) => <p key={'err' + i}>{x}</p>)
    ) : (
      <p key='No example.'>
        Populate the request content with the model example that was logged with the model.
      </p>
    );
    const message = (
      <span>
        {messageContent}
        See{' '}
        <a
          style={{ margin: '2px' }}
          target='_blank'
          rel='noopener noreferrer'
          href='https://www.mlflow.org/docs/latest/models.html#model-api'
        >
          MLflow documentation
        </a>
        for more details.
      </span>
    );
    return (
      <Popover overlayClassName='example-message' content={message} placement='bottom'>
        <Button
          className='show-example-button'
          size='small'
          type='secondary'
          loading={loading}
          disabled={disabled}
          onClick={() => onClick(content)}
        >
          Show Example
        </Button>
      </Popover>
    );
  }
}

export const ShowExampleButton = connect(
  mapStateToProps,
  mapDispatchToProps,
)(ShowExampleButtonImpl);
