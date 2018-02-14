import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl, AbstractControl } from '@angular/forms';

import { MAX_DISTANCE_VALUES } from '../../../../../shared/src/common-receiver-donor-deliverer/food-listing-domain/max-distance';
import { MAX_ESTIMATED_WEIGHT_VALUES } from '../../../../../shared/src/common-receiver-donor-deliverer/food-listing-domain/max-estimated-weight';
import { VEHICLE_TYPE_VALUES } from '../../../../../shared/src/common-receiver-donor-deliverer/food-listing-domain/vehicle-type';
import { FoodListingFilters } from '../../../../../shared/src/common-receiver-donor-deliverer/food-listing-filters';


@Component({
    selector: 'delivery-listings-filters',
    templateUrl: './delivery-listings-filters.component.html',
    styleUrls: ['./delivery-listings-filters.component.css']
})
export class DeliveryListingsFiltersComponent extends FormGroup implements OnInit {

    public readonly MAX_DISTANCES: number[] = MAX_DISTANCE_VALUES;
    public readonly MAX_TOTAL_WEIGHTS: number[] = MAX_ESTIMATED_WEIGHT_VALUES;
    public readonly VEHICLE_TYPES: string[] = VEHICLE_TYPE_VALUES;

    @Input() public header: string = 'Filters';
    /**
     * Additional filter controls and associated names.
     */
    @Input() public additionalFilters: Map <string, AbstractControl> = null;


    public constructor() {
        super({});
    }


    public ngOnInit(): void {

        const filters: FoodListingFilters = new FoodListingFilters();
        this.addControl('maxDistance', new FormControl(filters.maxDistance));
        this.addControl('maxEstimatedWeight', new FormControl(filters.maxEstimatedWeight));
        this.addControl('recommendedVehicleType', new FormControl(filters.recommendedVehicleType));

        // Add any parent specified additional filter controls.
        if (this.additionalFilters != null) {
            
            let additionalFiltersKeys: string[] = Array.from(this.additionalFilters.keys());
            for(let additionalFilterControlName of additionalFiltersKeys) {
                
                this.addControl(additionalFilterControlName, this.additionalFilters.get(additionalFilterControlName));
            }
        }
    }
}
