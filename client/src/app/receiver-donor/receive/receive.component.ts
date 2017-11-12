import { Component, ViewChild, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from "rxjs/Observable";

import { FoodListingsComponent } from "../food-listings/food-listings.component";
import { FoodListingsFiltersComponent } from "../food-listings/food-listings-filters/food-listings-filters.component";
import { ManageFoodListingService } from "../food-listings/food-listing-services/manage-food-listing.service";

import { FoodListing } from "../../../../../shared/receiver-donor/food-listing";
import { FoodListingsFilters, LISTINGS_STATUS } from "../../../../../shared/receiver-donor/food-listings-filters";


@Component({
    selector: 'app-receive',
    templateUrl: './receive.component.html',
    styleUrls: ['./receive.component.css', '../../slick-filtered-list/slick-filtered-list.component.css'],
    providers: [ManageFoodListingService]
})
export class ReceiveComponent implements OnInit {

    @ViewChild('foodListingsFilters') private foodListingsFiltersComponent: FoodListingsFiltersComponent;
    @ViewChild('foodListings') private foodListingsComponent: FoodListingsComponent;

    private readonly minFiltersWidth: string;


    constructor(
        private claimFoodListingService: ManageFoodListingService
    ) {
        this.minFiltersWidth = '262px';
    }


    /**
     * Executes after all input bindings have been established but before view children have been fully initialized.
     */
    public ngOnInit(): void {
        this.foodListingsFiltersComponent.addControl('matchAvailability', new FormControl(true));
    }


    /**
     * Executed after all of the view children have been initialized (so safest to interact with them now).
     */
    public ngAfterViewInit(): void {
        // First, trigger a refresh by manually invoking update function.
        this.onFiltersUpdate(this.foodListingsFiltersComponent.value);
        this.foodListingsFiltersComponent.valueChanges.subscribe(this.onFiltersUpdate.bind(this));
    }


    /**
     * Handles filters updates by refreshing the Food Listings with unclaimed listings only.
     * @param filters The filters from the Food Listing Filters component.
     */
    private onFiltersUpdate(filters: FoodListingsFilters): void {
        // Make sure we mark down that we only want unclaimed listings!
        filters.listingsStatus = LISTINGS_STATUS.unclaimedListings;
        this.foodListingsComponent.refreshList(filters);
    }


    /**
     * Claims the currently selected Food Listing.
     */
    private claimSelectedFoodListing(): void {
        let selectedFoodListing: FoodListing = this.foodListingsComponent.getSelectedListing();
        let observer: Observable<void> = this.claimFoodListingService.claimFoodListing(selectedFoodListing.foodListingKey);
        
        // Listen for result.
        observer.subscribe(
            () => {
                // On success, simply remove the Food Listing from the Receiver Food Listings interface.
                this.foodListingsComponent.removeSelectedListing();
            },
            (err: Error) => {
                console.log(err);
            }
        );
    }
}
