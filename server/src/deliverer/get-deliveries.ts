'use strict'
import { query, QueryResult } from './../database-util/connection-pool';
import { addArgPlaceholdersToQueryStr } from './../database-util/prepared-statement-util';
import { logSqlConnect, logSqlQueryExec, logSqlQueryResult } from './../logging/sql-logger';

import { getDrivingDistTime, GPSCoordinate, DriveDistTime } from './../geocode/geocode';
import { fillFullTripDrivingDistances } from './delivery-util/delivery-geocode-util';
import { availabilityToAbsDateRanges } from '../common-util/date-time-util';

import { DeliveryFilters } from './../../../shared/src/deliverer/delivery-filters';
import { Delivery } from "./../../../shared/src/deliverer/delivery";
import { Deserializer } from "./../../../shared/src/deserialization/deserializer";


const DESERIALIZER: Deserializer = new Deserializer();


/**
 * Gets scheduled (DeliveryFoodListings + ClaimedFoodListings + FoodListings) and/or unscheduled deliveries (ClaimedFoodListings + FoodListings).
 * @param filters The filter criteria.
 * @param myAppUserKey The key identifier for the App User that is logged in (making this call).
 * @param myGPSCoordinate The GPS Coordinates of the (driver) App User that is logged in.
 * @return A Promise that resolves to an array of Food Listings that have been retrieved.
 */
export async function getDeliveries(filters: DeliveryFilters, myAppUserKey: number, myGPSCoordinate: GPSCoordinate): Promise <Delivery[]> {
   
    // Build our prepared statement.
    let queryArgs: any[] = [
        myAppUserKey,
        filters.retrievalOffset,
        filters.retrievalAmount,
        filters.deliveryFoodListingKey,
        filters.claimedFoodListingKey,
        filters.maxDistance,
        filters.maxEstimatedWeight,
        filters.unscheduledDeliveries,
        filters.myScheduledDeliveries,
        filters.matchRegularAvailability,
        filters.deliveryState
    ];

    // Insert query argument placeholders and preprocess query arguments.
    let queryString: string = addArgPlaceholdersToQueryStr('SELECT * FROM getDeliveries();', queryArgs);
    logSqlQueryExec(queryString, queryArgs);

    try {
        const queryResult: QueryResult = await query(queryString, queryArgs);

        logSqlQueryResult(queryResult.rows);
        return generateResultArray(queryResult.rows, myGPSCoordinate);
    }
    catch (err) {
        console.log(err);
        throw new Error('Food listing search unexpectedly failed');
    }
}


/**
 * Generates the result Food Listing array. All Food Listings that have met the filter criteria will be entered into this array.
 * @param rows The database function result rows.
 * @return The Delivery Food Listings array that was generated.
 */
function generateResultArray(rows: any[], myGPSCoordinate: GPSCoordinate): Promise <Delivery[]> {

    let deliveries: Delivery[] = [];

    // Go through each row of the database output (each row corresponds to a Food Listing).
    for (let i: number = 0; i < rows.length; i++) {

        // Insert deserialized returned data into result arrays.
        let delivery: Delivery = DESERIALIZER.deserialize(rows[i].delivery, Delivery);
        delivery.possibleDeliveryTimes = availabilityToAbsDateRanges(delivery.possibleDeliveryTimes);
        deliveries.push(delivery);
    }

    return fillFullTripDrivingDistances(deliveries, myGPSCoordinate);
}
