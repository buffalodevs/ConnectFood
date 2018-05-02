import { Component } from '@angular/core';
import { FormControl, AbstractControl } from '@angular/forms';
import { DeliveryUtilService } from '../delivery-listings/delivery-services/delivery-util.service';
import { FoodListingsStatus, FoodListingFilters } from '../../../../../shared/src/common-user/food-listing-filters';


@Component({
    selector: 'delivery-cart',
    templateUrl: './delivery-cart.component.html',
    styleUrls: ['./delivery-cart.component.css', '../delivery-listings-filters/delivery-listings-filters.component.css']
})
export class DeliveryCartComponent {

    public deliveryStates: string[];
    public additionalFilters: Map <string, AbstractControl>;


    public constructor (
        public deliveryUtilService: DeliveryUtilService
    ) {
        this.deliveryStates = this.deliveryUtilService.getDeliveryStateVals();
        this.deliveryStates[0] = null; // Replace 'Unscheduled' with null as first element for default 'Any State' value.

        const filters: FoodListingFilters = new FoodListingFilters();
        this.additionalFilters = new Map <string, AbstractControl>([
            [ 'deliveryState', new FormControl(filters.deliveryState) ],
            [ 'foodListingsStatus', new FormControl(FoodListingsStatus.myScheduledDeliveries) ]
        ]);
    }
}
