import * as schedule from 'node-schedule';
import * as moment from 'moment';
import { refreshAppUserAvailabilityFromMeta } from './availability-times-refresh-from-meta';
import { logger, prettyjsonRender } from '../logging/logger';





/**
 * Schedules all jobs that will run at regular intervals.
 */
export function scheduleJobs(): void {

    // Scheduled for 12:30 AM (UTC) Sunday. NOTE: We give 30 minute buffer for inaccuracies in time between server and database.
    const job: schedule.Job = schedule.scheduleJob('Refresh User Availability', genCronStrSundayMidnightUTC(30), refreshAppUserAvailabilityFromMeta);
    logger.info('Scheduled job \'' + job.name + '\' for ' + job.nextInvocation());

    // PLACE MORE SCHEDULE JOBS HERE --
}


/**
 * Generates a cron schedule string for sundays at midnight according to UTC time zone.
 */
function genCronStrSundayMidnightUTC(minBuffer: number = 0): string {

    const utcMinsOffset: number = (new Date()).getTimezoneOffset();
    const utcDay: number = (utcMinsOffset > 0) ? 6
                                                     : 0;
    const utcHour: number = (utcMinsOffset > 0) ? 24 - (utcMinsOffset / 60)
                                                : (-utcMinsOffset / 60);

    return ( '0 ' + minBuffer + ' ' + utcHour + ' * * ' + utcDay );
}
