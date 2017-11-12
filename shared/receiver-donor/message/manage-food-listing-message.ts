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
         * The number of units to act upon in the management function.
         */
        public unitsCount?: number
    ) { }
}
