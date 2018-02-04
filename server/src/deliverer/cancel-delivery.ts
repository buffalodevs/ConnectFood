'use strict'
import { query, QueryResult } from './../database-util/connection-pool';
import { addArgPlaceholdersToQueryStr } from '../database-util/prepared-statement-util';
import { logSqlQueryExec, logSqlQueryResult } from './../logging/sql-logger';
import { logger, prettyjsonRender } from '../logging/logger';
import { SessionData } from '../common-util/session-data';
import { notifyReceiverAndDonorOfDeliveryUpdate, DeliveryUpdateNotificationData } from './delivery-util/delivery-update-notification';

import { DateFormatter } from '../../../shared/src/date-time-util/date-formatter';
import { Delivery } from '../../../shared/src/deliverer/delivery';


export async function cancelDelivery(deliveryFoodListingKey: number, delivererSessionData: SessionData, cancelReason: string, foodRejected: boolean): Promise <void> {

    let queryArgs: any[] = [ deliveryFoodListingKey, delivererSessionData.appUserKey, cancelReason, foodRejected ];
    let queryString: string = addArgPlaceholdersToQueryStr('SELECT * FROM cancelDelivery();', queryArgs);
    logSqlQueryExec(queryString, queryArgs);

    try {
        const queryResult: QueryResult = await query(queryString, queryArgs);
        return handleCancelDeliveryResult(deliveryFoodListingKey, delivererSessionData, queryResult);
    }
    catch (err) {
        logger.error(prettyjsonRender(err))
        throw new Error('Sorry, an unexpected error occured when cancelling the delivery');
    }
}


/**
 * Handles cancelDelivery() query result and mails cancelled delivery notifications to involved Donor and Receiver.
 * @param deliveryFoodListingKey The key identifier of the Delivery Food Listing that had been cancelled.
 * @param delivererSessionData The session information for the deliverer.
 * @param queryResult The result of the cancelDelivery() SQL query.
 * @return On success, a promise that resolves to nothing. On failure, an error is thrown.
 */
function handleCancelDeliveryResult(deliveryFoodListingKey: number, delivererSessionData: SessionData, queryResult: QueryResult): Promise <void> {

    logSqlQueryResult(queryResult.rows);
    
    if (queryResult.rowCount === 1) {
        logger.info('Deliverer with ID ' + delivererSessionData.appUserKey + ' successfully cancelled a Delivery with ID: ' + deliveryFoodListingKey);
        const deliveryUpdateNotificationData: DeliveryUpdateNotificationData = queryResult.rows[0].deliveryupdatenotification;
        return notifyReceiverAndDonorOfDeliveryUpdate(delivererSessionData, deliveryUpdateNotificationData);
    }

    throw new Error('No rows have returned from the cancelDelivery() SQL function call for delivery with ID ' +
                    deliveryFoodListingKey + ', caused by deliverer with ID ' + delivererSessionData.appUserKey);
}
