import { DateRange } from '../date-time-util/date-range';
import { FoodListingUser } from '../common-receiver-donor-deliverer/food-listing-user';
import { DeliveryStateInfo, DeliveryState } from '../common-receiver-donor-deliverer/delivery-state-info';
import { Deserializer, deserializable, deepDeserializable } from '../deserialization/deserializer';

export { DeliveryState };


/**
 * A single Food Listing Delivery entry that mainly contains data that is relavent to the user when browsing potential deliveries and scheduled/started deliveries.
 */
@deserializable('Delivery')
export class Delivery {

    @deepDeserializable(DateRange)
    public possibleDeliveryTimes: DateRange[];

    
    public constructor (
        public claimedFoodListingKey: number = null,
        public deliveryFoodListingKey: number = null,
        public deliveryStateInfo: DeliveryStateInfo = null,
        public foodTitle: string = null,
        public foodDescription: string = null,
        public needsRefrigeration: boolean = null,
        /**
         * The URLs of images associated with the Food Listing.
         * NOTE: The first URL should be the one marked as primary. The remaining URLs should be in the order they were uploaded.
         */
        public imgUrls: string[] = null,
        /**
         * The estimated weight of the delivery (in lbs).
         */
        public estimatedWeight: number = null,
        public donorInfo: FoodListingUser = null,     // Driving distance and time here is from driver to donor!
        public receiverInfo: FoodListingUser = null,  // Driving distance and time here is from donor to receiver!
        possibleDeliveryTimes: DateRange[] = null
    ) {
        this.possibleDeliveryTimes = possibleDeliveryTimes;
    }

}
