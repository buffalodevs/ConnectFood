"use strict";
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import { RequestService } from "../../../common-util/services/request.service";

import { ScheduleDeliveryRequest } from '../../../../../../shared/src/deliverer/message/schedule-delivery-message';
import { FoodWebResponse } from "./../../../../../../shared/src/message-protocol/food-web-response";


/**
 * Service for adding or scheduling a new Delivery Food Listing.
 */
@Injectable()
export class ScheduleDeliveryService {
    
    public constructor (
        private _requestService: RequestService
    ) {}


    /**
     * Schedules a new Delivery Food Listing.
     * @param claimInfoKey The Claimed key (ID). This will be used to create a newly scheduled Delivery Food Listing entry.
     * @param startImmediately A flag that determines if this new Delivery Food Listing should be scheduled to start now.
     * @param scheduledStartTime The scheduled start time for the new Delivery Food Listing.
     * @return An observable that resolves to true on success, false on non-fatal failure. If a fatal error occurs, then an exception is thrown.
     */
    public scheduleDelivery(claimInfoKey: number, startImmediately: boolean, scheduledStartTime?: Date): Observable <void> {
        
        return this._requestService.post('/deliverer/scheduleDelivery', new ScheduleDeliveryRequest(claimInfoKey, startImmediately, scheduledStartTime))
                                   .map(this._requestService.genericResponseMap);
    }
}
