import { validateDatabaseEnumConsistency } from "./database-enum-consistency-validation";
import { logger, prettyjsonRender } from "../../logging/logger";


/**
 * Bootstraps the database by invoking any necessary SQL before the server NodeJs app starts responding to client requests.
 */
export function bootstrapDatabase(): Promise <any> {

    return validateDatabaseEnumConsistency().catch((err: Error) => {
        
        logger.error(prettyjsonRender(err));
        throw new Error('Error during validation of database enum types.');
    });
}
