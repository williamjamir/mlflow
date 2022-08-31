import DatabricksUtils from '../../common/utils/DatabricksUtils';
import { getUUID } from './ActionUtils';

export const MLFLOW_IPC_REQUEST_ID_FIELD = 'mfeApiRequestId';
export const MLFLOW_IPC_RESPONSE_ID_FIELD = 'mfeApiResponseId';

/**
 * The client encapsulates message passing between the iframe (mlflow) and parent frame (universe).
 *
 * Client can either send() messages to the parent frame and forget it, or request() them
 * which returns a promise. The promise is resolved or rejected when the client receives
 * response from the parent frame. The messages / response are matched by their uuids.
 */
class UniverseFrontendClient {
  #pendingMessageHandlers = {};
  #initialized = false;

  #initialize() {
    this.#initialized = true;
    window.addEventListener('message', (message) => this._receive(message));
  }

  // exposed for testing.
  _receive(message) {
    if (!DatabricksUtils.isMessageFromSameOrigin(message)) return;
    const { [MLFLOW_IPC_RESPONSE_ID_FIELD]: responseId } = message.data;
    if (responseId !== undefined) {
      const responseHandler = this.#pendingMessageHandlers[responseId];
      if (responseHandler) {
        responseHandler(message);
      }
    }
  }

  /**
   * A method for the one-way communication: send a message to the overarching
   * frame/app but do not expect an answer.
   */
  send(messageData) {
    const id = getUUID();
    window.parent.postMessage(
      {
        [MLFLOW_IPC_REQUEST_ID_FIELD]: id,
        ...messageData,
      },
      window.parent.location.origin,
    );

    return id;
  }

  /**
   * A method for the two-way communication: send a request to the overarching
   * frame/app and then expect an answer in the Promise form. Optionally you can
   * set a timeout using `timeoutMs` parameter.
   */
  request(messageData, timeoutMs = 0) {
    if (!this.#initialized) {
      this.#initialize();
    }
    const messageId = this.send(messageData);

    const promise = new Promise((resolve, reject) => {
      this.#pendingMessageHandlers[messageId] = (message) => {
        const { payload, error } = message.data;
        if (error) {
          reject(typeof error === 'object' ? error : new Error(error));
        } else {
          resolve(payload);
        }
        delete this.#pendingMessageHandlers[messageId];
      };

      if (timeoutMs > 0) {
        setTimeout(() => {
          if (this.#pendingMessageHandlers[messageId] !== undefined) {
            delete this.#pendingMessageHandlers[messageId];
            reject(new Error(`Request timed out after ${timeoutMs / 1000.0} seconds.`));
          }
        }, timeoutMs);
      }
    });
    promise._message_id = messageId;
    return promise;
  }
}

// Exported for tests only. Use UniverseFrontendApis wrapper instead.
export const _client = new UniverseFrontendClient();

/**
 * APIs that can be called in the Webapp.
 *
 * NB: Make sure the list of APIs is in sync with IPC handlers in the Webapp.
 * To add a new API, you need to add a handler for your message type to
 * MfeIpcBroker instance in either MLFlow or Feature Store initialization code.
 */
export class UniverseFrontendApis {
  static getCreateClusterPermissions() {
    return _client.request(
      {
        type: 'MLFLOW_UNIVERSE_FRONTEND_API_REQUEST',
        api: 'GET_CREATE_SERVING_CLUSTER_PERMISSION',
      },
      3000,
    );
  }
  static updateTitle(payload) {
    return _client.send({
      type: 'UPDATE_TITLE',
      ...payload,
    });
  }
  static renameExperiment(payload) {
    return _client.request({
      type: 'RENAME_EXPERIMENT',
      ...payload,
    });
  }

  static deleteExperiment(payload) {
    return _client.request({
      type: 'DELETE_EXPERIMENT',
      ...payload,
    });
  }

  static editNotebookPermission(payload) {
    return _client.request({
      type: 'EDIT_NOTEBOOK_PERMISSION',
      ...payload,
    });
  }

  static editExperimentPermission(payload) {
    return _client.request({
      type: 'EDIT_EXPERIMENT_PERMISSION',
      ...payload,
    });
  }

  static editRegisteredModelPermission(payload) {
    return _client.request({
      type: 'EDIT_REGISTERED_MODEL_PERMISSION',
      ...payload,
    });
  }

  static editFeatureTablePermission(payload) {
    return _client.request({
      type: 'EDIT_FEATURE_TABLE_PERMISSION',
      ...payload,
    });
  }

  static showCloneRunModal(payload) {
    return _client.send({
      type: 'SHOW_CLONE_RUN_MODAL',
      ...payload,
    });
  }

  static showDataSelectorModal() {
    return _client.request({
      type: 'SHOW_DATA_SELECTOR_MODAL',
    });
  }

  static showFileBrowserModal(payload) {
    return _client.request({
      type: 'SHOW_FILE_BROWSER_MODAL',
      ...payload,
    });
  }

  static trackingEvent(payload) {
    return _client.send({
      type: 'MLFLOW_TRACKING_EVENT',
      ...payload,
    });
  }

  static interactionEvent(payload) {
    return _client.send({
      type: 'MLFLOW_INTERACTION_EVENT',
      ...payload,
    });
  }
}
