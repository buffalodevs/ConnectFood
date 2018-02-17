'use strict'
import { sanitizeFilters, queryGetFoodListings, QueryResult, processGetFoodListingsResult } from "./../common-receiver-donor-deliverer/get-food-listings-util";
import { logger, prettyjsonRender } from '../logging/logger';

import { getDrivingDistTime, GPSCoordinate } from './../geocode/geocode';
import { fillFullTripDrivingDistances } from './delivery-util/delivery-geocode-util';
import { relativeToAbsDateRanges } from '../common-util/date-time-util';

import { FoodListing } from '../../../shared/src/common-receiver-donor-deliverer/food-listing';
import { FoodListingFilters } from '../../../shared/src/common-receiver-donor-deliverer/food-listing-filters';


/**
 * Gets scheduled (DeliveryFoodListings + ClaimedFoodListings + FoodListings) and/or unscheduled deliveries (ClaimedFoodListings + FoodListings).
 * @param filters The filter criteria.
 * @param myAppUserKey The key identifier for the App User that is logged in (making this call).
 * @param myGPSCoordinate The GPS Coordinates of the (driver) App User that is logged in.
 * @param myUtcOffsetMins The offset (in minutes) of the (driver) logged in App User's time zone from the UTC time zone.
 * @return A Promise that resolves to an array of Food Listings that have been retrieved.
 */
export async function getDeliveries(filters: FoodListingFilters, myAppUserKey: number, myGPSCoordinate: GPSCoordinate, myUtcOffsetMins: number): Promise <FoodListing[]> {
   
    sanitizeFilters(filters);

    try {
        const queryResult: QueryResult = await queryGetFoodListings(filters, myAppUserKey);
        return await generateResultArray(queryResult, myGPSCoordinate, myUtcOffsetMins);
    }
    catch (err) {
        logger.error(prettyjsonRender(err));
        throw new Error('Food listing (Delivery) search unexpectedly failed');
    }
}


/**
 * Generates the result Food Listing array. All Food Listings that have met the filter criteria will be entered into this array.
 * @param queryResult The getFoodListings() SQL function query result.
 * @param myGPSCoordinate The GPS Coordinates of the (driver) App User that is logged in.
 * @param myUtcOffsetMins The offset (in minutes) of the (driver) logged in App User's time zone from the UTC time zone.
 * @return The (Delivery) Food Listings array that was generated.
 */
async function generateResultArray(queryResult: QueryResult, myGPSCoordinate: GPSCoordinate, myUtcOffsetMins: number): Promise <FoodListing[]> {

    let foodListings: FoodListing[] = processGetFoodListingsResult(queryResult, (foodListing: FoodListing) => {
        
        foodListing.claimInfo.possibleDeliveryTimes = relativeToAbsDateRanges(foodListing.claimInfo.possibleDeliveryTimes, myUtcOffsetMins);
        return foodListing;
    });

    return await fillFullTripDrivingDistances(foodListings, myGPSCoordinate);
}
