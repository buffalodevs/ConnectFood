import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, AbstractControl, FormControl } from '@angular/forms';

import { FoodTypesService } from '../../domain/food-types/food-types.service';
import { FoodListingsFilters } from "../../../../../shared/receiver-donor/food-listings-filters";


@Component({
    selector: 'food-listings-filters',
    templateUrl: './food-listings-filters.component.html',
    styleUrls: ['./food-listings-filters.component.css']
})
export class FoodListingsFiltersComponent extends FormGroup implements OnInit {

    @Input() private header: string;
    @Input() private defaultAvailableAfterDateNow: boolean;
    /**
     * Additional filter controls and associated names.
     */
    @Input() private additionalFilters: Map<string, AbstractControl>;


    public constructor (
        private foodTypesService: FoodTypesService
    ) {
        super({});

        this.header = 'Filters';
        this.defaultAvailableAfterDateNow = true;
    }


    public ngOnInit(): void {

        // Should resolve immedialtey!
        this.foodTypesService.getFoodTypes().subscribe((foodTypes: string[]) => {

            // Actual form group initialization requires Input to be evaluated, so must be in init!
            this.addControl('foodTypes', new FormControl(foodTypes));
            this.addControl('perishable', new FormControl(true));
            this.addControl('notPerishable', new FormControl(true));
            this.addControl('availableAfterDate', new FormControl(this.defaultAvailableAfterDateNow ? new Date() : null));

            // Add any parent specified additional filter controls.
            if (this.additionalFilters != null) {

                let additionalFiltersKeys: string[] = Array.from(this.additionalFilters.keys());
                for(let additionalFilterControlName of additionalFiltersKeys) {
                    
                    this.addControl(additionalFilterControlName, this.additionalFilters.get(additionalFilterControlName));
                }
            }
        })
    }
}
