import React from 'react';
import PropTypes from 'prop-types';

import { CollapsibleSection } from '../../common/components/CollapsibleSection';
import { getServingModelKey } from '../utils';
import { FormattedMessage } from 'react-intl';
import { injectIntl } from 'react-intl';
import { ModelEventsV2Table } from './ModelEventsV2Table';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

// Serving V2 events view.
// TODO: merge with ModelEventsV2Table and move CollapsibleSection wrapper out to ServingV2Container
export class EventsViewImpl extends React.Component {
  static propTypes = {
    modelName: PropTypes.string.isRequired,
    endpointVersionName: PropTypes.string.isRequired,
    // redux state
    events: PropTypes.array,
  };

  render = () => {
    const { events, endpointVersionName } = this.props;
    return (
      <div className='servingv2-version-events-container'>
        <CollapsibleSection
          title={
            <FormattedMessage
              defaultMessage='Version events'
              description="Title text for version events section on model version's serving page"
            />
          }
        >
          <div className='serving-model-version-events-panel'>
            <ModelEventsV2Table events={events} selectedVersionName={endpointVersionName} />
          </div>
        </CollapsibleSection>
      </div>
    );
  };
}

const mapStateToProps = (state, ownProps) => {
  const { modelName } = ownProps;
  const servingModelKey = getServingModelKey(null, modelName);
  const events =
    state.entities.endpointEventHistoryV2 && state.entities.endpointEventHistoryV2[servingModelKey];
  return {
    events,
  };
};

export const EventsView = withRouter(connect(mapStateToProps)(injectIntl(EventsViewImpl)));
