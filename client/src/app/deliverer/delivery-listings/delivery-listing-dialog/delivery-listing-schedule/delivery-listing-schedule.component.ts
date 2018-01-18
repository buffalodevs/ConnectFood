import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import 'rxjs/add/operator/finally';

import { ScheduleDeliveryService } from '../../delivery-services/schedule-delivery.service';
import { DateFormatterService } from '../../../../common-util/services/date-formatter.service';

import { Delivery } from '../../../../../../../shared/deliverer/delivery';
import { DeliveryState } from '../../../../../../../shared/deliverer/message/get-deliveries-message';
import { TimeRange } from '../../../../../../../shared/app-user/app-user-info';


@Component({
    selector: 'delivery-listing-schedule',
    templateUrl: './delivery-listing-schedule.component.html',
    styleUrls: ['./delivery-listing-schedule.component.css'],
})
export class DeliveryListingScheduleComponent {

    @Input() private delivery: Delivery;
    
    @Output() private removeListing: EventEmitter<void>;
    @Output() private close: EventEmitter<void>;

    private showProgressSpinner: boolean;
    private schedulingComplete: boolean;
    private scheduleControl: FormControl;


    public constructor (
        private scheduleDeliveryService: ScheduleDeliveryService,
        private dateFormatter: DateFormatterService
    ) {
        this.removeListing = new EventEmitter<void>();
        this.close = new EventEmitter<void>();

        this.showProgressSpinner = false;
        this.schedulingComplete = false;
        this.scheduleControl = new FormControl(null);
        this.scheduleControl.valueChanges.subscribe(this.scheduleDelivery.bind(this));
    }


    private scheduleDelivery(value: Date): void {

        this.showProgressSpinner = true;

        this.scheduleDeliveryService.scheduleDelivery(this.delivery.claimedFoodListingKey, false, value)
            .finally(() => { this.showProgressSpinner = false; })
            .subscribe((success: boolean) => {
                if (success) {
                    this.delivery.deliveryStateInfo.deliveryState = DeliveryState.scheduled;
                    this.removeListing.emit();
                    this.schedulingComplete = true;
                }
            },
            (err: Error) => {
                alert(err.message);
            });
    }
}
