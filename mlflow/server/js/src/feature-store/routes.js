import qs from 'qs';

const FEATURE_STORE_ROOT_ROUTE = '/';
const FEATURE_STORE_BASE_ROUTE = '/feature-store';
const FEATURE_TABLE_DETAIL_ROUTE = '/feature-store/:tableName';

export const getTableDetailPageRoute = (tableName) =>
  `/feature-store/${encodeURIComponent(tableName)}`;

const ONLINE_STORE = '/feature-store/online-stores/get';
export const getOnlineStorePageRoute = (
  featureTableName,
  name,
  cloud,
  storeType,
  tableArn,
  containerUri,
) =>
  ONLINE_STORE +
  '?' +
  qs.stringify({
    featureTableName,
    name,
    cloud,
    storeType,
    tableArn,
    containerUri,
  });

const FEATURE_PAGE = '/feature-store/:tableName/features/:featureName';
export const getFeaturePageRoute = (tableName, featureName) =>
  `/feature-store/${encodeURIComponent(tableName)}/features/${encodeURIComponent(featureName)}`;

export const FeatureStoreRoutes = Object.freeze({
  ROOT: FEATURE_STORE_ROOT_ROUTE,
  BASE: FEATURE_STORE_BASE_ROUTE,
  TABLE_DETAIL: FEATURE_TABLE_DETAIL_ROUTE,
  ONLINE_STORE: ONLINE_STORE,
  FEATURE_PAGE: FEATURE_PAGE,
});
