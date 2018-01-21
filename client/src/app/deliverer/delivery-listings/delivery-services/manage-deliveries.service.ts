"use strict";
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import { RequestService } from "../../../common-util/services/request.service";

import { ManageDeliveryRequest } from "./../../../../../../shared/deliverer/message/manage-delivery-message";
import { FoodWebResponse } from "./../../../../../../shared/message-protocol/food-web-response";
import { DeliveryState } from '../../../../../../shared/deliverer/delivery';


/**
 * Service for managing an already created or scheduled Delivery.
 */
@Injectable()
export class ManageDeliveryService {
    
    public constructor (
        private requestService: RequestService
    ) {}


    /**
     * Updates the state of a delivery.
     * @param deiveryFoodListingKey The key identifier of the Delivery Food Listing that is to be acted upon.
     * @param deliveryState The delivery state to set the Delivery Food Listing to. Set to DeliveryState.unscheduled if cancelling delivery (value does not matter).
     * @return An observable that has no payload (simply resolves on success).
     */
    public updateDeliveryState(deliveryFoodListingKey: number, deliveryState: DeliveryState): Observable <void> {
        
        return this.requestService.post('/deliverer/updateDeliveryState', new ManageDeliveryRequest(deliveryFoodListingKey, deliveryState))
                                  .map(this.requestService.genericResponseMap);
    }
}
