"use strict";
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import { RequestService } from "../../../common-util/services/request.service";

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
     * @return An observable that resolves to true on success, false on non-fatal failure. If a fatal error occurs, then an exception is thrown.
     */
    public scheduleDelivery(claimedFoodListingKey: number, startImmediately: boolean, scheduledStartTime?: Date): Observable<boolean> {
        
        return this.requestService.post('/deliverer/scheduleDelivery', new ScheduleDeliveryRequest(claimedFoodListingKey, startImmediately, scheduledStartTime))
                                  .map(this.requestService.genericResponseMap);
    }
}
