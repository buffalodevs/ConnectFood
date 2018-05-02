/**
 * The expected request for the unclaim food listings operation. Should be sent from the client to the server.
 */
export class UnclaimFoodListingRequest {

    public constructor (
        /**
         * The key identifier of the Food Listing to be unclaimed.
         */
        public foodListingKey: number,
        /**
         * The reason for the associated unclaim operation.
         */
        public reason: string = null
    ) {}
}
