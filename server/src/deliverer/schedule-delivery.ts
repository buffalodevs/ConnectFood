'use strict'
import { query, QueryResult } from './../database-util/connection-pool';
import { addArgPlaceholdersToQueryStr } from '../database-util/prepared-statement-util';
import { logSqlQueryExec, logSqlQueryResult } from './../logging/sql-logger';
import { logger, prettyjsonRender } from '../logging/logger';
import { SessionData } from '../common-util/session-data';
import { notifyReceiverAndDonorOfDeliveryUpdate, DeliveryUpdateNotificationData } from '../change-notification-util/delivery-update-notification';

import { DateFormatter } from '../../../shared/src/date-time-util/date-formatter';


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
        logger.error(prettyjsonRender(err));
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
        logger.info('Successfully scheduled a new Delivery');
        const deliveryUpdateNotificationData: DeliveryUpdateNotificationData = queryResult.rows[0].deliveryupdatenotification;
        return notifyReceiverAndDonorOfDeliveryUpdate(delivererSessionData, deliveryUpdateNotificationData);
    }

    throw new Error('No rows have returned from the scheduleDelivery() SQL function call, caused by deliverer with ID ' + delivererSessionData.appUserKey);
}
