import React from 'react';
import PropTypes from 'prop-types';
import { getModelServingDocsUri, Tooltip } from '../utils';
import { aliasType } from './ServingPropTypes';
import { Spacer, Typography, WithDesignSystemThemeHoc } from '@databricks/design-system';

const { Text } = Typography;

export class ModelUrlContainerImpl extends React.Component {
  static propTypes = {
    modelName: PropTypes.string.isRequired,
    endpointVersionName: PropTypes.string.isRequired,
    aliases: PropTypes.arrayOf(aliasType),
    invocationPathPrefix: PropTypes.string.isRequired,
    designSystemThemeApi: PropTypes.any.isRequired,
  };

  modelUrlsTooltipContent = (
    <div className='serving-tooltip-content'>
      <p>
        Use these endpoints to query your model using API token authentication.
        <br />
        See the&nbsp;
        <a
          href={getModelServingDocsUri() + '#score-deployed-model-versions'}
          target='_blank'
          rel='noopener noreferrer'
        >
          serving documentation
        </a>
        &nbsp;for example request structure.
      </p>
      <p>
        Every version can be called using its model version number. Additionally, the latest version
        of each stage (e.g., "Production") can be callable using this alias, which can be used as a
        stable identifier by clients.
      </p>
    </div>
  );

  render() {
    const { modelName, endpointVersionName, aliases, invocationPathPrefix } = this.props;
    const urlPrefix = 'https://' + window.location.host + invocationPathPrefix;
    const modelUrls = [
      urlPrefix + encodeURIComponent(modelName) + '/' + endpointVersionName + '/invocations',
    ];
    aliases.forEach((alias) => {
      modelUrls.push(urlPrefix + encodeURIComponent(modelName) + '/' + alias + '/invocations');
    });

    const EllipsisMiddle = ({ children }) => {
      // Make sure UI does not crash if children is undefined.
      if (!children) {
        return null;
      }
      const suffixCount = Math.floor(children.length / 2);
      const start = children.slice(0, children.length - suffixCount).trim();
      const suffix = children.slice(-suffixCount).trim();
      return (
        <Text
          data-testid='serving-model-urls'
          ellipsis={{ suffix }}
          dangerouslySetAntdProps={{ copyable: { text: children } }}
        >
          {start}
        </Text>
      );
    };

    const renderedModelUrls = modelUrls.map((url) => (
      <div>
        <EllipsisMiddle>{url}</EllipsisMiddle>
      </div>
    ));

    return (
      <div className='serving-model-url-container'>
        <Text color='secondary'>
          Model URL:
          <Tooltip contents={this.modelUrlsTooltipContent} />
        </Text>
        <Spacer size='small' />
        <div css={servingModelUrlsStyles}>{renderedModelUrls}</div>
      </div>
    );
  }
}

const servingModelUrlsStyles = {
  '.serving-model-urls': {
    width: '100%',
  },
};

export const ModelUrlContainer = WithDesignSystemThemeHoc(ModelUrlContainerImpl);
