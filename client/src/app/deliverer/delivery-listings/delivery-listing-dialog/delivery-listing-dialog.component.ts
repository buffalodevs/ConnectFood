import { Component, OnInit, Input, Output, EventEmitter, Inject } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';

import { DeliveryUtilService } from '../delivery-services/delivery-util.service';

import { Delivery, DeliveryState } from '../../../../../../shared/deliverer/delivery';
import { SlickListDialogData, SlickListDialog } from '../../../slick/slick-filtered-list/slick-list/slick-list-dialog/slick-list-dialog';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';


/**
 * Contains the state of the Delivery Dialog, which in turn, determines what to display in the dialog.
 */
enum DeliveryDialogState {
    DeliveryInfo,
    Schedule,
    CancelReason,
    CancelResult
}


/**
 * Expected input data for this dialog.
 * NOTE: Needed because this dialog will be globally generated and opened, and it cannot use traditional Input() slots.
 */
export class DeliveryListingDialogData extends SlickListDialogData<Delivery> {

    public constructor (
        public header: string,
        public isCart: boolean,
        selectedListing?: Delivery
    ) {
        super(selectedListing);
    }
}


@Component({
    selector: 'delivery-listing-dialog',
    templateUrl: './delivery-listing-dialog.component.html',
    styleUrls: ['./delivery-listing-dialog.component.css']
})
export class DeliveryListingDialogComponent extends SlickListDialog {

    private deliveryDialogState: DeliveryDialogState;


    public constructor (
        private dialogRef: MatDialogRef<DeliveryListingDialogComponent>,
        @Inject(MAT_DIALOG_DATA) private dialogData: DeliveryListingDialogData,
        private deliveryUtilService: DeliveryUtilService // Referenced in HTML template
    ) {
        super();
        this.deliveryDialogState = DeliveryDialogState.DeliveryInfo;
    }


    /**
     * Determines if the dialog state matches a given string.
     * @param state The state string to match.
     * @return true if it is in the given state, false if not.
     */
    private isDialogState(state: string): boolean {
        return ( this.deliveryDialogState === DeliveryDialogState[state] );
    }


    /**
     * Transitions the delivery dialog to the Schedule state.
     */
    private toSchedule(): void {
        this.deliveryDialogState = DeliveryDialogState.Schedule;
    }


    /**
     * Transitions the delivery dialog to the Cancel Reason state.
     */
    private toCancelReason(): void {
        this.deliveryDialogState = DeliveryDialogState.CancelReason;
    }
}
