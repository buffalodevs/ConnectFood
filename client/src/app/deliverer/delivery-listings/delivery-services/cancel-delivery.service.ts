"use strict";
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { RequestService, Response } from "../../../common-util/services/request.service";

import { CancelDeliveryRequest } from "./../../../../../../shared/deliverer/message/cancel-delivery-message";
import { FoodWebResponse } from "./../../../../../../shared/message-protocol/food-web-response";


/**
 * Service for cancelling a Delivery.
 */
@Injectable()
export class CancelDeliveryService {
    
    public constructor (
        private requestService: RequestService
    ) {}


    /**
     * Cancels a Delivery.
     * @param deiveryFoodListingKey The key identifier of the Delivery Food Listing that is to be acted upon.
     * @param cancelReason The reason for the cancellation.
     * @return An observable that has no payload (simply resolves on success).
     */
    public cancelDelivery(deliveryFoodListingKey: number, cancelReason: string): Observable<void> {

        let body: CancelDeliveryRequest = new CancelDeliveryRequest(deliveryFoodListingKey, cancelReason);
        let observer: Observable<Response> = this.requestService.post('/deliverer/cancelDelivery', body);

        // Listen for a response now.
        return observer.map((response: Response) => {

            let manageDeliveryFoodListingResponse: FoodWebResponse = response.json();
            
            // On failure.
            if (!manageDeliveryFoodListingResponse.success) {
                console.log(manageDeliveryFoodListingResponse.message);
                throw new Error(manageDeliveryFoodListingResponse.message);
            }
        });
    }
}
