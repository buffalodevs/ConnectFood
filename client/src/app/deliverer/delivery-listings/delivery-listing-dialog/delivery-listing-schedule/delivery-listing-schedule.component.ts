import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { ScheduleDeliveryService } from '../../delivery-services/schedule-delivery.service';

import { Delivery } from '../../../../../../../shared/deliverer/delivery';
import { DeliveryState } from '../../../../../../../shared/deliverer/message/get-deliveries-message';


@Component({
    selector: 'delivery-listing-schedule',
    templateUrl: './delivery-listing-schedule.component.html',
    styleUrls: ['./delivery-listing-schedule.component.css'],
})
export class DeliveryListingScheduleComponent {

    @Input() private delivery: Delivery;
    @Output() private scheduled: EventEmitter<void>;

    private scheduleControl: FormControl;


    public constructor (
        private scheduleDeliveryService: ScheduleDeliveryService
    ) {
        this.scheduled = new EventEmitter<void>();

        this.scheduleControl = new FormControl(null);
        this.scheduleControl.valueChanges.subscribe((value: Date) => {
            scheduleDeliveryService.scheduleDelivery(this.delivery.claimedFoodListingKey, false, value)
                .subscribe(() => {
                    console.log('Scheduling complete!');
                    this.scheduled.emit();
                });
        });
    }
}