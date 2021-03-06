import { query } from "../database-util/connection-pool";
import { logger } from "../logging/logger";


/**
 * Refresh all availability times for each App User by invoking the refreshAvailabilityTimesFromMeta() SQL function.
 */
export async function refreshAppUserAvailability(): Promise <void> {

    try {
        await query('SELECT refreshAppUserAvailability();');
        logger.info('Refreshed App User Availability times');
    }
    catch (err) {
        logger.error(err);
    }
}
