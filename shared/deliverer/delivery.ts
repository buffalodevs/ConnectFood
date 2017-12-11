import { FoodListingUser } from '../receiver-donor/food-listing';
import { TimeRange } from '../app-user/time-range';


/**
 * The state (implies location) of the Delivery Food Listing
 */
export enum DeliveryState {
    unscheduled = 'unscheduled',
    scheduled = 'scheduled',
    onRouteToDonor = 'onRouteToDonor',
    onRouteToReceiver = 'onRouteToReceiver',
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
        public unitsLabel?: string,
        public possibleDeliveryTimes?: TimeRange[]
    ) {}


    /**
     * Compares two delivery states. This is much like the C language compare method for string comparison. See it for more details.
     * @param lhs The left hand side of the comparison.
     * @param rhs The right hand side of the comparison.
     * @return If lhs < rhs, then any negative number. If lhs > rhs, then any positive number. If lhs == rhs, then 0.
     */
    public static compareDeliveryStates(lhs: DeliveryState, rhs: DeliveryState): number {

        const lhsIndex: number = Delivery.getDeliveryStateIndex(lhs);
        const rhsIndex: number = Delivery.getDeliveryStateIndex(rhs);

        return ( lhsIndex - rhsIndex );
    }


    /**
     * Converts a given delivery state into an ordered index related to the logical ordering of states as they occur throughout the delivery process.
     * @param deliveryState The delivery state to generate an index for.
     * @return The index of the delivery state.
     */
    public static getDeliveryStateIndex(deliveryState: DeliveryState): number {

        switch (deliveryState) {
            case DeliveryState.unscheduled:         return 0;
            case DeliveryState.scheduled:           return 1;
            case DeliveryState.onRouteToDonor:      return 2;
            case DeliveryState.onRouteToReceiver:   return 3;
            case DeliveryState.completed:           return 4;
        }
    }
}
