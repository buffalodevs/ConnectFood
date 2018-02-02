import { DeliveryState } from "../delivery";


/**
 * The expected request for the management operation for a Delivery.
 */
export class ManageDeliveryRequest {
    
    public constructor (
        /**
         * The key identifier of the Claimed Food Listing whose delivery is to be (un)claimed.
         */
        public deliveryFoodListingKey: number,
        /**
         * The delivery state that the Delivery Food Listing should be set to.
         */
        public deliveryState: DeliveryState
    ) {}
}
