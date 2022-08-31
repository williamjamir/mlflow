import React from 'react';
import { mountWithIntl } from '../../common/utils/TestUtils';
import { JobScheduleSection } from './JobScheduleSection';

describe('JobScheduleSection', () => {
  const props = {
    isLoading: false,
    schedule: {
      pause_status: 'PAUSED',
      quartz_cron_expression: '0 0 0 * * ? *',
      timezone_id: 'America/Los_Angeles',
    },
    jobId: ':jobId',
    dltPipelineId: ':dltPipelineId',
    analysisJobNotebookPath: ':analysisJobNotebookPath',
  };

  it('renders with minimal props without exploding', () => {
    const wrapper = mountWithIntl(<JobScheduleSection {...props} />);
    expect(wrapper.find('[data-testid="job-schedule-section"]')).toHaveLength(1);
  });

  describe('schedule status', () => {
    it('translates the schedule object into a string', () => {
      const wrapper = mountWithIntl(<JobScheduleSection {...props} />);
      expect(wrapper.find('div[data-testid="schedule-status"]').text()).toBe(
        'Paused - At 12:00 AM (America/Los_Angeles)',
      );
    });

    it('displays "None" when schedule is unavailable', () => {
      const noScheduleProps = { ...props, schedule: null };
      const wrapper = mountWithIntl(<JobScheduleSection {...noScheduleProps} />);
      expect(wrapper.find('div[data-testid="schedule-status"]').text()).toBe('None');
    });
  });
});
