import * as schedule from 'node-schedule';
import * as moment from 'moment';
import { refreshAppUserAvailability } from './refresh-app-user-availability';
import { logger, prettyjsonRender } from '../logging/logger';
import { extractAndSendDeliveryReminders, DELIVERY_REMINDER_INTERVAL_HOURS } from './send-delivery-reminders';


/**
 * Schedules all jobs that will run at regular intervals.
 */
export function scheduleJobs(): void {

    let job: schedule.Job = null;

    // Scheduled for 12:30 AM (UTC) Sunday. NOTE: We give 30 minute buffer for inaccuracies in time between server and database (Ensure UTC DOW is definitely Sunday).
    job = schedule.scheduleJob('Refresh User Availability', genCronStrSundayMidnightUTC(30), refreshAppUserAvailability);
    logger.info('Scheduled job \'' + job.name + '\' for ' + job.nextInvocation());

    // Schedule for every half hour of every day.
    job = schedule.scheduleJob('Send Scheduled Delivery Reminders', '0,30 0-23 * * *', extractAndSendDeliveryReminders);
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
