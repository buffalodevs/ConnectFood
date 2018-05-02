'use strict'
import { query, QueryResult } from '../database-util/connection-pool';
import { logSqlQueryExec, logSqlQueryResult } from '../logging/sql-logger';
import { addArgPlaceholdersToQueryStr } from '../database-util/prepared-statement-util';
import { logger, prettyjsonRender } from '../logging/logger';
import { SessionData } from '../common-util/session-data';
import { UnclaimNotificationData, notifyDelivererOfLostDelivery, notifyDonorOfLostClaim } from '../change-notification-util/unclaim-notification';


export async function unclaimFoodListing(foodListingKey: number, receiverSessionData: SessionData, unclaimReason: string): Promise <void> {

    let queryArgs: any[] = [ foodListingKey, receiverSessionData.appUserKey, unclaimReason ];
    let queryString = addArgPlaceholdersToQueryStr('SELECT * FROM unclaimFoodListing()', queryArgs);

    await execUnclaimQuery(queryString, queryArgs, receiverSessionData);
    logger.info('Receiver with ID ' + receiverSessionData.appUserKey + ' successfully unclaimed Food Listing with ID ' + foodListingKey);
}


async function execUnclaimQuery(queryString: string, queryArgs: any[], receiverSessionData?: SessionData): Promise <void> {

    logSqlQueryExec(queryString, queryArgs);

    try {
        const queryResult: QueryResult = await query(queryString, queryArgs);
        logSqlQueryResult(queryResult.rows);

        await handleUnclaimQueryResult(receiverSessionData, queryResult);
    }
    catch (err) {
        logger.error(prettyjsonRender(err));
        throw new Error('Unclaim Food Listing Unexpectedly Failed.');
    }
}


/**
 * If the claimed food listing had a scheduled delivery, then notifies affected deliverer that their delivery have been removed (unclaimed).
 * @param receiverSessionData The sessiond data related to the receiver who unclaimed the food listing resulting in loss of scheduled delivery.
 * @param result The result of the unclaim query which holds information needed to notify a deliverer who lost their scheduled delivery due to unclaim action.
 */
async function handleUnclaimQueryResult(receiverSessionData: SessionData, result: QueryResult): Promise <void> {
    
    let unclaimNotificationData: UnclaimNotificationData = result.rows[0].unclaimnotificationdata;
    let notificationPromises: Promise <any>[] = [];

    // Notify Donor that the Receiver has unclaimed the Food Listing Donation.
    notificationPromises.push(notifyDonorOfLostClaim(unclaimNotificationData));

    // Next, if the removal resulted in total unclaiming of food that had a scheduled delivery, then notify deliverer as well.
    if (unclaimNotificationData.delivererSessionData != null) {
        notificationPromises.push(notifyDelivererOfLostDelivery(receiverSessionData, 'receiver', unclaimNotificationData));
    }

    await Promise.all(notificationPromises);
}
