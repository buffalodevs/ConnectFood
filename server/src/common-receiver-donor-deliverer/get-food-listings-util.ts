import _ = require("lodash");
import { QueryResult, query } from "../database-util/connection-pool";
import { logSqlQueryResult, logSqlQueryExec } from "./../logging/sql-logger";
import { addArgPlaceholdersToQueryStr } from "../database-util/prepared-statement-util";

import { FoodListing } from "../../../shared/src/common-receiver-donor-deliverer/food-listing";
import { FoodListingFilters, FoodType, FoodListingsStatus } from "../../../shared/src/common-receiver-donor-deliverer/food-listing-filters";
import { Validation } from "../../../shared/src/validation/validation";
import { DESERIALIZER } from "../deserialization/deserialization";

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
    filters.matchRegularAvailability = sanitizeMatchRegularAvailability(filters.matchRegularAvailability, filters.foodListingsStatus);
    filters.needsRefrigeration = sanitizeNeedsRefrigeration(filters.needsRefrigeration, filters.notNeedsRefrigeration);
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
 * @param matchRegularAvailability The original match regular availability filter.
 * @param listingsStatus The status of the listings to retrieve.
 * @return true if we should match regular availability, false if not.
 */
function sanitizeMatchRegularAvailability(matchRegularAvailability: boolean, listingsStatus: FoodListingsStatus): boolean {
    return ( matchRegularAvailability && listingsStatus === FoodListingsStatus.unclaimedListings );
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
 * Executes the getFoodListings() SQL function query using given filters.
 * NOTE: Performs all logging tasks related to query execution and result.
 * @param filters The filters to apply to the query.
 * @param myAppUserKey The key ID of the user who is submitting the query.
 * @return A promise that resolves to the Query Result.
 */
export async function queryGetFoodListings(filters: FoodListingFilters, myAppUserKey: number): Promise <QueryResult> {

    // Build our prepared statement.    
    let queryArgs: any[] = [
        myAppUserKey,
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
