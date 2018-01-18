import { Component, ViewChild, OnInit } from '@angular/core';
import { FormControl, AbstractControl } from '@angular/forms';
import { Observable } from "rxjs/Observable";

import { DeliveryUtilService } from '../delivery-listings/delivery-services/delivery-util.service';

import { DeliveryFilters } from '../../../../../shared/deliverer/delivery-filters';
import { Delivery } from '../../../../../shared/deliverer/delivery';


@Component({
    selector: 'delivery-cart',
    templateUrl: './delivery-cart.component.html',
    styleUrls: ['./delivery-cart.component.css', '../delivery-listings-filters/delivery-listings-filters.component.css']
})
export class DeliveryCartComponent {

    private deliveryStates: string[];
    private deliveryListings: Delivery[];
    private additionalFilters: Map<string, AbstractControl>;


    public constructor (
        private deliveryUtilService: DeliveryUtilService
    ) {
        this.deliveryStates = this.deliveryUtilService.getDeliveryStateVals();
        this.deliveryStates[0] = null; // Replace 'Unscheduled' with null as first element for default 'Any State' value.
        this.additionalFilters = new Map<string, AbstractControl>([
            [ 'deliveryState', new FormControl(null) ],
            [ 'myScheduledDeliveries', new FormControl(true) ]
        ]);
    }


    private deserializeDeliveryListings(deliveryListings: Delivery[]): void {
        this.deliveryUtilService.deserializeDeliveryData(deliveryListings);
        this.deliveryListings = deliveryListings;
    }
}
