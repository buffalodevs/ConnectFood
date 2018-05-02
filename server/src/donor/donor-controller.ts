import { Express, Request, Response } from 'express';

import { logger, prettyjsonRender } from "../logging/logger";
import { SessionData } from '../common-util/session-data';
import { addFoodListing } from './add-food-listing';
import { removeFoodListing } from './remove-food-listing';

import { AddFoodListingRequest, AddFoodListingResponse } from '../../../shared/src/donor/message/add-food-listing-message';
import { RemoveFoodListingRequest } from '../../../shared/src/donor/message/remove-food-listing-message';
import { FoodWebResponse } from '../../../shared/src/message-protocol/food-web-response';


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

    let removeFoodListingRequest: RemoveFoodListingRequest = request.body;
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
