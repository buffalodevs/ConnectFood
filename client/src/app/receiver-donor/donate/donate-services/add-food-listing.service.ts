"use strict";
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import { RequestService } from "../../../common-util/services/request.service";
import { SlickImg } from '../../../slick/slick-img-manager/slick-img';

import { FoodListing } from "./../../../../../../shared/src/common-user/food-listing";
import { AddFoodListingRequest, AddFoodListingResponse } from "./../../../../../../shared/src/donor/message/add-food-listing-message";
import { FoodWebResponse } from "./../../../../../../shared/src/message-protocol/food-web-response";


@Injectable()
export class AddFoodListingService {

    public constructor (
        private _requestService: RequestService
    ) {}


    /**
     * Adds a food listing on the server.
     * @param foodListing The food listing to be added.
     * @param slickImgs The image data of images being uploaded with the new Food Listing (contains image files).
     * @return An observable that on success will provide the added food listings key (unique ID).
     */
    public addFoodListing(foodListingUpload: FoodListing, slickImgs: SlickImg[]): Observable <number> {

        // Extract image files and associated (crop) data from the Slick Image data.
        const imgFiles: File[] = this.prepareImgData(foodListingUpload, slickImgs);
        const body: AddFoodListingRequest = new AddFoodListingRequest(foodListingUpload);
        const observer: Observable <AddFoodListingResponse> = <Observable <AddFoodListingResponse>>this._requestService.post('/donor/addFoodListing', body, imgFiles);

        return observer.map((addFoodListingResponse: AddFoodListingResponse) => {

            if (addFoodListingResponse.success) {
                return addFoodListingResponse.foodListingKey;
            }
            
            throw new Error(addFoodListingResponse.message);
        });
    }


    /**
     * Prepares image data for upload.
     * @param foodListingUpload The Food Listing to upload. INTERNALLY MODIFIED.
     * @param slickImgs The Slick Images from the SlickImgComponent.
     * @return The image files of the full sized images to upload.
     */
    private prepareImgData(foodListingUpload: FoodListing, slickImgs: SlickImg[]): File[] {

        const imgFiles: File[] = [];
        foodListingUpload.imgData = [];

        if (slickImgs != null) {
            for (let i: number = 0; i < slickImgs.length; i++) {

                // Grab full size image represented by file.
                imgFiles.push(slickImgs[i].imgFile);

                // Grab all other data associated with image file (contains unset url fields, crop boundaries that have been set, and base64 cropped image string).
                foodListingUpload.imgData.push(slickImgs[i].imgData);
            }
        }

        return imgFiles;
    }
}
