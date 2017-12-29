import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { CancelDeliveryService } from '../../delivery-services/cancel-delivery.service';

import { Delivery } from '../../../../../../../shared/deliverer/delivery';
import { DeliveryState } from '../../../../../../../shared/deliverer/message/get-deliveries-message';


@Component({
    selector: 'delivery-listing-cancel',
    templateUrl: './delivery-listing-cancel.component.html',
    styleUrls: [
        './delivery-listing-cancel.component.css',
        './../../../../misc-slick-components/slick-filtered-list/slick-list/slick-list-dialog/slick-list-dialog.component.css'
    ],
    providers: [CancelDeliveryService]
})
export class DeliveryListingCancelComponent {

    @Input() private delivery: Delivery;
    @Output() private removeListing: EventEmitter<void>;
    @Output() private close: EventEmitter<void>;

    private cancelForm: FormGroup;
    private validate: boolean;
    private cancelComplete: boolean;
    private showProgressSpinner: boolean;


    public constructor (
        private cancelDeliveryService: CancelDeliveryService
    ) {
        this.removeListing = new EventEmitter<void>();
        this.close = new EventEmitter<void>();

        this.cancelForm = new FormGroup({
            'cancelReason': new FormControl('', [Validators.required]),
            'foodRejected': new FormControl('', [Validators.required])
        });

        this.validate = false;
        this.cancelComplete = false;
        this.showProgressSpinner = false;
    }


    /**
     * Cancels the delivery with a cancel reason from the contained cancelForm.
     */
    private cancelDelivery(): void {

        this.validate = true;
        if (!this.cancelForm.valid)  return;
        this.showProgressSpinner = true;

        const cancelReason: string = this.cancelForm.get('cancelReason').value;
        const foodRejected: boolean = this.cancelForm.get('foodRejected').value;

        this.cancelDeliveryService.cancelDelivery(this.delivery.deliveryFoodListingKey, cancelReason, foodRejected)
            .finally(() => { this.showProgressSpinner = false; })
            .subscribe((success: boolean) => {
                if (success) {
                    this.removeListing.emit(); // Emit signal to parent (Dialog) so it can close and remove the cancelled listing.
                    this.cancelComplete = true;
                }
            },
            (err: Error) => {
                alert(err.message);
            });
    }
}
