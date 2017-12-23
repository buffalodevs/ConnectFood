import { Component, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { ResponsiveService } from '../../../../common-util/services/responsive.service';
import { ManageFoodListingService } from '../../food-listing-services/manage-food-listing.service';

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
     * Emitted whenever a Food Listing has been managed and is to be removed from the respective listings in parent.
     */
    @Output() private toClaim: EventEmitter<void>;


    public constructor (
        private responsiveService: ResponsiveService,
        private manageFoodListingService: ManageFoodListingService
    ) {
        this.isClaimedCart = false;
        this.isDonatedCart = false;
        this.defaultImgUrl = null;

        this.toClaim = new EventEmitter<void>();
    }


    private unclaimSelectedFoodListing(): void {

        let observer: Observable<boolean> = this.manageFoodListingService.unclaimFoodListing(this.foodListing.foodListingKey);

        observer.subscribe (
            () => {
                //this.managementCompleted.emit();
            },
            (err: Error) => {
                alert(err.message);
            }
        );
    }


    private removeSelectedFoodListing(): void {

        let observer: Observable<boolean> = this.manageFoodListingService.removeFoodListing(this.foodListing.foodListingKey);

        observer.subscribe (
            () => {
                //this.managementCompleted.emit();
            },
            (err: Error) => {
                alert(err.message);
            }
        );
    }
}
