import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, AbstractControl, FormControl } from '@angular/forms';
import { MAX_DISTANCE_VALUES } from '../../../../../shared/src/common-receiver-donor-deliverer/food-listing-domain/max-distance';
import { FoodListingFilters } from '../../../../../shared/src/common-receiver-donor-deliverer/food-listing-filters';


@Component({
    selector: 'food-listing-filters',
    templateUrl: './food-listing-filters.component.html',
    styleUrls: ['./food-listing-filters.component.css']
})
export class FoodListingFiltersComponent extends FormGroup implements OnInit {

    public readonly MAX_DISTANCES: number[];

    @Input() public header: string;
    @Input() private defaultAvailableAfterDateNow: boolean;
    /**
     * Additional filter controls and associated names.
     */
    @Input() private additionalFilters: Map<string, AbstractControl>;


    public constructor() {
        super({});

        this.MAX_DISTANCES = MAX_DISTANCE_VALUES;

        this.header = 'Filters';
        this.defaultAvailableAfterDateNow = true;
    }


    public ngOnInit(): void {

        const filters: FoodListingFilters = new FoodListingFilters();

        // Actual form group initialization requires Input to be evaluated, so must be in init!
        this.addControl('foodTypes', new FormControl(filters.foodTypes));
        this.addControl('maxDistance', new FormControl(filters.maxDistance));
        this.addControl('needsRefrigeration', new FormControl(filters.needsRefrigeration));
        this.addControl('notNeedsRefrigeration', new FormControl(filters.notNeedsRefrigeration));
        this.addControl('availableAfterDate', new FormControl(this.defaultAvailableAfterDateNow ? new Date() : null));

        // Add any parent specified additional filter controls.
        if (this.additionalFilters != null) {

            let additionalFiltersKeys: string[] = Array.from(this.additionalFilters.keys());
            for(let additionalFilterControlName of additionalFiltersKeys) {
                
                this.addControl(additionalFilterControlName, this.additionalFilters.get(additionalFilterControlName));
            }
        }
    }
}
