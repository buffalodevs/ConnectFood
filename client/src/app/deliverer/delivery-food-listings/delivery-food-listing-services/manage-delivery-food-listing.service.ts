"use strict";
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { RequestService, Response } from "../../../common-util/services/request.service";

import { ManageDeliveryFoodListingRequest } from "./../../../../../../shared/deliverer/message/manage-delivery-food-listing-message";
import { FoodWebResponse } from "./../../../../../../shared/message-protocol/food-web-response";


/**
 * Service for sending claim and unclaim Delivery Food Listing messages to the server.
 */
@Injectable()
export class ManageDeliveryFoodListingService {
    
    public constructor (
        private requestService: RequestService
    ) { }


    /**
     * Claims a given Delivery Food Listing.
     * @param claimedFoodListingKey The key (identifier) for the Claimed Food Listing whose delivery is to be claimed.
     * @return An observable that has no payload (simply resolves on success).
     */
    public claimDeliveryFoodListing(claimedFoodListingKey: number): Observable<void> {
        return this.manageDeliveryFoodListing(claimedFoodListingKey, '/deliverer/claimDeliveryFoodListing');
    }


    /**
     * Unclaims a given Delivery Food Listing.
     * @param claimedFoodListingKey The key (identifier) for the Claimed Food Listing whose delivery is to be unclaimed.
     * @return An observable that has no payload (simply resolves on success).
     */
    public unclaimDeliveryFoodListing(claimedFoodListingKey: number): Observable<void> {
        return this.manageDeliveryFoodListing(claimedFoodListingKey, '/deliverer/unclaimDeliveryFoodListing');
    }


    /**
     * Uniform function for managing a Delivery Food Listing (for functions such as claim & unclaim).
     * @param claimedFoodListingKey The key identifier of the Claimed Food Listing that is to be acted upon.
     * @param controllerRoute The controller route for the management function.
     * @return An observable that has no payload (simply resolves on success).
     */
    private manageDeliveryFoodListing(claimedFoodListingKey: number, controllerRoute: string): Observable<void> {

        let body: ManageDeliveryFoodListingRequest = new ManageDeliveryFoodListingRequest(claimedFoodListingKey);
        let observer: Observable<Response> = this.requestService.post(controllerRoute, body);

        // Listen for a response now.
        return observer.map((response: Response) => {

            let claimFoodListingResponse: FoodWebResponse = response.json();
            
            // On failure.
            if (!claimFoodListingResponse.success) {
                console.log(claimFoodListingResponse.message);
                throw new Error(claimFoodListingResponse.message);
            }
        });
    }
}
