import React from 'react';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';
import { ShowExampleButton, ShowExampleButtonImpl } from './ShowExampleButton';

import configureStore from 'redux-mock-store';

import { mockInputExampleState } from '../test-utils';

import { BrowserRouter } from 'react-router-dom';
import { VersionDataType, ENDPOINT_VERSIONS } from '../utils';

describe('ShowExampleButton', () => {
  let wrapper;

  test('load example button states', () => {
    const modelName = 'mymodel';
    const versions = ['ready', 'loading', 'failed'].map((x) => ({ endpoint_version_name: x }));
    const examples = [{ content: JSON.stringify([{ x: 1, y: 2 }]) }, {}, { error: 'Some error' }];

    const localMockStore = configureStore();
    const localStore = localMockStore({
      entities: {
        inputExampleByModelVersion: mockInputExampleState(modelName, versions, examples),
      },
    });
    let requestContent;
    wrapper = mount(
      <Provider store={localStore}>
        <BrowserRouter>
          <ShowExampleButton
            modelName={modelName}
            version='ready'
            servingVersion={ENDPOINT_VERSIONS.V1}
            onClick={(content) => (requestContent = content)}
          />
        </BrowserRouter>
      </Provider>,
    );
    expect(wrapper.find('.show-example-button').at(0).find('Button').prop('disabled')).toBe(false);
    expect(wrapper.find('.show-example-button').at(0).find('Button').prop('loading')).toBe(false);
    wrapper.find('.show-example-button').at(0).simulate('click');
    expect(requestContent).toBe(examples[0].content);

    requestContent = undefined;
    wrapper = mount(
      <Provider store={localStore}>
        <BrowserRouter>
          <ShowExampleButton
            modelName={modelName}
            version='loading'
            servingVersion={ENDPOINT_VERSIONS.V1}
            onClick={(content) => (requestContent = content)}
          />
        </BrowserRouter>
      </Provider>,
    );
    expect(wrapper.find('.show-example-button').at(0).find('Button').prop('disabled')).toBe(true);
    expect(wrapper.find('.show-example-button').at(0).find('Button').prop('loading')).toBe(true);

    wrapper = mount(
      <Provider store={localStore}>
        <BrowserRouter>
          <ShowExampleButton
            modelName={modelName}
            version='failed'
            servingVersion={ENDPOINT_VERSIONS.V1}
            onClick={(content) => (requestContent = content)}
          />
        </BrowserRouter>
      </Provider>,
    );
    expect(wrapper.find('.show-example-button').at(0).find('Button').prop('disabled')).toBe(true);
    expect(wrapper.find('.show-example-button').at(0).find('Button').prop('loading')).toBe(false);
  });

  const modelConf = (type) => {
    let dataInfo;
    if (type === 'dataframe') {
      dataInfo = '  pandas_orient: split';
    } else if (type === 'ndarray') {
      dataInfo = '  format: tf-serving';
    } else {
      throw new Error('Unexpected input type');
    }

    return [
      'artifact_path: iris_glm',
      'flavors:',
      '  python_function:',
      '    data: model.pkl',
      '    env: conda.yaml',
      '    loader_module: mlflow.sklearn',
      '    python_version: 3.7.7',
      '  sklearn:',
      '    pickled_model: model.pkl',
      '    serialization_format: cloudpickle',
      '    sklearn_version: 0.22.1',
      'run_id: b703654fc8974b878735b18d133299df',
      'saved_input_example_info:',
      '  artifact_path: input_example.json',
      dataInfo,
      `  type: ${type}`,
      'utc_time_created: "2020-05-28 20:55:36.065975"',
    ].join('\n');
  };

  const modelConfWithoutExample = [
    'artifact_path: iris_glm',
    'flavors:',
    '  python_function:',
    '    data: model.pkl',
    '    env: conda.yaml',
    '    loader_module: mlflow.sklearn',
    '    python_version: 3.7.7',
    '  sklearn:',
    '    pickled_model: model.pkl',
    '    serialization_format: cloudpickle',
    '    sklearn_version: 0.22.1',
    'run_id: b703654fc8974b878735b18d133299df',
    'utc_time_created: "2020-05-28 20:55:36.065975"',
  ].join('\n');

  test('dataframe example with column names fetches ok for Serving V1', (testSuccessCallback) => {
    const instance = new ShowExampleButtonImpl();
    instance.props = {
      modelName: 'model',
      version: 'version',
      setInputExampleForModelVersion: jest.fn(),
      setInputExampleTypeForModelVersion: jest.fn(),
      servingVersion: ENDPOINT_VERSIONS.V1,
      getModelVersionArtifactUriApi: (mode, version) => {
        return Promise.resolve({ value: { artifact_uri: 'dbfs:/some/uri' } });
      },
      getDbfsFileApi: (x) => {
        if (x === 'some/uri/MLmodel') {
          return Promise.resolve({ value: modelConf('dataframe') });
        }
        if (x === 'some/uri/input_example.json') {
          return Promise.resolve({
            value: {
              columns: [
                'sepal length (cm)',
                'sepal width (cm)',
                'petal length (cm)',
                'petal width (cm)',
              ],
              data: [
                [5.1, 3.5, 1.4, 0.2],
                [4.9, 3.0, 1.4, 0.2],
              ],
            },
          });
        } else {
          throw new Error('Unexpected input.');
        }
      },
    };
    instance.props.inputExample = undefined;
    instance.maybeFetchExample().then(() => {
      expect(instance.props.setInputExampleForModelVersion.mock.calls).toEqual([
        ['model', 'version', {}],
        [
          'model',
          'version',
          {
            content: JSON.stringify(
              [
                {
                  'sepal length (cm)': 5.1,
                  'sepal width (cm)': 3.5,
                  'petal length (cm)': 1.4,
                  'petal width (cm)': 0.2,
                },
                {
                  'sepal length (cm)': 4.9,
                  'sepal width (cm)': 3,
                  'petal length (cm)': 1.4,
                  'petal width (cm)': 0.2,
                },
              ],
              null,
              '  ',
            ),
          },
        ],
      ]);
      expect(instance.props.setInputExampleTypeForModelVersion.mock.calls).toEqual([
        ['model', 'version', VersionDataType.DATAFRAME],
      ]);
      testSuccessCallback();
    });
  });

  test('dataframe example with column names fetches ok for serving V2', (testSuccessCallback) => {
    const instance = new ShowExampleButtonImpl();
    instance.props = {
      modelName: 'model',
      version: 'version',
      servingVersion: ENDPOINT_VERSIONS.V2,
      setInputExampleForModelVersion: jest.fn(),
      setInputExampleTypeForModelVersion: jest.fn(),
      getModelVersionArtifactUriApi: (mode, version) => {
        return Promise.resolve({ value: { artifact_uri: 'dbfs:/some/uri' } });
      },
      getDbfsFileApi: (x) => {
        if (x === 'some/uri/MLmodel') {
          return Promise.resolve({ value: modelConf('dataframe') });
        }
        if (x === 'some/uri/input_example.json') {
          return Promise.resolve({
            value: {
              columns: [
                'sepal length (cm)',
                'sepal width (cm)',
                'petal length (cm)',
                'petal width (cm)',
              ],
              data: [
                [5.1, 3.5, 1.4, 0.2],
                [4.9, 3.0, 1.4, 0.2],
              ],
            },
          });
        } else {
          throw new Error('Unexpected input.');
        }
      },
    };
    instance.props.inputExample = undefined;
    instance.maybeFetchExample().then(() => {
      expect(instance.props.setInputExampleForModelVersion.mock.calls).toEqual([
        ['model', 'version', {}],
        [
          'model',
          'version',
          {
            content: JSON.stringify(
              {
                dataframe_records: [
                  {
                    'sepal length (cm)': 5.1,
                    'sepal width (cm)': 3.5,
                    'petal length (cm)': 1.4,
                    'petal width (cm)': 0.2,
                  },
                  {
                    'sepal length (cm)': 4.9,
                    'sepal width (cm)': 3,
                    'petal length (cm)': 1.4,
                    'petal width (cm)': 0.2,
                  },
                ],
              },
              null,
              '  ',
            ),
          },
        ],
      ]);
      expect(instance.props.setInputExampleTypeForModelVersion.mock.calls).toEqual([
        ['model', 'version', VersionDataType.DATAFRAME],
      ]);
      testSuccessCallback();
    });
  });

  test('dataframe example without column names fetches ok for Serving V1', (testSuccessCallback) => {
    const instance = new ShowExampleButtonImpl();
    instance.props = {
      modelName: 'model',
      version: 'version',
      servingVersion: ENDPOINT_VERSIONS.V1,
      setInputExampleForModelVersion: jest.fn(),
      setInputExampleTypeForModelVersion: jest.fn(),
      getModelVersionArtifactUriApi: (mode, version) => {
        return Promise.resolve({ value: { artifact_uri: 'dbfs:/some/uri' } });
      },
      getDbfsFileApi: (x) => {
        if (x === 'some/uri/MLmodel') {
          return Promise.resolve({ value: modelConf('dataframe') });
        }
        if (x === 'some/uri/input_example.json') {
          return Promise.resolve({
            value: {
              data: [
                [5.1, 3.5, 1.4, 0.2],
                [4.9, 3.0, 1.4, 0.2],
              ],
            },
          });
        } else {
          throw new Error('Unexpected input.');
        }
      },
    };
    instance.props.inputExample = undefined;

    const expectedExample = '[\n  [5.1,3.5,1.4,0.2],\n  [4.9,3,1.4,0.2]\n]';

    instance.maybeFetchExample().then(() => {
      expect(instance.props.setInputExampleForModelVersion.mock.calls).toEqual([
        ['model', 'version', {}],
        ['model', 'version', { content: expectedExample }],
      ]);
      expect(instance.props.setInputExampleTypeForModelVersion.mock.calls).toEqual([
        ['model', 'version', VersionDataType.DATAFRAME],
      ]);
      testSuccessCallback();
    });
  });

  test('dataframe example without column names fetches ok for Serving V2', (testSuccessCallback) => {
    const instance = new ShowExampleButtonImpl();
    instance.props = {
      modelName: 'model',
      version: 'version',
      servingVersion: ENDPOINT_VERSIONS.V2,
      setInputExampleForModelVersion: jest.fn(),
      setInputExampleTypeForModelVersion: jest.fn(),
      getModelVersionArtifactUriApi: (mode, version) => {
        return Promise.resolve({ value: { artifact_uri: 'dbfs:/some/uri' } });
      },
      getDbfsFileApi: (x) => {
        if (x === 'some/uri/MLmodel') {
          return Promise.resolve({ value: modelConf('dataframe') });
        }
        if (x === 'some/uri/input_example.json') {
          return Promise.resolve({
            value: {
              data: [
                [5.1, 3.5, 1.4, 0.2],
                [4.9, 3.0, 1.4, 0.2],
              ],
            },
          });
        } else {
          throw new Error('Unexpected input.');
        }
      },
    };
    instance.props.inputExample = undefined;

    const expectedExample = '{"dataframe_records": [\n  [5.1,3.5,1.4,0.2],\n  [4.9,3,1.4,0.2]\n]}';

    instance.maybeFetchExample().then(() => {
      expect(instance.props.setInputExampleForModelVersion.mock.calls).toEqual([
        ['model', 'version', {}],
        ['model', 'version', { content: expectedExample }],
      ]);
      expect(instance.props.setInputExampleTypeForModelVersion.mock.calls).toEqual([
        ['model', 'version', VersionDataType.DATAFRAME],
      ]);
      testSuccessCallback();
    });
  });

  test('tensor example without names fetches ok', (testSuccessCallback) => {
    const instance = new ShowExampleButtonImpl();
    instance.props = {
      modelName: 'model',
      version: 'version',
      setInputExampleForModelVersion: jest.fn(),
      setInputExampleTypeForModelVersion: jest.fn(),
      getModelVersionArtifactUriApi: (mode, version) => {
        return Promise.resolve({ value: { artifact_uri: 'dbfs:/some/uri' } });
      },
      getDbfsFileApi: (x) => {
        if (x === 'some/uri/MLmodel') {
          return Promise.resolve({ value: modelConf('ndarray') });
        }
        if (x === 'some/uri/input_example.json') {
          return Promise.resolve({
            value: {
              inputs: [[5.1, 3.5, 1.4, 0.2]],
            },
          });
        } else {
          throw new Error('Unexpected input.');
        }
      },
    };
    instance.props.inputExample = undefined;

    const expectedExample = JSON.stringify(
      {
        inputs: [[5.1, 3.5, 1.4, 0.2]],
      },
      null,
      2,
    );

    instance.maybeFetchExample().then(() => {
      expect(instance.props.setInputExampleForModelVersion.mock.calls).toEqual([
        ['model', 'version', {}],
        ['model', 'version', { content: expectedExample }],
      ]);
      expect(instance.props.setInputExampleTypeForModelVersion.mock.calls).toEqual([
        ['model', 'version', VersionDataType.TENSOR],
      ]);
      testSuccessCallback();
    });
  });

  test('tensor example with names fetches ok', (testSuccessCallback) => {
    const instance = new ShowExampleButtonImpl();
    instance.props = {
      modelName: 'model',
      version: 'version',
      setInputExampleForModelVersion: jest.fn(),
      setInputExampleTypeForModelVersion: jest.fn(),
      getModelVersionArtifactUriApi: (mode, version) => {
        return Promise.resolve({ value: { artifact_uri: 'dbfs:/some/uri' } });
      },
      getDbfsFileApi: (x) => {
        if (x === 'some/uri/MLmodel') {
          return Promise.resolve({ value: modelConf('ndarray') });
        }
        if (x === 'some/uri/input_example.json') {
          return Promise.resolve({
            value: {
              inputs: {
                a: [5.1, 3.5, 1.4, 0.2],
                b: [4.9, 3.0, 1.4, 0.2],
              },
            },
          });
        } else {
          throw new Error('Unexpected input.');
        }
      },
    };
    instance.props.inputExample = undefined;

    const expectedExample = JSON.stringify(
      {
        inputs: {
          a: [5.1, 3.5, 1.4, 0.2],
          b: [4.9, 3.0, 1.4, 0.2],
        },
      },
      null,
      2,
    );

    instance.maybeFetchExample().then(() => {
      expect(instance.props.setInputExampleForModelVersion.mock.calls).toEqual([
        ['model', 'version', {}],
        ['model', 'version', { content: expectedExample }],
      ]);
      expect(instance.props.setInputExampleTypeForModelVersion.mock.calls).toEqual([
        ['model', 'version', VersionDataType.TENSOR],
      ]);
      testSuccessCallback();
    });
  });

  test('no example works ok', (testSuccessCallback) => {
    const instance = new ShowExampleButtonImpl();
    instance.props = {
      modelName: 'model',
      version: 'version',
      setInputExampleForModelVersion: jest.fn(),
      getModelVersionArtifactUriApi: (mode, version) => {
        return Promise.resolve({ value: { artifact_uri: 'dbfs:/some/uri' } });
      },
      getDbfsFileApi: (x) => {
        if (x === 'some/uri/MLmodel') {
          return Promise.resolve({ value: modelConfWithoutExample });
        }
        if (x === 'some/uri/input_example.json') {
          throw new Error('should not reach here');
        } else {
          throw new Error('Unexpected input.');
        }
      },
    };
    instance.props.inputExample = undefined;

    instance.maybeFetchExample().then(() => {
      expect(instance.props.setInputExampleForModelVersion.mock.calls).toEqual([
        ['model', 'version', {}],
        [
          'model',
          'version',
          {
            error:
              'This model was not logged with an example.\n' +
              'You can save example of model input data with the ' +
              'model when logging the model with MLflow.',
          },
        ],
      ]);
      testSuccessCallback();
    });
  });

  test('error handling', (testSuccessCallback) => {
    const instance = new ShowExampleButtonImpl();
    instance.props = {
      modelName: 'model',
      version: 'version',
      setInputExampleForModelVersion: jest.fn(),
      getModelVersionArtifactUriApi: (mode, version) => {
        return Promise.resolve({ value: { artifact_uri: 'dbfs:/some/uri' } });
      },
      getDbfsFileApi: (x) => {
        throw new Error('Some random error.');
      },
    };
    instance.props.inputExample = undefined;

    instance.maybeFetchExample().then(() => {
      expect(instance.props.setInputExampleForModelVersion.mock.calls).toEqual([
        ['model', 'version', {}],
        ['model', 'version', { error: 'Some random error.' }],
      ]);
      testSuccessCallback();
    });
  });
});
