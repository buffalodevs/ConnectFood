'use strict'
import { query, QueryResult } from './../database-util/connection-pool';
import { fixNullQueryArgs } from '../database-util/prepared-statement-util';
import { logSqlConnect, logSqlQueryExec, logSqlQueryResult } from './../logging/sql-logger';

import { DateFormatter } from '../../../shared/common-util/date-formatter';
import { Delivery } from '../../../shared/deliverer/delivery';


export function cancelDelivery(deliveryFoodListingKey: number, cancelledByAppUserKey: number, cancelReason: string): Promise<void> {

    let queryString: string = 'SELECT * FROM cancelDelivery($1, $2, $3)';
    let queryArgs: any[] = [ deliveryFoodListingKey, cancelledByAppUserKey, cancelReason ];

    queryString = fixNullQueryArgs(queryString, queryArgs);
    logSqlQueryExec(queryString, queryArgs);

    return query(queryString, queryArgs)
        .then((queryResult: QueryResult) => {

            logSqlQueryResult(queryResult.rows);
            
            if (queryResult.rowCount === 1) {
                console.log('Successfully cancelled a Delivery');
                return emailCancelledNotification(queryResult.rows[0].delivery);
            }

            throw new Error('An incorrect number of rows have returned from the scheduleDelivery() SQL function call');
        })
        .catch((err: Error) => {
            console.log(err);
            throw new Error('Sorry, an unexpected error occured when cancelling the delivery');
        });
}


export function emailCancelledNotification(cancelledDelivery: Delivery): Promise<void> {
    // TODO: Email/Text deliverer, receiver, and donor about the cancelled delivery.
    return Promise.resolve();
}
