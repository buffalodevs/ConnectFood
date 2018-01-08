import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialogConfig, MatDialog } from '@angular/material';

import { FoodListingDialogComponent, FoodListingDialogData } from './food-listing-dialog/food-listing-dialog.component';
import { SlickListComponent } from '../../misc-slick-components/slick-filtered-list/slick-list/slick-list.component';
import { GetListingsService } from '../../misc-slick-components/slick-filtered-list/slick-list/services/get-listings.service';
import { ConsumableListingCacheService } from '../../misc-slick-components/slick-filtered-list/slick-list/services/consumable-listing-cache.service';

import { FoodListing } from '../../../../../shared/receiver-donor/food-listing';
import { FoodListingsFilters } from "../../../../../shared/receiver-donor/food-listings-filters";


@Component({
    selector: 'food-listings',
    templateUrl: './food-listings.component.html',
    styleUrls: ['./food-listings.component.css', '../../misc-slick-components/slick-filtered-list/slick-list/slick-list.component.css']
})
export class FoodListingsComponent extends SlickListComponent <FoodListing, FoodListingsFilters> {

    @Input() private header: string;
    @Input() private isClaimedCart: boolean;
    @Input() private isDonatedCart: boolean;


    public constructor (
        getListingsService: GetListingsService <FoodListing, FoodListingsFilters>,
        consumableListingCacheService: ConsumableListingCacheService <FoodListing>,
        router: Router,
        dialogService: MatDialog
    ) {
        super('/receiverDonor/getFoodListings', getListingsService, consumableListingCacheService, router, dialogService);

        this.header = 'Food Listings';
        this.isClaimedCart = false;
        this.isDonatedCart = false;
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
