"use strict";
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import { RequestService } from "../../../common-util/services/request.service";

import { FoodListingUpload } from "./../../../../../../shared/receiver-donor/food-listing-upload";
import { AddFoodListingRequest, AddFoodListingResponse } from "./../../../../../../shared/receiver-donor/message/add-food-listing-message";
import { FoodWebResponse } from "./../../../../../../shared/message-protocol/food-web-response";


@Injectable()
export class AddFoodListingService {

    public constructor (
        private requestService: RequestService
    ) {}


    /**
     * Adds a food listing on the server.
     * @param foodListing The food listing to be added.
     * @param imageUpload The image component of the food listing that is to be added.
     * @return An observable that on success will provide the added food listings key (unique ID).
     */
    public addFoodListing(foodListingUpload: FoodListingUpload, imageUpload: string): Observable<number> {

        foodListingUpload.imageUpload = imageUpload;

        let body: AddFoodListingRequest = new AddFoodListingRequest(foodListingUpload);
        let observer: Observable<AddFoodListingResponse> = this.requestService.post('/receiverDonor/donor/addFoodListing', body);

        return observer.map((addFoodListingResponse: AddFoodListingResponse) => {

            console.log(addFoodListingResponse.message);

            if (addFoodListingResponse.success) {
                return addFoodListingResponse.foodListingKey;
            }
            
            throw new Error(addFoodListingResponse.message);
        });
    }
}
