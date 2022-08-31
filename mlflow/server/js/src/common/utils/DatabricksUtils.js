// This file contains general-purpose utils specific to Databricks. The file is not included in the
import { registerRecent } from '@databricks/web-shared-bundle/recents';
// OSS repo.

export const HEADER_DATABRICKS_ORG_ID = 'X-Databricks-Org-Id';
export const HEADER_DATABRICKS_CSRF_TOKEN = 'X-CSRF-Token';

class DatabricksUtils {
  static isMessageFromSameOrigin(messageEvent) {
    // For Chrome, the origin property is in the event.originalEvent object.
    const origin = messageEvent.origin || messageEvent.originalEvent.origin;
    return window.location.origin === origin;
  }

  static isCloneRunUIEnabled() {
    // TODO(ZhangW) [ML-11636] Added the view spec button & view cluster config UI
    //  & [ML-11522] Add "attach to cluster" step
    // Move this to databricks-edge before View Cluster Config PR is out
    // eslint-disable-next-line no-restricted-globals
    const { enableMlflowCloneRunUI } = top.settings || {};
    return enableMlflowCloneRunUI === true;
  }

  static isAclCheckEnabledForModelRegistry() {
    if (!DatabricksUtils.isAclCheckEnabledForWorkspace()) {
      return false;
    }
    // TODO(Zangr) 2019-10-16 Non OSS feature flags should only be checked in databricks-edge files.
    // Move this to databricks-edge folder before OSS model registry PR is out.
    /* eslint-disable no-restricted-globals */
    const { aclChecksEnabledForModelRegistryInCurrentWorkspace } = top.settings || {};
    /* eslint-disable no-restricted-globals */
    return aclChecksEnabledForModelRegistryInCurrentWorkspace === true;
  }

  static isAclCheckEnabledForWorkspace() {
    /* eslint-disable no-restricted-globals */
    const { enableWorkspaceAclsConfig } = top.settings || {};
    /* eslint-disable no-restricted-globals */
    return enableWorkspaceAclsConfig === true;
  }

  static isRegistryWidePermissionsEnabledForModelRegistry() {
    // eslint-disable-next-line no-restricted-globals
    const { isModelRegistryWidePermissionsEnabledInCurrentWorkspace } = top.settings || {};
    // Only return true when it's set explicitly to a boolean true
    return isModelRegistryWidePermissionsEnabledInCurrentWorkspace === true;
  }

  static isGenerateBatchInferenceNotebookEnabled() {
    // eslint-disable-next-line no-restricted-globals
    const { isGenerateBatchInferenceNotebookEnabledInCurrentWorkspace } = top.settings || {};
    // Only return true when it's set explicitly to a boolean true
    return isGenerateBatchInferenceNotebookEnabledInCurrentWorkspace === true;
  }

  static isArtifactAclsEnabled() {
    // eslint-disable-next-line no-restricted-globals
    const { isMlflowExperimentArtifactAclsEnabledInCurrentWorkspace } = top.settings || {};
    // Only return true when it's set explicitly to a boolean true
    return isMlflowExperimentArtifactAclsEnabledInCurrentWorkspace === true;
  }

  static isNestedRunDeletionEnabled() {
    /* eslint-disable no-restricted-globals */
    const { isMlflowNestedRunDeletionEnabled } = top.settings || {};
    return isMlflowNestedRunDeletionEnabled === true;
  }

  static isExperimentObservatoryEnabled() {
    /* eslint-disable no-restricted-globals */
    const { enableExperimentObservatory } = top.settings || {};
    return enableExperimentObservatory === true;
  }

  static artifactDownloadEnabled() {
    if (top.settings) {
      return top.settings.mlflowRunArtifactDownloadEnabled === true;
    } else {
      return true; // true by default
    }
  }

  static isModelServingEnabled() {
    // eslint-disable-next-line no-restricted-globals
    const { isModelServingEnabledInCurrentWorkspace } = top.settings || {};
    return isModelServingEnabledInCurrentWorkspace === true;
  }

  static modelServingEndpointCreationEnabled() {
    if (top.settings) {
      return top.settings.mlflowModelServingEndpointCreationEnabled === true;
    } else {
      return true; // true by default
    }
  }

  static modelServingV2AvailableInCurrentWorkspace() {
    if (top.settings) {
      return top.settings.isModelServingV2AvailableInCurrentWorkspace === true;
    } else {
      return false;
    }
  }

  static modelServingV2EndpointCreationEnabled() {
    // eslint-disable-next-line no-restricted-globals
    const { mlflowModelServingV2EndpointCreationEnabled } = top.settings || {};
    return mlflowModelServingV2EndpointCreationEnabled === true;
  }

  static modelRegistryEmailNotificationsEnabledInShard() {
    if (top.settings) {
      return top.settings.enableModelRegistryEmailNotificationsInShard === true;
    } else {
      return false;
    }
  }

  static modelRegistryEmailNotificationsEnabledForWorkspace() {
    if (top.settings) {
      return top.settings.mlflowModelRegistryEmailNotificationsEnabled === true;
    } else {
      return false;
    }
  }

  static modelRegistryEmailNotificationsEnabled() {
    return (
      this.modelRegistryEmailNotificationsEnabledForWorkspace() &&
      this.modelRegistryEmailNotificationsEnabledInShard()
    );
  }

  static autoMLEnabled() {
    if (top.settings) {
      return top.settings.autoMLEnabled === true;
    } else {
      return false; // false by default
    }
  }

  static isMlflowDatabricksGitLineageEnabled() {
    if (top.settings) {
      return top.settings.isMlflowDatabricksGitLineageEnabled === true;
    } else {
      return false; // false by default
    }
  }

  static getCloudProvider = () => top.settings && top.settings.cloud;

  // Add an mlflow route to the databricks recent route store if it exists, no-op otherwise
  static addToRecents(routeType, routeID) {
    const recentsTracker = top && top.router && top.router.recentViewRoutesByType;
    if (recentsTracker) {
      recentsTracker.add(routeType, routeID);
    }
  }

  static registerRecent(data) {
    try {
      registerRecent(data);
    } catch (e) {
      console.error(e);
    }
  }

  static logClientSideEvent(eventType, eventName) {
    top.recordEvent &&
      top.recordEvent('clientsideEvent', {
        eventType,
        eventName,
      });
  }

  // get the current workspace id
  static getCurrentWorkspaceId = () => top.settings && top.settings.currentWorkspaceId;

  /**
   * Function extracting CSRF token from either local or top window settings
   */
  static getCSRFToken = () => {
    return window.settings?.csrfToken || window.top?.settings?.csrfToken;
  };

  /**
   * Function extracting organization ID from either local or top window settings
   *
   * TODO(ML-23460) - update it with web-shared getOrgId function after next bundle
   * regeneration (or code-sharing enabled)
   */
  static getOrgID() {
    return window.settings?.orgId || window.top?.settings?.orgId;
  }

  static getConf = (key, defaultValue = undefined) => {
    if (top.settings && top.settings.hasOwnProperty(key)) {
      return top.settings[key];
    } else {
      return defaultValue;
    }
  };
}

export default DatabricksUtils;
