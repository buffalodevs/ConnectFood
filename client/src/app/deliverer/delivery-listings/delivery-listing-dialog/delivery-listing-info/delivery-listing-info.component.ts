import { Component, OnChanges, Input, ViewChild, SimpleChanges, Output, EventEmitter } from '@angular/core';

import { DeliveryUtilService } from '../../delivery-services/delivery-util.service';
import { ManageDeliveryService } from '../../delivery-services/manage-deliveries.service';

import { Delivery } from '../../../../../../../shared/deliverer/delivery';
import { DeliveryState } from '../../../../../../../shared/deliverer/message/get-deliveries-message';
import { Observable } from 'rxjs/Observable';
import { ScheduleDeliveryService } from '../../delivery-services/schedule-delivery.service';


@Component({
    selector: 'delivery-listing-info',
    templateUrl: './delivery-listing-info.component.html',
    styleUrls: ['./delivery-listing-info.component.css', './../../delivery-listings.component.css']
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
    @Output() private started: EventEmitter<void>;

    private showStartButton: boolean;


    public constructor (
        private deliveryUtilService: DeliveryUtilService, // Referenced in HTML template
        private manageDeliveryService: ManageDeliveryService,
        private scheduleDeliveryService: ScheduleDeliveryService
    ) {
        this.showStartButton = false;
        this.toSchedule = new EventEmitter<void>();
        this.toCancelReason = new EventEmitter<void>();
        this.started = new EventEmitter<void>();
    }


    public ngOnChanges(changes: SimpleChanges): void {
        
        if (changes.delivery.currentValue != null) {
            this.showStartButton = this.shouldShowStartButton(changes.delivery.currentValue);
        }
    }


    /**
     * Determines whether or not to show the start button for starting delivery.
     * @param delivery The Delivery dialog data used to determine if the start button should be shown.
     * @return true if it should be shown, false if not.
     */
    private shouldShowStartButton(delivery: Delivery): boolean {
        return this.deliveryUtilService.isPossibleDeliveryTimeNow(delivery)
            && Delivery.compareDeliveryStates(delivery.deliveryState, DeliveryState.onRouteToDonor) < 0;
    }


    /**
     * Starts a delivery by updating its state to onRouteToDonor.
     */
    private startDelivery(): void {

        let startObservable: Observable<void>;
        
        // If in Cart (Delivery already scheduled), then update delivery state. Otherwise, schedule new Delivery with startImmediately flag set true.
        startObservable = this.isCart ? this.manageDeliveryService.updateDeliveryState(this.delivery.deliveryFoodListingKey, DeliveryState.onRouteToDonor)
                                      : this.scheduleDeliveryService.scheduleDelivery(this.delivery.claimedFoodListingKey, true);

        startObservable.subscribe(() => {
            console.log('Delivery started');
            this.started.emit();
        });
    }
}