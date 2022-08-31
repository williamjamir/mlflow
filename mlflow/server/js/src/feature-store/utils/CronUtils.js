import React from 'react';
import cronstrue from 'cronstrue/i18n';
import { FormattedMessage } from 'react-intl';
import { SchedulePauseStatus } from '../constants';

/**
 * Please keep this file in sync with functions in webapp/web/js/jaws/jobs/ScheduleDescription.tsx
 * This way we can make sure the parsed schedule string is consistent with the jobs UI.
 * @param quartzCronExpression
 * @returns {*}
 */

class CronUtils {
  static removeSeconds = (quartzCronExpression) => {
    const parsed = quartzCronExpression.trim().split(/[ ]+/);
    if (parsed.length === 6) {
      parsed[0] = '0';
    }
    return parsed.join(' ');
  };

  static getScheduleExpression = (quartzCronExpression) => {
    try {
      return cronstrue.toString(CronUtils.removeSeconds(quartzCronExpression), {
        throwExceptionOnParseError: true,
        dayOfWeekStartIndexZero: false,
      });
    } catch (ex) {
      return null;
    }
  };

  static getJobRunScheduleText(schedule) {
    const { quartz_cron_expression, timezone_id, pause_status } = schedule;
    const parsed_expression =
      CronUtils.getScheduleExpression(quartz_cron_expression) || quartz_cron_expression;
    const paused = pause_status.toUpperCase() === SchedulePauseStatus.PAUSED;
    return (
      <span>
        {paused && (
          <FormattedMessage
            defaultMessage={'Paused - '}
            description={'Text for the status and schedule of this Databricks job.'}
          />
        )}
        {`${parsed_expression} (${timezone_id})`}
      </span>
    );
  }
}

export default CronUtils;
