/**
 * The expected request for the remove food listings operation. Should be sent from the client to the server.
 */
export class RemoveFoodListingRequest {

    public constructor (
        /**
         * The key identifier of the Food Listing to be removed.
         */
        public foodListingKey: number,
        /**
         * The reason for the associated remove operation.
         */
        public reason: string = null
    ) {}
}
