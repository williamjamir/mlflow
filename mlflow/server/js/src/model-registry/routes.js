export const modelListPageRoute = '/models';
export const modelPageRoute = '/models/:modelName';
export const modelSubpageRoute = '/models/:modelName/:subpage';
export const modelSubpageRouteWithName = '/models/:modelName/:subpage/:name';
export const modelVersionPageRoute = '/models/:modelName/versions/:version';
export const compareModelVersionsPageRoute = '/compare-model-versions';
export const getModelPageRoute = (modelName) => `/models/${encodeURIComponent(modelName)}`;
// BEGIN-EDGE
export const createModelPageRoute = '/createModel';
export const getModelPageServingRoute = (modelName) =>
  `/models/${encodeURIComponent(modelName)}/${PANES.SERVING}`;
export const getModelPageMonitoringRoute = (modelName, monitorName = '') =>
  monitorName
    ? `/models/${encodeURIComponent(modelName)}/${PANES.MONITORING}/${encodeURIComponent(
        monitorName,
      )}`
    : `/models/${encodeURIComponent(modelName)}/${PANES.MONITORING}`;
// END-EDGE
export const getModelVersionPageRoute = (modelName, version) =>
  `/models/${encodeURIComponent(modelName)}/versions/${version}`;
// replace undefined values with null, since undefined is not a valid JSON value
export const getCompareModelVersionsPageRoute = (modelName, runsToVersions) =>
  `/compare-model-versions?name=${JSON.stringify(encodeURIComponent(modelName))}` +
  `&runs=${JSON.stringify(runsToVersions, (k, v) => (v === undefined ? null : v))}`;
export const PANES = Object.freeze({
  DETAILS: 'details',
  SERVING: 'serving',
  // BEGIN-EDGE
  MONITORING: 'monitoring',
  // END-EDGE
});
