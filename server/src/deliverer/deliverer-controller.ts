import { Request, Response, Errback } from 'express';

import { SessionData } from "../common-util/session-data";
import { getDeliveries } from './get-deliveries';
import { getPossibleDeliveryTimes } from './get-possible-delivery-times';

import { GetDeliveriesRequest, GetDeliveriesResponse, Delivery } from '../../../shared/deliverer/message/get-deliveries-message';
import { ScheduleDeliveryFoodListingRequest } from '../../../shared/deliverer/message/schedule-delivery-food-listing-message';
import { ManageDeliveryRequest } from '../../../shared/deliverer/message/manage-delivery-message';
import { TimeRange } from '../../../shared/app-user/time-range';
import { GetPossibleDeliveryTimesResponse } from '../../../shared/deliverer/message/get-possible-delivery-times-message';


export function handleGetDeliveries(request: Request, response: Response): void {
    
    response.setHeader('Content-Type', 'application/json');

    let getDeliveriesRequest: GetDeliveriesRequest = request.body;
    let sessionData: SessionData = SessionData.loadSessionData(request);

    getDeliveries(getDeliveriesRequest.filters, sessionData.appUserKey, sessionData.appUserInfo.gpsCoordinate)
        .then((deliveries: Delivery[]) => {
            response.send(new GetDeliveriesResponse(deliveries, true, 'Delivery Food Listings Successfully Retrieved'));
        })
        .catch((err: Error) => {
            response.send(new GetDeliveriesResponse(null, false, err.message));
        });
}


export function handleScheduleDelivery(request: Request, response: Response): void {
    
    response.setHeader('Content-Type', 'application/json');

    const scheduleDeliveryFoodListingRequest: ScheduleDeliveryFoodListingRequest = request.body;
    let claimedFoodListingKey: number = scheduleDeliveryFoodListingRequest.claimedFoodListingKey;


}


export function handleCancelDelivery(request: Request, response: Response): void {

    response.setHeader('Content-Type', 'application/json');

    const cancelDeliveryRequest: ManageDeliveryRequest = request.body;
    let deliveryFoodListingKey: number = cancelDeliveryRequest.deliveryFoodListingKey;

    
}


export function handleUpdateDeliveryState(request: Request, response: Response): void {

    response.setHeader('Content-Type', 'application/json');
    
    const updateDeliveryStateRequest: ManageDeliveryRequest = request.body;
    let deliveryFoodListingKey: number = updateDeliveryStateRequest.deliveryFoodListingKey;

    
}


export function handleGetPossibleDeliveryTimes(request: Request, response: Response): void {

    response.setHeader('Content-Type', 'application/json');

    const getPossibleDeliveryTimesRequest: ManageDeliveryRequest = request.body;
    const sessionData: SessionData = SessionData.loadSessionData(request);

    let claimedFoodListingKey: number = getPossibleDeliveryTimesRequest.deliveryFoodListingKey;
    let myAppUserKey: number = sessionData.appUserKey;

    getPossibleDeliveryTimes(claimedFoodListingKey, myAppUserKey)
        .then((possibleDeliveryTimes: TimeRange[]) => {
            response.send(new GetPossibleDeliveryTimesResponse(possibleDeliveryTimes, true, 'Successfully retrieved possible delivery times.'));
        })
        .catch((err: Error) => {
            response.send(new GetPossibleDeliveryTimesResponse(null, false, err.message));
        });
}
