import { Component, OnInit, Input, Output, ViewChild, EventEmitter } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';

import { AbstractSlickListDialog } from '../../../slick-filtered-list/slick-list/slick-list-dialog/abstract-slick-list-dialog';
import { SlickListDialogComponent } from '../../../slick-filtered-list/slick-list/slick-list-dialog/slick-list-dialog.component';
import { DeliveryUtilService } from '../delivery-services/delivery-util.service';
import { CancelDeliveryService } from '../delivery-services/cancel-delivery.service';

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
    styleUrls: [
        './delivery-listing-dialog.component.css',
        './../delivery-listings.component.css',
        './../../../slick-filtered-list/slick-list/slick-list-dialog/slick-list-dialog.component.css'
    ]
})
export class DeliveryListingDialogComponent extends AbstractSlickListDialog <Delivery> {

    /**
     * Set to true if the Delivery Listings are for a Delivery Cart. Default is false.
     */
    @Input() private isCart: boolean;
    /**
     * Invoked whenever a delivery is to be cancelled.
     */
    @Output() private cancelDelivery: EventEmitter<{ deliveryFoodListingKey: number, cancelReason: string}>;

    /**
     * This is a shadow of the slickListDialog member in AbstractSlickListDialog.
     * It is all that is needed to make basic dialog functions work (open, close, etc).
     */
    @ViewChild('SlickListDialogComponent') protected slickListDialog: SlickListDialogComponent;

    private deliveryDialogState: DeliveryDialogState;


    public constructor (
        private deliveryUtilService: DeliveryUtilService // Referenced in HTML template
    ) {
        super();

        this.isCart = false;
        this.cancelDelivery = new EventEmitter<{ deliveryFoodListingKey: number, cancelReason: string}>();

        this.deliveryDialogState = DeliveryDialogState.DeliveryInfo;
    }


    public open(dialogData: Delivery): void {
        this.deliveryDialogState = DeliveryDialogState.DeliveryInfo;
        super.open(dialogData);
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
