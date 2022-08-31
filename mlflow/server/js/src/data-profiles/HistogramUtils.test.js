import { HistogramUtils } from './HistogramUtils';

describe('HistogramUtils', () => {
  describe('computeEquiWidthHistogram', () => {
    expect.extend({
      toMatchHistogram(actual, hist) {
        if (actual.length !== hist.length) {
          return {
            message: () =>
              `Actual histogram has ${actual.length} buckets compared to expected ${hist.length}`,
            pass: false,
          };
        }
        const approxeq = (v1, v2, epsilon = 0.001) => Math.abs(v1 - v2) <= epsilon;

        for (let i = 0; i < hist.length; ++i) {
          const bucket = hist[i];
          const actualBucket = actual[i];
          if (!approxeq(bucket.left, actualBucket.left)) {
            return {
              message: () =>
                `Bucket ${i} has different actual left ${actualBucket.left} ` +
                `vs expected ${bucket.left}`,
              pass: false,
            };
          }
          if (!approxeq(bucket.right, actualBucket.right)) {
            return {
              message: () =>
                `Bucket ${i} has different actual right ${actualBucket.right} ` +
                `vs expected ${bucket.right}`,
              pass: false,
            };
          }
          if (!approxeq(bucket.freq, actualBucket.freq)) {
            return {
              message: () =>
                `Bucket ${i} has different actual freq ${actualBucket.freq} ` +
                `vs expected ${bucket.freq}`,
              pass: false,
            };
          }
        }
        return {
          message: '',
          pass: true,
        };
      },
    });

    it('uniform', () => {
      /**
       * Setup:
       * - the value domain is [1.0, 2.0) and we request 5 buckets, so the bucket boundaries are
       *   [1.0, 1.2), [1.2, 1.4), [1.4, 1.6), [1.6, 1.8), [1.8, 2.0).
       * - There is a single quantile bucket that fully contains each histogram bucket. Hence,
       *   each histogram bucket gets assigned 1/5 of the total quantile bucket.
       *
       *   Tests single quantile buckets, full containment of histogram bucket in quantile bucket.
       */

      const quantiles = [1.0, 2.0];
      const totalFreq = 100;
      const numBuckets = 5;
      const expected = [
        { left: 1.0, right: 1.2, freq: 20.0 },
        { left: 1.2, right: 1.4, freq: 20.0 },
        { left: 1.4, right: 1.6, freq: 20.0 },
        { left: 1.6, right: 1.8, freq: 20.0 },
        { left: 1.8, right: 2.0, freq: 20.0 },
      ];
      expect(
        HistogramUtils.computeEquiWidthHistogram(quantiles, totalFreq, numBuckets),
      ).toMatchHistogram(expected);
    });

    it('slightly non-uniform', () => {
      /**
       * Setup:
       * - As before, the histogram buckets are
       *   [1.0, 1.2), [1.2, 1.4), [1.4, 1.6), [1.6, 1.8), [1.8, 2.0).
       * - There are two quantile buckets, the first containing the first two histogram buckets
       *   and the second containing the last three histogram buckets respectively.
       *
       *   Tests multiple quantile buckets, full containment of histogram bucket in quantile bucket.
       */
      const quantiles = [1.0, 1.4, 2.0];
      const totalFreq = 100;
      const numBuckets = 5;
      const expected = [
        { left: 1.0, right: 1.2, freq: 50.0 / 2 },
        { left: 1.2, right: 1.4, freq: 50.0 / 2 },
        { left: 1.4, right: 1.6, freq: 50.0 / 3 },
        { left: 1.6, right: 1.8, freq: 50.0 / 3 },
        { left: 1.8, right: 2.0, freq: 50.0 / 3 },
      ];
      expect(
        HistogramUtils.computeEquiWidthHistogram(quantiles, totalFreq, numBuckets),
      ).toMatchHistogram(expected);
    });

    it('extremely skewed left', () => {
      /**
       *  Setup:
       *  - the value domain is [1.0, 2.0) and we request 5 buckets, so the bucket boundaries are
       *    [1.0, 1.2), [1.2, 1.4), [1.4, 1.6), [1.6, 1.8), [1.8, 2.0).
       *  - we set up the distribution to be "left-skewed" so that the first histogram bucket fully
       *    contains the first four quantile buckets and 1/9 of the last quantile bucket. The
       *    remaining 8/9 of the last quantile bucket overlap uniformly with the last four histogram
       *    buckets.
       *
       *    Tests full containment of quantile bucket in histogram bucket, full containment of
       *    histogram bucket in quantile bucket, and left overlap of quantile bucket with histogram
       *    bucket.
       */
      const quantiles = [1.0, 1.01, 1.02, 1.03, 1.1, 2.0];
      const totalFreq = 100;
      const numBuckets = 5;
      const expected = [
        { left: 1.0, right: 1.2, freq: 80.0 + 20.0 / 9 },
        { left: 1.2, right: 1.4, freq: (20.0 * 2) / 9 },
        { left: 1.4, right: 1.6, freq: (20.0 * 2) / 9 },
        { left: 1.6, right: 1.8, freq: (20.0 * 2) / 9 },
        { left: 1.8, right: 2.0, freq: (20.0 * 2) / 9 },
      ];
      expect(
        HistogramUtils.computeEquiWidthHistogram(quantiles, totalFreq, numBuckets),
      ).toMatchHistogram(expected);
    });

    it('extremely skewed right', () => {
      /** This is the mirror setup to the "left-skewed" test above. */
      const quantiles = [1.0, 1.9, 1.97, 1.98, 1.99, 2.0];
      const totalFreq = 100;
      const numBuckets = 5;
      const expected = [
        { left: 1.0, right: 1.2, freq: (20.0 * 2) / 9 },
        { left: 1.2, right: 1.4, freq: (20.0 * 2) / 9 },
        { left: 1.4, right: 1.6, freq: (20.0 * 2) / 9 },
        { left: 1.6, right: 1.8, freq: (20.0 * 2) / 9 },
        { left: 1.8, right: 2.0, freq: 80.0 + 20.0 / 9 },
      ];
      expect(
        HistogramUtils.computeEquiWidthHistogram(quantiles, totalFreq, numBuckets),
      ).toMatchHistogram(expected);
    });

    it('single histogram bucket', () => {
      /**
       * Setup: a single histogram bucket for the full domain.
       * Tests single histogram bucket with full containment of quantile buckets
       */
      const quantiles = [1.0, 1.9, 1.97, 1.98, 1.99, 2.0];
      const totalFreq = 100;
      const numBuckets = 1;
      const expected = [{ left: 1.0, right: 2.0, freq: 100 }];
      expect(
        HistogramUtils.computeEquiWidthHistogram(quantiles, totalFreq, numBuckets),
      ).toMatchHistogram(expected);
    });

    it('repeated quantiles', () => {
      const quantiles = [1.0, 1.0, 1.0, 1.0, 3.0];
      const totalFreq = 100;
      const numBuckets = 2;
      const expected = [
        { left: 1.0, right: 2.0, freq: 75 + 12.5 },
        { left: 2.0, right: 3.0, freq: 12.5 },
      ];
      expect(
        HistogramUtils.computeEquiWidthHistogram(quantiles, totalFreq, numBuckets),
      ).toMatchHistogram(expected);
    });

    it('edge-overlapping ranges', () => {
      const quantiles = [1.0, 2.0, 3.0];
      const totalFreq = 200;
      const numBuckets = 2;
      const expected = [
        { left: 1.0, right: 2.0, freq: 100 },
        { left: 2.0, right: 3.0, freq: 100 },
      ];
      expect(
        HistogramUtils.computeEquiWidthHistogram(quantiles, totalFreq, numBuckets),
      ).toMatchHistogram(expected);
    });

    describe('same value', () => {
      const quantiles = [1.0, 1.0, 1.0, 1.0, 1.0];
      const totalFreq = 100;

      it('five buckets', () => {
        const numBuckets = 5;
        const expected = [
          { left: -1.0, right: 0.0, freq: 0 },
          { left: 0.0, right: 1.0, freq: 0 },
          { left: 1.0, right: 1.0, freq: 100 },
          { left: 1.0, right: 2.0, freq: 0 },
          { left: 2.0, right: 3.0, freq: 0 },
        ];
        expect(
          HistogramUtils.computeEquiWidthHistogram(quantiles, totalFreq, numBuckets),
        ).toMatchHistogram(expected);
      });

      it('two buckets', () => {
        const numBuckets = 2;
        const expected = [
          { left: 0.0, right: 1.0, freq: 0 },
          { left: 1.0, right: 1.0, freq: 100 },
        ];
        expect(
          HistogramUtils.computeEquiWidthHistogram(quantiles, totalFreq, numBuckets),
        ).toMatchHistogram(expected);
      });

      it('one bucket', () => {
        const numBuckets = 1;
        const expected = [{ left: 1.0, right: 1.0, freq: 100 }];
        expect(
          HistogramUtils.computeEquiWidthHistogram(quantiles, totalFreq, numBuckets),
        ).toMatchHistogram(expected);
      });
    });
  });
});
