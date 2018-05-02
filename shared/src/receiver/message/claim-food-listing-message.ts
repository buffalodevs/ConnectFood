/**
 * The expected request for the claim food listings operation. Should be sent from the client to the server.
 */
export class ClaimFoodListingRequest {

    public constructor (
        /**
         * The key identifier of the Food Listing to be (un)claimed/removed.
         */
        public foodListingKey: number,
        /**
         * Any of the specfiic availability times the Receiver entered while searching for the claim (will be recorded as new claim's specific availability).
         */
        public claimAvailabilityTimes: Date[]
    ) {}
}
