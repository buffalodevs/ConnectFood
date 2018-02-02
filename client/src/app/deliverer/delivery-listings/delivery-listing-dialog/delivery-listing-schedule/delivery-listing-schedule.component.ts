import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import 'rxjs/add/operator/finally';

import { ScheduleDeliveryService } from '../../delivery-services/schedule-delivery.service';
import { DateFormatterService } from '../../../../common-util/services/date-formatter.service';

import { Delivery } from '../../../../../../../shared/src/deliverer/delivery';
import { DeliveryState } from '../../../../../../../shared/src/deliverer/message/get-deliveries-message';


@Component({
    selector: 'delivery-listing-schedule',
    templateUrl: './delivery-listing-schedule.component.html',
    styleUrls: ['./delivery-listing-schedule.component.css'],
})
export class DeliveryListingScheduleComponent {

    @Input() public delivery: Delivery;
    
    @Output() public removeListing: EventEmitter <void>;
    @Output() public close: EventEmitter <void>;

    private _showProgressSpinner: boolean;
    get showProgressSpinner(): boolean {
        return this._showProgressSpinner;
    }

    private _schedulingComplete: boolean;
    get schedulingComplete(): boolean {
        return this._schedulingComplete;
    }

    private _scheduleControl: FormControl;
    public get scheduleControl(): FormControl {
        return this._scheduleControl;
    }
    
    private _errMsg: string;
    public get errMsg(): string {
        return this._errMsg;
    }


    public constructor (
        public dateFormatter: DateFormatterService,
        private _scheduleDeliveryService: ScheduleDeliveryService
    ) {
        this.removeListing = new EventEmitter <void>();
        this.close = new EventEmitter <void>();

        this._showProgressSpinner = false;
        this._schedulingComplete = false;
        this._scheduleControl = new FormControl(null);
        this.scheduleControl.valueChanges.subscribe(this.scheduleDelivery.bind(this));
    }


    private scheduleDelivery(value: Date): void {

        this._showProgressSpinner = true;

        this._scheduleDeliveryService.scheduleDelivery(this.delivery.claimedFoodListingKey, false, value)
            .finally(() => {
                this._schedulingComplete = true;
                this._showProgressSpinner = false;
            })
            .subscribe(() => {
                this.delivery.deliveryStateInfo.deliveryState = DeliveryState.scheduled;
                this.removeListing.emit();
            },
            (err: Error) => {
                this._errMsg = err.message;
            });
    }
}
