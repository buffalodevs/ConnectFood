import { TimeRange } from '../app-user/time-range';
import { DeliveryStateInfo, DeliveryState, FoodListingUser } from '../common-receiver-donor-deliverer/shared-food-listing-delivery';

export { DeliveryState };


/**
 * A single Food Listing Delivery entry that mainly contains data that is relavent to the user when browsing potential deliveries and scheduled/started deliveries.
 */
export class Delivery {

    public constructor (
        public claimedFoodListingKey?: number,
        public deliveryFoodListingKey?: number,
        public deliveryStateInfo?: DeliveryStateInfo,
        public foodTitle?: string,
        public foodDescription?: string,
        public needsRefrigeration?: boolean,
        /**
         * The URLs of images associated with the Food Listing.
         * NOTE: The first URL should be the one marked as primary. The remaining URLs should be in the order they were uploaded.
         */
        public imgUrls?: string[],
        /**
         * The estimated weight of the delivery (in lbs).
         */
        public estimatedWeight?: number,
        public donorInfo?: FoodListingUser,     // Driving distance and time here is from driver to donor!
        public receiverInfo?: FoodListingUser,  // Driving distance and time here is from donor to receiver!
        public possibleDeliveryTimes?: TimeRange[]
    ) {}
}
