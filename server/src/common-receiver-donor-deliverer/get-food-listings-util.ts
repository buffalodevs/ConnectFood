import _ = require("lodash");
import { QueryResult, query } from "../database-util/connection-pool";
import { addArgPlaceholdersToQueryStr } from "../database-util/prepared-statement-util";
import { logSqlQueryResult, logSqlQueryExec } from "./../logging/sql-logger";
import { logger, prettyjsonRender } from "../logging/logger";
import { DESERIALIZER } from "../deserialization/deserialization";

import { FoodListing } from "../../../shared/src/common-receiver-donor-deliverer/food-listing";
import { FoodListingFilters, FoodType, FoodListingsStatus } from "../../../shared/src/common-receiver-donor-deliverer/food-listing-filters";
import { Validation } from "../../../shared/src/validation/validation";
import { AppUserType } from "../../../shared/src/app-user/app-user";

export { QueryResult };


/**
 * Sanitizes all filters values. Any values that must be auto corrected before being sent to the data access layer (SP) for data retrieval
 * will be modified internally. If any filters have errors and cannot be corrected, then an associated Error will be thrown.
 * @param filters The original filters values.
 *                NOTE: Modified internally.
 */
export function sanitizeFilters(filters: FoodListingFilters): void {

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
 * Executes the getFoodListings() SQL function query using given filters.
 * NOTE: Performs all logging tasks related to query execution and result.
 * @param filters The filters to apply to the query.
 * @param myAppUserKey The key ID of the user who is submitting the query.
 * @return A promise that resolves to the Query Result.
 */
export async function queryGetFoodListings(filters: FoodListingFilters, myAppUserKey: number): Promise <QueryResult> {

    let appUserType: AppUserType = deriveAppUserType(filters.foodListingsStatus);

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
 * Processes the results of the getFoodListings() SQL function query. Includes deserialization of each result and generation of result Food Listing array.
 * @param queryResult The query result to process.
 * @param applyFn A funciton that should be applied to each Food Listing result (after it has been deserialized - should be type safe).
 * @return An array filled with the processed Food Listing results.
 */
export function processGetFoodListingsResult(queryResult: QueryResult, applyFn?: (foodListing: FoodListing) => FoodListing): FoodListing[] {

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
