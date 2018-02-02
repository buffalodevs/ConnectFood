import { Component } from '@angular/core';
import { AbstractControl, FormControl } from '@angular/forms';

import { LISTINGS_STATUS } from "../../../../../shared/src/receiver-donor/food-listings-filters";


@Component({
    selector: 'app-receive',
    templateUrl: './receive.component.html',
    styleUrls: ['./receive.component.css']
})
export class ReceiveComponent {

    public additionalFilters: Map<string, AbstractControl>;

    
    public constructor() {
        this.additionalFilters = new Map<string, AbstractControl>([
            ['listingsStatus', new FormControl(LISTINGS_STATUS.unclaimedListings)],
            ['matchRegularAvailability', new FormControl(true)],
            ['matchSpecifiedAvailability', new FormControl(false)]
        ]);
    }
}
