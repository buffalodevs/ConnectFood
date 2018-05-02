import _ = require("lodash");

import { QueryResult, query } from "../database-util/connection-pool";
import { addArgPlaceholdersToQueryStr } from "../database-util/prepared-statement-util";
import { logSqlQueryResult, logSqlQueryExec } from "./../logging/sql-logger";
import { logger, prettyjsonRender } from "../logging/logger";
import { DESERIALIZER } from "../deserialization/deserialization";
import { DriveDistTime, getDrivingDistTime } from "../geocode/geocode";
import { fillFullTripDrivingDistances } from "../geocode/delivery-geocode-util";

import { FoodListing } from "../../../shared/src/common-user/food-listing";
import { FoodListingFilters, FoodType, FoodListingsStatus } from "../../../shared/src/common-user/food-listing-filters";
import { Validation } from "../../../shared/src/validation/validation";
import { AppUserType, GPSCoordinate } from "../../../shared/src/app-user/app-user";


/**
 * Gets Food Listings for any user type based off of a set of filter criteria.
 * NOTE: Internally sanitizes and derives missing filters.
 * @param filters The filter criteria for the retrieval of Food Listings.
 * @param myAppUserKey The App User Key of the user issuing the query.
 * @param myGPSCoordinate The GPS Coordinates of the user issuing the query.
 * @return A promise resolving to the retrieved and processed Food Listings array.
 */
export async function getFoodListings(filters: FoodListingFilters, myAppUserKey: number, myGPSCoordinate: GPSCoordinate): Promise <FoodListing[]> {

    sanitizeFilters(filters);
    const appUserType: AppUserType = deriveAppUserType(filters.foodListingsStatus);

    try {
        const queryResult: QueryResult = await queryGetFoodListings(filters, myAppUserKey, appUserType);

        switch (filters.foodListingsStatus) {
            // Donor
            case FoodListingsStatus.myDonatedListings:
                return await generateResultArrayDonor(queryResult);

            // Receiver
            case FoodListingsStatus.unclaimedListings:
            case FoodListingsStatus.myClaimedListings:
                return await generateResultArrayReceiver(queryResult, myGPSCoordinate);
                
            // Deliverer
            case FoodListingsStatus.unscheduledDeliveries:
            case FoodListingsStatus.myScheduledDeliveries:
                return await generateResultArrayDeliverer(queryResult, myGPSCoordinate);
        }
        return 
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
function sanitizeFilters(filters: FoodListingFilters): void {

    const validation: Validation = new Validation();
    if (!validation.validateRetrievalLimts(filters.retrievalOffset, filters.retrievalAmount)) {
        throw new Error('Retrieval offset or amount is not within correct range.');
    }

    filters.foodTypes = sanitizeFoodTypes(filters.foodTypes);
    filters.matchRegularAvailability = sanitizeMatchRegularAvailability(filters);
    filters.needsRefrigeration = sanitizeNeedsRefrigeration(filters.needsRefrigeration, filters.notNeedsRefrigeration);
    filters.maxDistance = sanitizeMaxDistance(filters.foodListingsStatus, filters.maxDistance);

    logger.debug(prettyjsonRender(filters));
}


/**
 * Generates a refined Food Types argument.
 * @param foodTypes The original Food Types filter.
 * @return If the given Food Types filter is impty, then null is returned, otherwise the filter value is returned.
 */
function sanitizeFoodTypes(foodTypes: FoodType[]): FoodType[] {
    return _.isEmpty(foodTypes) ? null
                                : foodTypes;
}


/**
 * Generates a refined match regular availability flag arugment.
 * Make sure we are only matching regular availability when looking for other listings in Receive tab (not in user's personal cart).
 * @param filters The Food Listing Filters containing availability match flags.
 * @return true if we should match regular availability, false if not.
 */
function sanitizeMatchRegularAvailability(filters: FoodListingFilters): boolean {

    // If we are in a cart, then we don't care about matching availability.
    if (filters.foodListingsStatus === FoodListingsStatus.myClaimedListings ||
        filters.foodListingsStatus === FoodListingsStatus.myDonatedListings ||
        filters.foodListingsStatus === FoodListingsStatus.myScheduledDeliveries )
    { return false; }

    // Else, we want to match by some availability criteria if not in a cart. If no availability criteria is set, then force match regular availability.
    return ( filters.matchRegularAvailability || !filters.matchAvailableNow );
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
 * Sanitizes/generates max distance argument.
 * @param foodListingsStatus The status of listings that are to be retrieved.
 * @param maxDistance The max distance filter provided by the user.
 * @return The max distance argument.
 */
function sanitizeMaxDistance(foodListingsStatus: FoodListingsStatus, maxDistance: number): number {

    // If in Donor or Receiver Cart, then ignore max distance filter.
    if (foodListingsStatus === FoodListingsStatus.myDonatedListings || foodListingsStatus === FoodListingsStatus.myClaimedListings) {
        return null;
    }
    
    if (maxDistance == null) {
        return 30;
    }

    return maxDistance;
}


/**
 * Derives the App User Type based off of given Food Listings Status in filters.
 * NOTE: We do not use the App User's assigned type here since a Donor can fill the roll of a Receiver and vice versa. The user's chosen type only reflects their
 *       primary motivation for using the app.
 * @param foodListingsStatus The status of the Food Listings that should be pulled back.
 * @return The derived App User Type.
 */
function deriveAppUserType(foodListingsStatus: FoodListingsStatus): AppUserType {

    if (foodListingsStatus === FoodListingsStatus.unclaimedListings || foodListingsStatus === FoodListingsStatus.myClaimedListings) {
        return AppUserType.Receiver;
    }
    
    if (foodListingsStatus === FoodListingsStatus.myDonatedListings) {
        return AppUserType.Donor;
    }

    return ( foodListingsStatus != null ) ? AppUserType.Deliverer
                                          : null;
}


/**
 * Executes the getFoodListings() SQL function query using given filters.
 * NOTE: Performs all logging tasks related to query execution and result.
 * @param filters The filters to apply to the query.
 * @param myAppUserKey The key ID of the user who is submitting the query.
 * @param appUserType The type of the App User issuing the query. NOTE: May not be the active user's primary user type (e.g. A Donor can act as a Receiver, vice-versa).
 * @return A promise that resolves to the Query Result.
 */
export async function queryGetFoodListings(filters: FoodListingFilters, myAppUserKey: number, appUserType: AppUserType): Promise <QueryResult> {

    // Build our prepared statement.    
    let queryArgs: any[] = [
        myAppUserKey,
        appUserType,
        filters.foodListingKey,
        filters.claimInfoKey,
        filters.deliveryInfoKey,
        filters
    ];
    let queryString = addArgPlaceholdersToQueryStr('SELECT * FROM getFoodListings();', queryArgs);
    logSqlQueryExec(queryString, queryArgs);

    const queryResult: QueryResult = await query(queryString, queryArgs);   
    logSqlQueryResult(queryResult.rows);
    return queryResult;
}


/**
 * Generates the result Food Listing array. All Food Listings that have met the filter criteria will be entered into this array.
 * @param queryResult The getFoodListings() SQL function result.
 * @return A promise that resolves the the result Food Listing array.
 */
async function generateResultArrayDonor(queryResult: QueryResult): Promise <FoodListing[]> {

    // If in Donor Cart, then we don't care about seeing driving distances!
    return processGetFoodListingsResult(queryResult);
}


/**
 * Generates the result Food Listing array. All Food Listings that have met the filter criteria will be entered into this array.
 * @param queryResult The getFoodListings() SQL function result.
 * @param myGPSCoordinate The GPS Coordinates of the App User who is logged in and triggering the execution of this function.
 * @return A promise that resolves the the result Food Listing array.
 */
async function generateResultArrayReceiver(queryResult: QueryResult, myGPSCoordinate: GPSCoordinate): Promise <FoodListing[]> {

    // Process query result into deserialized Food Listings array and grab all Donor GPS Coordinates.
    const donorGPSCoordinates: GPSCoordinate[] = [];
    const foodListings: FoodListing[] = processGetFoodListingsResult(queryResult, (foodListing: FoodListing) => {

        donorGPSCoordinates.push(foodListing.donorInfo.contactInfo.gpsCoordinate);
        return foodListing;
    });

    const driveDistTime: DriveDistTime[] = await getDrivingDistTime(myGPSCoordinate, donorGPSCoordinates);
    
    for (let i: number = 0; i < driveDistTime.length; i++) {
        foodListings[i].donorInfo.contactInfo.drivingDistance = driveDistTime[i].driveDistanceMi;
        foodListings[i].donorInfo.contactInfo.drivingTime = driveDistTime[i].driveDurationMin;
    }

    return foodListings;
    // NOTE: No need to handle error since friendly error message generated in getDrivingDistances() and should bubble up to controller for client!
}


/**
 * Generates the result Food Listing array. All Food Listings that have met the filter criteria will be entered into this array.
 * @param queryResult The getFoodListings() SQL function query result.
 * @param myGPSCoordinate The GPS Coordinates of the (driver) App User that is logged in.
 * @return The (Delivery) Food Listings array that was generated.
 */
async function generateResultArrayDeliverer(queryResult: QueryResult, myGPSCoordinate: GPSCoordinate): Promise <FoodListing[]> {

    const foodListings: FoodListing[] = processGetFoodListingsResult(queryResult);
    return await fillFullTripDrivingDistances(foodListings, myGPSCoordinate);
}


/**
 * Processes the results of the getFoodListings() SQL function query. Includes deserialization of each result and generation of result Food Listing array.
 * @param queryResult The query result to process.
 * @param applyFn A funciton that should be applied to each Food Listing result (after it has been deserialized - should be type safe).
 * @return An array filled with the processed Food Listing results.
 */
function processGetFoodListingsResult(queryResult: QueryResult, applyFn?: (foodListing: FoodListing) => FoodListing): FoodListing[] {

    let foodListings: FoodListing[] = [];

    // Go through each row of the database output (each row corresponds to a Food Listing).
    for (let i: number = 0; i < queryResult.rows.length; i++) {
        
        // Deserialize returned food listing.
        let foodListing: FoodListing = queryResult.rows[i].foodlisting;
        foodListing = DESERIALIZER.deserialize(foodListing, FoodListing);
        
        // Apply any function to each Food Listing result and add to return array.
        if (applyFn != null)    applyFn(foodListing);
        foodListings.push(foodListing);
    }

    return foodListings;
}
