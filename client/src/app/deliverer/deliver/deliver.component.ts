import { Component, ViewChild, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from "rxjs/Observable";

import { DeliveryFoodListingsComponent } from '../delivery-food-listings/delivery-food-listings.component';
import { DeliveryFoodListingsFiltersComponent } from '../delivery-food-listings/delivery-food-listings-filters/delivery-food-listings-filters.component';

import { DeliveryFoodListingsFilters } from '../../../../../shared/deliverer/delivery-food-listings-filters';


@Component({
    selector: 'deliver',
    templateUrl: './deliver.component.html',
    styleUrls: ['./deliver.component.css', '../../slick-filtered-list/slick-filtered-list.component.css']
})
export class DeliverComponent implements OnInit {

    @ViewChild('deliveryFoodListingsFilters') private deliveryFoodListingsFiltersComponent: DeliveryFoodListingsFiltersComponent;
    @ViewChild('deliveryFoodListings') private deliveryFoodListingsComponent: DeliveryFoodListingsComponent;

    private readonly minFiltersWidth: string;


    constructor (

    ) {
        this.minFiltersWidth = '262px';
    }


    /**
     * Executes after all input bindings have been established but before view children have been fully initialized.
     */
    public ngOnInit(): void {}


    /**
     * Executed after all of the view children have been initialized (so safest to interact with them now).
     */
    public ngAfterViewInit(): void {
        // First, trigger a refresh by manually invoking update function.
        this.onFiltersUpdate(this.deliveryFoodListingsFiltersComponent.value);
        this.deliveryFoodListingsFiltersComponent.valueChanges.subscribe(this.onFiltersUpdate.bind(this));
    }


    /**
     * Handles filters updates by refreshing the Delivery Food Listings with unclaimed listings only.
     * @param filters The filters from the Delivery Food Listing Filters component.
     */
    private onFiltersUpdate(filters: DeliveryFoodListingsFilters): void {
        // Make sure we mark down that we only want unclaimed listings!
        this.deliveryFoodListingsComponent.refreshList(filters);
    }
}
