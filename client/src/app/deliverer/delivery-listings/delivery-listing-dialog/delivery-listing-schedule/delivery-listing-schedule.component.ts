import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import 'rxjs/add/operator/finally';

import { ScheduleDeliveryService } from '../../delivery-services/schedule-delivery.service';
import { DateFormatterService } from '../../../../common-util/services/date-formatter.service';

import { FoodListing } from '../../../../../../../shared/src/common-user/food-listing';
import { DeliveryState } from '../../../../../../../shared/src/common-user/delivery-info';


@Component({
    selector: 'delivery-listing-schedule',
    templateUrl: './delivery-listing-schedule.component.html',
    styleUrls: ['./delivery-listing-schedule.component.css'],
})
export class DeliveryListingScheduleComponent {

    @Input() public foodListing: FoodListing;
    
    @Output() public removeListing: EventEmitter <void>;
    @Output() public close: EventEmitter <void>;

    public showProgressSpinner: boolean;
    public schedulingComplete: boolean;
    public scheduleControl: FormControl;    
    public errMsg: string;


    public constructor (
        public dateFormatter: DateFormatterService,
        private _scheduleDeliveryService: ScheduleDeliveryService
    ) {
        this.removeListing = new EventEmitter <void>();
        this.close = new EventEmitter <void>();

        this.showProgressSpinner = false;
        this.schedulingComplete = false;
        this.scheduleControl = new FormControl(null);
        this.scheduleControl.valueChanges.subscribe(this.scheduleDelivery.bind(this));
    }


    public scheduleDelivery(value: Date): void {

        this.showProgressSpinner = true;

        this._scheduleDeliveryService.scheduleDelivery(this.foodListing.claimInfo.claimInfoKey, false, value)
            .finally(() => {
                this.schedulingComplete = true;
                this.showProgressSpinner = false;
            })
            .subscribe(() => {
                this.foodListing.claimInfo.deliveryInfo.deliveryStateInfo.deliveryState = DeliveryState.scheduled;
                this.removeListing.emit();
            },
            (err: Error) => {
                this.errMsg = err.message;
            });
    }
}
