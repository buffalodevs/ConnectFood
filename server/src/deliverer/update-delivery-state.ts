'use strict'
import { query, QueryResult } from './../database-util/connection-pool';
import { addArgPlaceholdersToQueryStr } from '../database-util/prepared-statement-util';
import { logSqlConnect, logSqlQueryExec, logSqlQueryResult } from './../logging/sql-logger';
import { SessionData } from '../common-util/session-data';
import { notifyReceiverAndDonorOfDeliveryUpdate, DeliveryUpdateNotification } from './delivery-update-notification';

import { Delivery, DeliveryState } from '../../../shared/deliverer/delivery';


export function updateDeliveryState(deliveryFoodListingKey: number, delivererSessionData: SessionData, deliveryState: DeliveryState): Promise<void> {

    let queryArgs: any[] = [
        deliveryFoodListingKey,
        delivererSessionData.appUserKey,
        deliveryState
    ];
    let queryString: string = addArgPlaceholdersToQueryStr('SELECT * FROM updateDeliveryState();', queryArgs);
    logSqlQueryExec(queryString, queryArgs);

    return query(queryString, queryArgs)
        .then((queryResult: QueryResult) => {
            return handleUpdateDeliveryStateResult(delivererSessionData, queryResult, deliveryState);
        })
        .catch((err: Error) => {
            console.log(err);
            throw new Error('Sorry, an unexpected error occured when updating the state of the delivery');
        });
}


/**
 * Handles updateDeliveryState() query result and mails delivery update notifications to involved Donor and Receiver.
 * @param delivererSessionData The session information for the deliverer.
 * @param queryResult The result of the updateDeliveryState() SQL query.
 * @param deliveryState The delivery state that the delivery was updated to.
 * @return On success, a promise that resolves to nothing. On failure, an error is thrown.
 */
export function handleUpdateDeliveryStateResult(delivererSessionData: SessionData, queryResult: QueryResult, deliveryState: DeliveryState): Promise<void> {

    logSqlQueryResult(queryResult.rows);
    
    if (queryResult.rowCount === 1) {
        console.log('Successfully updated the delivery state to: ' + deliveryState);
        const deliveryUpdateNotification: DeliveryUpdateNotification = queryResult.rows[0].deliveryupdatenotification;
        return notifyReceiverAndDonorOfDeliveryUpdate(delivererSessionData, deliveryUpdateNotification);
    }

    throw new Error('An incorrect number of rows have returned from the updateDeliveryState() SQL function call');
}
