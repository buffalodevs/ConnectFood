'use strict'
import { query, QueryResult } from './../database-util/connection-pool';
import { fixNullQueryArgs, toPostgresArray } from './../database-util/prepared-statement-util';
import { logSqlConnect, logSqlQueryExec, logSqlQueryResult } from './../logging/sql-logger';

import { getDrivingDistTime, GPSCoordinate, DriveDistTime } from './../common-util/geocode';
import { DeliveryFilters } from './../../../shared/deliverer/delivery-filters';
import { Delivery } from "./../../../shared/deliverer/delivery";
import { DateFormatter } from "./../../../shared/common-util/date-formatter";


/**
 * Gets scheduled (DeliveryFoodListings + ClaimedFoodListings + FoodListings) and/or unscheduled deliveries (ClaimedFoodListings + FoodListings).
 * @param filters The filter criteria.
 * @param myAppUserKey The key identifier for the App User that is logged in (making this call).
 * @param myGPSCoordinate The GPS Coordinates of the (driver) App User that is logged in.
 * @return A Promise that resolves to an array of Food Listings that have been retrieved.
 */
export function getDeliveries(filters: DeliveryFilters, myAppUserKey: number, myGPSCoordinate: GPSCoordinate): Promise<Delivery[]> {
   
    // Build our prepared statement.
    let queryString: string = 'SELECT * FROM getDeliveries($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);';
    let queryArgs: any[] = [ myAppUserKey, filters.retrievalOffset, filters.retrievalAmount,
                             filters.deliveryFoodListingKey, filters.claimedFoodListingKey,
                             filters.maxDistance, filters.maxTotalWeight, filters.unscheduledDeliveries,
                             filters.myScheduledDeliveries, filters.matchAvailability ];

    // Replace any NULL query arguments with literals in query string.
    queryString = fixNullQueryArgs(queryString, queryArgs);
    logSqlQueryExec(queryString, queryArgs);

    return query(queryString, queryArgs)
        .then((queryResult: QueryResult) => {
            logSqlQueryResult(queryResult.rows);
            return generateResultArray(queryResult.rows, myGPSCoordinate);
        })
        .catch((err: Error) => {
            console.log(err);
            return Promise.reject(new Error('Food listing search unexpectedly failed'));
        });
}


/**
 * Generates the result Food Listing array. All Food Listings that have met the filter criteria will be entered into this array.
 * @param rows The database function result rows.
 * @return The Delivery Food Listings array that was generated.
 */
function generateResultArray(rows: any[], myGPSCoordinate: GPSCoordinate): Promise<Delivery[]> {

    let deliveries: Delivery[] = [];

    // Go through each row of the database output (each row corresponds to a Food Listing).
    for (let i: number = 0; i < rows.length; i++) {

        // Insert returned data into result arrays.
        deliveries.push(rows[i].delivery);
    }

    return getFullTripDrivingDistances(deliveries, myGPSCoordinate);
}


/**
 * Gets the full delivery trip's driving distances and times  for segments from Deliverer origin to Donor and from Donor to Receiver.
 * Fills in the distance and time information in each Delivery Food Listing provided to this function.
 * @param deliveries The deliveries that have been retreived but have not yet had distance information filled in yet.
 * @param myGPSCoordinate The GPS Coordinate of the logged in user (deliverer).
 * @param donorGPSCoordinates The GPS Coordinates of the donors.
 * @param receivergpscoordinates The GPS Coordinates of the receivers.
 * @return A promise that resolves to the Delivery Food Listings array that was passed in with filled in distance data.
 */
function getFullTripDrivingDistances(deliveries: Delivery[], myGPSCoordinate: GPSCoordinate): Promise<Delivery[]>
{
    let donorGPSCoordinates: Array<GPSCoordinate> = new Array<GPSCoordinate>();
    let receiverGPSCoordinates: Array<GPSCoordinate> = new Array<GPSCoordinate>();

    // First, extract a list of Donor & Receiver GPS Coordinates from deliveryFoodListings results.
    for (let i: number = 0; i < deliveries.length; i++) {
        donorGPSCoordinates.push(deliveries[i].donorInfo.gpsCoordinate);
        receiverGPSCoordinates.push(deliveries[i].receiverInfo.gpsCoordinate);
    }

    // Next calculate and store Deliverer to Donor and Donor to Receiver driving distances & times.
    return getDrivingDistTimeToDonors(deliveries, myGPSCoordinate, donorGPSCoordinates)
        .then((deliveries: Delivery[]) => {
            return getDrivingDistTimeFromReceiversToDonors(deliveries, donorGPSCoordinates, receiverGPSCoordinates);
        });
}


/**
 * Gets the driving distances from the Deliverer origin to each Donor.
 * Fills in the distance information in each Delivery Food Listing provided to this function.
 * @param deliveries The Deliveries that have been retreived but have not yet had distance information filled in yet.
 * @param myGPSCoordinate The GPS Coordinate of the logged in user (deliverer).
 * @param donorGPSCoordinates The GPS Coordinates of the donors.
 * @return A promise that resolves to the Delivery Food Listings array that was passed in, but with added filled in to-donor distance data.
 */
function getDrivingDistTimeToDonors(deliveries: Delivery[], myGPSCoordinate: GPSCoordinate, donorGPSCoordinates: GPSCoordinate[]): Promise<Delivery[]> {

    return getDrivingDistTime(myGPSCoordinate, donorGPSCoordinates)
        .then((driveDistTime: DriveDistTime[]) => {
            for (let i: number = 0; i < driveDistTime.length; i++) {
                deliveries[i].donorInfo.drivingDistance = driveDistTime[i].driveDistanceMi;
                deliveries[i].donorInfo.drivingTime = driveDistTime[i].driveDurationMin;
            }

            return deliveries;
        });
}


/**
 * Gets the driving distances and times from the Donors to corresponding Receivers (Donor-Receiver pairs).
 * Fills in the distance and time information in each Delivery Food Listing provided to this function.
 * @param deliveries The Deliveries that have been retreived but have not yet had donor to receiver distance information filled in yet.
 * @param donorGPSCoordinates The GPS Coordinates of the donors.
 * @param receiverGPSCoordinates The GPS Coordinates of the receivers.
 * @param index Should not be provided by external call to this function!!! Used to keep track of index in recursvie function calls (internally ONLY)!
 * @return A promise that resolves to the Delivery Food Listings array that was passed in, but with added filled in donor-to-receiver distance data.
 */
function getDrivingDistTimeFromReceiversToDonors(deliveries: Delivery[], donorGPSCoordinates: GPSCoordinate[],
                                                 receiverGPSCoordinates: GPSCoordinate[], index: number = 0): Promise<Delivery[]>
{
    // Ensure that we do not have an empty list.
    if (deliveries.length === 0)  return Promise.resolve(deliveries);

    // TODO: Look for a way to do this in batch (multiple separate network requests are inefficient). 
    return getDrivingDistTime(donorGPSCoordinates[index], [receiverGPSCoordinates[index]])
        .then((driveDistTime: DriveDistTime[]) => {
            
            deliveries[index].receiverInfo.drivingDistance = driveDistTime[0].driveDistanceMi;
            deliveries[index].receiverInfo.drivingTime = driveDistTime[0].driveDurationMin;

            // If we have recursively gone through the whole list.
            if (++index === deliveries.length) {
                return deliveries;
            }
            else {
                return getDrivingDistTimeFromReceiversToDonors(deliveries, donorGPSCoordinates, receiverGPSCoordinates, index);
            }
        });
}
