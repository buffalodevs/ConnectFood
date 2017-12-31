'use strict'
import { connect, query, Client, QueryResult } from '../../database-util/connection-pool';
import { logSqlConnect, logSqlQueryExec, logSqlQueryResult } from '../../logging/sql-logger';
import { FoodListing } from '../food-listing';
import { SessionData } from '../../common-util/session-data';
import { UnclaimNotificationData, notifyDelivererOfLostDelivery, notifyDonorOfLostDelivery } from '../common-receiver-donor/unclaim-notification';


export function claimFoodListing(foodListingKey: number, receiverSessionData: SessionData, unitsCount: number): Promise<void> {
    return claimOrUnclaimFoodListing(foodListingKey, receiverSessionData, unitsCount, true);
}


export function unclaimFoodListing(foodListingKey: number, receiverSessionData: SessionData, unitsCount: number): Promise<void> {
    return claimOrUnclaimFoodListing(foodListingKey, receiverSessionData, unitsCount, false);
}


function claimOrUnclaimFoodListing(foodListingKey: number, receiverSessionData: SessionData, unitsCount: number, isClaim: boolean): Promise<void> {
    
    let queryString: string = 'SELECT * FROM ' + (isClaim ? '' : 'un') + 'claimFoodListing($1, $2, $3)';
    let queryArgs: Array<any> = [ foodListingKey, receiverSessionData.appUserKey, unitsCount ];
    logSqlQueryExec(queryString, queryArgs);

    return query(queryString, queryArgs)

        .then((queryResult: QueryResult) => {
            logSqlQueryResult(queryResult.rows);
            console.log((isClaim ? 'Claim' : 'Unclaim') + ' Food Listing Successful.');
            return isClaim ? Promise.resolve() // If claim, then just resolve.
                           : handleUnclaimQueryResult(receiverSessionData, queryResult);
        })

        .catch((err: Error) => {
            console.log(err);
            return Promise.reject(new Error((isClaim ? 'Claim' : 'Unclaim') + ' Food Listing Unexpectedly Failed.'));
        });
}


/**
 * If the claimed food listing had a scheduled delivery, then notifies affected deliverer that their delivery have been removed (unclaimed).
 * @param receiverSessionData The sessiond data related to the receiver who unclaimed the food listing resulting in loss of scheduled delivery.
 * @param result The result of the unclaim query which holds information needed to notify a deliverer who lost their scheduled delivery due to unclaim action.
 */
function handleUnclaimQueryResult(receiverSessionData: SessionData, result: QueryResult): Promise<void> {
    
    let unclaimNotificationData: UnclaimNotificationData = result.rows[0].unclaimnotificationdata;

    // Next, if the removal resulted in total unclaiming of food that had a scheduled delivery, then notify deliverer and donor as well.
    if (unclaimNotificationData.delivererSessionData != null && unclaimNotificationData.newClaimedUnitsCount === 0) {
        
        return notifyDelivererOfLostDelivery(receiverSessionData, 'receiver', unclaimNotificationData)
            .then(() => {
                return notifyDonorOfLostDelivery(unclaimNotificationData);
            });
    }
}
