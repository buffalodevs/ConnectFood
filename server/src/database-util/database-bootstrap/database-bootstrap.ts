import { validateDatabaseEnumConsistency } from "./database-enum-consistency-validation";
import { logger, prettyjsonRender } from "../../logging/logger";
import { refreshAppUserAvailability } from "../../cron/refresh-app-user-availability";


/**
 * Bootstraps the database by invoking any necessary SQL before the server NodeJs app starts responding to client requests.
 */
export function bootstrapDatabase(): Promise <any> {

    return refreshAppUserAvailability() // First ensure that all Availability time ranges for App Users are up to date.
        .then(validateDatabaseEnumConsistency)
        .catch((err: Error) => {
            logger.error(prettyjsonRender(err));
            throw new Error('Error during validation of database enum types.');
        });
}
