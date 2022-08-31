import { Skeleton, Table } from '@databricks/design-system';
import { useEffect, useState } from 'react';

export const ExperimentViewRunsTable = () => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setTimeout(() => setLoaded(true), 1000);
  }, []);

  return (
    <div css={{ margin: 5, padding: 5, backgroundColor: 'rgba(0,0,0,0.1)' }}>
      Experiment View Runs Table
      {loaded ? <Table pagination={false} dataSource={[{ foo: 'bar' }]} /> : <Skeleton active />}
    </div>
  );
};
