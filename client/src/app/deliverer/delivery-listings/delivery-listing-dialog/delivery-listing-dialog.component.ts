import { Component, OnInit, Input, Output, EventEmitter, Inject } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import { DeliveryListingDialogData } from './delivery-listing-dialog-data';
import { SlickListDialogData, SlickListDialog } from '../../../slick/slick-filtered-list/slick-list/slick-list-dialog/slick-list-dialog';

export { DeliveryListingDialogData };


/**
 * Contains the state of the Delivery Dialog, which in turn, determines what to display in the dialog.
 */
enum DeliveryDialogState {
    DeliveryInfo,
    Schedule,
    CancelReason,
    CancelResult
}


@Component({
    selector: 'delivery-listing-dialog',
    templateUrl: './delivery-listing-dialog.component.html',
    styleUrls: ['./delivery-listing-dialog.component.css']
})
export class DeliveryListingDialogComponent implements SlickListDialog {

    private _dialogRef: MatDialogRef <DeliveryListingDialogComponent>;
    get dialogRef(): MatDialogRef <DeliveryListingDialogComponent> {
        return this._dialogRef;
    }

    private _dialogData: DeliveryListingDialogData;
    get dialogData(): DeliveryListingDialogData {
        return this._dialogData;
    }

    private _deliveryDialogState: DeliveryDialogState;

    public removeSelectedListing: EventEmitter<void> = new EventEmitter <void>();


    public constructor (
        dialogRef: MatDialogRef <DeliveryListingDialogComponent>,
        @Inject(MAT_DIALOG_DATA) dialogData: DeliveryListingDialogData
    ) {
        this._dialogRef = dialogRef;
        this._dialogData = dialogData;
        this._deliveryDialogState = DeliveryDialogState.DeliveryInfo;
    }


    /**
     * Determines if the dialog state matches a given string.
     * @param state The state string to match.
     * @return true if it is in the given state, false if not.
     */
    public isDialogState(state: string): boolean {
        return ( this._deliveryDialogState === DeliveryDialogState[state] );
    }


    /**
     * Transitions the delivery dialog to the Schedule state.
     */
    public toSchedule(): void {
        this._deliveryDialogState = DeliveryDialogState.Schedule;
    }


    /**
     * Transitions the delivery dialog to the Cancel Reason state.
     */
    public toCancelReason(): void {
        this._deliveryDialogState = DeliveryDialogState.CancelReason;
    }
}
