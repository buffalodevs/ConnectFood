'use strict'
import { query, QueryResult } from './../database-util/connection-pool';
import { addArgPlaceholdersToQueryStr } from '../database-util/prepared-statement-util';
import { logSqlQueryExec, logSqlQueryResult } from './../logging/sql-logger';
import { logger, prettyjsonRender } from '../logging/logger';
import { SessionData } from '../common-util/session-data';
import { notifyReceiverAndDonorOfDeliveryUpdate, DeliveryUpdateNotificationData } from '../change-notification-util/delivery-update-notification';
import { DeliveryState } from './delivery-util';


export async function updateDeliveryState(deliveryInfoKey: number, delivererSessionData: SessionData, deliveryState: DeliveryState): Promise <void> {

    let queryArgs: any[] = [
        deliveryInfoKey,
        delivererSessionData.appUserKey,
        deliveryState
    ];
    let queryString: string = addArgPlaceholdersToQueryStr('SELECT * FROM updateDeliveryState();', queryArgs);
    logSqlQueryExec(queryString, queryArgs);

    try {
        const queryResult: QueryResult = await query(queryString, queryArgs);
        return handleUpdateDeliveryStateResult(deliveryInfoKey, delivererSessionData, queryResult, deliveryState);
    }
    catch (err) {
        logger.error(prettyjsonRender(err));
        throw new Error('Sorry, an unexpected error occured when updating the state of the delivery');
    }
}


/**
 * Handles updateDeliveryState() query result and mails delivery update notifications to involved Donor and Receiver.
 * @param deliveryInfoKey The key ID of the delivery.
 * @param delivererSessionData The session information for the deliverer.
 * @param queryResult The result of the updateDeliveryState() SQL query.
 * @param deliveryState The delivery state that the delivery was updated to.
 * @return On success, a promise that resolves to nothing. On failure, an error is thrown.
 */
export function handleUpdateDeliveryStateResult(deliveryInfoKey: number, delivererSessionData: SessionData,
                                                queryResult: QueryResult, deliveryState: DeliveryState): Promise <void>
{
    logSqlQueryResult(queryResult.rows);
    
    if (queryResult.rowCount === 1) {
        logger.info('Successfully updated the delivery state of delivery with ID ' + deliveryInfoKey + ' to: ' + deliveryState);
        const deliveryUpdateNotificationData: DeliveryUpdateNotificationData = queryResult.rows[0].deliveryupdatenotification;
        return notifyReceiverAndDonorOfDeliveryUpdate(delivererSessionData, deliveryUpdateNotificationData);
    }

    throw new Error('No rows have returned from the updateDeliveryState() SQL function call, caused by deliverer with ID ' + delivererSessionData.appUserKey);
}
