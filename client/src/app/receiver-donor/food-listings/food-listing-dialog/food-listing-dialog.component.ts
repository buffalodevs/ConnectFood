import { Component, Input, ViewChild } from '@angular/core';

import { AbstractSlickListDialog } from '../../../misc-slick-components/slick-filtered-list/slick-list/slick-list-dialog/abstract-slick-list-dialog';
import { SlickListDialogComponent } from '../../../misc-slick-components/slick-filtered-list/slick-list/slick-list-dialog/slick-list-dialog.component';
import { ResponsiveService } from '../../../common-util/services/responsive.service';

import { FoodListing } from './../../../../../../shared/receiver-donor/food-listing';


/**
 * Contains the state of the Delivery Dialog, which in turn, determines what to display in the dialog.
 */
enum FoodListingDialogState {
    FoodListingInfo,
    Claim,
    Unclaim,
    Remove
}


@Component({
    selector: 'food-listing-dialog',
    templateUrl: './food-listing-dialog.component.html',
    styleUrls: [
        './food-listing-dialog.component.css',
        '../food-listings.component.css',
        '../../../misc-slick-components/slick-filtered-list/slick-list/slick-list-dialog/slick-list-dialog.component.css'
    ]
})
export class FoodListingDialogComponent extends AbstractSlickListDialog<FoodListing> {

    /**
     * Determines if this dialog is displaying Food Listing info for a Receiver's Cart. Default is false.
     */
    @Input() private isClaimedCart: boolean = false;
    /**
     * Determines if this dialog is displaying Food Listing info for a Donor's Cart. Default is false.
     */
    @Input() private isDonatedCart: boolean = false;
    /**
     * Default replacement image URL if one is not provided or if the provided one does not exist.
     */
    @Input() private defaultImgUrl: string = null;

    /**
     * This is a shadow of the slickListDialog member in AbstractSlickListDialog.
     * It is all that is needed to make basic dialog functions work (open, close, etc).
     */
    @ViewChild('SlickListDialogComponent') protected slickListDialog: SlickListDialogComponent;

    private foodListingDialogState: FoodListingDialogState;


    public constructor (
        private responsiveService: ResponsiveService
    ) {
        super();
    }


    public open(dialogData: FoodListing): void {
        this.foodListingDialogState = FoodListingDialogState.FoodListingInfo;
        super.open(dialogData);
    }


    /**
     * Determines if the dialog state matches a given string.
     * @param state The state string to match.
     * @return true if it is in the given state, false if not.
     */
    private isDialogState(state: string): boolean {
        return ( this.foodListingDialogState === FoodListingDialogState[state] );
    }


    /**
     * Transitions dialog state to Claim.
     */
    private toClaim(): void {
        this.foodListingDialogState = FoodListingDialogState.Claim;
    }
}
