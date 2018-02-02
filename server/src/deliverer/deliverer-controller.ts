import { Request, Response, Errback } from 'express';

import { SessionData } from "../common-util/session-data";
import { getDeliveries } from './get-deliveries';
import { scheduleDelivery } from './schedule-delivery';
import { cancelDelivery } from './cancel-delivery';

import { GetDeliveriesRequest, GetDeliveriesResponse, Delivery } from '../../../shared/src/deliverer/message/get-deliveries-message';
import { ScheduleDeliveryRequest } from '../../../shared/src/deliverer/message/schedule-delivery-message';
import { ManageDeliveryRequest } from '../../../shared/src/deliverer/message/manage-delivery-message';
import { CancelDeliveryRequest } from '../../../shared/src/deliverer/message/cancel-delivery-message';
import { DateRange } from '../../../shared/src/date-time-util/date-range';
import { GetPossibleDeliveryTimesResponse } from '../../../shared/src/deliverer/message/get-possible-delivery-times-message';
import { FoodWebResponse } from '../../../shared/src/message-protocol/food-web-response';
import { updateDeliveryState } from './update-delivery-state';


export function handleGetDeliveries(request: Request, response: Response): void {
    
    response.setHeader('Content-Type', 'application/json');

    const getDeliveriesRequest: GetDeliveriesRequest = request.body;
    const sessionData: SessionData = SessionData.loadSessionData(request);

    getDeliveries (
        getDeliveriesRequest.filters,
        sessionData.appUserKey,
        sessionData.appUserInfo.gpsCoordinate
    ).then((deliveries: Delivery[]) => {
        response.send(new GetDeliveriesResponse(deliveries, true, 'Delivery Food Listings Successfully Retrieved'));
    })
    .catch((err: Error) => {
        response.send(new GetDeliveriesResponse(null, false, err.message));
    });
}


export function handleScheduleDelivery(request: Request, response: Response): void {
    
    response.setHeader('Content-Type', 'application/json');

    const scheduleDeliveryRequest: ScheduleDeliveryRequest = request.body;
    const sessionData: SessionData = SessionData.loadSessionData(request);

    scheduleDelivery (
        scheduleDeliveryRequest.claimedFoodListingKey,
        sessionData,
        scheduleDeliveryRequest.startImmediately,
        scheduleDeliveryRequest.scheduledStartTime
    ).then(() => {
        response.send(new FoodWebResponse(true, 'Successfully scheduled a new delivery'));
    })
    .catch((err: Error) => {
        response.send(new FoodWebResponse(false, err.message));
    });
}


export function handleCancelDelivery(request: Request, response: Response): void {

    response.setHeader('Content-Type', 'application/json');

    const cancelDeliveryRequest: CancelDeliveryRequest = request.body;
    const sessionData: SessionData = SessionData.loadSessionData(request);

    cancelDelivery (
        cancelDeliveryRequest.deliveryFoodListingKey,
        sessionData,
        cancelDeliveryRequest.cancelReason,
        cancelDeliveryRequest.foodRejected
    ).then(() => {
        response.send(new FoodWebResponse(true, 'Successfully cancelled a delivery'));
    })
    .catch((err: Error) => {
        response.send(new FoodWebResponse(false, err.message));
    });
}


export function handleUpdateDeliveryState(request: Request, response: Response): void {

    response.setHeader('Content-Type', 'application/json');
    
    const updateDeliveryStateRequest: ManageDeliveryRequest = request.body;
    const sessionData: SessionData = SessionData.loadSessionData(request);

    updateDeliveryState (
        updateDeliveryStateRequest.deliveryFoodListingKey,
        sessionData,
        updateDeliveryStateRequest.deliveryState
    ).then(() => {
        response.send(new FoodWebResponse(true, 'Successfully updated delivery state'));
    })
    .catch((err: Error) => {
        response.send(new FoodWebResponse(false, err.message));
    });
}
