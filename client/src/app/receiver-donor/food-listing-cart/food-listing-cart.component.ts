import { Component, OnInit, NgModule, Injectable, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { NgbModule, NgbModal, ModalDismissReasons, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from "rxjs/Observable";

import { FoodListingsFiltersComponent } from "../food-listings/food-listings-filters/food-listings-filters.component";
import { FoodListingsComponent } from "../food-listings/food-listings.component";
import { ManageFoodListingService } from "../food-listings/food-listing-services/manage-food-listing.service";
import { SessionDataService } from '../../common-util/services/session-data.service';

import { FoodListing } from "../../../../../shared/receiver-donor/food-listing";
import { FoodListingsFilters, LISTINGS_STATUS } from "../../../../../shared/receiver-donor/food-listings-filters";
import { AppUserInfo } from "../../../../../shared/app-user/app-user-info";


@Component({
    selector: 'food-listing-cart',
    templateUrl: './food-listing-cart.component.html',
    styleUrls: ['./food-listing-cart.component.css', '../../slick-filtered-list/slick-filtered-list.component.css'],
    providers: [
        SessionDataService,
        ManageFoodListingService
    ]
})
export class FoodListingCartComponent implements OnInit {

    // Need to declare LISTINGS_STATUS enum inside component to be used in the HTML template!
    private readonly LISTINGS_STATUS: typeof LISTINGS_STATUS = LISTINGS_STATUS;

    @ViewChild('foodListingsFilters') private foodListingsFiltersComponent: FoodListingsFiltersComponent;
    @ViewChild('foodListings') private foodListingsComponent: FoodListingsComponent;


    public constructor (
        private sessionDataService: SessionDataService,
        private manageFoodListingService: ManageFoodListingService
    ) { }


    /**
     * Retrieves user data from session storage to determine initial cart type and mutability of cart type.
     */
    public ngOnInit(): void {
        const appUserInfo: AppUserInfo = this.sessionDataService.getAppUserSessionData();

        if (appUserInfo.appUserType === 'Receiver') {
            // If both receiver and donor, then default to receiver mode!
            this.foodListingsFiltersComponent.addControl('listingsStatus', new FormControl(LISTINGS_STATUS.myClaimedListings));
        } 
        else {
            this.foodListingsFiltersComponent.addControl('listingsStatus', new FormControl(LISTINGS_STATUS.myDonatedListings));
        }
    }


    /**
     * Executed after all of the view children have been initialized (so safest to interact with them now).
     */
    public ngAfterViewInit(): void {
        this.foodListingsComponent.refreshList(this.foodListingsFiltersComponent.getRawValue());
        this.foodListingsFiltersComponent.valueChanges.subscribe(this.foodListingsComponent.refreshList.bind(this.foodListingsComponent));
    }


    private getFoodListingsTitle(): string {
        return (this.isClaimedCart() ? 'Claimed Food'
                                     : 'Donated Food');
    }


    private isClaimedCart(): boolean {
        return (this.foodListingsFiltersComponent.value.listingsStatus === LISTINGS_STATUS.myClaimedListings);
    }


    private isDonatedCart(): boolean {
        return (this.foodListingsFiltersComponent.value.listingsStatus === LISTINGS_STATUS.myDonatedListings);
    }


    private unclaimSelectedFoodListing(): void {
        if (confirm('Are you sure you want to unclaim the food?\nThis cannot be undone.')) {
            let selectedFoodListing: FoodListing = this.foodListingsComponent.getSelectedListing();
            let observer: Observable<void> = this.manageFoodListingService.unclaimFoodListing(selectedFoodListing.foodListingKey);

            observer.subscribe(
                () => {
                    this.foodListingsComponent.removeSelectedListing();
                },
                (err: Error) => {
                    console.log(err);
                }
            );
        }
    }


    private removeSelectedFoodListing(): void {
        let selectedFoodListing: FoodListing = this.foodListingsComponent.getSelectedListing();
        let observer: Observable<void> = this.manageFoodListingService.removeFoodListing(selectedFoodListing.foodListingKey);

        observer.subscribe(
            () => {
                this.foodListingsComponent.removeSelectedListing();
            },
            (err: Error) => {
                console.log(err);
            }
        );
    }
}
