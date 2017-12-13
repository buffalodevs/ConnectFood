import { Component, Input, Output, EventEmitter } from '@angular/core';
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
    @Output() private cancelled: EventEmitter<void>

    private cancelForm: FormGroup


    public constructor (
        private cancelDeliveryService: CancelDeliveryService
    ) {
        this.cancelled = new EventEmitter<void>();

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
                this.cancelled.emit(); // Emit cancelled signal to parent (Dialog) so it can close and remove the cancelled listing. 
            });
    }
}
