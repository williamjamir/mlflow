import React from 'react';
import PropTypes from 'prop-types';
import { Empty } from 'antd';
import { Button } from '@databricks/design-system';
import emptyStateImage from '../../common/static/empty_state.svg';
import { Spacer } from '../../shared/building_blocks/Spacer';
import { getModelPageRoute } from '../../model-registry/routes';
import { withRouter } from 'react-router-dom';

class ServingV2EmptyStateImpl extends React.Component {
  static propTypes = {
    modelName: PropTypes.string.isRequired,
    emptyStateHeader: PropTypes.string.isRequired,
    emptyStateText: PropTypes.string,
    dataTestId: PropTypes.string,
    history: PropTypes.object.isRequired,
  };

  render() {
    const { emptyStateHeader, emptyStateText, dataTestId } = this.props;
    return (
      <div css={emptyStateStyles} data-test-id={dataTestId}>
        <Empty
          className='empty-state-container'
          image={emptyStateImage}
          imageStyle={{
            height: 80,
          }}
          description={<b>{emptyStateHeader}</b>}
        >
          <Spacer direction='vertical' size='small'>
            <div data-test-id='empty-state-text' className='empty-state-recommendation'>
              {emptyStateText}
            </div>
            <Button
              type='link'
              onClick={() => this.props.history.push(getModelPageRoute(this.props.modelName))}
            >
              View Model Details
            </Button>
          </Spacer>
        </Empty>
      </div>
    );
  }
}

const emptyStateStyles = {
  '.empty-state-container': {
    paddingTop: '50px',
  },
};

export const ServingV2EmptyState = withRouter(ServingV2EmptyStateImpl);
