import { Component, Input } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { CancelDeliveryService } from '../../delivery-services/cancel-delivery.service';

import { Delivery } from '../../../../../../../shared/deliverer/delivery';
import { DeliveryState } from '../../../../../../../shared/deliverer/message/get-deliveries-message';


@Component({
    selector: 'delivery-listing-cancel',
    templateUrl: './delivery-listing-cancel.component.html',
    styleUrls: ['./delivery-listing-cancel.component.css'],
    providers: [CancelDeliveryService]
})
export class DeliveryListingCancelComponent {

    @Input() private delivery: Delivery;

    private cancelForm: FormGroup


    public constructor (
        private cancelDeliveryService: CancelDeliveryService
    ) {
        this.cancelForm = new FormGroup({
            'cancelReason': new FormControl('', [Validators.required])
        });
    }


    /**
     * Cancels the delivery with a cancel reason from the contained cancelForm.
     */
    private cancelDelivery(): void {

        if (!this.cancelForm.valid)  return;
        this.cancelDeliveryService.cancelDelivery(this.delivery.deliveryFoodListingKey, this.cancelForm.get('cancelReason').value)
            .subscribe(() => {
                console.log('Cancel Delivery Completed!');  
            });
    }
}
