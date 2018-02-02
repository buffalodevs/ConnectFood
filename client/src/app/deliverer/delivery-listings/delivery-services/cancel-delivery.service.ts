"use strict";
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import { RequestService } from "../../../common-util/services/request.service";

import { CancelDeliveryRequest } from "./../../../../../../shared/src/deliverer/message/cancel-delivery-message";
import { FoodWebResponse } from "./../../../../../../shared/src/message-protocol/food-web-response";


/**
 * Service for cancelling a Delivery.
 */
@Injectable()
export class CancelDeliveryService {
    
    public constructor (
        private _requestService: RequestService
    ) {}


    /**
     * Cancels a Delivery.
     * @param deiveryFoodListingKey The key identifier of the Delivery Food Listing that is to be acted upon.
     * @param cancelReason The reason for the cancellation.
     * @param foodRejected Determines whether or not the food was rejected due to an inadequate quality.
     * @return An observable that resolves to true on success, false on non-fatal failure (such as when need login), and throws an error on fatal failure.
     */
    public cancelDelivery(deliveryFoodListingKey: number, cancelReason: string, foodRejected: boolean): Observable <void> {

        return this._requestService.post('/deliverer/cancelDelivery', new CancelDeliveryRequest(deliveryFoodListingKey, cancelReason, foodRejected))
                                   .map(this._requestService.genericResponseMap);
    }
}
