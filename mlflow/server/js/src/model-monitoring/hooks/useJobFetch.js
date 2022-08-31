import { useEffect, useState } from 'react';
import { JobsService } from '../../common/sdk/JobsService';

export const JOB_FETCH_LIMIT = 100;

export function useJobFetch(jobId) {
  const [isLoading, setIsLoading] = useState(true);
  const [schedule, setSchedule] = useState(undefined);
  const [runHistory, setRunHistory] = useState(undefined);

  const makeCalls = async (id) => {
    setIsLoading(true);
    const [runs, jobDetails] = await Promise.all([
      JobsService.listRuns({
        job_id: id,
        limit: JOB_FETCH_LIMIT,
      }),
      JobsService.getJob({
        job_id: id,
      }),
    ]).catch(() => {
      setIsLoading(false);
    });
    setIsLoading(false);
    setSchedule(jobDetails?.settings?.schedule);
    setRunHistory(runs?.runs);
  };

  useEffect(() => {
    makeCalls(jobId);
  }, [jobId]);

  return {
    isLoading,
    schedule,
    runHistory,
  };
}
