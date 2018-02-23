import { Component, Input, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialogConfig, MatDialog } from '@angular/material';

import { FoodListingDialogComponent, FoodListingDialogData } from './food-listing-dialog/food-listing-dialog.component';
import { SlickListComponent } from '../../slick/slick-filtered-list/slick-list/slick-list.component';
import { GetListingsService } from '../../slick/slick-filtered-list/slick-list/services/get-listings.service';
import { ConsumableListingCacheService } from '../../slick/slick-filtered-list/slick-list/services/consumable-listing-cache.service';
import { DateFormatterService } from '../../common-util/services/date-formatter.service';
import { DEFAULT_IMG_URL } from '../../common-util/directives/default-img.directive';

import { FoodListing } from '../../../../../shared/src/common-receiver-donor-deliverer/food-listing';
import { FoodListingFilters } from "../../../../../shared/src/common-receiver-donor-deliverer/food-listing-filters";


@Component({
    selector: 'food-listings',
    templateUrl: './food-listings.component.html',
    styleUrls: ['./food-listings.component.css', '../../slick/slick-filtered-list/slick-list/slick-list.component.css']
})
export class FoodListingsComponent extends SlickListComponent <FoodListing, FoodListingFilters> {

    // Make this available to HTML Template.
    public readonly DEFAULT_IMG_URL: string = DEFAULT_IMG_URL;

    @Input() public header: string = 'Food Listings';
    @Input() public isClaimedCart: boolean = false;
    @Input() public isDonatedCart: boolean = false;


    public constructor (
        public dateFormatter: DateFormatterService,
        elementRef: ElementRef,
        getListingsService: GetListingsService <FoodListing, FoodListingFilters>,
        consumableListingCacheService: ConsumableListingCacheService <FoodListing>,
        router: Router,
        dialogService: MatDialog
    ) {
        super('/receiverDonor/getFoodListings', elementRef, getListingsService, consumableListingCacheService, router, dialogService);
    }


    /**
     * Selects a listing (and opens associated dialog) based on a given list index.
     * @param selectedListIndex The index of the listing to select.
     */
    public selectListing(selectedListIndex: number): void {

        // Prepare dialog configuration upon selection by setting input data for dialog.
        let dialogConfig: MatDialogConfig<FoodListingDialogData> = new MatDialogConfig<FoodListingDialogData>();
        dialogConfig.data = new FoodListingDialogData(this.listData[selectedListIndex].foodTitle, this.isClaimedCart, this.isDonatedCart);

        super.selectListing(selectedListIndex, FoodListingDialogComponent, dialogConfig);
    }
}
