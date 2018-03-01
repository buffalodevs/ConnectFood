"use strict";
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import { RequestService } from "../../../common-util/services/request.service";

import { ClaimFoodListingRequest } from "./../../../../../../shared/src/receiver-donor/message/claim-food-listing-message";
import { UnclaimRemoveFoodListingRequest } from "./../../../../../../shared/src/receiver-donor/message/unclaim-remove-food-listing-message";


/**
 * Service for sending claim, unclaim, and remove Food Listing messages to the server.
 */
@Injectable()
export class ManageFoodListingService {
    
    public constructor (
        private requestService: RequestService
    ) {}


    /**
     * Claims a given Food Listing.
     * @param foodListingKey The key (identifier) for the Food Listing that is to be claimed.
     * @return An observable that has no payload (simply resolves on success).
     */
    public claimFoodListing(foodListingKey: number, specificAvailabilityTimes: Date[]): Observable <void> {
        return this.requestService.post('/receiverDonor/receiver/claimFoodListing', new ClaimFoodListingRequest(foodListingKey, specificAvailabilityTimes))
                                  .map(this.requestService.genericResponseMap);
    }


    /**
     * Unclaims a given Food Listing.
     * @param foodListingKey The key (identifier) for the Food Listing that is to be unclaimed.
     * @param unclaimReason The reason for the unclaim.
     * @return An observable that has no payload (simply resolves on success).
     */
    public unclaimFoodListing(foodListingKey: number, unclaimReason: string): Observable <void> {
        return this.unclaimRemoveFoodListing(foodListingKey, '/receiverDonor/receiver/unclaimFoodListing', unclaimReason);
    }


    /**
     * Removes (un-donates) a given Foood Listing.
     * @param foodListingKey The key (identifier) for the Food Listing that is to be removed.
     * @param removalReason The reason for the removal.
     * @return An observable that has no payload (simply resolves on success).
     */
    public removeFoodListing(foodListingKey: number, removalReason: string): Observable <void> {
        return this.unclaimRemoveFoodListing(foodListingKey, 'receiverDonor/donor/removeFoodListing', removalReason);
    }


    /**
     * Uniform function for sending Food Listing ID to server for specific management functions (such as claim, unclaim, & remove).
     * @param foodListingKey The key identifier of the food listing that is to be acted upon.
     * @param controllerRoute The route to the controller function that handles the operation.
     * @param reason The reason for the associated management operation.
     * @return An observable that on success resolves to nothing.
     *         If failure, then error is thrown.
     */
    private unclaimRemoveFoodListing(foodListingKey: number, controllerRoute: string, reason?: string): Observable <void> {

        return this.requestService.post(controllerRoute, new UnclaimRemoveFoodListingRequest(foodListingKey, reason))
                                  .map(this.requestService.genericResponseMap);
    }
}
