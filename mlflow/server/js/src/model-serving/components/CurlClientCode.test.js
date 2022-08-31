import React from 'react';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';
import { curl_client_code_text, CurlClientCode } from './CurlClientCode';

import configureStore from 'redux-mock-store';

import { mockInputExampleTypeState } from '../test-utils';

import { BrowserRouter } from 'react-router-dom';
import { VersionDataType, ENDPOINT_VERSIONS } from '../utils';

describe('CurlClientCode', () => {
  let wrapper;

  test('Correct curl client code is shown', () => {
    const modelName = 'mymodel';
    const versions = ['DF', 'TENSOR', 'failed'].map((x) => ({ endpoint_version_name: x }));
    const exampleTypes = [VersionDataType.DATAFRAME, VersionDataType.TENSOR, undefined];

    const localMockStore = configureStore();
    const localStore = localMockStore({
      entities: {
        inputExampleTypeByModelVersion: mockInputExampleTypeState(
          modelName,
          versions,
          exampleTypes,
        ),
      },
    });

    // Test Dataframe with Serving V1
    const dfUrl = 'df-url';
    wrapper = mount(
      <Provider store={localStore}>
        <BrowserRouter>
          <CurlClientCode
            url={dfUrl}
            modelName={modelName}
            version='DF'
            servingVersion={ENDPOINT_VERSIONS.V1}
          />
        </BrowserRouter>
      </Provider>,
    );
    const dfHeader = 'Content-Type: application/json; format=pandas-records';
    const expectedDFText = curl_client_code_text(dfHeader, dfUrl).replace(/\n/g, '');
    expect(wrapper.text()).toBe(expectedDFText);

    // Test Datafram with Serving V2
    const dfUrl2 = 'df-url';
    wrapper = mount(
      <Provider store={localStore}>
        <BrowserRouter>
          <CurlClientCode
            url={dfUrl}
            modelName={modelName}
            version='DF'
            servingVersion={ENDPOINT_VERSIONS.V2}
          />
        </BrowserRouter>
      </Provider>,
    );
    const dfHeader2 = 'Content-Type: application/json';
    const expectedDFText2 = curl_client_code_text(dfHeader2, dfUrl2).replace(/\n/g, '');
    expect(wrapper.text()).toBe(expectedDFText2);

    // Test Tensor with Serving V1
    const tensorUrl = 'tensor-url';
    wrapper = mount(
      <Provider store={localStore}>
        <BrowserRouter>
          <CurlClientCode
            url={tensorUrl}
            modelName={modelName}
            version='TENSOR'
            servingVersion={ENDPOINT_VERSIONS.V1}
          />
        </BrowserRouter>
      </Provider>,
    );
    const tensorHeader = 'Content-Type: application/json';
    const expectedTensorText = curl_client_code_text(tensorHeader, tensorUrl).replace(/\n/g, '');
    expect(wrapper.text()).toBe(expectedTensorText);

    // Test Tensor with Serving V2
    const tensorUrl2 = 'tensor-url';
    wrapper = mount(
      <Provider store={localStore}>
        <BrowserRouter>
          <CurlClientCode
            url={tensorUrl}
            modelName={modelName}
            version='TENSOR'
            servingVersion={ENDPOINT_VERSIONS.V2}
          />
        </BrowserRouter>
      </Provider>,
    );
    const tensorHeader2 = 'Content-Type: application/json';
    const expectedTensorText2 = curl_client_code_text(tensorHeader2, tensorUrl2).replace(/\n/g, '');
    expect(wrapper.text()).toBe(expectedTensorText2);

    // Test Failure
    const url = 'url';
    wrapper = mount(
      <Provider store={localStore}>
        <BrowserRouter>
          <CurlClientCode
            url={url}
            modelName={modelName}
            version='failed'
            servingVersion={ENDPOINT_VERSIONS.V1}
          />
        </BrowserRouter>
      </Provider>,
    );
    const header = 'Content-Type: application/json';
    const expectedText = curl_client_code_text(header, url).replace(/\n/g, '');
    expect(wrapper.text()).toBe(expectedText);
  });
});
