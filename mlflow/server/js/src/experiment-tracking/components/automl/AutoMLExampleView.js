import React from 'react';
import PropTypes from 'prop-types';
import {
  SegmentedControlButton,
  SegmentedControlGroup,
  Typography,
} from '@databricks/design-system';
import { FormattedMessage } from 'react-intl';

const { Paragraph, Text } = Typography;

export const SupportLanguages = {
  SQL: 'SQL',
  PYTHON: 'Python',
};

function python_forecast_prediction_code_text(dataPath) {
  return `\n df = spark.table('${dataPath}')`;
}

function sql_forecast_prediction_code_text(dataPath) {
  return `\n select * from ${dataPath}`;
}

const PythonForecastPredictionCode = ({ dataPath }) => (
  <Paragraph
    dangerouslySetAntdProps={{
      copyable: { text: python_forecast_prediction_code_text(dataPath) },
    }}
  >
    <pre style={{ wordBreak: 'break-all', whiteSpace: 'pre-wrap' }}>
      <div className='code'>
        df = spark.table(<span className='code-string'>{`'${dataPath}'`}</span>)
      </div>
    </pre>
  </Paragraph>
);

PythonForecastPredictionCode.propTypes = {
  dataPath: PropTypes.string.isRequired,
};

const SQLForecastPredictionCode = ({ dataPath }) => (
  <Paragraph
    dangerouslySetAntdProps={{
      copyable: { text: sql_forecast_prediction_code_text(dataPath) },
    }}
  >
    <pre style={{ wordBreak: 'break-all', whiteSpace: 'pre-wrap' }}>
      <div className='code'>
        <span className='code-keyword'>select </span>* <span className='code-keyword'>from </span>
        {`${dataPath}`}
      </div>
    </pre>
  </Paragraph>
);

SQLForecastPredictionCode.propTypes = {
  dataPath: PropTypes.string.isRequired,
};

const ForecastPredictionCodeExample = ({ clientLanguage, dataPath }) => {
  if (clientLanguage === SupportLanguages.SQL) {
    return (
      <SQLForecastPredictionCode
        dataPath={dataPath}
        data-testid='automl-prediction-example-sql-text'
      />
    );
  } else if (clientLanguage === SupportLanguages.PYTHON) {
    return (
      <PythonForecastPredictionCode
        dataPath={dataPath}
        data-testid='automl-prediction-example-python-text'
      />
    );
  }
  return null;
};

ForecastPredictionCodeExample.propTypes = {
  clientLanguage: PropTypes.string.isRequired,
  dataPath: PropTypes.string.isRequired,
};

export function dataTableUrl(tableName) {
  if (tableName.split('.').length === 2) {
    return `${window.location.origin}#table/hive_metastore/${tableName.replace(/[.]/g, '/')}`;
  } else {
    return `${window.location.origin}#table/${tableName.replace(/[.]/g, '/')}`;
  }
}

export class LoadForecastPredictionTableView extends React.Component {
  static propTypes = {
    dataPath: PropTypes.string.isRequired,
  };

  state = {
    codeLanguage: SupportLanguages.SQL,
  };

  handleCodeLanguageChange = (e) => {
    this.setState({ codeLanguage: e.target.value });
  };

  render() {
    const { dataPath } = this.props;
    const { codeLanguage } = this.state;
    const outputDataTable = (
      <FormattedMessage
        // eslint-disable-next-line max-len
        defaultMessage='The prediction results of the best model are saved to <link>{table_name}</link>. Load the prediction table:'
        description='Text message when user provide the output database'
        values={{
          table_name: dataPath,
          link: (text) => (
            <a href={dataTableUrl(dataPath)} target='_blank' rel='noopener noreferrer'>
              {text}
            </a>
          ),
        }}
      />
    );
    return (
      <div className='forecast-get-prediction-table'>
        <div css={styles.container}>
          <Text strong>
            <FormattedMessage
              defaultMessage='Load the Prediction Table'
              description='Title to load the prediction result'
            />
          </Text>
          <br />
          {outputDataTable}
        </div>
        <div className='automl-forecast-example-language-select'>
          <SegmentedControlGroup
            className='automl-forecast-active-toggle-1'
            value={codeLanguage}
            onChange={this.handleCodeLanguageChange}
          >
            <SegmentedControlButton
              value={SupportLanguages.SQL}
              data-testid='automl-prediction-select-sql'
            >
              SQL
            </SegmentedControlButton>
            <SegmentedControlButton
              value={SupportLanguages.PYTHON}
              data-testid='automl-prediction-select-python'
            >
              PYTHON
            </SegmentedControlButton>
          </SegmentedControlGroup>
        </div>
        <div css={styles.exampleCode} data-testid='automl-prediction-example-code-text'>
          <ForecastPredictionCodeExample clientLanguage={codeLanguage} dataPath={dataPath} />
        </div>
      </div>
    );
  }
}

const styles = {
  container: {
    marginTop: 20,
  },
  exampleCode: {
    width: '50%',
    padding: 1,
    position: 'relative',
    pre: { margin: 0 },
    '.du-bois-light-typography-copy': {
      position: 'absolute',
      top: 0,
      right: 0,
    },
  },
};
