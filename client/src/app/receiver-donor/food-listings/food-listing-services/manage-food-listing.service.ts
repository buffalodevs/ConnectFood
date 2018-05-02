"use strict";
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import { RequestService } from "../../../common-util/services/request.service";

import { ClaimFoodListingRequest } from "./../../../../../../shared/src/receiver/message/claim-food-listing-message";
import { UnclaimFoodListingRequest } from "./../../../../../../shared/src/receiver/message/unclaim-food-listing-message";
import { RemoveFoodListingRequest } from "./../../../../../../shared/src/donor/message/remove-food-listing-message";


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
        return this.requestService.post('/receiver/claimFoodListing', new ClaimFoodListingRequest(foodListingKey, specificAvailabilityTimes))
                                  .map(this.requestService.genericResponseMap);
    }


    /**
     * Unclaims a given Food Listing.
     * @param foodListingKey The key (identifier) for the Food Listing that is to be unclaimed.
     * @param unclaimReason The reason for the unclaim.
     * @return An observable that has no payload (simply resolves on success).
     */
    public unclaimFoodListing(foodListingKey: number, unclaimReason: string): Observable <void> {
        return this.requestService.post('/receiver/unclaimFoodListing', new UnclaimFoodListingRequest(foodListingKey, unclaimReason))
                                  .map(this.requestService.genericResponseMap);
    }


    /**
     * Removes (un-donates) a given Foood Listing.
     * @param foodListingKey The key (identifier) for the Food Listing that is to be removed.
     * @param removalReason The reason for the removal.
     * @return An observable that has no payload (simply resolves on success).
     */
    public removeFoodListing(foodListingKey: number, removalReason: string): Observable <void> {
        return this.requestService.post('/donor/removeFoodListing', new RemoveFoodListingRequest(foodListingKey, removalReason))
                                  .map(this.requestService.genericResponseMap);
    }
}
