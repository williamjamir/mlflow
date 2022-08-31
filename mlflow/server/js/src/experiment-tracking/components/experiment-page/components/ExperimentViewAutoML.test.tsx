import { mount } from 'enzyme';
import DatabricksUtils from '../../../../common/utils/DatabricksUtils';
import { AutoMLExperimentPanelPage } from '../../automl/AutoMLExperimentPanelPage';
import { ExperimentViewAutoML } from './ExperimentViewAutoML';

jest.mock('../../automl/AutoMLExperimentPanelPage', () => ({
  ...jest.requireActual('../../automl/AutoMLExperimentPanelPage'),
  AutoMLExperimentPanelPage: () => <div>foobar</div>,
}));

jest.mock('../../../../common/utils/DatabricksUtils', () => ({
  autoMLEnabled: jest.fn(),
  getConf: jest.fn(),
}));

const createExperimentMock = (additionalTags: any[] = []): any => ({
  experiment_id: '1234',
  tags: [{ key: '_databricks_automl', value: '' }, ...additionalTags],
});

const createComponentMock = (experimentData = createExperimentMock()) =>
  mount(<ExperimentViewAutoML experiment={experimentData} />);

describe('ExperimentViewAutoML', () => {
  beforeEach(() => {
    // Explicitly set "DatabricksUtils.autoMLEnabled()" return value to true
    (DatabricksUtils.autoMLEnabled as jest.Mock).mockReturnValue(true);
    // Explicitly set "DatabricksUtils.getConf('autoMLServiceAPIUsed')" return value to true
    (DatabricksUtils.getConf as jest.Mock).mockReturnValue(true);
  });

  test('should not display when there is no automl data', async () => {
    const wrapper = createComponentMock({
      experiment_id: '1234',
      tags: [],
    });
    expect(wrapper.html()).toBeFalsy();
  });

  test('should not display when automl is disabled', async () => {
    // Explicitly set "DatabricksUtils.autoMLEnabled()" return value to false
    (DatabricksUtils.autoMLEnabled as jest.Mock).mockReturnValue(false);
    const wrapper = createComponentMock();
    expect(wrapper.html()).toBeFalsy();
  });

  test('should not be null when there is automl data set', async () => {
    const wrapper = createComponentMock();
    expect(wrapper.html()).toBeTruthy();
  });

  test('should render automl panel page without extracted data if automl service is enabled', async () => {
    const wrapper = createComponentMock();
    expect(wrapper.find(AutoMLExperimentPanelPage).length).toBe(1);
    expect(wrapper.find(AutoMLExperimentPanelPage).props()).toEqual(
      expect.objectContaining({
        experimentId: '1234',
      }),
    );
    expect(wrapper.find(AutoMLExperimentPanelPage).props()).toEqual(
      expect.not.objectContaining({
        automlExperimentData: expect.anything(),
        automlWarnings: expect.anything(),
      }),
    );
  });

  test('should render automl panel page with extracted data if automl service is disabled', async () => {
    // Explicitly set "DatabricksUtils.getConf('autoMLServiceAPIUsed')" return value to false
    (DatabricksUtils.getConf as jest.Mock).mockReturnValue(false);

    const wrapper = createComponentMock();
    expect(wrapper.find(AutoMLExperimentPanelPage).length).toBe(1);
    expect(wrapper.find(AutoMLExperimentPanelPage).props()).toEqual(
      expect.objectContaining({
        experimentId: '1234',
        automlExperimentData: expect.anything(),
        automlWarnings: expect.anything(),
      }),
    );
  });
});
