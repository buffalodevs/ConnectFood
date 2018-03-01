import { Component, Input, Output, EventEmitter, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

import { FoodListingDialogData } from './food-listing-dialog-data';
import { SlickListDialogData, SlickListDialog } from '../../../slick/slick-filtered-list/slick-list/slick-list-dialog/slick-list-dialog';

export { FoodListingDialogData };


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
    styleUrls: ['./food-listing-dialog.component.css']
})
export class FoodListingDialogComponent implements SlickListDialog {

    private _foodListingDialogState: FoodListingDialogState = FoodListingDialogState.FoodListingInfo;
    public removeSelectedListing: EventEmitter<void> = new EventEmitter <void>();

    public constructor (
        public dialogRef: MatDialogRef <FoodListingDialogComponent>,
        @Inject(MAT_DIALOG_DATA)
        public dialogData: FoodListingDialogData
    ) {}


    /**
     * Determines if the dialog state matches a given string.
     * @param state The state string to match.
     * @return true if it is in the given state, false if not.
     */
    public isDialogState(state: string): boolean {
        return ( this._foodListingDialogState === FoodListingDialogState[state] );
    }


    /**
     * Transitions dialog state to Claim.
     */
    public toClaim(): void {
        this._foodListingDialogState = FoodListingDialogState.Claim;
    }


    /**
     * Transitions dialog state to Unclaim.
     */
    public toUnclaim(): void {
        this._foodListingDialogState = FoodListingDialogState.Unclaim;
    }


    /**
     * Transitions dialog state to Remove.
     */
    public toRemove(): void {
        this._foodListingDialogState = FoodListingDialogState.Remove;
    }
}
