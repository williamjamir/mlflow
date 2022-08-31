import React from 'react';
import PropTypes from 'prop-types';
import { ENDPOINT_VERSIONS } from '../utils';

import { Typography } from '@databricks/design-system';

const { Paragraph } = Typography;

export function python_client_code_text(url, servingVersion) {
  let dsDict;
  if (servingVersion === ENDPOINT_VERSIONS.V1) {
    // eslint-disable-next-line
    dsDict = `  ds_dict = dataset.to_dict(orient='split') if isinstance(dataset, pd.DataFrame) else create_tf_serving_json(dataset)\n`;
  } else {
    // eslint-disable-next-line
    dsDict = `  ds_dict = {'dataframe_split': dataset.to_dict(orient='split')} if isinstance(dataset, pd.DataFrame) else create_tf_serving_json(dataset)\n`;
  }
  return (
    `\n` +
    `import os\n` +
    `import requests\n` +
    `import numpy as np\n` +
    `import pandas as pd\n` +
    `import json\n` +
    `\n` +
    `def create_tf_serving_json(data):\n` +
    // eslint-disable-next-line
    `  return {'inputs': {name: data[name].tolist() for name in data.keys()} if isinstance(data, dict) else data.tolist()}\n` +
    `\n` +
    `def score_model(dataset):\n` +
    `  url = '${url}'\n` +
    `  headers = {'Authorization': f'Bearer {os.environ.get("DATABRICKS_TOKEN")}', ` +
    `'Content-Type': 'application/json'}\n` +
    dsDict +
    // eslint-disable-next-line
    `  data_json = json.dumps(ds_dict, allow_nan=True)\n` +
    `  response = requests.request(method='POST', headers=headers, url=url, data=data_json)\n` +
    `  if response.status_code != 200:\n` +
    `    raise Exception(f'Request failed with status {response.status_code}, {response.text}')` +
    `\n` +
    `  return response.json()\n`
  );
}

export class PythonClientCode extends React.Component {
  static propTypes = {
    url: PropTypes.string.isRequired,
    servingVersion: PropTypes.string.isRequired,
  };

  render() {
    const { url, servingVersion } = this.props;

    let dsDictDiv;
    if (servingVersion === ENDPOINT_VERSIONS.V1) {
      dsDictDiv = (
        <div className='code'>
          {'  '}
          ds_dict = dataset.to_dict(orient=
          <span className='code-string'>'split'</span>)
          <span className='code-keyword'> if isinstance</span>(dataset, pd.DataFrame)
          <span className='code-keyword'> else </span>create_tf_serving_json(dataset)
        </div>
      );
    } else {
      dsDictDiv = (
        <div className='code'>
          {'  '}
          ds_dict = &#123;
          <span className='code-string'>'dataframe_split'</span>: dataset.to_dict(orient=
          <span className='code-string'>'split'</span>)&#125;
          <span className='code-keyword'> if isinstance</span>(dataset, pd.DataFrame)
          <span className='code-keyword'> else </span>create_tf_serving_json(dataset)
        </div>
      );
    }

    // The Python code with html formatting
    return (
      <Paragraph
        dangerouslySetAntdProps={{
          copyable: { text: python_client_code_text(url, servingVersion) },
        }}
      >
        <pre>
          <div className='code'>
            <span className='code-keyword'>import </span>os
          </div>
          <div className='code'>
            <span className='code-keyword'>import </span>requests
          </div>
          <div className='code'>
            <span className='code-keyword'>import </span>numpy{' '}
            <span className='code-keyword'>as</span> np
          </div>
          <div className='code'>
            <span className='code-keyword'>import </span>pandas{' '}
            <span className='code-keyword'>as</span> pd
          </div>
          <div className='code'>
            <span className='code-keyword'>import </span>json
          </div>
          <br />
          <div className='code'>
            <span className='code-keyword'>def </span>create_tf_serving_json(data)
            <span className='code-keyword'>:</span>
          </div>
          <div className='code'>
            {'  '}
            <span className='code-keyword'>return </span>&#123;
            <span className='code-string'>'inputs'</span>: &#123;name: data[name].tolist(){' '}
            <span className='code-keyword'>for </span>name
            <span className='code-keyword'> in</span> data.keys()&#125;
            <span className='code-keyword'> if isinstance</span>(data,{' '}
            <span className='code-keyword'>dict</span>)<span className='code-keyword'> else </span>
            data.tolist()&#125;
          </div>
          <br />
          <div className='code'>
            <span className='code-keyword'>def </span>score_model(dataset)
            <span className='code-keyword'>:</span>
          </div>
          <div className='code'>
            {'  '}
            url = <span className='code-string'>'{url}'</span>
          </div>
          <div className='code'>
            {'  '}
            headers = &#123;
            <span className='code-string'>'Authorization'</span>: f
            <span className='code-string'>'Bearer </span>&#123;os.environ.get(
            <span className='code-string'>&quot;DATABRICKS_TOKEN&quot;</span>
            <span>)&#125;</span>
            <span className='code-string'>'</span>,{' '}
            <span className='code-string'>'Content-Type'</span>:{' '}
            <span className='code-string'>'application/json'</span>
            &#125;
          </div>
          {dsDictDiv}
          <div className='code'>
            {'  '}
            data_json = json.dumps(ds_dict, allow_nan=True)
          </div>
          <div className='code'>
            {'  '}
            response = requests.request(method=<span className='code-string'>'POST'</span>
            <span className='code-keyword'>, </span>headers=headers
            <span className='code-keyword'>, </span>url=url
            <span className='code-keyword'>, </span>data=data_json)
          </div>
          <div className='code'>
            {'  '}
            <span className='code-keyword'>if </span>response.status_code !={' '}
            <span className='code-number'>200</span>:
          </div>
          <div className='code'>
            {'    '}
            <span className='code-keyword'>raise </span>Exception(
            <span className='code-string'>f'Request failed with status </span>
            <span>&#123;response.status_code&#125;</span>
            <span className='code-string'>, </span>
            <span>&#123;response.text&#125;')</span>
          </div>
          <div className='code'>
            {'  '}
            <span className='code-keyword'>return </span>response.json()
          </div>
        </pre>
      </Paragraph>
    );
  }
}
