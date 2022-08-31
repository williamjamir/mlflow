import React from 'react';
import { PropTypes } from 'prop-types';

import { Tooltip, Typography } from '@databricks/design-system';

const { Text } = Typography;

export function TopValuesList({ list, limit = list.length }) {
  const listValues = list.map((item) => item.item);
  const values = listValues.slice(0, Math.floor(limit));
  if (list.length > limit) {
    const remaining = list.length - limit;
    values.push(`Other values (${remaining})`);
  }
  return (
    <div
      css={{
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}
    >
      <Tooltip title={values.join(', ')}>
        <Text color='secondary'>{values.join(', ')}</Text>
      </Tooltip>
    </div>
  );
}

TopValuesList.propTypes = {
  list: PropTypes.arrayOf(PropTypes.shape({ item: PropTypes.string, count: PropTypes.number }))
    .isRequired,
  limit: PropTypes.number,
};
