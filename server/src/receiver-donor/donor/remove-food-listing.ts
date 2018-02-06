'use strict';
import { query, QueryResult } from '../../database-util/connection-pool';
import { logSqlQueryExec, logSqlQueryResult } from '../../logging/sql-logger';
import { addArgPlaceholdersToQueryStr } from '../../database-util/prepared-statement-util';
import { SessionData } from '../../common-util/session-data';
import { UnclaimNotificationData, notifyReceiverOfUnclaim, notifyDelivererOfLostDelivery } from '../receiver-donor-util/unclaim-notification';


/**
 * Removes a donated food listing and all assocaited claims for the given food listing.
 * @param foodListingKey The key identifier for the food listing that is to be removed.
 * @param donorAppUserKey The key identifier for the user who originally posted/donated the food listing.
 *                        Should be pulled from server session to ensure that the requestor is authorized to perform this action!
 * @return A promise that simply resolve on success without any payload.
 */
export async function removeFoodListing(foodListingKey: number, donorSessionData: SessionData, removalReason: string): Promise <void> {
    
    // Construct prepared statement.
    let queryArgs = [ foodListingKey, donorSessionData.appUserKey, removalReason ];
    let queryString = addArgPlaceholdersToQueryStr('SELECT * FROM removeFoodListing();', queryArgs);
    logSqlQueryExec(queryString, queryArgs);

    // Execute prepared statement.
    const queryResult: QueryResult = await query(queryString, queryArgs);
    
    logSqlQueryResult(queryResult.rows);
    return await notifyAffectedAppUsers(donorSessionData, queryResult);
}


/**
 * Notifies all affected users (other than Donor causing removal) that their claims/deliveries have been removed.
 */
async function notifyAffectedAppUsers(donorSessionData: SessionData, result: QueryResult, resultRowIndex: number = 0): Promise <void> {

    if (resultRowIndex === result.rowCount) return; // Terminate recursive call once we reach end of result rows!

    // First notify affected receiver that their food has been unclaimed as a result of removal.
    const unclaimNotificationData: UnclaimNotificationData = result.rows[resultRowIndex].unclaimnotificationdata;

    // Notify receiver and deliverer at the same time (don't wait for one to finish before notifying the other).
    await Promise.all([
        notifyReceiverOfUnclaim(unclaimNotificationData),
        // If the removal resulted in total unclaiming of food that had a scheduled delivery, then notify deliverer as well.
        (unclaimNotificationData.delivererSessionData != null) ? notifyDelivererOfLostDelivery(donorSessionData, 'donor', unclaimNotificationData)
                                                               : Promise.resolve()
    ]);
}
