import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {
  ClientLanguages,
  ENDPOINT_VERSIONS,
  getModelServingDocsUri,
  getServingModelKey,
  getServingRequestHeaders,
  suppressInvalidParameterValue,
  Tooltip,
} from '../utils';
import { Input, Radio, Tooltip as AntdTooltip } from 'antd';
import { Button } from '@databricks/design-system';
import { CollapsibleSection } from '../../common/components/CollapsibleSection';
import { CurlClientCode } from './CurlClientCode';
import { PythonClientCode } from './PythonClientCode';
import { ShowExampleButton } from './ShowExampleButton';
import { submitServingRequestApi, submitServingRequestV2Api } from '../actions';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import { getUUID } from '../../common/utils/ActionUtils';

const { TextArea } = Input;

export class CallModelViewImpl extends React.Component {
  static propTypes = {
    modelName: PropTypes.string.isRequired,
    servingVersion: PropTypes.string.isRequired,
    endpointVersionName: PropTypes.string.isRequired,
    invocationPathPrefix: PropTypes.string.isRequired,
    isModelVersionReady: PropTypes.bool.isRequired,

    // redux state
    endpointVersionExampleTypes: PropTypes.object,
    // redux actions
    submitServingRequestApi: PropTypes.func.isRequired,
    submitServingRequestV2Api: PropTypes.func.isRequired,
  };

  state = {
    requestBody: '',
    servingRequestInProgress: false,
    responseFailure: false,
    responseBody: '',
    clientLanguage: ClientLanguages.BROWSER,
  };

  requestTooltipContent = (
    <div className='serving-tooltip-content'>
      <p>Supported request formats:</p>
      <ul>
        <li>
          JSON-formatted Pandas DataFrame with the `records` orient produced using the
          `pandas.DataFrame.to_json(..., orient='records')` method.
        </li>
        <li>
          Tensor input format as described in{' '}
          <a
            href='https://www.tensorflow.org/tfx/serving/api_rest#request_format_2'
            target='_blank'
            rel='noopener noreferrer'
          >
            TF Serving’s API docs
          </a>{' '}
          where the provided inputs will be cast to Numpy arrays
        </li>
      </ul>
      <a
        href={getModelServingDocsUri() + '#score-deployed-model-versions'}
        target='_blank'
        rel='noopener noreferrer'
      >
        More info
      </a>
    </div>
  );

  handleClientLanguageChange = (e) => {
    this.setState({ clientLanguage: e.target.value });
  };

  onRequestBodyChange = (event) => {
    this.setState({ requestBody: event.target.value });
  };

  onServingResponse = (response) => {
    this.setState({
      responseBody: JSON.stringify(response.value),
      responseFailure: false,
      servingRequestInProgress: false,
    });
  };

  onServingResponseError = (e) => {
    this.setState({
      responseBody: e.renderHttpError(),
      responseFailure: true,
      servingRequestInProgress: false,
    });
  };

  submitServingRequest = () => {
    const { modelName, endpointVersionExampleTypes, endpointVersionName, servingVersion } =
      this.props;
    const { requestBody } = this.state;

    const headers = getServingRequestHeaders(
      endpointVersionExampleTypes[endpointVersionName],
      servingVersion,
    );
    this.setState({
      servingRequestInProgress: true,
      responseFailure: false,
      responseBody: '',
    });
    if (servingVersion === ENDPOINT_VERSIONS.V1) {
      return this.props
        .submitServingRequestApi(
          modelName,
          endpointVersionName, // version id...
          requestBody,
          headers,
          getUUID(),
        )
        .catch(suppressInvalidParameterValue)
        .then(this.onServingResponse)
        .catch(this.onServingResponseError);
    } else {
      return this.props
        .submitServingRequestV2Api(
          modelName,
          endpointVersionName, // version id...
          requestBody,
          headers,
          getUUID(),
        )
        .catch(suppressInvalidParameterValue)
        .then(this.onServingResponse)
        .catch(this.onServingResponseError);
    }
  };

  responseTooltipContent = (
    <div className='serving-tooltip-content'>
      Response structure depends on the model type, and will be encoded in the same
      <br />
      fashion as the input. Commonly, this will be a Pandas dataframe or numpy array.
    </div>
  );

  requestTextAreaRef = React.createRef();

  showExampleOnClick = (content) => {
    this.onRequestBodyChange({ target: { value: content } });
    this.requestTextAreaRef.current.focus();
  };

  renderShowExampleButton = () => {
    const { modelName, endpointVersionName, servingVersion } = this.props;
    return (
      <ShowExampleButton
        modelName={modelName}
        version={endpointVersionName}
        servingVersion={servingVersion}
        onClick={this.showExampleOnClick}
      />
    );
  };

  renderBrowserModelRequest = () => {
    const { responseFailure, servingRequestInProgress, requestBody, responseBody } = this.state;
    const responseTextareaClassnames = classNames({
      'serving-response-textarea': true,
      failed: responseFailure,
    });

    const { isModelVersionReady } = this.props;
    let sendRequestButton = (
      <Button
        className='submit-request-button'
        type='primary'
        htmlType='button'
        onClick={this.submitServingRequest}
        disabled={servingRequestInProgress || !isModelVersionReady}
        size='small'
      >
        Send Request
      </Button>
    );
    if (!isModelVersionReady) {
      const tooltipMessage = 'Model version process is not ready';
      sendRequestButton = (
        <AntdTooltip title={tooltipMessage} placement='bottom'>
          {sendRequestButton}
        </AntdTooltip>
      );
    }
    return (
      <div>
        <div className='serving-request-response-container'>
          <div className='serving-request-container'>
            <b>Request</b>
            <Tooltip contents={this.requestTooltipContent} />
            <div>
              <TextArea
                rows={8}
                ref={this.requestTextAreaRef}
                value={requestBody}
                style={{ fontFamily: 'Courier New, monospace' }}
                onChange={this.onRequestBodyChange}
                className='serving-request-textarea'
                aria-label='serving request'
              />
            </div>
          </div>
          <div className='serving-response-container'>
            <b>Response</b>
            <Tooltip contents={this.responseTooltipContent} />
            <div>
              <TextArea
                rows={8}
                readOnly
                value={responseBody}
                style={{ fontFamily: 'Courier New, monospace' }}
                className={responseTextareaClassnames}
                aria-label='serving response'
              />
            </div>
          </div>
        </div>
        <div>
          {sendRequestButton}
          {this.renderShowExampleButton()}
        </div>
      </div>
    );
  };

  render() {
    const { modelName, endpointVersionName, invocationPathPrefix, servingVersion } = this.props;
    const { clientLanguage } = this.state;
    const urlPrefix = 'https://' + window.location.host + invocationPathPrefix;
    const modelUrls = [
      urlPrefix + encodeURIComponent(modelName) + '/' + endpointVersionName + '/invocations',
    ];
    const selectedModelURL = modelUrls[0]; // use url with the explicit version number.

    const renderClientCodeExample = () => {
      if (clientLanguage === ClientLanguages.BROWSER) {
        return this.renderBrowserModelRequest();
      } else if (clientLanguage === ClientLanguages.CURL) {
        return (
          <CurlClientCode
            url={selectedModelURL}
            version={endpointVersionName}
            modelName={modelName}
            servingVersion={servingVersion}
          />
        );
      } else if (clientLanguage === ClientLanguages.PYTHON) {
        return <PythonClientCode url={selectedModelURL} servingVersion={servingVersion} />;
      }
      return '';
    };

    return (
      <div className='serving-call-model-container'>
        <CollapsibleSection
          title='Call the model'
          data-test-id='model-serving-call-the-model-section'
        >
          <div className='serving-example-client-language-select'>
            <Radio.Group
              className='active-toggle'
              value={clientLanguage}
              onChange={this.handleClientLanguageChange}
            >
              <Radio.Button value={ClientLanguages.BROWSER}>Browser</Radio.Button>
              <Radio.Button value={ClientLanguages.CURL}>Curl</Radio.Button>
              <Radio.Button value={ClientLanguages.PYTHON}>Python</Radio.Button>
            </Radio.Group>
          </div>
          <div data-testid='serving-example-client-code' css={styles.code}>
            {renderClientCodeExample(clientLanguage)}
          </div>
        </CollapsibleSection>
      </div>
    );
  }
}

const styles = {
  code: {
    padding: 8,
    position: 'relative',
    pre: { margin: 0 },
    '.du-bois-light-typography-copy': {
      position: 'absolute',
      top: 16,
      right: 16,
    },
  },
};

const mapStateToProps = (state, ownProps) => {
  const { modelName } = ownProps;
  const servingModelKey = getServingModelKey(null, modelName);
  const endpointVersionExampleTypes =
    state.entities.inputExampleTypeByModelVersion[servingModelKey] || {};
  return {
    endpointVersionExampleTypes,
  };
};

const mapDispatchToProps = {
  submitServingRequestApi,
  submitServingRequestV2Api,
};

export const CallModelView = withRouter(
  connect(mapStateToProps, mapDispatchToProps)(injectIntl(CallModelViewImpl)),
);
