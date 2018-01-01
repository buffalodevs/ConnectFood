'use strict'
import { query, QueryResult } from './../database-util/connection-pool';
import { logSqlConnect, logSqlQueryExec, logSqlQueryResult } from './../logging/sql-logger';

import { TimeRange } from '../../../shared/app-user/time-range';


/**
 * Gets the possible delivery times for a Deliverer who wishes to claim a delivery for the future.
 * @param claimedFoodListingKey The Claimed Food Listing Key (ID) from which to get associated Donor and Reiver availability times.
 * @param myAppUserKey The App User Key (ID) for the current user (Deliverer).
 */
export function getPossibleDeliveryTimes(claimedFoodListingKey: number, myAppUserKey: number): Promise<TimeRange[]> {

    let queryString: string = 'SELECT * FROM getPossibleDeliveryTimes($1, $2)';
    let queryArgs: any[] = [ claimedFoodListingKey, myAppUserKey ];
    logSqlQueryExec(queryString, queryArgs);

    return query(queryString, queryArgs)
        .then((results: QueryResult) => {

            let possibleDeliveryTimes: Array<TimeRange> = new Array<TimeRange>();

            for (let i: number = 0; i < results.rowCount; i++) {
                let possibleDeliveryTime: any = results.rows[i].getPossibleDeliveryTimes;
                possibleDeliveryTimes.push(new TimeRange(new Date(possibleDeliveryTime.startDate), new Date(possibleDeliveryTime.endDate)));
            }

            return possibleDeliveryTimes;
        })
        .catch((err: Error) => {
            console.log(err);
            throw new Error('An unexpected problem occured. Failed to get possible delivery times.');
        });
}
