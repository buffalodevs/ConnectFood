import { Request, Response } from 'express';

import { SessionData } from "../common-util/session-data";
import { getDeliveryFoodListings } from './get-delivery-food-listings';

import { GetDeliveryFoodListingsRequest, GetDeliveryFoodListingsResponse,
         DeliveryFoodListing } from '../../../shared/deliverer/message/get-delivery-food-listings-message';


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

    
}
