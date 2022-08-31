// TODO [ML-22801] (Anirudh): Delete this constant once we are completely switched
//                            over to concurrency compute config
export const SERVING_COMPUTE_CONFIG_MAX_REPLICAS = 50;
export const CONCURRENCY_PER_CORE = 1;
export const CORES_PER_REPLICA = 4;
export const CONCURRENCY_PER_REPLICA = CONCURRENCY_PER_CORE * CORES_PER_REPLICA;
export const WORKLOAD_TSHIRT_SIZES = {
  SMALL: 'Small',
  MEDIUM: 'Medium',
  LARGE: 'Large',
};
export const DBU_PER_CONCURRENT_REQUEST = 1;
