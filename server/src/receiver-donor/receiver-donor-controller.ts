import { Request, Response } from 'express';

import { SessionData } from "../common-util/session-data";
import { addFoodListing } from './donor/add-food-listing';
import { removeFoodListing } from "./donor/remove-food-listing";
import { getFoodListings } from './get-food-listings';
import { claimFoodListing, unclaimFoodListing } from './receiver/claim-unclaim-food-listing';

import { AddFoodListingRequest, AddFoodListingResponse, FoodListingUpload } from '../../../shared/src/receiver-donor/message/add-food-listing-message'
import { GetFoodListingsRequest, GetFoodListingsResponse, FoodListing } from '../../../shared/src/receiver-donor/message/get-food-listings-message';
import { ManageFoodListingRequest } from '../../../shared/src/receiver-donor/message/manage-food-listing-message';
import { LISTINGS_STATUS } from "../../../shared/src/receiver-donor/food-listings-filters";
import { FoodWebResponse } from "../../../shared/src/message-protocol/food-web-response";
import { Deserializer } from '../../../shared/src/deserialization/deserializer';


export function handleGetFoodListings(request: Request, response: Response): void {
    
    response.setHeader('Content-Type', 'application/json');
    let getFoodListingsRequest: GetFoodListingsRequest = request.body;
    let sessionData: SessionData = SessionData.loadSessionData(request);

    getFoodListings(getFoodListingsRequest.filters, sessionData.appUserKey, sessionData.appUser.contactInfo.gpsCoordinate)
        .then((foodListings: FoodListing[]) => {
            response.send(new GetFoodListingsResponse(foodListings, true, 'Food Listings Successfully Retrieved'));
        })
        .catch((err: Error) => {
            response.send(new GetFoodListingsResponse(null, false, err.message));
        });
}


export function handleAddFoodListing(request: Request, response: Response): void {

    response.setHeader('Content-Type', 'application/json');
    
    let addFoodListingRequest: AddFoodListingRequest = request.body;
    // The currently logged in user must be the Donor.
    let donorAppUserKey: number = SessionData.loadSessionData(request).appUserKey;

    addFoodListing(addFoodListingRequest.foodListingUpload, donorAppUserKey)
        .then((foodListingKey: number) => {
            response.send(new AddFoodListingResponse(foodListingKey, true, 'Food Listing Added Successfully'));
        })
        .catch((err: Error) => {
            response.send(new AddFoodListingResponse(null, false, 'Food Listing Add Failed'));
        });
}


export function handleRemoveFoodListing(request: Request, response: Response): void {

    response.setHeader('Content-Type', 'application/json');

    let removeFoodListingRequest: ManageFoodListingRequest = request.body;
    // Need so we can verify that currently logged in user must be the original Donor (have authority to remove Food Listing).
    let donorSessionData: SessionData = SessionData.loadSessionData(request);

    removeFoodListing(removeFoodListingRequest.foodListingKey, donorSessionData, removeFoodListingRequest.reason)
        .then(() => {
            response.send(new FoodWebResponse(true, 'Food listing has been successfully removed.'));
        })
        .catch((err: Error) => {
            response.send(new FoodWebResponse(false, err.message));
        });
}


export function handleClaimFoodListing(request: Request, response: Response): void {

    response.setHeader('Content-Type', 'application/json');

    let claimFoodListingRequest: ManageFoodListingRequest = request.body;
    let receiverSessionData: SessionData = SessionData.loadSessionData(request);

    claimFoodListing(claimFoodListingRequest.foodListingKey, receiverSessionData)
        .then(() => {
            response.send(new FoodWebResponse(true, 'Food listing has been successfully claimed.'));
        })
        .catch((err: Error) => {
            response.send(new FoodWebResponse(false, err.message));
        });
}


export function handleUnclaimFoodListing(request: Request, response: Response): void {

    response.setHeader('Content-Type', 'application/json');

    let unclaimFoodListingRequest: ManageFoodListingRequest = request.body;
    let receiverSessionData: SessionData = SessionData.loadSessionData(request);

    unclaimFoodListing(unclaimFoodListingRequest.foodListingKey, receiverSessionData, unclaimFoodListingRequest.reason)
        .then(() => {
            response.send(new FoodWebResponse(true, 'Food listing has been successfully unclaimed.'));
        })
        .catch((err: Error) => {
            response.send(new FoodWebResponse(false, err.message));
        });
}
