import * as schedule from 'node-schedule';
import { refreshAppUserAvailabilityFromMeta } from './availability-times-refresh-from-meta';
import { logger } from '../logging/logger';


/**
 * Schedules all jobs that will run at regular intervals.
 */
export function scheduleJobs(): void {

    const job: schedule.Job = schedule.scheduleJob('Refresh User Availability', '0 0 0 * * 0', refreshAppUserAvailabilityFromMeta);
    logger.info('Scheduled job \'' + job.name + '\' for ' + job.nextInvocation());

    // PLACE MORE SCHEDULE JOBS HERE --
}
