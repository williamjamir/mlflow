import { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router';
import { getModelPageMonitoringRoute, PANES } from '../../model-registry/routes';

export function useActiveMonitor(monitors) {
  const { name, subpage } = useParams();
  const history = useHistory();
  const [activeMonitor, setActiveMonitor] = useState(
    name
      ? monitors.find((m) => m.config.monitor_name === name)
      : monitors.length > 0 && monitors[0],
  );
  const [activeKey, setActiveKey] = useState(activeMonitor?.key);

  useEffect(() => {
    setActiveMonitor(monitors.find((tag) => tag.key === activeKey));
  }, [activeKey, monitors]);

  useEffect(() => {
    if (!activeMonitor) {
      return;
    }

    const { config = {} } = activeMonitor;
    const { model_name: modelName, monitor_name: monitorName } = config;

    if (subpage === PANES.MONITORING && monitorName !== name) {
      history.push(getModelPageMonitoringRoute(modelName, monitorName));
    }
  }, [activeMonitor, name, subpage, history]);

  return {
    monitorName: name,
    activeKey,
    activeMonitor,
    setActiveKey,
  };
}
