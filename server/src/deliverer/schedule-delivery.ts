'use strict'
import { query, QueryResult } from './../database-util/connection-pool';
import { fixNullQueryArgs } from '../database-util/prepared-statement-util';
import { logSqlConnect, logSqlQueryExec, logSqlQueryResult } from './../logging/sql-logger';

import { DateFormatter } from '../../../shared/common-util/date-formatter';
import { Delivery } from '../../../shared/deliverer/delivery';


export function scheduleDelivery(claimedFoodListingKey: number, deliveryAppUserKey: number, startImmediately: boolean, scheduledStartTime: Date): Promise<void> {

    // scheduledStartTime was likely converted to a string in the JSON request message!
    DateFormatter.ensureIsDate(scheduledStartTime);

    let queryString: string = 'SELECT * FROM scheduleDelivery($1, $2, $3, $4)';
    let queryArgs: any[] = [
        claimedFoodListingKey,
        deliveryAppUserKey,
        startImmediately,
        DateFormatter.dateToDateTimeString(scheduledStartTime)
    ];

    queryString = fixNullQueryArgs(queryString, queryArgs);
    logSqlQueryExec(queryString, queryArgs);

    return query(queryString, queryArgs)

        .then((queryResult: QueryResult) => {
            
            logSqlQueryResult(queryResult.rows);

            if (queryResult.rowCount === 1) {
                console.log('Successfully scheduled a new Delivery');
                return emailScheduledNotification(queryResult.rows[0].delivery, startImmediately, scheduledStartTime);
            }

            throw new Error('An incorrect number of rows have returned from the scheduleDelivery() SQL function call');
        })

        .catch((err: Error) => {
            console.log(err);
            throw new Error('Sorry, an unexpected error occured when ' + (startImmediately ? 'starting' : 'scheduling') + ' the delivery');
        });
}


export function emailScheduledNotification(scheduledDelivery: Delivery, startImmediately: boolean, scheduledStartTime: Date): Promise<void> {
    
    
    
    return Promise.resolve();
}
