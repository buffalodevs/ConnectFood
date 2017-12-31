'use strict'
import { query, QueryResult } from './../database-util/connection-pool';
import { fixNullQueryArgs } from '../database-util/prepared-statement-util';
import { logSqlConnect, logSqlQueryExec, logSqlQueryResult } from './../logging/sql-logger';
import { SessionData } from '../common-util/session-data';
import { notifyReceiverAndDonorOfDeliveryUpdate, DeliveryUpdateNotification } from './delivery-update-notification';

import { DateFormatter } from '../../../shared/common-util/date-formatter';
import { Delivery } from '../../../shared/deliverer/delivery';


export function cancelDelivery(deliveryFoodListingKey: number, delivererSessionData: SessionData, cancelReason: string, foodRejected: boolean): Promise<void> {

    let queryString: string = 'SELECT * FROM cancelDelivery($1, $2, $3, $4)';
    let queryArgs: any[] = [ deliveryFoodListingKey, delivererSessionData.appUserKey, cancelReason, foodRejected ];

    queryString = fixNullQueryArgs(queryString, queryArgs);
    logSqlQueryExec(queryString, queryArgs);

    return query(queryString, queryArgs)
        .then((queryResult: QueryResult) => {
            return handleCancelDeliveryResult(delivererSessionData, queryResult);
        })
        .catch((err: Error) => {
            console.log(err);
            throw new Error('Sorry, an unexpected error occured when cancelling the delivery');
        });
}


/**
 * Handles cancelDelivery() query result and mails cancelled delivery notifications to involved Donor and Receiver.
 * @param delivererSessionData The session information for the deliverer.
 * @param queryResult The result of the cancelDelivery() SQL query.
 * @return On success, a promise that resolves to nothing. On failure, an error is thrown.
 */
function handleCancelDeliveryResult(delivererSessionData: SessionData, queryResult: QueryResult): Promise<void> {

    logSqlQueryResult(queryResult.rows);
    
    if (queryResult.rowCount === 1) {
        console.log('Successfully cancelled a Delivery');
        const deliveryUpdateNotification: DeliveryUpdateNotification = queryResult.rows[0].deliveryupdatenotification;
        return notifyReceiverAndDonorOfDeliveryUpdate(delivererSessionData, deliveryUpdateNotification);
    }

    throw new Error('An incorrect number of rows have returned from the cancelDelivery() SQL function call');
}
