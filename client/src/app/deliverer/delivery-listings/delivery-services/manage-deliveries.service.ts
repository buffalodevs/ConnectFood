"use strict";
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { RequestService, Response } from "../../../common-util/services/request.service";

import { ManageDeliveryRequest } from "./../../../../../../shared/deliverer/message/manage-delivery-message";
import { FoodWebResponse } from "./../../../../../../shared/message-protocol/food-web-response";
import { DeliveryState } from '../../../../../../shared/deliverer/delivery';


/**
 * Service for managing an already created or scheduled Delivery Food Listing (by changing Delivery State or Cancelling).
 */
@Injectable()
export class ManageDeliveryService {
    
    public constructor (
        private requestService: RequestService
    ) {}


    /**
     * Updates the state of a Delivery Food Listing.
     * @param deliveryFoodListingKey The Delivery Food Listing key (ID).
     * @param deliveryState The new state of the Delivery Food Listing.
     * @return An observable that resolves to nothing on success.
     */
    public updateDeliveryFoodListingState(deliveryFoodListingKey: number, deliveryState: DeliveryState): Observable<void> {
        return this.manageDeliveryFoodListing(deliveryFoodListingKey, deliveryState, '/deliverer/updateDeliveryFoodListingState');
    }


    /**
     * Cancels the Delivery Food Listing.
     * @param deliveryFoodListingKey The Delivery Food Listing key (ID).
     * @return An observable that resolves to nothing on success.
     */
    public cancelDeliveryFoodListing(deliveryFoodListingKey: number): Observable<void> {
        return this.manageDeliveryFoodListing(deliveryFoodListingKey, DeliveryState.unscheduled, '/deliverer/cancelDeliveryFoodListing');
    }


    /**
     * Uniform function for managing a Delivery Food Listing (for functions such as updateDeliveryFoodListingState and cancelDeliveryFoodListing).
     * @param deiveryFoodListingKey The key identifier of the Delivery Food Listing that is to be acted upon.
     * @param deliveryState The delivery state to set the Delivery Food Listing to. Set to DeliveryState.unscheduled if cancelling delivery (value does not matter).
     * @param controllerRoute The controller route for the management function.
     * @return An observable that has no payload (simply resolves on success).
     */
    private manageDeliveryFoodListing(deliveryFoodListingKey: number, deliveryState: DeliveryState, controllerRoute: string): Observable<void> {

        let body: ManageDeliveryRequest = new ManageDeliveryRequest(deliveryFoodListingKey, deliveryState);
        let observer: Observable<Response> = this.requestService.post(controllerRoute, body);

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
