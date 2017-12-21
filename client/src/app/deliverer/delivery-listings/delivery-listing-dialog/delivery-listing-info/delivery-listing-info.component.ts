import { Component, OnChanges, Input, ViewChild, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { ScheduleDeliveryService } from '../../delivery-services/schedule-delivery.service';
import { SessionDataService } from '../../../../common-util/services/session-data.service';
import { Delivery, DeliveryState, DeliveryUtilService } from '../../delivery-services/delivery-util.service';
import { ManageDeliveryService } from '../../delivery-services/manage-deliveries.service';
import { FoodWebResponse } from '../../../../../../../shared/message-protocol/food-web-response';


@Component({
    selector: 'delivery-listing-info',
    templateUrl: './delivery-listing-info.component.html',
    styleUrls: [
        './delivery-listing-info.component.css',
        './../../delivery-listings.component.css',
        './../../../../misc-slick-components/slick-filtered-list/slick-list/slick-list-dialog/slick-list-dialog.component.css'
    ]
})
export class DeliveryListingInfoComponent implements OnChanges {
    
    /**
     * Set to true if the Delivery Listings are for a Delivery Cart. Default is false.
     */
    @Input() private isCart: boolean;
    @Input() private delivery: Delivery;

    /**
     * Emitted whenever the 'Schedule Delivery' button is selected.
     */
    @Output() private toSchedule: EventEmitter<void>; // Referenced in HTML template
    /**
     * Emitted whenever the 'Cancel Delivery' button is selected.
     */
    @Output() private toCancelReason: EventEmitter<void>; // Referenced in HTML template
    @Output() private deliveryStateChange: EventEmitter<void>;
    @Output() private close: EventEmitter<void>;

    private startComplete: boolean;
    private stateChangeComplete: boolean;
    private showStartButton: boolean;
    private showMarkPickedUpButton: boolean;
    private showMarkDroppedOffButton: boolean;
    private showCancelButton: boolean;


    public constructor (
        private sessionDataService: SessionDataService,
        private deliveryUtilService: DeliveryUtilService, // Referenced in HTML template
        private manageDeliveryService: ManageDeliveryService,
        private scheduleDeliveryService: ScheduleDeliveryService
    ) {
        this.toSchedule = new EventEmitter<void>();
        this.toCancelReason = new EventEmitter<void>();
        this.deliveryStateChange = new EventEmitter<void>();
        this.close = new EventEmitter<void>();

        this.startComplete = false;
        this.stateChangeComplete = false;
        this.showStartButton = false;
        this.showMarkPickedUpButton = false;
        this.showMarkDroppedOffButton = false;
        this.showCancelButton = false;
    }


    public ngOnChanges(changes: SimpleChanges): void {
        
        // Show the start button if the delivery state is before onRouteToDonor.
        if (changes.delivery.currentValue != null) {

            const delivery: Delivery = changes.delivery.currentValue;

            this.showStartButton = this.shouldShowStartButton(delivery);
            this.showMarkPickedUpButton = ( delivery.deliveryState === DeliveryState.started );
            this.showMarkDroppedOffButton = ( delivery.deliveryState === DeliveryState.pickedUp );
            this.showCancelButton = ( this.isCart && this.deliveryUtilService.compareDeliveryStates(delivery.deliveryState, DeliveryState.droppedOff) < 0 );
        }
    }


    /**
     * Determines whether or not to show the start button for starting delivery.
     * @param delivery The Delivery dialog data used to determine if the start button should be shown.
     * @return true if it should be shown, false if not.
     */
    private shouldShowStartButton(delivery: Delivery): boolean {
        return this.deliveryUtilService.isPossibleDeliveryTimeNow(delivery)
            && this.deliveryUtilService.compareDeliveryStates(delivery.deliveryState, DeliveryState.started) < 0;
    }


    /**
     * Starts a delivery by updating its state to onRouteToDonor or scheduling the delivery with startImmediately flag set true.
     */
    private startDelivery(): void {

        // If in Cart (Delivery already scheduled), then update delivery state. Otherwise, schedule new Delivery with startImmediately flag set true.
        if (this.isCart) {
            this.updateDeliveryState(DeliveryState.started);
        }
        else {
            this.scheduleDeliveryService.scheduleDelivery(this.delivery.claimedFoodListingKey, true)
                .subscribe((success: boolean) => {
                    if (success) {
                        console.log('Delivery started');
                        this.delivery.deliveryState = DeliveryState.started;
                        this.deliveryStateChange.emit();
                        this.startComplete = true;
                    }
                },
                (err: Error) => {
                    // If we get here, then we have encountered a fatal error...
                    alert(err.message);
                });
        }
    }


    /**
     * Marks the delivery as picked up (on route from Donor to Receiver).
     */
    private markPickedUp(): void {
        this.updateDeliveryState(DeliveryState.pickedUp);
    }


    /**
     * Marks the delivery as dropped off (completed at the Receiver).
     */
    private markDroppedOff(): void {
        this.updateDeliveryState(DeliveryState.droppedOff);
    }


    /**
     * Updates the Delivery's state.
     * @param deliveryState The new Delivery state.
     */
    private updateDeliveryState(deliveryState: DeliveryState): void {

        this.manageDeliveryService.updateDeliveryState(this.delivery.deliveryFoodListingKey, deliveryState)
            .subscribe((success: boolean) => {
                if (success) {
                    this.delivery.deliveryState = deliveryState;
                    this.deliveryStateChange.emit();
                    this.stateChangeComplete = true;
                }
            },
            (err: Error) => {
                // If we get here, then we have encountered a fatal error...
                alert(err.message);
            });
    }
}
