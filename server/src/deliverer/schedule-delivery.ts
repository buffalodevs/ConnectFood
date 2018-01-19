'use strict'
import { query, QueryResult } from './../database-util/connection-pool';
import { fixNullQueryArgs } from '../database-util/prepared-statement-util';
import { logSqlConnect, logSqlQueryExec, logSqlQueryResult } from './../logging/sql-logger';
import { SessionData } from '../common-util/session-data';
import { notifyReceiverAndDonorOfDeliveryUpdate, DeliveryUpdateNotification } from './delivery-update-notification';

import { DateFormatter } from '../../../shared/common-util/date-formatter';
import { Delivery } from '../../../shared/deliverer/delivery';


export function scheduleDelivery(claimedFoodListingKey: number, delivererSessionData: SessionData, startImmediately: boolean, scheduledStartTime: Date): Promise<void> {

    const dateFormatter: DateFormatter = new DateFormatter();

    // scheduledStartTime was likely converted to a string in the JSON request message!
    dateFormatter.ensureIsDate(scheduledStartTime);

    let queryString: string = 'SELECT * FROM scheduleDelivery($1, $2, $3, $4)';
    let queryArgs: any[] = [
        claimedFoodListingKey,
        delivererSessionData.appUserKey,
        startImmediately,
        dateFormatter.dateToDateTimeString(scheduledStartTime)
    ];

    queryString = fixNullQueryArgs(queryString, queryArgs);
    logSqlQueryExec(queryString, queryArgs);

    return query(queryString, queryArgs)
        .then((queryResult: QueryResult) => {
            return handleScheduleDeliveryResult(delivererSessionData, queryResult);
        })
        .catch((err: Error) => {
            console.log(err);
            throw new Error('Sorry, an unexpected error occured when ' + (startImmediately ? 'starting' : 'scheduling') + ' the delivery');
        });
}


/**
 * Handles query result and emails scheduled delivery notifications to involved Donor and Receiver.
 * @param delivererSessionData The session information for the deliverer.
 * @param queryResult The result of the scheduleDelivery() SQL query.
 * @return On success, a promise that resolves to nothing. On failure, an error is thrown.
 */
function handleScheduleDeliveryResult(delivererSessionData: SessionData, queryResult: QueryResult): Promise<void> {

    logSqlQueryResult(queryResult.rows);
    
    if (queryResult.rowCount === 1) {
        console.log('Successfully scheduled a new Delivery');
        const deliveryUpdateNotification: DeliveryUpdateNotification = queryResult.rows[0].deliveryupdatenotification;
        return notifyReceiverAndDonorOfDeliveryUpdate(delivererSessionData, deliveryUpdateNotification);
    }

    throw new Error('An incorrect number of rows have returned from the scheduleDelivery() SQL function call');
}
