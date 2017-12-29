import { Component, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { ResponsiveService } from '../../../../common-util/services/responsive.service';

import { FoodListing } from './../../../../../../../shared/receiver-donor/food-listing';


@Component({
    selector: 'food-listing-info',
    templateUrl: './food-listing-info.component.html',
    styleUrls: [
        './food-listing-info.component.css',
        '../../food-listings.component.css',
        '../../../../misc-slick-components/slick-filtered-list/slick-list/slick-list-dialog/slick-list-dialog.component.css'
    ]
})
export class FoodListingInfoComponent {

    @Input() private foodListing: FoodListing;
    /**
     * Determines if this dialog is displaying Food Listing info for a Receiver's Cart. Default is false.
     */
    @Input() private isClaimedCart: boolean;
    /**
     * Determines if this dialog is displaying Food Listing info for a Donor's Cart. Default is false.
     */
    @Input() private isDonatedCart: boolean;
    /**
     * Default replacement image URL if one is not provided or if the provided one does not exist.
     */
    @Input() private defaultImgUrl: string;

    /**
     * Emitted whenever a Food Listing is to be claimed.
     */
    @Output() private toClaim: EventEmitter<void>;
    /**
     * Emitted whenever a Food Listing is to be unclaimed.
     */
    @Output() private toUnclaim: EventEmitter<void>;
    /**
     * Emitted whenever a Food Listing is to be removed (un-donated).
     */
    @Output() private toRemove: EventEmitter<void>;


    public constructor (
        private responsiveService: ResponsiveService
    ) {
        this.isClaimedCart = false;
        this.isDonatedCart = false;
        this.defaultImgUrl = null;

        this.toClaim = new EventEmitter<void>();
        this.toUnclaim = new EventEmitter<void>();
        this.toRemove = new EventEmitter<void>();
    }
}
