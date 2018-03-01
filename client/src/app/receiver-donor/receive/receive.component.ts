import { Component } from '@angular/core';
import { AbstractControl, FormControl } from '@angular/forms';

import { FoodListingsStatus } from "../../../../../shared/src/common-receiver-donor-deliverer/food-listing";
import { FoodListingFilters } from '../../../../../shared/src/common-receiver-donor-deliverer/food-listing-filters';


@Component({
    selector: 'app-receive',
    templateUrl: './receive.component.html',
    styleUrls: ['./receive.component.css']
})
export class ReceiveComponent {

    public additionalFilters: Map <string, AbstractControl>;

    
    public constructor() {

        // Get default filters values by default constructing a new filters object.
        const filters: FoodListingFilters = new FoodListingFilters();

        this.additionalFilters = new Map <string, AbstractControl>([
            [ 'foodListingsStatus', new FormControl(FoodListingsStatus.unclaimedListings) ],
            [ 'matchRegularAvailability', new FormControl(filters.matchRegularAvailability) ]
        ]);
    }
}
