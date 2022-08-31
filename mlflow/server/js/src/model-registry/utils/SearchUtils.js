import { REGISTERED_MODELS_SEARCH_NAME_FIELD } from '../constants';
import { resolveFilterValue } from '../actions';
// BEGIN-EDGE
import DatabricksUtils from '../../common/utils/DatabricksUtils';
// END-EDGE

export function getModelNameFilter(query) {
  if (query) {
    return `${REGISTERED_MODELS_SEARCH_NAME_FIELD} ilike ${resolveFilterValue(query, true)}`;
  } else {
    return '';
  }
}

// BEGIN-EDGE
export function getUserId() {
  return DatabricksUtils.getConf('userId');
}
// END-EDGE
export function getCombinedSearchFilter({
  query = '',
  // BEGIN-EDGE
  selectedOwnerFilter = OwnerFilter.ACCESSIBLE_BY_ME,
  selectedStatusFilter = StatusFilter.ALL,
  // END-EDGE
  // eslint-disable-nextline
} = {}) {
  const filters = [];
  const initialFilter = query.includes('tags.') ? query : getModelNameFilter(query);
  if (initialFilter) filters.push(initialFilter);
  // BEGIN-EDGE
  if (selectedStatusFilter === StatusFilter.SERVING_ENABLED) filters.push(`ext.served = 'true'`);
  if (selectedOwnerFilter === OwnerFilter.OWNED_BY_ME) {
    const userId = getUserId();
    filters.push(`userId = ${userId}`);
  }
  // END-EDGE
  return filters.join(' AND ');
}

export function constructSearchInputFromURLState(urlState) {
  if ('searchInput' in urlState) {
    return urlState['searchInput'];
  }
  if ('nameSearchInput' in urlState && 'tagSearchInput' in urlState) {
    return getModelNameFilter(urlState['nameSearchInput']) + ` AND ` + urlState['tagSearchInput'];
  }
  if ('tagSearchInput' in urlState) {
    return urlState['tagSearchInput'];
  }
  if ('nameSearchInput' in urlState) {
    return urlState['nameSearchInput'];
  }
  return '';
}
// BEGIN-EDGE
export const OwnerFilter = Object.freeze({
  OWNED_BY_ME: 'ownedByMe',
  ACCESSIBLE_BY_ME: 'accessibleByMe',
});

export const StatusFilter = Object.freeze({
  ALL: 'all',
  SERVING_ENABLED: 'serving_enabled',
});
// END-EDGE
