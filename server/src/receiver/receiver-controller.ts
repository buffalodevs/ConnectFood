import { Express, Request, Response } from 'express';
import { logger, prettyjsonRender } from "./../logging/logger";

import { SessionData } from "../common-util/session-data";
import { claimFoodListing } from './claim-food-listing';
import { unclaimFoodListing } from './unclaim-food-listing';

import { ClaimFoodListingRequest } from '../../../shared/src/receiver/message/claim-food-listing-message';
import { UnclaimFoodListingRequest } from '../../../shared/src/receiver/message/unclaim-food-listing-message';
import { FoodWebResponse } from "../../../shared/src/message-protocol/food-web-response";


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

    let unclaimFoodListingRequest: UnclaimFoodListingRequest = request.body;
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
