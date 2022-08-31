// Model Events Table
import React from 'react';
import PropTypes from 'prop-types';
import Utils from '../../common/utils/Utils';
import { Table } from 'antd';

export class ModelEventsTable extends React.Component {
  static propTypes = {
    events: PropTypes.array,
  };

  render() {
    const { events } = this.props;
    if (events === undefined) {
      return 'Loading...';
    }

    const columns = [
      {
        title: 'Timestamp',
        dataIndex: 'timestamp',
        key: 'timestamp',
        render: (creationTimestamp) => <span>{Utils.formatTimestamp(creationTimestamp)}</span>,
        width: 175,
      },
      {
        title: 'Event Type',
        dataIndex: 'event_type',
        key: 'event_type',
        width: 175,
      },
      {
        title: 'Version',
        dataIndex: 'endpoint_version_name',
        key: 'endpoint_version_name',
        width: 100,
      },
      {
        title: 'Message',
        dataIndex: 'message',
        key: 'message',
      },
    ];
    const rows = events.filter((x) => !x.internal);
    return (
      <Table
        className='serving-events-table'
        rowClassName={(record, index) => 'serving-event-row serving-event-row-' + index.toString()}
        dataSource={rows}
        columns={columns}
        pagination={false}
        size='middle'
        scroll={{ y: 600, x: '80vw' }}
      />
    );
  }
}
