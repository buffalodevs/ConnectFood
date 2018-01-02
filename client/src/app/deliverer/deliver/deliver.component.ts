import { Component } from '@angular/core';
import { FormControl, AbstractControl } from '@angular/forms';

import { DeliveryUtilService } from '../delivery-listings/delivery-services/delivery-util.service';

import { Delivery } from '../../../../../shared/deliverer/delivery';


@Component({
    selector: 'deliver',
    templateUrl: './deliver.component.html',
    styleUrls: ['./deliver.component.css']
})
export class DeliverComponent {
    
    private deliveryListings: Delivery[];
    private additionalFilters: Map<string, AbstractControl>


    public constructor (
        private deliveryUtilService: DeliveryUtilService
    ) {
        this.deliveryListings = []
        this.additionalFilters = new Map<string, AbstractControl>([
            [ 'matchAvailability', new FormControl(true) ],
            [ 'unscheduledDeliveries', new FormControl(true) ]
        ]);
    }


    private deserializeDeliveryListings(deliveryListings: Delivery[]): void {
        this.deliveryUtilService.deserializeDeliveryData(deliveryListings);
        this.deliveryListings = deliveryListings;
    }
}
