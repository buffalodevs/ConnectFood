import { Component, Input, ViewChild } from '@angular/core';
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { Observable } from "rxjs/Observable";

import { AbstractSlickList } from './../../misc-slick-components/slick-filtered-list/slick-list/abstract-slick-list';
import { AbstractSlickListDialog } from '../../misc-slick-components/slick-filtered-list/slick-list/slick-list-dialog/abstract-slick-list-dialog';
import { GetFoodListingsService } from './food-listing-services/get-food-listings.service';

import { FoodListing } from '../../../../../shared/receiver-donor/food-listing';
import { FoodListingsFilters } from "../../../../../shared/receiver-donor/food-listings-filters";


@Component({
    selector: 'app-food-listings',
    templateUrl: './food-listings.component.html',
    styleUrls: ['./food-listings.component.css'],
    providers: [GetFoodListingsService]
})
export class FoodListingsComponent extends AbstractSlickList <FoodListing, FoodListingsFilters> {

    private readonly DEFAULT_IMG_URL = './../../assets/IconImg.png';

    /**
     * Title of the Food Listings. Default is 'Food Listings'.
     */
    @Input() private header: string = 'Food Listings';
    /**
     * Determines if this dialog is displaying Food Listing info for a Receiver's Cart. Default is false.
     */
    @Input() private isClaimedCart: boolean = false;
    /**
     * Determines if this dialog is displaying Food Listing info for a Donor's Cart. Default is false.
     */
    @Input() private isDonatedCart: boolean = false;

    @ViewChild('FoodListingDialogComponent') protected slickListDialog: AbstractSlickListDialog <FoodListing>;


    public constructor (
        getFoodListingsService: GetFoodListingsService
    ) {
        super(getFoodListingsService, '/receiverDonor/getFoodListings');
    }
}
