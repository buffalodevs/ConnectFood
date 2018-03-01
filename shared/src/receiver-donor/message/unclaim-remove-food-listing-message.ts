/**
 * The expected request for the unclaim/remove food listings operation. Should be sent from the client to the server.
 */
export class UnclaimRemoveFoodListingRequest {

    public constructor (
        /**
         * The key identifier of the Food Listing to be (un)claimed/removed.
         */
        public foodListingKey: number,
        /**
         * The reason for the associated management operation (such as unclaim or removal reason).
         */
        public reason: string = null
    ) {}
}
