import React from 'react';
import { ModelVersionTable } from './ModelVersionTable';
import { mockModelVersionDetailed } from '../test-utils';
import { ModelVersionStatus, Stages } from '../constants';
import { Table } from 'antd';
import { RegisteringModelDocUrl } from '../../common/constants';
import { mountWithIntl } from '../../common/utils/TestUtils';
import { BrowserRouter } from 'react-router-dom';
// BEGIN-EDGE
import { oss_test } from '../../common/utils/DatabricksTestUtils';
import { DatabricksRegisterAModelDocUrl } from '../../common/constants-databricks';
import DatabricksUtils from '../../common/utils/DatabricksUtils';
import { CloudProvider } from '../../shared/constants-databricks';
// END-EDGE

describe('ModelVersionTable', () => {
  let wrapper;
  let minimalProps;

  beforeEach(() => {
    minimalProps = {
      modelName: 'Model A',
      modelVersions: [],
      onChange: jest.fn(),
    };
  });

  test('should render with minimal props without exploding', () => {
    wrapper = mountWithIntl(
      <BrowserRouter>
        <ModelVersionTable {...minimalProps} />
      </BrowserRouter>,
    );
    expect(wrapper.length).toBe(1);
  });
  // BEGIN-EDGE

  test('should render correct empty text', () => {
    [CloudProvider.AWS, CloudProvider.Azure].forEach((provider) => {
      DatabricksUtils.getCloudProvider = jest.fn().mockReturnValue(provider);
      wrapper = mountWithIntl(
        <BrowserRouter>
          <ModelVersionTable {...minimalProps} />
        </BrowserRouter>,
      );
      expect(wrapper.find(`a[href="${DatabricksRegisterAModelDocUrl[provider]}"]`)).toHaveLength(1);
    });
  });
  // END-EDGE

  oss_test('should render correct empty text', () => {
    wrapper = wrapper = mountWithIntl(
      <BrowserRouter>
        <ModelVersionTable {...minimalProps} />
      </BrowserRouter>,
    );
    expect(wrapper.find(`a[href="${RegisteringModelDocUrl}"]`)).toHaveLength(1);
  });

  test('should render active versions when activeStageOnly is true', () => {
    const props = {
      ...minimalProps,
      modelVersions: [
        mockModelVersionDetailed('Model A', 1, Stages.NONE, ModelVersionStatus.READY),
        mockModelVersionDetailed('Model A', 2, Stages.PRODUCTION, ModelVersionStatus.READY),
        mockModelVersionDetailed('Model A', 3, Stages.STAGING, ModelVersionStatus.READY),
        mockModelVersionDetailed('Model A', 4, Stages.ARCHIVED, ModelVersionStatus.READY),
      ],
    };
    wrapper = mountWithIntl(
      <BrowserRouter>
        <ModelVersionTable {...props} />
      </BrowserRouter>,
    );
    expect(wrapper.find(Table).props().dataSource.length).toBe(4);

    const propsWithActive = {
      ...props,
      activeStageOnly: true,
    };
    wrapper = mountWithIntl(
      <BrowserRouter>
        <ModelVersionTable {...propsWithActive} />
      </BrowserRouter>,
    );
    expect(wrapper.find(Table).props().dataSource.length).toBe(2);
  });
});
