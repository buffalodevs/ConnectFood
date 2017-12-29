'use strict';
import { connect, query, Client, QueryResult } from '../../database-util/connection-pool';
import { logSqlConnect, logSqlQueryExec, logSqlQueryResult } from '../../logging/sql-logger';
import { SessionData } from '../../common-util/session-data';
import { AffectedUnclaimNotification, notifyAffectedReceiver, notifyAffectedDeliverer } from '../common-receiver-donor/affected-unclaim-notification';


/**
 * Removes a donated food listing and all assocaited claims for the given food listing.
 * @param foodListingKey The key identifier for the food listing that is to be removed.
 * @param donorAppUserKey The key identifier for the user who originally posted/donated the food listing.
 *                        Should be pulled from server session to ensure that the requestor is authorized to perform this action!
 * @return A promise that simply resolve on success without any payload.
 */
export function removeFoodListing(foodListingKey: number, donorSessionData: SessionData, unitsCount: number): Promise<void> {
    
    // Construct prepared statement.
    let queryString = 'SELECT * FROM removeFoodListing($1, $2, $3);';
    let queryArgs = [ foodListingKey, donorSessionData.appUserKey, unitsCount ];

    // Execute prepared statement.
    return query(queryString, queryArgs)
        .then((result: QueryResult) => {
            logSqlQueryResult(result.rows);
            return notifyAffectedAppUsers(donorSessionData, result);
        });
}


/**
 * Notifies all affected users (other than Donor causing removal) that their claims/deliveries have been removed.
 */
function notifyAffectedAppUsers(donorSessionData: SessionData, result: QueryResult, resultRowIndex: number = 0): Promise<void> {

    if (resultRowIndex === result.rowCount) return; // Terminate recursive call once we reach end of result rows!

    // First notify affected receiver that their food has been unclaimed as a result of removal.
    let affectedUnclaimNotification: AffectedUnclaimNotification = result.rows[resultRowIndex].affectednotificationdata;
    return notifyAffectedReceiver(donorSessionData, affectedUnclaimNotification)
        .then(() => {

            // Next, if the removal resulted in total unclaiming of food that had a scheduled delivery, then notify deliverer as well.
            if (affectedUnclaimNotification.delivererSessionData != null && affectedUnclaimNotification.allUnitsAffected) {
                return notifyAffectedDeliverer(donorSessionData, 'donor', affectedUnclaimNotification)
                    .then(() => {

                        // Make recursive call with index of next row as subject of next call.
                        return notifyAffectedAppUsers(donorSessionData, result, ++resultRowIndex);
                    })
            }
            else {
                return notifyAffectedAppUsers(donorSessionData, result, ++resultRowIndex);
            }
        });
}
