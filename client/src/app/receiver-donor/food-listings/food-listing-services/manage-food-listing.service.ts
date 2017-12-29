"use strict";
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { RequestService, Response } from "../../../common-util/services/request.service";

import { ManageFoodListingRequest } from "./../../../../../../shared/receiver-donor/message/manage-food-listing-message";


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
     * @param unitsCount The number of units of the given Food Listing that should be claimed.
     * @return An observable that has no payload (simply resolves on success).
     */
    public claimFoodListing(foodListingKey: number, unitsCount: number): Observable<boolean> {
        return this.manageFoodListing(foodListingKey, unitsCount, '/receiverDonor/receiver/claimFoodListing');
    }


    /**
     * Unclaims a given Food Listing.
     * @param foodListingKey The key (identifier) for the Food Listing that is to be unclaimed.
     * @param unitsCount The number of units to unclaim.
     * @return An observable that has no payload (simply resolves on success).
     */
    public unclaimFoodListing(foodListingKey: number, unitsCount: number): Observable<boolean> {
        return this.manageFoodListing(foodListingKey, unitsCount, '/receiverDonor/receiver/unclaimFoodListing');
    }


    /**
     * Removes (un-donates) a given Foood Listing.
     * @param foodListingKey The key (identifier) for the Food Listing that is to be removed.
     * @param unitsCount The number of units to remove.
     * @return An observable that has no payload (simply resolves on success).
     */
    public removeFoodListing(foodListingKey: number, unitsCount: number): Observable<boolean> {
        return this.manageFoodListing(foodListingKey, unitsCount, 'receiverDonor/donor/removeFoodListing');
    }


    /**
     * Uniform function for sending Food Listing ID to server for specific management functions (such as claim, unclaim, & remove).
     * @param foodListingKey The key identifier of the food listing that is to be acted upon.
     * @param controllerRoute The route to the controller function that handles the operation.
     * @return An observable that on success resolves to true. On failure, if it is non-fatal (such as required login), then false.
     *         If fatal failure, then error is thrown.
     */
    private manageFoodListing(foodListingKey: number, unitsCount: number, controllerRoute: string): Observable<boolean> {

        return this.requestService.post(controllerRoute, new ManageFoodListingRequest(foodListingKey, unitsCount))
                                  .map(this.requestService.genericResponseMap);
    }
}
