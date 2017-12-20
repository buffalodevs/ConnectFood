import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { ScheduleDeliveryService } from '../../delivery-services/schedule-delivery.service';

import { Delivery } from '../../../../../../../shared/deliverer/delivery';
import { DeliveryState } from '../../../../../../../shared/deliverer/message/get-deliveries-message';
import { DateFormatter } from '../../../../../../../shared/common-util/date-formatter';


@Component({
    selector: 'delivery-listing-schedule',
    templateUrl: './delivery-listing-schedule.component.html',
    styleUrls: ['./delivery-listing-schedule.component.css', './../../../../slick-filtered-list/slick-list/slick-list-dialog/slick-list-dialog.component.css'],
})
export class DeliveryListingScheduleComponent {

    @Input() private delivery: Delivery;
    @Output() private scheduled: EventEmitter<void>;
    @Output() private close: EventEmitter<void>;

    private schedulingComplete: boolean;
    private scheduleControl: FormControl;


    public constructor (
        private scheduleDeliveryService: ScheduleDeliveryService
    ) {
        this.scheduled = new EventEmitter<void>();
        this.close = new EventEmitter<void>();
        this.schedulingComplete = false;

        this.scheduleControl = new FormControl(null);
        this.scheduleControl.valueChanges.subscribe((value: Date) => {
            scheduleDeliveryService.scheduleDelivery(this.delivery.claimedFoodListingKey, false, value)
                .subscribe((success: boolean) => {
                    if (success) {
                        this.delivery.deliveryState = DeliveryState.scheduled;
                        this.scheduled.emit();
                        this.schedulingComplete = true;
                    }
                },
                (err: Error) => {
                    alert(err.message);
                });
        });
    }


    /**
     * Gets the scheduled date string.
     */
    private getScheduledDate(): string {
        return DateFormatter.dateToMonthDayYearString(this.scheduleControl.value);
    }


    /**
     * Gets the scheduled wall-clock time string.
     */
    private getScheduledTime(): string {
        return DateFormatter.dateToWallClockString(this.scheduleControl.value);
    }
}
