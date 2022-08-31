import { SchedulePauseStatus } from '../constants';
import CronUtils from './CronUtils';
import { mountWithIntl } from '../../common/utils/TestUtils';

describe('CronUtils', () => {
  it('job run schedule cell is rendered correctly', () => {
    const schedule1 = {
      quartz_cron_expression: '0 15 22 ? * *',
      timezone_id: 'America/Chicago',
      pause_status: SchedulePauseStatus.UNPAUSED,
    };
    const schedule2 = {
      quartz_cron_expression: '46 0 22 * * ?',
      timezone_id: 'America/Los_Angeles',
      pause_status: SchedulePauseStatus.PAUSED,
    };

    const formattedSchedule1 = mountWithIntl(CronUtils.getJobRunScheduleText(schedule1));
    expect(formattedSchedule1.text()).toEqual('At 10:15 PM (America/Chicago)');
    const formattedSchedule2 = mountWithIntl(CronUtils.getJobRunScheduleText(schedule2));
    expect(formattedSchedule2.text()).toEqual('Paused - At 10:00 PM (America/Los_Angeles)');
  });
});
