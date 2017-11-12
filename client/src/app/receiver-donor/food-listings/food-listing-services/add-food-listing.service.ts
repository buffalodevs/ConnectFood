"use strict";
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { RequestService, Response } from "../../../common-util/services/request.service";

import { FoodListingUpload } from "./../../../../../../shared/receiver-donor/food-listing-upload";
import { AddFoodListingRequest, AddFoodListingResponse } from "./../../../../../../shared/receiver-donor/message/add-food-listing-message";
import { FoodWebResponse } from "./../../../../../../shared/message-protocol/food-web-response";


@Injectable()
export class AddFoodListingService {


    constructor(
        private requestService: RequestService
    ) { }


    /**
     * Adds a food listing on the server.
     * @param foodListing The food listing to be added.
     * @param imageUpload The image component of the food listing that is to be added.
     * @return An observable that on success will provide the added food listings key (unique ID).
     */
    public addFoodListing(foodListingUpload: FoodListingUpload, imageUpload: string): Observable<number> {
        foodListingUpload.imageUpload = imageUpload;

        let body: AddFoodListingRequest = new AddFoodListingRequest(foodListingUpload);
        let observer: Observable<Response> = this.requestService.post('/receiverDonor/donor/addFoodListing', body);

        return observer.map((response: Response) => {
            let addFoodListingResponse: AddFoodListingResponse = response.json();
            console.log(addFoodListingResponse.message);

            if (addFoodListingResponse.success) {
                return addFoodListingResponse.foodListingKey;
            }
            throw new Error(addFoodListingResponse.message);
        });
    }
}
