import { FoodListingUser } from '../receiver-donor/food-listing';


/**
 * The state (implies location) of the Delivery Food Listing
 */
export enum DeliveryState {
    unscheduled = 'unscheduled',
    scheduled = 'scheduled',
    onRouteToDonor = 'onRouteToReceiver',
    onRouteToReceiver = 'onRouteToDonor',
    completed = 'completed'
}


/**
 * A single Food Listing Delivery entry that mainly contains data that is relavent to the user when browsing potential deliveries and scheduled/started deliveries.
 */
export class Delivery {

    public constructor (
        public claimedFoodListingKey?: number,
        public deliveryFoodListingKey?: number,
        public deliveryState?: DeliveryState,
        public foodTitle?: string,
        public foodDescription?: string,
        public perishable?: boolean,
        /**
         * The url of a saved Food Listing that will be used to display the associated image.
         */
        public imgUrl?: string,
        /**
         * The total weight of the delivery (in lbs).
         */
        public totalWeight?: number,
        public donorInfo?: FoodListingUser,     // Driving distance and time here is from driver to donor!
        public receiverInfo?: FoodListingUser,  // Driving distance and time here is from donor to receiver!
        public claimedUnitsCount?: number,
        public unitsLabel?: string
    ) {}
}
