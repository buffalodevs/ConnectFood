'use strict'
import { query, QueryResult } from '../database-util/connection-pool';
import { addArgPlaceholdersToQueryStr } from '../database-util/prepared-statement-util';
import { logSqlQueryExec, logSqlQueryResult } from '../logging/sql-logger';
import { logger, prettyjsonRender } from '../logging/logger';
import * as _ from 'lodash';

import { getDrivingDistTime, GPSCoordinate, DriveDistTime } from '../geocode/geocode';
import { FoodListingsFilters, LISTINGS_STATUS } from '../../../shared/src/receiver-donor/food-listings-filters';
import { FoodListing } from "../../../shared/src/receiver-donor/food-listing";
import { Validation } from '../../../shared/src/validation/validation';
import { DateFormatter } from '../../../shared/src/date-time-util/date-formatter';


/**
 * Gets the Food Listings that meet a given set of filter criteria.
 * @param filters The filter criteria.
 * @param myAppUserKey The key identifier for the App User that is logged in (making this call).
 * @param myGPSCoordinate The GPS Coordinates of the organization associated with the App User this is logged in (making this call).
 * @return A Promise that resolves to an array of Food Listings that have been retrieved.
 */
export async function getFoodListings(filters: FoodListingsFilters, myAppUserKey: number, myGPSCoordinate: GPSCoordinate): Promise <FoodListing[]> {

    sanitizeFilters(filters);

    // Build our prepared statement.    
    let queryArgs: any[] = [
        myAppUserKey,
        filters.retrievalOffset,
        filters.retrievalAmount,
        null,
        filters.foodTypes,
        filters.needsRefrigeration,
        filters.availableAfterDate,
        (filters.listingsStatus === LISTINGS_STATUS.unclaimedListings),
        (filters.listingsStatus === LISTINGS_STATUS.myDonatedListings),
        (filters.listingsStatus === LISTINGS_STATUS.myClaimedListings),
        filters.matchRegularAvailability
    ];
    let queryString = addArgPlaceholdersToQueryStr('SELECT * FROM getFoodListings();', queryArgs);
    logSqlQueryExec(queryString, queryArgs);

    try {
        const queryResult: QueryResult = await query(queryString, queryArgs);
        logSqlQueryResult(queryResult.rows);

        return await generateResultArray(queryResult.rows, myGPSCoordinate, (filters.listingsStatus === LISTINGS_STATUS.myDonatedListings));
    }
    catch (err) {
        logger.error(prettyjsonRender(err));
        throw new Error('Food listing search failed');
    }
}


/**
 * Sanitizes all filters values. Any values that must be auto corrected before being sent to the data access layer (SP) for data retrieval
 * will be modified internally. If any filters have errors and cannot be corrected, then an associated Error will be thrown.
 * @param filters The original filters values.
 *                NOTE: Modified internally.
 */
function sanitizeFilters(filters: FoodListingsFilters): void {

    const validation: Validation = new Validation();
    if (!validation.validateRetrievalLimts(filters.retrievalOffset, filters.retrievalAmount)) {
        throw new Error('Retrieval offset or amount is not within correct range.');
    }

    const dateFormatter: DateFormatter = new DateFormatter();
    filters.availableAfterDate = dateFormatter.ensureIsDate(filters.availableAfterDate);
    if (!_.isDate(filters.availableAfterDate)) {
        throw new Error('Available After Date filter is not in correct date format.');
    }

    filters.foodTypes = sanitizeFoodTypes(filters.foodTypes);
    filters.matchRegularAvailability = sanitizeMatchRegularAvailability(filters.matchRegularAvailability, filters.listingsStatus);
    filters.needsRefrigeration = sanitizeNeedsRefrigeration(filters.needsRefrigeration, filters.needsRefrigeration);
}


/**
 * Generates a refined Food Types argument.
 * @param foodTypes The original Food Types filter.
 * @return If the given Food Types filter is impty, then null is returned, otherwise the filter value is returned.
 */
function sanitizeFoodTypes(foodTypes: string[]): string[] {
    return ( _.isEmpty(foodTypes) ? null : foodTypes );
}


/**
 * Generates a refined match regular availability flag arugment.
 * Make sure we are only matching regular availability when looking for other listings in Receive tab (not in user's personal cart).
 * @param matchRegularAvailability The original match regular availability filter.
 * @param listingsStatus The status of the listings to retrieve.
 * @return true if we should match regular availability, false if not.
 */
function sanitizeMatchRegularAvailability(matchRegularAvailability: boolean, listingsStatus: LISTINGS_STATUS): boolean {
    return ( matchRegularAvailability && listingsStatus === LISTINGS_STATUS.unclaimedListings );
}


/**
 * Generates the perishablility argument.
 * @param perishable Set true if including perishable listings.
 * @param notPerishable Set true if including non-perishable listings.
 * @return true if only perishable items should be included, false if only non-perishable should be included, and null if both (don't care).
 */
function sanitizeNeedsRefrigeration(needsRefrigeration: boolean, notNeedsRefrigeration: boolean): boolean {

    const notBoth = !(needsRefrigeration && notNeedsRefrigeration);
    const notNeither = (needsRefrigeration || notNeedsRefrigeration);

    // If exactly one filter is only active, then we apply original filter.
    return (notBoth && notNeither) ? needsRefrigeration
                                   : null;
}


/**
 * Generates the result Food Listing array. All Food Listings that have met the filter criteria will be entered into this array.
 * @param rows The database function result rows.
 * @param myGPSCoordinate The GPS Coordinates of the App User who is logged in and triggering the execution of this function.
 * @param myDonatedListingsOnly A flag signifying whether or not the listings that were retrieved are the logged in App User's donated items only (donor cart).
 * @return A promise that resolves the the result Food Listing array.
 */
async function generateResultArray(rows: any[], myGPSCoordinate: GPSCoordinate, myDonatedListingsOnly: boolean): Promise <FoodListing[]> {

    let foodListings: FoodListing[] = [];
    let donorGPSCoordinates: GPSCoordinate[] = [];

    // Go through each row of the database output (each row corresponds to a Food Listing).
    for (let i: number = 0; i < rows.length; i++) {
        
        // Insert returned data into result arrays.
        foodListings.push(rows[i].foodlisting);

        if (foodListings[i].donorInfo == null) {
            throw new Error('donorInfo member of queried Food Listing should NOT be null.');
        }
        donorGPSCoordinates.push(foodListings[i].donorInfo.contactInfo.gpsCoordinate);
    }

    // If in Donor Cart, then we don't care about seeing driving distances!
    if (myDonatedListingsOnly)  return Promise.resolve(foodListings);

    // In Receive tab or Receiver Cart, we do care about driving distances!
    const driveDistTime: DriveDistTime[] = await getDrivingDistTime(myGPSCoordinate, donorGPSCoordinates);
    
    for (let i: number = 0; i < driveDistTime.length; i++) {
        foodListings[i].donorInfo.contactInfo.drivingDistance = driveDistTime[i].driveDistanceMi;
        foodListings[i].donorInfo.contactInfo.drivingTime = driveDistTime[i].driveDurationMin;
    }

    return foodListings;
    // NOTE: No need to handle error since friendly error message generated in getDrivingDistances() and should bubble up to controller for client!
}
