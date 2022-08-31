import { Tooltip } from '@databricks/design-system';
import { shallow } from 'enzyme';
import DatabricksUtils from '../../../../common/utils/DatabricksUtils';

import { ExperimentViewArtifactLocation } from './ExperimentViewArtifactLocation';

jest.mock('../../../../common/utils/DatabricksUtils');

const doMock = (artifactLocation: string) =>
  shallow(<ExperimentViewArtifactLocation artifactLocation={artifactLocation} />);

const mockIsArtifactAclsEnabled = DatabricksUtils.isArtifactAclsEnabled as jest.Mock;

const urls = {
  empty: '',
  someProtocol: 'someProtocol:/',
  mlTrackingDbfs: 'dbfs:/databricks/mlflow-tracking/test-location',
  otherDbfs: 'dbfs:/databricks/other-location/test',
};

describe('ExperimentViewArtifactLocation', () => {
  test('if the artifact location is displayed properly when ACLs are disabled', () => {
    mockIsArtifactAclsEnabled.mockReturnValue(false);

    // Assert not displaying tooltips at all
    expect(doMock(urls.empty).html()).toBe(urls.empty);
    expect(doMock(urls.otherDbfs).html()).toBe(urls.otherDbfs);
    expect(doMock(urls.otherDbfs).find(Tooltip).length).toBe(0);
  });

  test('if the artifact location is displayed properly when ACLs are enabled', () => {
    mockIsArtifactAclsEnabled.mockReturnValue(true);

    // Assert not displaying tooltips on various strings
    expect(doMock(urls.empty).html()).toBe(urls.empty);
    expect(doMock(urls.someProtocol).html()).toBe(urls.someProtocol);

    // Assert not displaying tooltips when DBFS pattern is detected but its mlflow-tracking
    expect(doMock(urls.mlTrackingDbfs).html()).toBe(urls.mlTrackingDbfs);

    // Assert displaying tooltips when DBFS pattern is detected
    expect(doMock(urls.otherDbfs).html()).not.toBe(urls.otherDbfs);
    expect(doMock(urls.otherDbfs).find(Tooltip).length).toBe(1);
  });
});
