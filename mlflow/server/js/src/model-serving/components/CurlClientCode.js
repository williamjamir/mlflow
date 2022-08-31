import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { Typography } from '@databricks/design-system';
import { getServingModelKey, getServingRequestHeaders } from '../utils';

const { Paragraph } = Typography;

// Raw text with curl command used by copy-to-clipboard
export function curl_client_code_text(exampleHeaders, url) {
  return (
    `curl \\\n  -u token:$DATABRICKS_TOKEN \\\n` +
    `  -X POST \\\n` +
    `  -H "${exampleHeaders}" \\\n` +
    `  -d@data.json \\\n  ${url}`
  );
}

export class CurlClientCodeImpl extends React.Component {
  static propTypes = {
    url: PropTypes.string.isRequired,
    version: PropTypes.string.isRequired,
    modelName: PropTypes.string.isRequired,
    inputExampleType: PropTypes.string,
    servingVersion: PropTypes.string,
  };

  render() {
    const { inputExampleType, url, servingVersion } = this.props;
    const exampleHeaders =
      'Content-Type: ' + getServingRequestHeaders(inputExampleType, servingVersion);

    // The CURL command with HTML formatting
    return (
      <Paragraph
        dangerouslySetAntdProps={{
          copyable: { text: curl_client_code_text(exampleHeaders, url) },
        }}
      >
        <pre>
          <div className='code'>
            curl <span className='code-keyword'>\</span>
          </div>
          <div className='code'>
            {'  '}
            <span className='code-keyword'>-u</span> token:
            <span className='code-keyword'>$DATABRICKS_TOKEN</span>{' '}
            <span className='code-keyword'>\</span>
          </div>
          <div className='code'>
            {'  '}
            <span className='code-keyword'>-X</span> <span className='code-keyword'>POST</span>{' '}
            <span className='code-keyword'>\</span>
          </div>
          <div className='code'>
            {'  '}
            <span className='code-keyword'>-H</span>{' '}
            <span className='code-string'>"{exampleHeaders}"</span>{' '}
            <span className='code-keyword'>\</span>
          </div>
          <div className='code'>
            {'  '}
            <span className='code-keyword'>-d@data.json</span>{' '}
            <span className='code-keyword'>\</span>
          </div>
          <div className='code'>
            {'  '}
            {url}
          </div>
        </pre>
      </Paragraph>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  const { modelName, version, servingVersion } = ownProps;
  const servingModelKey = getServingModelKey(null, modelName);
  const versions = state.entities.inputExampleTypeByModelVersion[servingModelKey] || {};
  return {
    modelName: modelName,
    version: version,
    inputExampleType: versions[version],
    servingVersion: servingVersion,
  };
};

export const CurlClientCode = connect(mapStateToProps, null)(CurlClientCodeImpl);
