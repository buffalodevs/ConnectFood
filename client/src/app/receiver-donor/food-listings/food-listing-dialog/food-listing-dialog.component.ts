import { Component, Input, Output, EventEmitter } from '@angular/core';

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
    styleUrls: ['./food-listing-dialog.component.css']
})
export class FoodListingDialogComponent {

    /**
     * Determines if this dialog is displaying Food Listing info for a Receiver's Cart. Default is false.
     */
    @Input() private isClaimedCart: boolean;
    /**
     * Determines if this dialog is displaying Food Listing info for a Donor's Cart. Default is false.
     */
    @Input() private isDonatedCart: boolean;
    /**
     * The food listing to display in the dialog.
     */
    @Input() private foodListing: FoodListing;

    /**
     * Emitted whenever the food listing being displayed (and manipualted) in the dialog should be removed.
     */
    @Output() private removeListing: EventEmitter<void>;
    @Output() private close: EventEmitter<void>;


    private foodListingDialogState: FoodListingDialogState;


    public constructor() {
        this.isClaimedCart = false;
        this.isDonatedCart = false;
        this.removeListing = new EventEmitter<void>();
        this.close = new EventEmitter<void>();
        this.refreshDialogState();
    }


    public refreshDialogState(): void {
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
