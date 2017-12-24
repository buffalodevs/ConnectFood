import { Component, OnInit, NgModule, Injectable, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { NgbModule, NgbModal, ModalDismissReasons, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from "rxjs/Observable";

import { AbstractSlickFilteredList } from '../../misc-slick-components/slick-filtered-list/abstract-slick-filtered-list';
import { FoodListingsFiltersComponent } from "../food-listings/food-listings-filters/food-listings-filters.component";
import { FoodListingsComponent } from "../food-listings/food-listings.component";
import { SessionDataService } from '../../common-util/services/session-data.service';

import { FoodListing } from "../../../../../shared/receiver-donor/food-listing";
import { FoodListingsFilters, LISTINGS_STATUS } from "../../../../../shared/receiver-donor/food-listings-filters";
import { AppUserInfo } from "../../../../../shared/app-user/app-user-info";


@Component({
    selector: 'food-listing-cart',
    templateUrl: './food-listing-cart.component.html',
    styleUrls: ['./food-listing-cart.component.css']
})
export class FoodListingCartComponent extends AbstractSlickFilteredList<FoodListing, FoodListingsFilters> implements OnInit {

    // Need to declare LISTINGS_STATUS enum inside component to be used in the HTML template!
    private readonly LISTINGS_STATUS: typeof LISTINGS_STATUS = LISTINGS_STATUS;


    public constructor (
        private sessionDataService: SessionDataService
    ) {
        super();
    }


    /**
     * Retrieves user data from session storage to determine initial cart type and mutability of cart type.
     */
    public ngOnInit(): void {
        const appUserInfo: AppUserInfo = this.sessionDataService.getAppUserSessionData();

        if (appUserInfo.appUserType === 'Receiver') {
            // If both receiver and donor, then default to receiver mode!
            this.filters.addControl('listingsStatus', new FormControl(LISTINGS_STATUS.myClaimedListings));
        } 
        else {
            this.filters.addControl('listingsStatus', new FormControl(LISTINGS_STATUS.myDonatedListings));
        }
    }


    private getFoodListingsTitle(): string {
        return (this.isClaimedCart() ? 'Claimed Food'
                                     : 'Donated Food');
    }


    private isClaimedCart(): boolean {
        return (this.filters.value.listingsStatus === LISTINGS_STATUS.myClaimedListings);
    }


    private isDonatedCart(): boolean {
        return (this.filters.value.listingsStatus === LISTINGS_STATUS.myDonatedListings);
    }
}
