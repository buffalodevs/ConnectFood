'use strict'
import { query, QueryResult } from './../database-util/connection-pool';
import { fixNullQueryArgs } from '../database-util/prepared-statement-util';
import { logSqlConnect, logSqlQueryExec, logSqlQueryResult } from './../logging/sql-logger';

import { Delivery, DeliveryState } from '../../../shared/deliverer/delivery';


export function updateDeliveryState(deliveryFoodListingKey: number, deliveryAppUserKey: number, deliveryState: DeliveryState): Promise<void> {

    let queryString: string = 'SELECT * FROM updateDeliveryState($1, $2, $3)';
    let queryArgs: any[] = [
        deliveryFoodListingKey,
        deliveryAppUserKey,
        deliveryState
    ];

    queryString = fixNullQueryArgs(queryString, queryArgs);
    logSqlQueryExec(queryString, queryArgs);

    return query(queryString, queryArgs)

        .then((queryResult: QueryResult) => {
            
            logSqlQueryResult(queryResult.rows);

            if (queryResult.rowCount === 1) {
                console.log('Successfully updated the delivery state to: ' + deliveryState);
                return emailUpdateNotification(queryResult.rows[0].delivery, deliveryState);
            }

            throw new Error('An incorrect number of rows have returned from the updateDeliveryState() SQL function call');
        })

        .catch((err: Error) => {
            console.log(err);
            throw new Error('Sorry, an unexpected error occured when updating the state of the delivery');
        });
}


export function emailUpdateNotification(scheduledDelivery: Delivery, deliveryState: DeliveryState): Promise<void> {
    // TODO: Email/Text deliverer, receiver, and donor about the updated delivery.
    return Promise.resolve();
}
