"use strict";
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import { RequestService } from "../../../common-util/services/request.service";

import { FoodListing } from "./../../../../../../shared/src/common-receiver-donor-deliverer/food-listing";
import { AddFoodListingRequest, AddFoodListingResponse } from "./../../../../../../shared/src/receiver-donor/message/add-food-listing-message";
import { FoodWebResponse } from "./../../../../../../shared/src/message-protocol/food-web-response";


@Injectable()
export class AddFoodListingService {

    public constructor (
        private requestService: RequestService
    ) {}


    /**
     * Adds a food listing on the server.
     * @param foodListing The food listing to be added.
     * @param imageUploads The image(s) associated with the food listing that is to be added.
     * @return An observable that on success will provide the added food listings key (unique ID).
     */
    public addFoodListing(foodListingUpload: FoodListing, imageUpload: string): Observable <number> {

        let body: AddFoodListingRequest = new AddFoodListingRequest(foodListingUpload, [ imageUpload ]);
        let observer: Observable <AddFoodListingResponse> = <Observable <AddFoodListingResponse>>this.requestService.post('/receiverDonor/donor/addFoodListing', body);

        return observer.map((addFoodListingResponse: AddFoodListingResponse) => {

            if (addFoodListingResponse.success) {
                return addFoodListingResponse.foodListingKey;
            }
            
            throw new Error(addFoodListingResponse.message);
        });
    }
}
