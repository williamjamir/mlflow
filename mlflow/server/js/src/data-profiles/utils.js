import _ from 'lodash';
import Utils from '../common/utils/Utils';

export const MINIMUM_PERCENTAGE_THRESHOLD = 0.05;

// TODO: add exact spark data types when real data is returned.
export const CATEGORICAL_TYPES = ['STRING', 'string'];
export const NUMERIC_TYPES = ['DOUBLE', 'double'];

function extractKeysIntoCamelCase(data, keys = []) {
  const pickedObject = _.pick(data, keys);
  return _.mapKeys(pickedObject, (v, key) => _.camelCase(key));
}

// TODO: add tests to this after more defined structure. currently only used in storybook
function extractCategoricalData(rawData) {
  const baseCategoricalData = extractKeysIntoCamelCase(rawData, [
    'count',
    'num_nulls',
    'distinct_count',
    'frequent_items',
    'min_length',
    'max_length',
    'avg_length',
  ]);
  const { numNulls, count, frequentItems } = baseCategoricalData;
  const nullPercentage = (numNulls / Math.max(count, 1)) * 100;
  const frequentList = frequentItems.sort((a, b) => b.count - a.count);

  return {
    ...baseCategoricalData,
    nullPercentage,
    frequentList,
    topFrequency: frequentList[0].count,
  };
}

function extractNumericalData(rawData, profileName) {
  const baseData = extractKeysIntoCamelCase(rawData, [
    'avg',
    'count',
    'distinct_count',
    'frequent_items',
    'max',
    'min',
    'num_nan',
    'num_nulls',
    'quantiles',
    'stddev',
  ]);
  const { numNulls, count, quantiles, frequentItems } = baseData;
  const nullPercentage = (numNulls / Math.max(count, 1)) * 100;
  const numBuckets = Math.min(frequentItems.length, 20); // Move to backend?

  return {
    ...baseData,
    nullPercentage,
    numBuckets,
    quantilesData: {
      group: profileName,
      quantiles,
      totalFreq: count,
    },
  };
}

// TODO: add tests to this after more defined structure. currently only used in storybook
export function extractData(rawDataArray = []) {
  const dict = {};
  rawDataArray.forEach((profile) => {
    const { column_profiles: features, profile_name, window_granularity } = profile;
    const profileName = profile_name || window_granularity;
    features.forEach((blob) => {
      let feature = blob;
      if (typeof feature === 'string') {
        feature = JSON.parse(blob);
      }
      const { column_name, data_type } = feature;

      let datum;
      if (CATEGORICAL_TYPES.includes(data_type)) {
        datum = {
          profileName,
          ...extractCategoricalData(feature),
        };
      } else if (NUMERIC_TYPES.includes(data_type)) {
        datum = {
          profileName,
          ...extractNumericalData(feature, profileName),
        };
      } else {
        console.warn(`Unsupported data profile type: ${data_type}`);
      }

      if (!datum) return;

      if (dict[column_name]) {
        dict[column_name].data.push(datum);
      } else {
        dict[column_name] = {
          columnName: column_name,
          dataType: data_type,
          data: [datum],
        };
      }
    });
  });

  return dict;
}

/*
  (Interim) function used for comparisons -- takes in an array of features and extracts and maps
  profile name into the value of a specific feature. Will probably refactor this later, it's super
  inefficient right now.

  E.g. For feature "feature2" in [
    { feature1: 'a', feature2: 'foo', profileName: 'p1' },
    { feature1: 'b', feature2: 'bar', profileName: 'p2' },
  ] => [
    { value: 'foo', profileName: 'p1' },
    { value: 'bar', profileName: 'p2' },
  ]
 */
export function formatValue(features, featureName) {
  return features.map((feature) => {
    return {
      value: feature[featureName],
      profileName: feature.profileName,
    };
  });
}

/*
  (Interim) function used for the TopValue data specifically. This takes the output of formatValue
  and maps profileName as group into a flattened data for vegalite. Eg. vegalite expects an array of
  { item, count, group }. Might refactor later.
*/
export function getTopValuesData(features) {
  const frequentItems = formatValue(features, 'frequentItems');

  return frequentItems.flatMap((profile) =>
    profile.value.map((item) => ({ ...item, group: profile.profileName })),
  );
}

// TODO: replace with defineMessages of i18n
export const featureLabels = {
  count: 'Count',
  distinctCount: 'Unique values',
  topFrequency: 'Top frequency',
  numNan: 'NaNs',
  numNulls: 'Nulls',
  avgLength: 'Average length',
  maxLength: 'Max length',
  minLength: 'Min length',
  avg: 'Average',
  stddev: 'Standard deviation',
  max: 'Max',
  min: 'Min',
};

/*
  Utility function which takes in a number and limits to 3dp if number has decimals
 */
export function clipValue(number) {
  return number % 1 === 0 ? number : number.toFixed(3);
}

/**
 * Function to display a human-readable unique identifier for a profile
 */
export function getProfileLabel(profile) {
  const { window_granularity, window_start_timestamp } = profile;

  // Profiles where window_start_timestamp is 0 should be the Global profile, thus we default to
  // returning the granularity (which should say "Global") instead of the time.
  if (window_start_timestamp === 0) return window_granularity;

  return Utils.formatTimestamp(window_start_timestamp, 'mmm d, yyyy');
}
