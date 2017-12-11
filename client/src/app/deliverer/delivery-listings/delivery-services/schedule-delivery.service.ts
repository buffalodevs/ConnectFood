"use strict";
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { RequestService, Response } from "../../../common-util/services/request.service";

import { ScheduleDeliveryRequest } from '../../../../../../shared/deliverer/message/schedule-delivery-message';
import { FoodWebResponse } from "./../../../../../../shared/message-protocol/food-web-response";
import { DeliveryState } from '../../../../../../shared/deliverer/delivery';


/**
 * Service for adding or scheduling a new Delivery Food Listing.
 */
@Injectable()
export class ScheduleDeliveryService {
    
    public constructor (
        private requestService: RequestService
    ) {}


    /**
     * Schedules a new Delivery Food Listing.
     * @param claimedFoodListingKey The Claimed Food Listing key (ID). This will be used to create a newly scheduled Delivery Food Listing entry.
     * @param startImmediately A flag that determines if this new Delivery Food Listing should be scheduled to start now.
     * @param scheduledStartTime The scheduled start time for the new Delivery Food Listing.
     * @return An observable that resolves to nothing on success.
     */
    public scheduleDelivery(claimedFoodListingKey: number, startImmediately: boolean, scheduledStartTime?: Date): Observable<void> {
        
        let body: ScheduleDeliveryRequest = new ScheduleDeliveryRequest(claimedFoodListingKey, startImmediately, scheduledStartTime);
        let observer: Observable<Response> = this.requestService.post('/deliverer/scheduleDelivery', body);

        // Listen for a response now.
        return observer.map((response: Response) => {

            let scheduleDeliveryFoodListingResponse: FoodWebResponse = response.json();
            
            // On failure.
            if (!scheduleDeliveryFoodListingResponse.success) {
                console.log(scheduleDeliveryFoodListingResponse.message);
                throw new Error(scheduleDeliveryFoodListingResponse.message);
            }
        });
    }
}
