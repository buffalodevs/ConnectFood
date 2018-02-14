import { Component } from '@angular/core';
import { FormControl, AbstractControl } from '@angular/forms';
import { DeliveryUtilService } from '../delivery-listings/delivery-services/delivery-util.service';
import { FoodListingsStatus } from '../../../../../shared/src/common-receiver-donor-deliverer/food-listing';
import { FoodListingFilters } from '../../../../../shared/src/common-receiver-donor-deliverer/food-listing-filters';


@Component({
    selector: 'deliver',
    templateUrl: './deliver.component.html',
    styleUrls: ['./deliver.component.css']
})
export class DeliverComponent {
    
    public additionalFilters: Map<string, AbstractControl>


    public constructor (
        private deliveryUtilService: DeliveryUtilService
    ) {
        const filters: FoodListingFilters = new FoodListingFilters();

        this.additionalFilters = new Map<string, AbstractControl>([
            [ 'matchRegularAvailability', new FormControl(filters.matchRegularAvailability) ],
            [ 'foodListingsStatus', new FormControl(FoodListingsStatus.unscheduledDeliveries) ]
        ]);
    }
}
