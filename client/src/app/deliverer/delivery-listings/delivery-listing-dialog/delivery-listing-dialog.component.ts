import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';

import { DeliveryUtilService } from '../delivery-services/delivery-util.service';

import { Delivery, DeliveryState } from '../../../../../../shared/deliverer/delivery';


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
export class DeliveryListingDialogComponent {

    /**
     * The current delivery listing to display/manipulate.
     */
    @Input() private deliveryListing: Delivery;
    /**
     * Set to true if the Delivery Listings are for a Delivery Cart. Default is false.
     */
    @Input() private isCart: boolean;

    @Output() private removeListing: EventEmitter<void>;
    @Output() private close: EventEmitter<void>;

    private deliveryDialogState: DeliveryDialogState;


    public constructor (
        private deliveryUtilService: DeliveryUtilService // Referenced in HTML template
    ) {
        this.isCart = false;
        this.removeListing = new EventEmitter<void>();
        this.close = new EventEmitter<void>();
        this.refreshDialogState();
    }


    public refreshDialogState(): void {
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
