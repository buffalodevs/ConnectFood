import { Request, Response } from 'express';
import { logger, prettyjsonRender } from "./../logging/logger";

import { SessionData } from "../common-util/session-data";
import { addFoodListing } from './donor/add-food-listing';
import { removeFoodListing } from "./donor/remove-food-listing";
import { getFoodListings } from './get-food-listings';
import { claimFoodListing } from './receiver/claim-food-listing';
import { unclaimFoodListing } from './receiver/unclaim-food-listing';

import { AddFoodListingRequest, AddFoodListingResponse } from '../../../shared/src/receiver-donor/message/add-food-listing-message'
import { GetFoodListingsRequest, GetFoodListingsResponse, FoodListing } from '../../../shared/src/common-receiver-donor-deliverer/message/get-food-listings-message';
import { ClaimFoodListingRequest } from '../../../shared/src/receiver-donor/message/claim-food-listing-message';
import { UnclaimRemoveFoodListingRequest } from '../../../shared/src/receiver-donor/message/unclaim-remove-food-listing-message';
import { FoodWebResponse } from "../../../shared/src/message-protocol/food-web-response";


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


export function handleAddFoodListing(request: Request, response: Response): void {

    response.setHeader('Content-Type', 'application/json');

    let addFoodListingRequest: AddFoodListingRequest = request.body;
    let imageUploads = <Express.Multer.File[]>request.files;
    let donorAppUserKey: number = SessionData.loadSessionData(request).appUserKey;

    addFoodListing(addFoodListingRequest.foodListing, imageUploads, donorAppUserKey)
        .then((foodListingKey: number) => {
            response.send(new AddFoodListingResponse(foodListingKey, true, 'Food Listing Added Successfully'));
        })
        .catch((err: Error) => {
            logger.error(prettyjsonRender(err));
            response.send(new AddFoodListingResponse(null, false, 'Food Listing Add Failed'));
        });
}


export function handleRemoveFoodListing(request: Request, response: Response): void {

    response.setHeader('Content-Type', 'application/json');

    let removeFoodListingRequest: UnclaimRemoveFoodListingRequest = request.body;
    // Need so we can verify that currently logged in user must be the original Donor (have authority to remove Food Listing).
    let donorSessionData: SessionData = SessionData.loadSessionData(request);

    removeFoodListing(removeFoodListingRequest.foodListingKey, donorSessionData, removeFoodListingRequest.reason)
        .then(() => {
            response.send(new FoodWebResponse(true, 'Food listing has been successfully removed.'));
        })
        .catch((err: Error) => {
            logger.error(prettyjsonRender(err));
            response.send(new FoodWebResponse(false, err.message));
        });
}


export function handleClaimFoodListing(request: Request, response: Response): void {

    response.setHeader('Content-Type', 'application/json');

    let claimFoodListingRequest: ClaimFoodListingRequest = request.body;
    let receiverSessionData: SessionData = SessionData.loadSessionData(request);

    claimFoodListing(claimFoodListingRequest.foodListingKey, claimFoodListingRequest.claimAvailabilityTimes, receiverSessionData)
        .then(() => {
            response.send(new FoodWebResponse(true, 'Food listing has been successfully claimed.'));
        })
        .catch((err: Error) => {
            logger.error(prettyjsonRender(err));
            response.send(new FoodWebResponse(false, err.message));
        });
}


export function handleUnclaimFoodListing(request: Request, response: Response): void {

    response.setHeader('Content-Type', 'application/json');

    let unclaimFoodListingRequest: UnclaimRemoveFoodListingRequest = request.body;
    let receiverSessionData: SessionData = SessionData.loadSessionData(request);

    unclaimFoodListing(unclaimFoodListingRequest.foodListingKey, receiverSessionData, unclaimFoodListingRequest.reason)
        .then(() => {
            response.send(new FoodWebResponse(true, 'Food listing has been successfully unclaimed.'));
        })
        .catch((err: Error) => {
            logger.error(prettyjsonRender(err));
            response.send(new FoodWebResponse(false, err.message));
        });
}
