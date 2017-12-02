'use strict'
import { query, QueryResult } from './../database-util/connection-pool';
import { fixNullQueryArgs } from '../database-util/prepared-statement-util';
import { logSqlConnect, logSqlQueryExec, logSqlQueryResult } from './../logging/sql-logger';
import { DateFormatter } from '../common-util/date-formatter';


export function scheduleDeliveryFoodListing(claimedFoodListingKey: number, myAppUserKey: number, startImmediately: boolean, scheduledStartTime: Date): Promise<void> {

    // scheduledStartTime was likely converted to a string in the JSON request message!
    DateFormatter.ensureIsDate(scheduledStartTime);

    let queryString: string = 'SELECT * FROM scheduleDeliveryFoodListing($1, $2, $3, $4)';
    let queryArgs: any[] = [ claimedFoodListingKey, myAppUserKey, startImmediately, scheduledStartTime ];

    queryString = fixNullQueryArgs(queryString, queryArgs);
    logSqlQueryExec(queryString, queryArgs);

    return query(queryString, queryArgs)
        .then((queryResult: QueryResult) => {
            console.log('Successfully scheduled a new Delivery Food Listing');
        })
        .catch((err: Error) => {
            console.log(err);
            throw new Error('Sorry, an unexpected error occured when ' + (startImmediately ? 'starting' : 'scheduling') + ' the delivery');
        });
}