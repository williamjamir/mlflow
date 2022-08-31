// Model Events V2 Table
import React from 'react';
import { injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import Utils from '../../common/utils/Utils';
import { StageTagComponents } from '../../model-registry/constants';
import { Table } from 'antd';

class ModelEventsV2TableImpl extends React.Component {
  static propTypes = {
    events: PropTypes.array,
    selectedVersionName: PropTypes.string,
    intl: PropTypes.shape({ formatMessage: PropTypes.func.isRequired }).isRequired,
  };

  getColumns = () => {
    const { selectedVersionName } = this.props;
    return [
      {
        title: this.props.intl.formatMessage({
          defaultMessage: 'Timestamp',
          description: 'Column title text for created at timestamp in model (version) events table',
        }),
        dataIndex: 'timestamp',
        key: 'timestamp',
        render: (creationTimestamp) => <span>{Utils.formatTimestamp(creationTimestamp)}</span>,
        width: 175,
      },
      {
        title: this.props.intl.formatMessage({
          defaultMessage: 'Event type',
          description: 'Column title text for event type in model version events table',
        }),
        dataIndex: 'type',
        key: 'type',
        width: 275,
      },
      ...(selectedVersionName === undefined
        ? [
            {
              title: this.props.intl.formatMessage({
                defaultMessage: 'Version',
                description: 'Column title text for version name in model version events table',
              }),
              dataIndex: 'endpoint_version_name',
              key: 'endpoint_version_name',
              width: 100,
            },
          ]
        : []),
      {
        title: this.props.intl.formatMessage({
          defaultMessage: 'Stage',
          description: 'Column title text for stage in model version events table',
        }),
        dataIndex: 'stage',
        key: 'stage',
        width: 100,
        render: (stage) => {
          const stageComp = stage ? StageTagComponents[stage] : '';
          return stageComp;
        },
      },
      {
        title: this.props.intl.formatMessage({
          defaultMessage: 'Message',
          description: 'Column title text for event message in model version events table',
        }),
        dataIndex: 'message',
        key: 'message',
      },
    ];
  };

  render() {
    const { events, selectedVersionName } = this.props;
    if (events === undefined) {
      return this.props.intl.formatMessage({
        defaultMessage: 'Loading...',
        description: 'Text to be displayed when waiting for RPC call to fetch events to return',
      });
    }
    const selectedEvents =
      selectedVersionName === undefined
        ? events
        : events.filter((x) => x.endpoint_version_name === selectedVersionName);

    return (
      <Table
        className='serving-events-table'
        rowClassName={(record, index) =>
          'serving-event-v2-row serving-event-v2-row-' + index.toString()
        }
        dataSource={selectedEvents}
        columns={this.getColumns()}
        pagination={false}
        size='middle'
        scroll={{ y: 600, x: '60vw' }}
      />
    );
  }
}

export const ModelEventsV2Table = injectIntl(ModelEventsV2TableImpl);
