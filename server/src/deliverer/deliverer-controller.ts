import { Request, Response, Errback } from 'express';

import { SessionData } from "../common-util/session-data";
import { getDeliveryFoodListings } from './get-delivery-food-listings';
import { getPossibleDeliveryTimes } from './get-possible-delivery-times';

import { GetDeliveryFoodListingsRequest, GetDeliveryFoodListingsResponse,
         DeliveryFoodListing } from '../../../shared/deliverer/message/get-delivery-food-listings-message';
import { ManageDeliveryFoodListingRequest } from '../../../shared/deliverer/message/manage-delivery-food-listing-message';
import { TimeRange } from '../../../shared/app-user/time-range';
import { GetPossibleDeliveryTimesResponse } from '../../../shared/deliverer/message/get-possible-delivery-times-message';


export function handleGetDeliveryFoodListings(request: Request, response: Response): void {
    
    response.setHeader('Content-Type', 'application/json');

    let getDeliveryFoodListingsRequest: GetDeliveryFoodListingsRequest = request.body;
    let sessionData: SessionData = SessionData.loadSessionData(request);

    getDeliveryFoodListings(getDeliveryFoodListingsRequest.filters, sessionData.appUserKey, sessionData.appUserInfo.gpsCoordinate)
        .then((deliveryFoodListings: DeliveryFoodListing[]) => {
            response.send(new GetDeliveryFoodListingsResponse(deliveryFoodListings, true, 'Delivery Food Listings Successfully Retrieved'));
        })
        .catch((err: Error) => {
            response.send(new GetDeliveryFoodListingsResponse(null, false, err.message));
        });
}


export function handleClaimDeliveryFoodListing(request: Request, response: Response): void {
    
    response.setHeader('Content-Type', 'application/json');

    const claimDeliveryFoodListingRequest: ManageDeliveryFoodListingRequest = request.body;
    let claimedFoodListingKey: number = claimDeliveryFoodListingRequest.claimedFoodListingKey;


}


export function handleUnclaimDeliveryFoodListing(request: Request, response: Response): void {

    response.setHeader('Content-Type', 'application/json');

    const unclaimDeliveryFoodListingRequest: ManageDeliveryFoodListingRequest = request.body;
    let unclaimedFoodListingKey: number = unclaimDeliveryFoodListingRequest.claimedFoodListingKey;

    
}


export function handleGetPossibleDeliveryTimes(request: Request, response: Response): void {

    response.setHeader('Content-Type', 'application/json');

    const getPossibleDeliveryTimesRequest: ManageDeliveryFoodListingRequest = request.body;
    const sessionData: SessionData = SessionData.loadSessionData(request);

    let claimedFoodListingKey: number = getPossibleDeliveryTimesRequest.claimedFoodListingKey;
    let myAppUserKey: number = sessionData.appUserKey;

    getPossibleDeliveryTimes(claimedFoodListingKey, myAppUserKey)
        .then((possibleDeliveryTimes: TimeRange[]) => {
            response.send(new GetPossibleDeliveryTimesResponse(possibleDeliveryTimes, true, 'Successfully retrieved possible delivery times.'));
        })
        .catch((err: Error) => {
            response.send(new GetPossibleDeliveryTimesResponse(null, false, err.message));
        });
}
