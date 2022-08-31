import { getJson, postJson } from '../../../common/utils/FetchUtils';

const AJAX_API = 'ajax-api/2.0';

export default class AutoMLService {
  static cancelAutoMLExperiment = (experimentId) =>
    postJson({
      relativeUrl: `${AJAX_API}/automl/experiments/${experimentId}/cancel`,
      data: {},
    });

  static getAutoMLExperiment = (experimentId) =>
    getJson({
      relativeUrl: `${AJAX_API}/automl/experiments/${experimentId}`,
      data: {},
    });

  static getAutoMLWarnings = (experimentId) =>
    getJson({
      relativeUrl: `${AJAX_API}/automl/experiments/${experimentId}/warnings`,
      data: {},
    });
}
