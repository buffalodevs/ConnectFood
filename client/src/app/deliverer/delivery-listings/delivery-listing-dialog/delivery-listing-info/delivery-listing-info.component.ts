import { Component, OnChanges, Input, ViewChild, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/finally';

import { ScheduleDeliveryService } from '../../delivery-services/schedule-delivery.service';
import { SessionDataService } from '../../../../common-util/services/session-data.service';
import { DeliveryState, DeliveryUtilService } from '../../delivery-services/delivery-util.service';
import { ManageDeliveryService } from '../../delivery-services/manage-deliveries.service';
import { DateFormatterService } from '../../../../common-util/services/date-formatter.service';

import { FoodWebResponse } from '../../../../../../../shared/src/message-protocol/food-web-response';
import { FoodListing } from '../../../../../../../shared/src/common-receiver-donor-deliverer/food-listing';


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
    @Input() public foodListing: FoodListing;

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

    public startComplete: boolean;
    public stateChangeComplete: boolean;
    public showProgressSpinner: boolean;

    private _showButtonFlags: Map <string, boolean>;


    public constructor (
        public sessionDataService: SessionDataService,
        public deliveryUtilService: DeliveryUtilService, // Referenced in HTML template
        public dateFormatter: DateFormatterService,
        private _manageDeliveryService: ManageDeliveryService,
        private _scheduleDeliveryService: ScheduleDeliveryService,
        private _dateFormatter: DateFormatterService
    ) {
        this.toSchedule = new EventEmitter<void>();
        this.toCancelReason = new EventEmitter<void>();
        this.removeListing = new EventEmitter<void>();
        this.close = new EventEmitter <void>();

        this.startComplete = false;
        this.stateChangeComplete = false;
        this._showButtonFlags = new Map <string, boolean> ([
            ['startButton', false],
            ['pickedUpButton', false],
            ['droppedOffButton', false],
            ['cancelButton', false]
        ]);

    }


    public ngOnChanges(changes: SimpleChanges): void {
        
        // Show the start button if the delivery state is before onRouteToDonor.
        if (changes.foodListing.currentValue != null) {

            const foodListing: FoodListing = changes.foodListing.currentValue;
            const deliveryState: DeliveryState = foodListing.claimInfo.deliveryInfo.deliveryStateInfo.deliveryState;

            this._showButtonFlags.set('startButton', this.shouldShowStartButton(foodListing));
            this._showButtonFlags.set('pickedUpButton', ( deliveryState === DeliveryState.started ));
            this._showButtonFlags.set('droppedOffButton', ( deliveryState === DeliveryState.pickedUp ));
            this._showButtonFlags.set('cancelButton', ( this.isCart && this.deliveryUtilService.compareDeliveryStates(deliveryState, DeliveryState.droppedOff) < 0 ));
        }
    }


    /**
     * Determines whether or not to show the start button for starting foodListing.
     * @param foodListing The food listing used to determine if the start button should be shown.
     * @return true if it should be shown, false if not.
     */
    private shouldShowStartButton(foodListing: FoodListing): boolean {

        const deliveryState: DeliveryState = foodListing.claimInfo.deliveryInfo.deliveryStateInfo.deliveryState;

        return this.deliveryUtilService.isPossibleDeliveryTimeNow(foodListing)
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
    public startDelivery(): void {

        // If in Cart (Delivery already scheduled), then update delivery state. Otherwise, schedule new Delivery with startImmediately flag set true.
        if (this.isCart) {
            this.updateDeliveryState(DeliveryState.started);
        }
        else {

            this.showProgressSpinner = true;

            this._scheduleDeliveryService.scheduleDelivery(this.foodListing.claimInfo.claimInfoKey, true)
                .finally(() => { this.showProgressSpinner = false; })
                .subscribe(() => {
                    this.foodListing.claimInfo.deliveryInfo.deliveryStateInfo.deliveryState = DeliveryState.started;
                    if (!this.isCart) this.removeListing.emit();
                    this.startComplete = true;
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
    public markPickedUp(): void {
        this.updateDeliveryState(DeliveryState.pickedUp);
    }


    /**
     * Marks the delivery as dropped off (completed at the Receiver).
     */
    public markDroppedOff(): void {
        this.updateDeliveryState(DeliveryState.droppedOff);
    }


    /**
     * Updates the Delivery's state.
     * @param deliveryState The new Delivery state.
     */
    public updateDeliveryState(deliveryState: DeliveryState): void {

        this.showProgressSpinner = true;

        this._manageDeliveryService.updateDeliveryState(this.foodListing.claimInfo.deliveryInfo.deliveryInfoKey, deliveryState)
            .finally(() => { this.showProgressSpinner = false; })
            .subscribe(() => {
                this.foodListing.claimInfo.deliveryInfo.deliveryStateInfo.deliveryState = deliveryState;
                this.stateChangeComplete = true;
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
    public getReadableScheduledStartTime(): string {

        const scheduledStartTime: Date = this.foodListing.claimInfo.deliveryInfo.deliveryStateInfo.scheduledStartTime;

        return (scheduledStartTime != null) ? ( this._dateFormatter.dateToMonthDayYearString(scheduledStartTime) + ' at ' +
                                                this._dateFormatter.dateToWallClockString(scheduledStartTime) )
                                            : '';
    }
}
