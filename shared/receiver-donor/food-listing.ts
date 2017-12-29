import { FoodListingUser, DeliveryStateInfo } from '../common-receiver-donor-deliverer/shared-food-listing-delivery';


/**
 * Contains information pertaining to a claim on a food listing.
 */
export class ClaimInfo {

    public constructor (
        public receiverInfo?: FoodListingUser,
        public delivererInfo?: FoodListingUser,
        public deliveryStateInfo?: DeliveryStateInfo
    ) {}
}


/**
 * Container for Food Listing Units data.
 */
export class FoodListingUnits {

    public constructor (
        /**
         * The number of units of a Food Listing that are available (have not been claimed).
         */
        public availableUnitsCount?: number,
        /**
         * The number of units of a Food Listing that are still in possession of the Donor.
         * In other words, these units have not left the Donor's facility (not in delivery phase).
         */
        public donorOnHandUnitsCount?: number,
        /**
         * The number of units of this Food Listing that this user has claimed.
         */
        public myClaimedUnitsCount?: number,
        /**
         * The total number of units that a Food Listing has been split into.
         */
        public totalUnitsCount?: number,
        /**
         * The user given label for the units that the Food Listing has been split into (e.g. cans, bottles, lbs, etc).
         */
        public unitsLabel?: string
    ) {}
}


/**
 * A single Food Listing entry that mainly contains data that is relavent to the user when browsing food listings.
 */
export class FoodListing {

    public constructor (
        public foodListingKey?: number,
        public foodTitle?: string,
        public foodTypes?: string[],
        public foodDescription?: string,
        public perishable?: boolean,
        /**
         * The date until the Food Listing expires of the format mm/dd/yyyy
         */
        public availableUntilDate?: string,
        /**
         * The url of a saved Food Listing that will be used to display the associated image.
         */
        public imgUrl?: string,
        public donorInfo?: FoodListingUser,
        /**
         * Information pertaining to all claims on this Food Listing.
         */
        public claimsInfo?: ClaimInfo[],
        public unitsInfo?: FoodListingUnits
    ) {}
}
