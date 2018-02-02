import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import 'rxjs/add/operator/finally';

import { CancelDeliveryService } from '../../delivery-services/cancel-delivery.service';

import { Delivery } from '../../../../../../../shared/src/deliverer/delivery';
import { DeliveryState } from '../../../../../../../shared/src/deliverer/message/get-deliveries-message';
import { runInThisContext } from 'vm';


@Component({
    selector: 'delivery-listing-cancel',
    templateUrl: './delivery-listing-cancel.component.html',
    styleUrls: ['./delivery-listing-cancel.component.css'],
    providers: [CancelDeliveryService]
})
export class DeliveryListingCancelComponent {

    @Input() public delivery: Delivery;

    @Output() public removeListing: EventEmitter <void>;
    @Output() public close: EventEmitter <void>;

    private _form: FormGroup;
    get form(): FormGroup {
        return this._form
    }

    private _validate: boolean;
    get validate(): boolean {
        return this._validate;
    }

    private _cancelComplete: boolean;
    get cancelComplete(): boolean {
        return this._cancelComplete;
    }

    private _showProgressSpinner: boolean;
    get showProgressSpinner(): boolean {
        return this._showProgressSpinner;
    }

    private _errMsg: string;
    get errMsg(): string {
        return this._errMsg;
    }


    public constructor (
        private cancelDeliveryService: CancelDeliveryService
    ) {
        this.removeListing = new EventEmitter <void>();
        this.close = new EventEmitter <void>();

        this._form = new FormGroup({
            'cancelReason': new FormControl('', [Validators.required]),
            'foodRejected': new FormControl('', [Validators.required])
        });

        this._validate = false;
        this._cancelComplete = false;
        this._showProgressSpinner = false;
        this._errMsg = null;
    }


    /**
     * Cancels the delivery with a cancel reason from the contained cancelForm.
     */
    private cancelDelivery(): void {

        this._validate = true;
        if (!this.form.valid)  return;
        this._showProgressSpinner = true;

        const cancelReason: string = this.form.get('cancelReason').value;
        const foodRejected: boolean = this.form.get('foodRejected').value;

        this.cancelDeliveryService.cancelDelivery(this.delivery.deliveryFoodListingKey, cancelReason, foodRejected)
            .finally(() => {
                this._cancelComplete = true;
                this._showProgressSpinner = false;
            })
            .subscribe(() => {
                this.removeListing.emit(); // Emit signal to parent (Dialog) so it can close and remove the cancelled listing.
            },
            (err: Error) => {
                this._errMsg = err.message;
            });
    }
}
