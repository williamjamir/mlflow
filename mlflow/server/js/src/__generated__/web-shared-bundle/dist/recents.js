import _orderBy from 'lodash/orderBy';
import _groupBy from 'lodash/groupBy';
import { g as getCSRFToken } from './getCSRFToken-c6ef80ad.js';

const fetchEndpoint = async function (url) {
  let {
    method,
    headers,
    ...args
  } = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  return fetch(url, {
    method,
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': getCSRFToken(),
      ...headers
    },
    ...args
  });
};

const GET_NOTEBOOKS_URL = '/ajax-api/2.0/tree/get-node';
const LIST_MODELS_URL = '/ajax-api/2.0/mlflow/databricks/registered-models/list-by-id';
function getNotebooksURL(id) {
  return "".concat(GET_NOTEBOOKS_URL, "/?id=").concat(id);
}
function getListModelsURL() {
  return LIST_MODELS_URL;
}
async function retrieveValidNotebooks(recentsGroup) {
  const rawNotebooks = await Promise.all(recentsGroup.map(recent => fetchEndpoint(getNotebooksURL(recent.id))));
  return Promise.all(rawNotebooks.map(async (res, index) => {
    const matchingRecent = recentsGroup[index];

    if (!res.ok) {
      if (res.status === 404) {
        return undefined; // Don't throw in case of 404
      }

      throw new Error('Unexpected Error in API Request');
    }

    const notebook = await res.json();

    if (notebook.info.is_deleted) {
      return undefined;
    }

    const path = notebook.info.full_path;
    return { ...matchingRecent,
      name: path.substring(path.lastIndexOf('/') + 1)
    };
  }));
}
function retrieveValidExperiments(recentsGroup) {
  const namedExperiments = recentsGroup.map(recent => ({ ...recent,
    name: 'sampleExperiment'
  }));
  return new Promise(res => setTimeout(() => res(namedExperiments), 45));
}
async function retrieveValidModels(recentsGroup) {
  var _bulkResponse$registe;

  const ids = recentsGroup.map(rec => rec.id);
  const rawModels = await fetchEndpoint(getListModelsURL(), {
    method: 'POST',
    body: JSON.stringify({
      ids: ids
    })
  });

  if (!rawModels.ok) {
    if (rawModels.status !== 404) {
      throw new Error('Unexpected Error in API Request');
    }

    return [];
  }

  const bulkResponse = await rawModels.json();
  return (_bulkResponse$registe = bulkResponse.registered_models_databricks) === null || _bulkResponse$registe === void 0 ? void 0 : _bulkResponse$registe.map(res => {
    const found = recentsGroup.find(recent => recent.id === res.id);

    if (!found) {
      return undefined;
    }

    return { ...found,
      name: res.name
    };
  });
}
function retrieveValidFeatureTables(recentsGroup) {
  const namedFeatureTables = recentsGroup.map(recent => ({ ...recent,
    name: 'sampleFeatureTable'
  }));
  return new Promise(res => setTimeout(() => res(namedFeatureTables), 15));
}

// Only asset types defined here will show in recents table
let AssetType;

(function (AssetType) {
  AssetType["NOTEBOOK"] = "notebook";
  AssetType["EXPERIMENT"] = "experiment";
  AssetType["MODEL"] = "model";
  AssetType["ENDPOINT"] = "endpoint";
  AssetType["FEATURE_TABLE"] = "featureTable";
  AssetType["FILE"] = "file";
  AssetType["QUERY"] = "query";
  AssetType["ALERT"] = "alert";
  AssetType["DASHBOARD"] = "dashboard";
  AssetType["WORKFLOW"] = "workflow";
})(AssetType || (AssetType = {}));

/**
 * @throws if window.settings, or its user and orgId keys are undefined
 * @returns {string} cache key containing user ID, org ID, 'recents' tag
 */
function getCacheKey() {
  const settings = window.settings || window.top.settings;

  if (!(settings !== null && settings !== void 0 && settings.hasOwnProperty('user')) || !(settings !== null && settings !== void 0 && settings.hasOwnProperty('orgId'))) {
    throw new Error('Invalid environment for recents: user ID or org ID not found');
  }

  return "".concat(settings.user, "-").concat(settings.orgId, "-recents");
}

/**
 * Adds a recently opened asset to local storage cache.
 */
function registerRecent(_ref) {
  let {
    id,
    type
  } = _ref;
  const recent = {
    id,
    type,
    lastAccessedTimestamp: Date.now()
  };
  const recentAssets = getRecents();
  const updatedRecents = [recent, ...recentAssets.filter(asset => asset.id !== id || asset.type !== type)];
  setRecents(updatedRecents);
  return recent;
}
/**
 * Reads local storage to see if the recents cache key is present. If it is,
 * returns the resulting array; otherwise returns an empty array.
 * @returns an array of Recent objects
 */

function getRecents() {
  const saved = window.localStorage.getItem(getCacheKey());

  if (saved !== null) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      return [];
    }
  }

  return [];
}

function setRecents(updated) {
  window.localStorage.setItem(getCacheKey(), JSON.stringify(updated));
}
/**
 * Performs the necessary api calls based on asset type.
 * Calls the corresponding helper function for each type, which gets the most recent name for each entry,
 * and removes all assets not found in the API response.
 * @returns The aggregated output of the n most recent valid assets, sorted by lastAccessedTimestamp
 */


async function retrieveAndValidate() {
  let numRecents = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 15;
  const recents = getRecents();
  const slicedRecents = recents.slice(0, numRecents);
  const remaining = recents.slice(numRecents);

  const grouped = _groupBy(slicedRecents, recent => recent.type);

  const promises = [];
  Object.keys(grouped).forEach(type => {
    const recentsGroup = grouped[type];

    switch (type) {
      case AssetType.NOTEBOOK:
        {
          promises.push(retrieveValidNotebooks(recentsGroup));
          break;
        }

      case AssetType.EXPERIMENT:
        {
          promises.push(retrieveValidExperiments(recentsGroup));
          break;
        }

      case AssetType.MODEL: // Models and Endpoints use the same API for retrieval

      case AssetType.ENDPOINT:
        {
          promises.push(retrieveValidModels(recentsGroup));
          break;
        }

      case AssetType.FEATURE_TABLE:
        {
          promises.push(retrieveValidFeatureTables(recentsGroup));
          break;
        }
    }
  });
  let flattened;

  try {
    flattened = (await Promise.all(promises)).flat();
  } catch (e) {
    console.error('Recents failed to load');
    return [];
  }

  const valid = flattened.filter(res => res !== undefined);

  const output = _orderBy(valid, ['lastAccessedTimestamp'], ['desc']);

  const updated = output.map(_ref2 => {
    let {
      id,
      type,
      lastAccessedTimestamp
    } = _ref2;
    return {
      id,
      type,
      lastAccessedTimestamp
    };
  }) // convert DetailedRecent to Recent
  .concat(remaining);
  setRecents(updated);
  return output;
}

export { AssetType, getRecents, registerRecent, retrieveAndValidate };
//# sourceMappingURL=recents.js.map
