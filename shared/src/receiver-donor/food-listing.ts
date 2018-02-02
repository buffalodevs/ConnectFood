import { FoodListingUser } from '../common-receiver-donor-deliverer/food-listing-user';
import { DeliveryStateInfo } from '../common-receiver-donor-deliverer/delivery-state-info';
import { deserializable, deepDeserializable } from '../deserialization/deserializer';


/**
 * Contains information pertaining to a claim on a food listing.
 */
@deserializable('ClaimInfo')
export class ClaimInfo {

    @deepDeserializable(DeliveryStateInfo)
    public deliveryStatInfo: DeliveryStateInfo;


    public constructor (
        public receiverInfo: FoodListingUser = null,
        public delivererInfo: FoodListingUser = null,
        deliveryStateInfo: DeliveryStateInfo = null
    ) {
        this.deliveryStatInfo = deliveryStateInfo;
    }
}


/**
 * A single Food Listing entry that mainly contains data that is relavent to the user when browsing food listings.
 */
@deserializable('FoodListing')
export class FoodListing {

    @deepDeserializable(Date)       public availableUntilDate: Date;
    @deepDeserializable(ClaimInfo)  public claimInfo: ClaimInfo;


    public constructor (
        public foodListingKey: number = null,
        public foodTitle: string = null,
        public foodTypes: string[] = null,
        public foodDescription: string = null,
        public needsRefrigeration: boolean = null,
        /**
         * The date until the Food Listing expires of the format mm/dd/yyyy
         */
        availableUntilDate: Date = null,
        /**
         * The URLs of images associated with the Food Listing.
         * NOTE: The first url in the array should be the image marked as the primary one. The rest are in the order they were uploaded.
         */
        public imgUrls: string[] = null,
        public donorInfo: FoodListingUser = null,
        /**
         * Information pertaining to all claims on this Food Listing.
         */
        claimInfo: ClaimInfo = null
    ) {
        this.availableUntilDate = availableUntilDate;
        this.claimInfo = claimInfo;
    }
}
