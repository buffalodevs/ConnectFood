import { DeliveryState } from "../../common-user/delivery-info";


/**
 * The expected request for the management operation for a Delivery.
 */
export class ManageDeliveryRequest {
    
    public constructor (
        /**
         * The key identifier of delivery that is being managed.
         */
        public deliveryInfoKey: number,
        /**
         * The delivery state that the Delivery Food Listing should be set to.
         */
        public deliveryState: DeliveryState
    ) {}
}
