import { Express, Request, Response } from 'express';
import { logger, prettyjsonRender } from "./../logging/logger";

import { SessionData } from "../common-util/session-data";
import { getFoodListings } from './get-food-listings';
import { getFoodListingFilters } from "./get-food-listing-filters";

import { GetFoodListingsRequest, GetFoodListingsResponse, FoodListing } from '../../../shared/src/common-user/message/get-food-listings-message';
import { GetFoodListingFiltersRequest, GetFoodListingFiltersResponse } from '../../../shared/src/common-user/message/get-food-listing-filters-message';
import { FoodListingFilters } from "../../../shared/src/common-user/food-listing-filters";


export function handleGetFoodListings(request: Request, response: Response): void {

    response.setHeader('Content-Type', 'application/json');
    let getFoodListingsRequest: GetFoodListingsRequest = request.body;
    let sessionData: SessionData = SessionData.loadSessionData(request);

    getFoodListings(getFoodListingsRequest.filters, sessionData.appUserKey, sessionData.appUser.contactInfo.gpsCoordinate)
        .then((foodListings: FoodListing[]) => {
            response.send(new GetFoodListingsResponse(foodListings, true, 'Food Listings Successfully Retrieved'));
        })
        .catch((err: Error) => {
            logger.error(prettyjsonRender(err));
            response.send(new GetFoodListingsResponse(null, false, err.message));
        });
}


export async function handleGetFoodListingFilters(request: Request, response: Response): Promise <void> {
    
    response.setHeader('Content-Type', 'application/json');
    let getFoodListingFiltersRequest: GetFoodListingFiltersRequest = request.body;
    let sessionData: SessionData = SessionData.loadSessionData(request);

    try {

        const foodListingFilters: FoodListingFilters = await getFoodListingFilters(sessionData.appUserKey, getFoodListingFiltersRequest.foodListingFiltersKey);

        let foodListings: FoodListing[] = null;
        if (getFoodListingFiltersRequest.getFoodListings) {
            foodListings = await getFoodListings(foodListingFilters, sessionData.appUserKey, sessionData.appUser.contactInfo.gpsCoordinate);
        }

        response.send(new GetFoodListingFiltersResponse(foodListingFilters, foodListings, true, 'Food Listing Filters Successfully Retrieved'));
    }
    catch (err) {
        response.send(new GetFoodListingFiltersResponse(null, null, false, err.message));
    }
    
}
