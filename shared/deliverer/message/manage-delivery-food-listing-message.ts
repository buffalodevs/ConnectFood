/**
 * The expected request for the (un)claim Delivery Food Listing operation. Should be sent from the client to the server.
 */
export class ManageDeliveryFoodListingRequest {
    
        public constructor (
            /**
             * The key identifier of the Claimed Food Listing whose delivery is to be (un)claimed.
             */
            public claimedFoodListingKey: number
        ) { }
    }
    