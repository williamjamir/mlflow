import { ProducerActions } from '../constants';

class FeatureTableUtils {
  static getLatestWrittenProducer(featureTable) {
    const notebookProducers = featureTable.notebook_producers || [];
    const jobProducers = featureTable.job_producers || [];
    // importers should not be accounted as producer that writes to a feature table
    const allProducers = notebookProducers
      .concat(jobProducers)
      .filter((producer) => producer.producer_action !== ProducerActions.REGISTER);

    if (allProducers.length === 0) return null;
    return allProducers.reduce((latestProducer, producer) =>
      producer.creation_timestamp > latestProducer.creation_timestamp ? producer : latestProducer,
    );
  }
}

export default FeatureTableUtils;
