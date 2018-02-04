import { Component, OnChanges, Input, ViewChild, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/finally';

import { ScheduleDeliveryService } from '../../delivery-services/schedule-delivery.service';
import { SessionDataService } from '../../../../common-util/services/session-data.service';
import { Delivery, DeliveryState, DeliveryUtilService } from '../../delivery-services/delivery-util.service';
import { ManageDeliveryService } from '../../delivery-services/manage-deliveries.service';
import { DateFormatterService } from '../../../../common-util/services/date-formatter.service';

import { FoodWebResponse } from '../../../../../../../shared/src/message-protocol/food-web-response';


@Component({
    selector: 'delivery-listing-info',
    templateUrl: './delivery-listing-info.component.html',
    styleUrls: ['./delivery-listing-info.component.css', './../../delivery-listings.component.css']
})
export class DeliveryListingInfoComponent implements OnChanges {
    
    /**
     * Set to true if the Delivery Listings are for a Delivery Cart. Default is false.
     */
    @Input() public isCart: boolean;
    @Input() public delivery: Delivery;

    /**
     * Emitted whenever the 'Schedule Delivery' button is selected.
     */
    @Output() public toSchedule: EventEmitter<void>; // Referenced in HTML template
    /**
     * Emitted whenever the 'Cancel Delivery' button is selected.
     */
    @Output() public toCancelReason: EventEmitter<void>; // Referenced in HTML template
    @Output() public removeListing: EventEmitter<void>;
    @Output() public close: EventEmitter<void>;

    private _startComplete: boolean;
    get startComplete(): boolean {
        return this._startComplete;
    }

    private _stateChangeComplete: boolean;
    get stateChangeComplete(): boolean {
        return this._stateChangeComplete;
    }

    private _showProgressSpinner: boolean;
    get showProgressSpinner(): boolean {
        return this._showProgressSpinner;
    }

    private _showButtonFlags: Map <string, boolean>;


    public constructor (
        public sessionDataService: SessionDataService,
        public deliveryUtilService: DeliveryUtilService, // Referenced in HTML template
        private _manageDeliveryService: ManageDeliveryService,
        private _scheduleDeliveryService: ScheduleDeliveryService,
        private _dateFormatter: DateFormatterService
    ) {
        this.toSchedule = new EventEmitter<void>();
        this.toCancelReason = new EventEmitter<void>();
        this.removeListing = new EventEmitter<void>();
        this.close = new EventEmitter <void>();

        this._startComplete = false;
        this._stateChangeComplete = false;
        this._showButtonFlags = new Map <string, boolean> ([
            ['startButton', false],
            ['pickedUpButton', false],
            ['droppedOffButton', false],
            ['cancelButton', false]
        ]);

    }


    public ngOnChanges(changes: SimpleChanges): void {
        
        // Show the start button if the delivery state is before onRouteToDonor.
        if (changes.delivery.currentValue != null) {

            const delivery: Delivery = changes.delivery.currentValue;
            const deliveryState: DeliveryState = delivery.deliveryStateInfo.deliveryState;

            this._showButtonFlags.set('startButton', this.shouldShowStartButton(delivery));
            this._showButtonFlags.set('pickedUpButton', ( deliveryState === DeliveryState.started ));
            this._showButtonFlags.set('droppedOffButton', ( deliveryState === DeliveryState.pickedUp ));
            this._showButtonFlags.set('cancelButton', ( this.isCart && this.deliveryUtilService.compareDeliveryStates(deliveryState, DeliveryState.droppedOff) < 0 ));
        }
    }


    /**
     * Determines whether or not to show the start button for starting delivery.
     * @param delivery The Delivery dialog data used to determine if the start button should be shown.
     * @return true if it should be shown, false if not.
     */
    private shouldShowStartButton(delivery: Delivery): boolean {

        const deliveryState: DeliveryState = delivery.deliveryStateInfo.deliveryState;

        return this.deliveryUtilService.isPossibleDeliveryTimeNow(delivery)
            && this.deliveryUtilService.compareDeliveryStates(deliveryState, DeliveryState.started) < 0;
    }


    /**
     * Determines whether or not to show a given button.
     * @param buttonName The name of the button.
     * @return true if it should be shown, false if not.
     */
    public shouldShowButton(buttonName: string): boolean {
        return this._showButtonFlags.get(buttonName);
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

            this._showProgressSpinner = true;

            this._scheduleDeliveryService.scheduleDelivery(this.delivery.claimedFoodListingKey, true)
                .finally(() => { this._showProgressSpinner = false; })
                .subscribe(() => {
                    this.delivery.deliveryStateInfo.deliveryState = DeliveryState.started;
                    if (!this.isCart) this.removeListing.emit();
                    this._startComplete = true;
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

        this._showButtonFlags.set('progressSpinner', true);

        this._manageDeliveryService.updateDeliveryState(this.delivery.deliveryFoodListingKey, deliveryState)
            .finally(() => { this._showButtonFlags.set('progressSpinner', false); })
            .subscribe(() => {
                this.delivery.deliveryStateInfo.deliveryState = deliveryState;
                this._stateChangeComplete = true;
            },
            (err: Error) => {
                // If we get here, then we have encountered a fatal error...
                alert(err.message);
            });
    }


    /**
     * Gets human friendly readable version of scheduled start time.
     * @return The readable version if not null, and if null, then null is returned.
     */
    private getReadableScheduledStartTime(): string {

        const scheduledStartTime: Date = this.delivery.deliveryStateInfo.scheduledStartTime;

        return (scheduledStartTime != null) ? ( this._dateFormatter.dateToMonthDayYearString(scheduledStartTime) + ' at ' +
                                                this._dateFormatter.dateToWallClockString(scheduledStartTime) )
                                            : '';
    }
}
