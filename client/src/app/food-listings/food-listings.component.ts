import { Component, Input, ViewChild } from '@angular/core';
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { Observable } from "rxjs/Observable";

import { AbstractSlickList } from './../slick-list/abstract-slick-list';
import { GetFoodListingsService } from './food-listing-services/get-food-listings.service';

import { FoodListing } from '../../../../shared/food-listings/food-listing';
import { FoodListingsFilters } from "../../../../shared/food-listings/food-listings-filters";
import { GetFoodListingsRequest } from '../../../../shared/food-listings/message/get-food-listings-message';
import { AbstractSlickListDialog } from '../slick-list/slick-list-dialog/abstract-slick-list-dialog';


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
        super(getFoodListingsService, '/foodListings/getFoodListings');
    }
}
