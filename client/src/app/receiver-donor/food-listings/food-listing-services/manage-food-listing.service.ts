"use strict";
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { RequestService, Response } from "../../../common-util/services/request.service";

import { ManageFoodListingRequest } from "./../../../../../../shared/receiver-donor/message/manage-food-listing-message";
import { FoodWebResponse } from "./../../../../../../shared/message-protocol/food-web-response";


/**
 * Service for sending claim, unclaim, and remove Food Listing messages to the server.
 */
@Injectable()
export class ManageFoodListingService {
    
    public constructor (
        private requestService: RequestService
    ) { }


    /**
     * Claims a given Food Listing.
     * @param foodListingKey The key (identifier) for the Food Listing that is to be claimed.
     * @return An observable that has no payload (simply resolves on success).
     */
    public claimFoodListing(foodListingKey: number): Observable<void> {
        return this.manageFoodListing(foodListingKey, '/receiverDonor/receiver/claimFoodListing');
    }


    /**
     * Unclaims a given Food Listing.
     * @param foodListingKey The key (identifier) for the Food Listing that is to be unclaimed.
     * @return An observable that has no payload (simply resolves on success).
     */
    public unclaimFoodListing(foodListingKey: number): Observable<void> {
        return this.manageFoodListing(foodListingKey, '/receiverDonor/receiver/unclaimFoodListing');
    }


    /**
     * Removes a given Foood Listing.
     * @param foodListingKey The key (identifier) for the Food Listing that is to be removed.
     * @return An observable that has no payload (simply resolves on success).
     */
    public removeFoodListing(foodListingKey: number): Observable<void> {
        return this.manageFoodListing(foodListingKey, 'receiverDonor/donor/removeFoodListing');
    }


    /**
     * Uniform function for sending Food Listing ID to server for specific management functions (such as claim, unclaim, & remove).
     * @param foodListingKey The key identifier of the food listing that is to be acted upon.
     * @param controllerRoute The route to the controller function that handles the operation.
     * @return An observable that has no payload (simply resolves on success).
     */
    private manageFoodListing(foodListingKey: number, controllerRoute: string): Observable<void> {

        let body: ManageFoodListingRequest = new ManageFoodListingRequest(foodListingKey);
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
