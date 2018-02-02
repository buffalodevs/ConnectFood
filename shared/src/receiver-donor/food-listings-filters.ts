import { deserializable, deepDeserializable } from "../deserialization/deserializer";


/**
 * An emumeration of different food listing statuses to filter on.
 */
export enum LISTINGS_STATUS {
    unclaimedListings,
    myClaimedListings,
    myDonatedListings
};


/**
 * A basic container for Food Listing filter data that may be sent to/from the server/client.
 */
@deserializable('FoodListingsFilters')
export class FoodListingsFilters {


    @deepDeserializable(Date)
    public availableAfterDate: Date;


    public constructor (
        /**
         * Determines what food types the results should contain.
         */
        public foodTypes: string[] = null,
        /**
         * Determines if results should include perishable elements.
         */
        public needsRefrigeration: boolean = null,
        /**
         * Determines if results should include non-perishable elements.
         */
        public notNeedsRefrigeration: boolean = null,
        /**
         * Determines the minimum date that retrieved items must still be available by.
         */
        availableAfterDate: Date = null,
        /**
         * Determines the maximum distance from the requesting entity that donations must fall within.
         */
        public maxDistance: number = null,
        /**
         * Determines the offset used when retrieving a limited segment of food listings.
         */
        public retrievalOffset: number = null,
        /**
         * Determines the number of food listings that will be contained in the limited segment of retrievals.
         */
        public retrievalAmount: number = null,
        /**
         * Determines what food listings we should bring back based off of their status (unclaimed = null, claimed = null, or donated relative to the current user).
         */
        public listingsStatus: LISTINGS_STATUS = LISTINGS_STATUS.unclaimedListings,
        /**
         * Determines whether or not we should only pull back food listings where the associated Donors' availability schedules partially overlap with this user's regular one.
         */
        public matchRegularAvailability: boolean = null
    ) {
        this.availableAfterDate = availableAfterDate;
    }
}
