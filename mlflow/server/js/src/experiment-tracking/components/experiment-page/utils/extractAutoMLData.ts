import { camelCase, upperCase } from 'lodash';
import { ExperimentEntity } from '../../../types';
import { AUTOML_TAG_PREFIX } from '../../automl/AutoMLExperimentPanelPage';
import {
  AUTOML_WARNING_PREFIX,
  AUTOML_WARNING_PREFIX_DEPRECATED,
  WARNING_NAMES,
} from '../../automl/AutoMLWarningDashboard';

type WarningSeverityType = 'HIGH' | 'MEDIUM' | 'LOW';

interface WarningType {
  version: number;
  severity: WarningSeverityType;
  name: string;
  affected: {
    values: { id: string; type: string | null }[];
    others: number;
  };
}

export type AutoMLExtractResult = {
  warnings: WarningType[];
  [k: string]: any;
};

/**
 * Function used to map the data type originating from experiment tags
 * to match model used by AutoML service.
 */
const mapExperimentTagsDataToAutoMLFormat = ({ key, value }: { key: string; value: string }) => {
  switch (key) {
    // If the evaluation metric is better if higher then we want to order
    // the runs by desc order so order by asc is false
    case 'evaluationMetricOrderByAsc': {
      return {
        key: 'evaluationMetricHigherIsBetter',
        value: !(value === 'True'),
      };
    }
    // Service has a different name for this key
    case 'startTime': {
      return {
        key: 'startTimeSeconds',
        value: value,
      };
    }
    // Service has a different name for this key
    case 'errorMessage': {
      return {
        key: 'jobRunErrorMessage',
        value: value,
      };
    }
    // Service returns the value as upper case since it's a proto enum
    case 'problemType': {
      return {
        key: 'problemType',
        value: value.toUpperCase(),
      };
    }
  }
  return {
    key,
    value,
  };
};

/**
 * Returns true if key indicates an AutoML warning
 */
const isAutoMLWarningKey = (key: string) =>
  key.startsWith(AUTOML_WARNING_PREFIX) || key.startsWith(AUTOML_WARNING_PREFIX_DEPRECATED);

/**
 * Extracts AutoML warning from experiment tags
 */
const extractAutoMLWarning = ({ key, value }: { key: string; value: string }) => {
  const prefix = key.startsWith(AUTOML_WARNING_PREFIX)
    ? AUTOML_WARNING_PREFIX
    : AUTOML_WARNING_PREFIX_DEPRECATED;

  const warningName = camelCase(key.substring(prefix.length + 1));
  if (Object.values(WARNING_NAMES).includes(warningName)) {
    try {
      const warningValue = JSON.parse(value);

      return {
        name: warningName,
        ...warningValue,
        /**
         * Some of the keys and values obtained from the tags for the warnings
         * need to be changed to match the data returned by the AutoML service:
         * severity needs to be uppercase.
         */
        severity: upperCase(warningValue.severity) as WarningSeverityType,
      } as WarningType;
    } catch {
      // Swallow the exception if value JSON is malformed, do not push warning
    }
  }
  return null;
};

/**
 * Extracts AutoML data from experiment tags. This mechanism is used if
 * the separate AutoML service is not available.
 */
export const extractAutoMLData = (experiment: ExperimentEntity) => {
  const autoMLResult: AutoMLExtractResult = {
    warnings: [],
  };

  for (const { key, value } of experiment.tags) {
    if (!key || !value) {
      continue;
    }
    if (isAutoMLWarningKey(key)) {
      const warningData = extractAutoMLWarning({ key, value });
      if (warningData) {
        autoMLResult.warnings.push(warningData);
      }
    } else if (key.startsWith(AUTOML_TAG_PREFIX)) {
      // Tag `_databricks_automl` will have an empty substring hence we pass `automl` to camelCase instead
      const extractedKey = key.substring(AUTOML_TAG_PREFIX.length + 1) || 'automl';
      const camelCaseKey = camelCase(extractedKey);

      // Override the key and values if required
      const finalKeyValue = mapExperimentTagsDataToAutoMLFormat({
        key: camelCaseKey,
        value,
      });

      autoMLResult[finalKeyValue.key] = finalKeyValue.value;
    }
  }
  return autoMLResult;
};
