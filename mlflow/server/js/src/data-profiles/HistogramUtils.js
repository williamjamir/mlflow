export class HistogramUtils {
  /**
   * Computes bucket frequency given quantiles and assuming a uniform distribution between
   * quantiles.
   *
   * @param low The low range of the bucket, inclusive.
   * @param high The high range of the bucket, inclusive.
   * @param quantiles The array of quantiles.
   * @param quantileFreq The total frequency covered by a pair of successive quantiles.
   * @param globalMax The maximum value in quantiles.
   * @returns approximate frequency for range [low, high]
   */
  static #computeBucketFrequency(low, high, quantiles, quantileFreq, globalMax) {
    let result = 0;
    for (let i = 0; i <= quantiles.length - 2; ++i) {
      const qLow = quantiles[i];
      const qHigh = quantiles[i + 1];

      const overlapLow = Math.max(low, qLow);
      const overlapHigh = Math.min(high, qHigh);

      const overlapRangeLength = overlapHigh - overlapLow;

      let qPairContribRatio = 0;
      if (qLow === qHigh) {
        if ((qHigh < high && qHigh >= low) || (qHigh === high && high === globalMax)) {
          qPairContribRatio = 1.0;
        } else {
          qPairContribRatio = 0.0;
        }
      } else if (overlapRangeLength > 0.0) {
        qPairContribRatio = overlapRangeLength / (qHigh - qLow);
      } else {
        qPairContribRatio = 0.0;
      }

      result += qPairContribRatio * quantileFreq;
    }
    return result;
  }

  /**
   * Computes an equi-width histogram given the input quantiles.
   *
   * @param quantiles An array of equi-spaced quantiles.
   * @param totalFreq The total frequency represented by the quantiles.
   * @param numBuckets The number of buckets in the histogram.
   * @returns An array of {left:..., right:..., freq:...} buckets that represent the histogram.
   */
  static computeEquiWidthHistogram(quantiles, totalFreq, numBuckets) {
    const min = quantiles[0];
    const max = quantiles[quantiles.length - 1];

    const result = [];

    if (min === max) {
      // If all values are same, then the width of all buckets will be set to 1 as fixed,
      // except the bucket that contains the real value. The width of that will be 0.
      const num = min;
      const midBucket = Math.floor(numBuckets / 2);
      let leftEdge = num - midBucket;
      for (let i = 0; i < numBuckets; ++i) {
        if (i === midBucket) {
          result.push({ left: leftEdge, right: leftEdge, freq: totalFreq });
        } else {
          result.push({ left: leftEdge, right: leftEdge + 1, freq: 0 });
          leftEdge += 1;
        }
      }
    } else {
      const bucketWidth = (max - min) / numBuckets;

      const quantileFreq = totalFreq / (quantiles.length - 1);
      for (let i = 0; i < numBuckets; ++i) {
        const bucketLeft = min + i * bucketWidth;
        const bucketRight = min + (i + 1) * bucketWidth;
        result.push({
          left: bucketLeft,
          right: bucketRight,
          freq: HistogramUtils.#computeBucketFrequency(
            bucketLeft,
            bucketRight,
            quantiles,
            quantileFreq,
            max,
          ),
        });
      }
    }
    return result;
  }
}
