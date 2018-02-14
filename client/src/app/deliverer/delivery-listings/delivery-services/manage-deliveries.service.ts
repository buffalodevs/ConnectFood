"use strict";
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import { RequestService } from "../../../common-util/services/request.service";
import { DeliveryState } from './delivery-util.service';

import { ManageDeliveryRequest } from "./../../../../../../shared/src/deliverer/message/manage-delivery-message";
import { FoodWebResponse } from "./../../../../../../shared/src/message-protocol/food-web-response";


/**
 * Service for managing an already created or scheduled Delivery.
 */
@Injectable()
export class ManageDeliveryService {
    
    public constructor (
        private _requestService: RequestService
    ) {}


    /**
     * Updates the state of a delivery.
     * @param deliveryInfoKey The key identifier of the Delivery that is to be acted upon.
     * @param deliveryState The delivery state to set the Delivery to. Set to DeliveryState.unscheduled if cancelling delivery (value does not matter).
     * @return An observable that has no payload (simply resolves on success).
     */
    public updateDeliveryState(deliveryInfoKey: number, deliveryState: DeliveryState): Observable <void> {
        
        return this._requestService.post('/deliverer/updateDeliveryState', new ManageDeliveryRequest(deliveryInfoKey, deliveryState))
                                   .map(this._requestService.genericResponseMap);
    }
}
