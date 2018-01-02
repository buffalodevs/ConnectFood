import { Component } from '@angular/core';
import { AbstractControl, FormControl } from '@angular/forms';

import { LISTINGS_STATUS } from "../../../../../shared/receiver-donor/food-listings-filters";
import { FoodListing } from '../../../../../shared/receiver-donor/food-listing';


@Component({
    selector: 'app-receive',
    templateUrl: './receive.component.html',
    styleUrls: ['./receive.component.css']
})
export class ReceiveComponent {

    private additionalFilters: Map<string, AbstractControl>;
    private foodListings: FoodListing[];

    
    public constructor() {
        this.foodListings = [];
        this.additionalFilters = new Map<string, AbstractControl>([
            ['listingsStatus', new FormControl(LISTINGS_STATUS.unclaimedListings)],
            ['matchAvailability', new FormControl(true)]
        ]);
    }
}
