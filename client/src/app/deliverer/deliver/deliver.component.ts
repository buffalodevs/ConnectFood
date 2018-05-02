import { Component } from '@angular/core';
import { FormControl, AbstractControl } from '@angular/forms';
import { DeliveryUtilService } from '../delivery-listings/delivery-services/delivery-util.service';
import { FoodListingsStatus } from '../../../../../shared/src/common-user/food-listing';
import { FoodListingFilters } from '../../../../../shared/src/common-user/food-listing-filters';


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
            [ 'matchAvailableNow', new FormControl(filters.matchAvailableNow) ],
            [ 'foodListingsStatus', new FormControl(FoodListingsStatus.unscheduledDeliveries) ]
        ]);

        // Make sure that we update matchAvailableNow filter based on value of matchRegularAvailability (cannot bind both controls to radio group).
        this.additionalFilters.get('matchRegularAvailability').valueChanges.subscribe((value: boolean) => {
            this.additionalFilters.get('matchAvailableNow').setValue(!value);
        });
    }
}
