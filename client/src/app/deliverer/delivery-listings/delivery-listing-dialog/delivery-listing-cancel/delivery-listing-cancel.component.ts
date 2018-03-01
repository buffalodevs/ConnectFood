import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import 'rxjs/add/operator/finally';

import { CancelDeliveryService } from '../../delivery-services/cancel-delivery.service';

import { FoodListing } from '../../../../../../../shared/src/common-receiver-donor-deliverer/food-listing';
import { DeliveryState } from '../../../../../../../shared/src/common-receiver-donor-deliverer/delivery-info';


@Component({
    selector: 'delivery-listing-cancel',
    templateUrl: './delivery-listing-cancel.component.html',
    styleUrls: ['./delivery-listing-cancel.component.css'],
    providers: [CancelDeliveryService]
})
export class DeliveryListingCancelComponent {

    @Input() public foodListing: FoodListing;

    @Output() public removeListing: EventEmitter <void>;
    @Output() public close: EventEmitter <void>;

    public form: FormGroup;
    public validate: boolean;
    public cancelComplete: boolean;
    public showProgressSpinner: boolean;
    public errMsg: string;


    public constructor (
        private cancelDeliveryService: CancelDeliveryService
    ) {
        this.removeListing = new EventEmitter <void>();
        this.close = new EventEmitter <void>();

        this.form = new FormGroup({
            'cancelReason': new FormControl('', [Validators.required]),
            'foodRejected': new FormControl('', [Validators.required])
        });

        this.validate = false;
        this.cancelComplete = false;
        this.showProgressSpinner = false;
        this.errMsg = null;
    }


    /**
     * Cancels the delivery with a cancel reason from the contained cancelForm.
     */
    public cancelDelivery(): void {

        this.validate = true;
        if (!this.form.valid)  return;
        this.showProgressSpinner = true;

        const cancelReason: string = this.form.get('cancelReason').value;
        const foodRejected: boolean = this.form.get('foodRejected').value;

        this.cancelDeliveryService.cancelDelivery(this.foodListing.claimInfo.deliveryInfo.deliveryInfoKey, cancelReason, foodRejected)
            .finally(() => {
                this.cancelComplete = true;
                this.showProgressSpinner = false;
            })
            .subscribe(() => {
                this.removeListing.emit(); // Emit signal to parent (Dialog) so it can close and remove the cancelled listing.
            },
            (err: Error) => {
                this.errMsg = err.message;
            });
    }
}
