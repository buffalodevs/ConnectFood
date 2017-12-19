/**
 * The expected request for the cancel operation for a Delivery.
 */
export class CancelDeliveryRequest {
    
    public constructor (
        /**
         * The key identifier of the Claimed Food Listing whose delivery is to be (un)claimed.
         */
        public deliveryFoodListingKey: number,
        /**
         * The required reason for the cancellation.
         */
        public cancelReason: string,
        /**
         * Determines whether or not the deliverer or receiver has rejected the food due to an inadequate quality.
         */
        public foodRejected: boolean
    ) {}
}
