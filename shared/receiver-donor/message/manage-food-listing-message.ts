/**
 * The expected request for the (un)claim/remove food listings operation. Should be sent from the client to the server.
 */
export class ManageFoodListingRequest {

    public constructor (
        /**
         * The key identifier of the Food Listing to be (un)claimed/removed.
         */
        public foodListingKey: number,
        /**
         * The reason for the associated management operation (such as unclaim or removal reason).
         */
        public reason?: string
    ) { }
}
