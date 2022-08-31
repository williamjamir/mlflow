import React from 'react';
import { shallow } from 'enzyme';
import { DeleteRunModalImpl, mapStateToProps } from './DeleteRunModal';
import { RunTag } from '../../sdk/MlflowMessages';
import DatabricksUtils from '../../../common/utils/DatabricksUtils';

/**
 * Return a function that can be used to mock run deletion API requests, appending deleted run IDs
 * to the provided list.
 * @param shouldFail: If true, the generated function will return a promise that always reject
 * @param deletedIdsList List to which to append IDs of deleted runs
 * @returns {function(*=): Promise<any>}
 */
const getMockDeleteRunApiFn = (shouldFail, deletedIdsList) => {
  const error = new Error('Mock Error Message');
  return (runId) => {
    return new Promise((resolve, reject) => {
      window.setTimeout(() => {
        if (shouldFail) {
          reject(error);
        } else {
          deletedIdsList.push(runId);
          resolve();
        }
      }, 1000);
    });
  };
};

const getMockDeleteRunDatabricksApiFn = (shouldFail, deletedIdsList) => {
  const error = new Error('Mock Error Message');
  return (runId) => {
    return new Promise((resolve, reject) => {
      window.setTimeout(() => {
        if (shouldFail) {
          reject(error);
        } else {
          deletedIdsList.push(runId);
          resolve();
        }
      }, 1000);
    });
  };
};

describe('MyComponent', () => {
  let wrapper;
  let instance;
  let minimalProps;

  beforeEach(() => {
    minimalProps = {
      isOpen: false,
      onClose: jest.fn(),
      selectedRunIds: ['runId0', 'runId1'],
      selectedRootRunsToDescendantRuns: { runId0: ['childId0'] },
      openErrorModal: jest.fn(),
      experimentId: 'mockExperimentID',
      deleteRunApi: getMockDeleteRunApiFn(false, []),
      deleteRunDatabricksApi: getMockDeleteRunDatabricksApiFn(false, []),
    };
  });

  test('should render with minimal props without exploding', () => {
    wrapper = shallow(<DeleteRunModalImpl {...minimalProps} />);
    expect(wrapper.length).toBe(1);
  });

  test('should not render checkbox when only non-root runs are selected', () => {
    const props = { ...minimalProps, selectedRootRunsToDescendantRuns: {} };
    wrapper = shallow(<DeleteRunModalImpl {...props} />);
    expect(wrapper.dive().find('Checkbox').exists()).toEqual(false);
  });

  test('should render checkbox when root run is selected for deletion', () => {
    DatabricksUtils.isNestedRunDeletionEnabled = jest.fn().mockReturnValue(true);
    wrapper = shallow(<DeleteRunModalImpl {...minimalProps} />);
    expect(wrapper.dive().find('Checkbox').length).toBe(1);
  });

  test('should not render checkbox when NestedRunDeletion is disabled', () => {
    DatabricksUtils.isNestedRunDeletionEnabled = jest.fn().mockReturnValue(false);
    wrapper = shallow(<DeleteRunModalImpl {...minimalProps} />);
    expect(wrapper.dive().find('Checkbox').length).toBe(0);
  });

  test('should delete each selected run on submission', (done) => {
    const deletedRunIds = [];
    const deleteRunApi = getMockDeleteRunApiFn(false, deletedRunIds);
    wrapper = shallow(<DeleteRunModalImpl {...{ ...minimalProps, deleteRunApi }} />);
    instance = wrapper.instance();
    instance.handleSubmit().then(() => {
      expect(deletedRunIds).toEqual(minimalProps.selectedRunIds);
      done();
    });
  });

  test('should show error modal if deleteRunApi fails', (done) => {
    const deletedRunIds = [];
    const deleteRunApi = getMockDeleteRunApiFn(true, deletedRunIds);
    wrapper = shallow(<DeleteRunModalImpl {...{ ...minimalProps, deleteRunApi }} />);
    instance = wrapper.instance();
    instance.handleSubmit().then(() => {
      expect(deletedRunIds).toEqual([]);
      expect(minimalProps.openErrorModal).toBeCalled();
      done();
    });
  });

  test('should invoke deleteRunDatabricksRun if root run is present and checkbox ticked', (done) => {
    const deleteRunIdsByNormalApi = [];
    const deletedRunIdsByDatabricksApi = [];
    const deleteRunApi = getMockDeleteRunApiFn(false, deleteRunIdsByNormalApi);
    const deleteRunDatabricksApi = getMockDeleteRunDatabricksApiFn(
      false,
      deletedRunIdsByDatabricksApi,
    );
    // intentionally include a child run id
    const selectedRunIds = ['runId0', 'runId1', 'childId0'];
    DatabricksUtils.isNestedRunDeletionEnabled = jest.fn().mockReturnValue(true);
    wrapper = shallow(
      <DeleteRunModalImpl
        {...{ ...minimalProps, deleteRunApi, deleteRunDatabricksApi, selectedRunIds }}
      />,
    );
    instance = wrapper.instance();
    instance.setState({ deleteDescendantsBoxChecked: true });
    instance.handleSubmit().then(() => {
      // childId0 should be skipped because it is deleted by the backend when runId0 is deleted
      expect(deletedRunIdsByDatabricksApi).toEqual(['runId0']);
      expect(deleteRunIdsByNormalApi).toEqual(['runId1']);
      done();
    });
  });

  test('should invoke deleteRunApi if root run is present and checkbox ticked, but NestedRunDeletion is disabled', (done) => {
    const deletedRunIds = [];
    const deleteRunApi = getMockDeleteRunApiFn(false, deletedRunIds);
    DatabricksUtils.isNestedRunDeletionEnabled = jest.fn().mockReturnValue(false);
    wrapper = shallow(<DeleteRunModalImpl {...{ ...minimalProps, deleteRunApi }} />);
    instance = wrapper.instance();
    instance.setState({ deleteDescendantsBoxChecked: true });
    instance.handleSubmit().then(() => {
      expect(deletedRunIds).toEqual(minimalProps.selectedRunIds);
      done();
    });
  });

  test('should invoke deleteRunApi if root run is present and checkbox unticked', (done) => {
    const deletedRunIds = [];
    const deleteRunApi = getMockDeleteRunApiFn(false, deletedRunIds);
    wrapper = shallow(<DeleteRunModalImpl {...{ ...minimalProps, deleteRunApi }} />);
    instance = wrapper.instance();
    instance.setState({ deleteDescendantsBoxChecked: false });
    instance.handleSubmit().then(() => {
      expect(deletedRunIds).toEqual(minimalProps.selectedRunIds);
      done();
    });
  });

  test('should show error modal if deleteRunDatabricksRun fails', (done) => {
    const deletedRunIds = [];
    const deleteRunDatabricksApi = getMockDeleteRunDatabricksApiFn(true, deletedRunIds);
    DatabricksUtils.isNestedRunDeletionEnabled = jest.fn().mockReturnValue(true);
    wrapper = shallow(<DeleteRunModalImpl {...{ ...minimalProps, deleteRunDatabricksApi }} />);
    instance = wrapper.instance();
    instance.setState({ deleteDescendantsBoxChecked: true });
    instance.handleSubmit().then(() => {
      expect(deletedRunIds).toEqual([]);
      expect(minimalProps.openErrorModal).toBeCalled();
      done();
    });
  });

  test('mapStateToProps returns all descendants of selected root runs', () => {
    const state = {
      entities: {
        tagsByRunUuid: {
          runId0: {
            'mlflow.rootRunId': RunTag.fromJs({ key: 'mlflow.rootRunId', value: 'runId0' }),
          },
          runId1: {},
          childId0: {
            'mlflow.rootRunId': RunTag.fromJs({ key: 'mlflow.rootRunId', value: 'runId0' }),
          },
          childId1: {
            'mlflow.rootRunId': RunTag.fromJs({ key: 'mlflow.rootRunId', value: 'runId0' }),
          },
        },
      },
    };
    const selectedRunIds = ['runId0', 'runId1', 'childId0']; // childId1 is not selected
    const props = { ...minimalProps, selectedRunIds };
    const mappedProps = mapStateToProps(state, props);
    expect(mappedProps).toEqual({
      selectedRootRunsToDescendantRuns: { runId0: ['childId0', 'childId1'] },
    });
  });

  test('mapStateToProps returns selected rootRuns with empty list if there is no child run', () => {
    const state = {
      entities: {
        tagsByRunUuid: {
          runId0: {
            'mlflow.rootRunId': RunTag.fromJs({ key: 'mlflow.rootRunId', value: 'runId0' }),
          },
          runId1: {},
        },
      },
    };
    const selectedRunIds = ['runId0', 'runId1'];
    const props = { ...minimalProps, selectedRunIds };
    const mappedProps = mapStateToProps(state, props);
    expect(mappedProps).toEqual({
      selectedRootRunsToDescendantRuns: { runId0: [] },
    });
  });

  test('mapStateToProps returns nothing if no root run is selected', () => {
    const state = {
      entities: {
        tagsByRunUuid: {
          runId0: {
            'mlflow.rootRunId': RunTag.fromJs({ key: 'mlflow.rootRunId', value: 'runId0' }),
          },
          runId1: {},
          childId0: {
            'mlflow.rootRunId': RunTag.fromJs({ key: 'mlflow.rootRunId', value: 'runId0' }),
          },
          childId1: {
            'mlflow.rootRunId': RunTag.fromJs({ key: 'mlflow.rootRunId', value: 'runId0' }),
          },
        },
      },
    };
    const selectedRunIds = ['runId1', 'childId0', 'childId1']; // runId0 is not selected
    const props = { ...minimalProps, selectedRunIds };
    const mappedProps = mapStateToProps(state, props);
    expect(mappedProps).toEqual({
      selectedRootRunsToDescendantRuns: {},
    });
  });
});
