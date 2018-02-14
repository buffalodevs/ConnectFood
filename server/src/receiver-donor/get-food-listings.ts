'use strict'
import { sanitizeFilters, queryGetFoodListings, QueryResult, processGetFoodListingsResult } from "../common-receiver-donor-deliverer/get-food-listings-util";
import { logger, prettyjsonRender } from '../logging/logger';
import { getDrivingDistTime, GPSCoordinate, DriveDistTime } from '../geocode/geocode';

import { FoodListingFilters } from '../../../shared/src/common-receiver-donor-deliverer/food-listing-filters';
import { FoodListing, FoodListingsStatus } from "../../../shared/src/common-receiver-donor-deliverer/food-listing";


/**
 * Gets the Food Listings that meet a given set of filter criteria.
 * @param filters The filter criteria.
 * @param myAppUserKey The key identifier for the App User that is logged in (making this call).
 * @param myGPSCoordinate The GPS Coordinates of the organization associated with the App User this is logged in (making this call).
 * @return A Promise that resolves to an array of Food Listings that have been retrieved.
 */
export async function getFoodListings(filters: FoodListingFilters, myAppUserKey: number, myGPSCoordinate: GPSCoordinate): Promise <FoodListing[]> {

    sanitizeFilters(filters);

    try {
        const queryResult: QueryResult = await queryGetFoodListings(filters, myAppUserKey);
        return await generateResultArray(queryResult, myGPSCoordinate, (filters.foodListingsStatus === FoodListingsStatus.myDonatedListings));
    }
    catch (err) {
        logger.error(prettyjsonRender(err));
        throw new Error('Food listing search failed');
    }
}


/**
 * Generates the result Food Listing array. All Food Listings that have met the filter criteria will be entered into this array.
 * @param queryResult The getFoodListings() SQL function result.
 * @param myGPSCoordinate The GPS Coordinates of the App User who is logged in and triggering the execution of this function.
 * @param myDonatedListingsOnly A flag signifying whether or not the listings that were retrieved are the logged in App User's donated items only (donor cart).
 * @return A promise that resolves the the result Food Listing array.
 */
async function generateResultArray(queryResult: QueryResult, myGPSCoordinate: GPSCoordinate, myDonatedListingsOnly: boolean): Promise <FoodListing[]> {

    // Process query result into deserialized Food Listings array and grab all Donor GPS Coordinates.
    let donorGPSCoordinates: GPSCoordinate[] = [];
    let foodListings: FoodListing[] = processGetFoodListingsResult(queryResult, (foodListing: FoodListing) => {

        donorGPSCoordinates.push(foodListing.donorInfo.contactInfo.gpsCoordinate);
        return foodListing;
    });

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
