'use strict'
import { query, QueryResult } from './../database-util/connection-pool';
import { addArgPlaceholdersToQueryStr } from '../database-util/prepared-statement-util';
import { logSqlConnect, logSqlQueryExec, logSqlQueryResult } from './../logging/sql-logger';
import { SessionData } from '../common-util/session-data';
import { notifyReceiverAndDonorOfDeliveryUpdate, DeliveryUpdateNotificationData } from './delivery-update-notification';

import { DateFormatter } from '../../../shared/common-util/date-formatter';
import { Delivery } from '../../../shared/deliverer/delivery';


export async function scheduleDelivery(claimedFoodListingKey: number, delivererSessionData: SessionData, startImmediately: boolean, scheduledStartTime: Date): Promise <void> {

    const dateFormatter: DateFormatter = new DateFormatter();

    // scheduledStartTime was likely converted to a string in the JSON request message!
    dateFormatter.ensureIsDate(scheduledStartTime);

    let queryArgs: any[] = [
        claimedFoodListingKey,
        delivererSessionData.appUserKey,
        startImmediately,
        scheduledStartTime
    ];

    // Insert query argument placeholders and preprocess query arguments.
    let queryString: string = addArgPlaceholdersToQueryStr('SELECT * FROM scheduleDelivery();', queryArgs);
    logSqlQueryExec(queryString, queryArgs);
    
    try {
        const queryResult: QueryResult = await query(queryString, queryArgs);
        return handleScheduleDeliveryResult(delivererSessionData, queryResult);
    }
    catch (err) {
        console.log(err);
        throw new Error('Sorry, an unexpected error occured when ' + (startImmediately ? 'starting' : 'scheduling') + ' the delivery');
    }
}


/**
 * Handles query result and emails scheduled delivery notifications to involved Donor and Receiver.
 * @param delivererSessionData The session information for the deliverer.
 * @param queryResult The result of the scheduleDelivery() SQL query.
 * @return On success, a promise that resolves to nothing. On failure, an error is thrown.
 */
function handleScheduleDeliveryResult(delivererSessionData: SessionData, queryResult: QueryResult): Promise <void> {

    logSqlQueryResult(queryResult.rows);
    
    if (queryResult.rowCount === 1) {
        console.log('Successfully scheduled a new Delivery');
        const deliveryUpdateNotificationData: DeliveryUpdateNotificationData = queryResult.rows[0].deliveryupdatenotification;
        return notifyReceiverAndDonorOfDeliveryUpdate(delivererSessionData, deliveryUpdateNotificationData);
    }

    throw new Error('An incorrect number of rows have returned from the scheduleDelivery() SQL function call');
}
