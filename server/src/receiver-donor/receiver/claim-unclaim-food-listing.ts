'use strict'
import { query, QueryResult } from '../../database-util/connection-pool';
import { logSqlQueryExec, logSqlQueryResult } from '../../logging/sql-logger';
import { addArgPlaceholdersToQueryStr } from '../../database-util/prepared-statement-util';
import { SessionData } from '../../common-util/session-data';
import { UnclaimNotificationData, notifyDelivererOfLostDelivery, notifyDonorOfLostDelivery } from '../common-receiver-donor/unclaim-notification';


export function claimFoodListing(foodListingKey: number, receiverSessionData: SessionData): Promise <void> {
    
    let queryArgs: Array<any> = [ foodListingKey, receiverSessionData.appUserKey ];
    let queryString = addArgPlaceholdersToQueryStr('SELECT * FROM claimFoodListing()', queryArgs);

    return execClaimOrUnclaimQuery(true, queryString, queryArgs);
}


export function unclaimFoodListing(foodListingKey: number, receiverSessionData: SessionData, unclaimReason: string): Promise <void> {

    let queryArgs: Array<any> = [ foodListingKey, receiverSessionData.appUserKey, unclaimReason ];
    let queryString = addArgPlaceholdersToQueryStr('SELECT * FROM unclaimFoodListing()', queryArgs);

    return execClaimOrUnclaimQuery(false, queryString, queryArgs, receiverSessionData);
}


async function execClaimOrUnclaimQuery(isClaim: boolean, queryString: string, queryArgs: any[], receiverSessionData?: SessionData): Promise <void> {

    logSqlQueryExec(queryString, queryArgs);

    try {
        const queryResult: QueryResult = await query(queryString, queryArgs);
        logSqlQueryResult(queryResult.rows);

        return ( isClaim ? Promise.resolve() // If claim, then just resolve.
                         : handleUnclaimQueryResult(receiverSessionData, queryResult) );
    }
    catch (err) {
        console.log(err);
        return Promise.reject(new Error((isClaim ? 'Claim' : 'Unclaim') + ' Food Listing Unexpectedly Failed.'));
    }
}


/**
 * If the claimed food listing had a scheduled delivery, then notifies affected deliverer that their delivery have been removed (unclaimed).
 * @param receiverSessionData The sessiond data related to the receiver who unclaimed the food listing resulting in loss of scheduled delivery.
 * @param result The result of the unclaim query which holds information needed to notify a deliverer who lost their scheduled delivery due to unclaim action.
 */
async function handleUnclaimQueryResult(receiverSessionData: SessionData, result: QueryResult): Promise <void> {
    
    let unclaimNotificationData: UnclaimNotificationData = result.rows[0].unclaimnotificationdata;

    // Next, if the removal resulted in total unclaiming of food that had a scheduled delivery, then notify deliverer and donor as well.
    if (unclaimNotificationData.delivererSessionData != null) {
        
        await notifyDelivererOfLostDelivery(receiverSessionData, 'receiver', unclaimNotificationData)
        return notifyDonorOfLostDelivery(unclaimNotificationData);
    }
}
