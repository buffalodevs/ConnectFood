import { SessionData } from "../../common-util/session-data";
import { addArgPlaceholdersToQueryStr } from "../../database-util/prepared-statement-util";
import { logger, prettyjsonRender } from '../../logging/logger';
import { query, QueryResult } from "../../database-util/connection-pool";
import { logSqlQueryResult, logSqlQueryExec } from "../../logging/sql-logger";


export async function claimFoodListing(foodListingKey: number, claimAvailabilityTimes: Date[], receiverSessionData: SessionData): Promise <void> {
    
    let queryArgs: any[] = [ foodListingKey, receiverSessionData.appUserKey, claimAvailabilityTimes ];
    let queryString = addArgPlaceholdersToQueryStr('SELECT * FROM claimFoodListing()', queryArgs);

    await execClaimQuery(queryString, queryArgs);
    logger.info('Receiver with ID ' + receiverSessionData.appUserKey + ' successfully claimed Food Listing with ID ' + foodListingKey);
}


async function execClaimQuery(queryString: string, queryArgs: any[]): Promise <void> {

    logSqlQueryExec(queryString, queryArgs);

    try {
        const queryResult: QueryResult = await query(queryString, queryArgs);
        logSqlQueryResult(queryResult.rows);
    }
    catch (err) {
        logger.error(prettyjsonRender(err));
        throw new Error('Unclaim Food Listing Unexpectedly Failed.');
    }
}
