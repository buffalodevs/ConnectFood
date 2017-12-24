import { Component, ViewChild, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from "rxjs/Observable";

import { AbstractSlickFilteredList } from '../../misc-slick-components/slick-filtered-list/abstract-slick-filtered-list';
import { FoodListingsComponent } from "../food-listings/food-listings.component";
import { FoodListingsFiltersComponent } from "../food-listings/food-listings-filters/food-listings-filters.component";
import { ManageFoodListingService } from "../food-listings/food-listing-services/manage-food-listing.service";

import { FoodListing } from "../../../../../shared/receiver-donor/food-listing";
import { FoodListingsFilters, LISTINGS_STATUS } from "../../../../../shared/receiver-donor/food-listings-filters";


@Component({
    selector: 'app-receive',
    templateUrl: './receive.component.html',
    styleUrls: ['./receive.component.css']
})
export class ReceiveComponent extends AbstractSlickFilteredList<FoodListing, FoodListingsFilters> implements OnInit {

    
    public constructor() {
        super();
    }


    /**
     * Executes after all input bindings have been established but before view children have been fully initialized.
     */
    public ngOnInit(): void {
        this.filters.addControl('matchAvailability', new FormControl(true));
    }


    /**
     * Handles filters updates by refreshing the Food Listings with unclaimed listings only.
     * @param filters The filters from the Food Listing Filters component.
     */
    protected onFiltersUpdate(filters: FoodListingsFilters): void {
        // Make sure we mark down that we only want unclaimed listings!
        filters.listingsStatus = LISTINGS_STATUS.unclaimedListings;
        super.onFiltersUpdate(filters);
    }
}
