import { deserializable, deepDeserializable } from '../deserialization/deserializer';
import { AppUser } from '../app-user/app-user';
import { DeliveryStateInfo } from '../common-receiver-donor-deliverer/delivery-state-info';
import { ClaimInfo } from './claim-info';
import { DeliveryInfo } from './delivery-info';
import { DateRange } from '../date-time-util/date-range';
import { FoodListingsStatus } from './food-listing-filters';

export { FoodListingsStatus }


/**
 * A single Food Listing entry that mainly contains data that is relavent to the user when browsing food listings.
 */
@deserializable('FoodListing')
export class FoodListing {

    @deepDeserializable(Date)       public availableUntilDate: Date;
    @deepDeserializable(DateRange)  public foodListingAvailability: DateRange[];
    @deepDeserializable(ClaimInfo)  public claimInfo: ClaimInfo;


    public constructor (
        /**
         * The key ID of the food listing.
         */
        public foodListingKey: number = null,
        /**
         * The title of the food listing.
         */
        public foodTitle: string = null,
        /**
         * The food types/categories.
         */
        public foodTypes: string[] = null,
        /**
         * An (optional) descritpion of the food.
         */
        public foodDescription: string = null,
        /**
         * Whether or not the food needs to be refrigerated.
         */
        public needsRefrigeration: boolean = null,
        /**
         * The date until the Food Listing expires of the format mm/dd/yyyy
         */
        availableUntilDate: Date = null,
        /**
         * The (optional) relative URLs of images associated with the Food Listing.
         * NOTE: The first url in the array should be the image marked as the primary one. The rest are in the order they were uploaded.
         */
        public imgUrls: string[] = null,
         /**
         * Optional estimated weight of Food Listing (in pounds).
         */
        public estimatedWeight: number = null,
        /**
         * Optional estimated monetary value of Food Listing (in $).
         */
        public estimatedValue: number = null,
        /**
         * Recommended vehicle type (size) to use for delivery.
         */
        public recommendedVehicleType: string = null,
        /**
         * The user info for the donor of the food listing.
         */
        public donorInfo: AppUser = null,
        /**
         * Absolute availability time ranges when food donation is available to be picked up.
         * NOTE: This is an addition/overlaod of Donor App User's Regular Availability!
         */
        foodListingAvailability: DateRange[] = null,
        /**
         * Information pertaining to a claim on this Food Listing.
         */
        claimInfo: ClaimInfo = null
    ) {
        this.availableUntilDate = availableUntilDate;
        this.foodListingAvailability = foodListingAvailability;
        this.claimInfo = claimInfo;
    }
}
