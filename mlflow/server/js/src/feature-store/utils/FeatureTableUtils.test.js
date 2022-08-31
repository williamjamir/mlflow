import { mockFeatureTable, mockJobProducer, mockJobRun, mockNotebookProducer } from './test-utils';
import { ProducerActions } from '../constants';
import FeatureTableUtils from './FeatureTableUtils';

describe('FeatureTableUtils', () => {
  const notebook1 = mockNotebookProducer(1234, 1, 100000000000, 'notebook 1 creator');
  const notebook2 = mockNotebookProducer(5678, 1, 150000000000, 'notebook 2 creator');
  const job1 = mockJobProducer(1234, 1, 200000000000, 'job 1 creator', mockJobRun({ jobId: 1234 }));
  const job2 = mockJobProducer(5678, 1, 250000000000, 'job 2 creator', mockJobRun({ jobId: 5678 }));

  it('getLatestWrittenProducer returns the latest producer', () => {
    const mockInput = {
      notebookProducers: [notebook1, notebook2],
      jobProducers: [job1, job2],
    };
    const featureTable = mockFeatureTable(mockInput);
    expect(FeatureTableUtils.getLatestWrittenProducer(featureTable)).toEqual(job2);
  });

  it('importers does not count as latest written producer', () => {
    const notebookImporter = mockNotebookProducer(
      6666,
      1,
      300000000000,
      'creator',
      undefined,
      undefined,
      undefined,
      ProducerActions.REGISTER,
    );
    const jobImporter = mockJobProducer(
      8888,
      1,
      350000000000,
      'creator',
      mockJobRun({ jobId: 8888 }),
      undefined,
      undefined,
      undefined,
      undefined,
      ProducerActions.REGISTER,
    );
    const mockInput = {
      notebookProducers: [notebook1, notebook2, notebookImporter],
      jobProducers: [job1, job2, jobImporter],
    };
    const featureTable = mockFeatureTable(mockInput);
    expect(FeatureTableUtils.getLatestWrittenProducer(featureTable)).toEqual(job2);
  });
});
