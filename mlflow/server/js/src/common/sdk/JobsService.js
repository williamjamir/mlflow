import { getBigIntJson, postJson } from '../utils/FetchUtils';

// copied from webapp/web/js/generated_files/services/JobsService.js

export class JobsService {
  /**
   * Get a job run
   */
  static getRun = (data) => getBigIntJson({ relativeUrl: '/ajax-api/2.0/jobs/runs/get', data });

  /**
   * Cancel a job run
   */
  static cancelRun = (data) => postJson({ relativeUrl: '/ajax-api/2.0/jobs/runs/cancel', data });

  /**
   * Get a job
   */
  static getJob = (data) => getBigIntJson({ relativeUrl: '/ajax-api/2.0/jobs/get', data });

  /**
   * List runs for a job
   */
  static listRuns = (data) => getBigIntJson({ relativeUrl: '/ajax-api/2.0/jobs/runs/list', data });
}
