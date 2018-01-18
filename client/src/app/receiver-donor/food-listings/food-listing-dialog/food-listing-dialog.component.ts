import { Component, Input, Output, EventEmitter, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

import { SlickListDialogData, SlickListDialog } from '../../../slick/slick-filtered-list/slick-list/slick-list-dialog/slick-list-dialog';

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


/**
 * Expected input data for this dialog.
 * NOTE: Needed because this dialog will be globally generated and opened, and it cannot use traditional Input() slots.
 */
export class FoodListingDialogData extends SlickListDialogData <FoodListing> {

    public constructor (
        public header: string,
        public isClaimedCart: boolean,
        public isDonatedCart: boolean,
        selectedListing?: FoodListing
    ) {
        super(selectedListing);
    }
}


@Component({
    selector: 'food-listing-dialog',
    templateUrl: './food-listing-dialog.component.html',
    styleUrls: ['./food-listing-dialog.component.css']
})
export class FoodListingDialogComponent extends SlickListDialog {

    private foodListingDialogState: FoodListingDialogState;


    public constructor (
        private dialogRef: MatDialogRef <FoodListingDialogComponent>,
        @Inject(MAT_DIALOG_DATA) private dialogData: FoodListingDialogData
    ) {
        super();
        this.foodListingDialogState = FoodListingDialogState.FoodListingInfo;
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


    /**
     * Transitions dialog state to Unclaim.
     */
    private toUnclaim(): void {
        this.foodListingDialogState = FoodListingDialogState.Unclaim;
    }


    /**
     * Transitions dialog state to Remove.
     */
    private toRemove(): void {
        this.foodListingDialogState = FoodListingDialogState.Remove;
    }
}
