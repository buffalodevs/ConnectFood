import { Component, OnInit, Input, Output, ViewChild } from '@angular/core';
import { FormGroup, AbstractControl, FormControl } from '@angular/forms';

import { FoodTypesComponent } from "../../../domain/food-types/food-types.component";

import { FoodListingsFilters } from "../../../../../../shared/receiver-donor/food-listings-filters";


@Component({
    selector: 'app-food-listings-filters',
    templateUrl: './food-listings-filters.component.html',
    styleUrls: ['./food-listings-filters.component.css']
})
export class FoodListingsFiltersComponent extends FormGroup implements OnInit {

    @Input() private header: string = 'Filters';
    @Input() private maxWidth: string = null;
    @Input() private defaultAvailableAfterDateNow: boolean = true;


    public constructor () {
        super({});
    }


    public ngOnInit(): void {
        // Actual form group initialization requires Input to be evaluated, so must be in init!
        this.addControl('foodTypes', new FormControl(null));
        this.addControl('perishable', new FormControl(true));
        this.addControl('notPerishable', new FormControl(true));
        this.addControl('availableAfterDate', new FormControl(this.defaultAvailableAfterDateNow ? new Date() : null));
    }
}
