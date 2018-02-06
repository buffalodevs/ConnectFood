import { DeliveryState } from "./delivery";


/**
 * A basic container for Food Listing Delivery filter data that may be sent to/from the server/client.
 */
export class DeliveryFilters {


    public constructor (
        /**
         * The key ID of the Delivery Food Listing to pull back.
         */
        public deliveryFoodListingKey: number = null,
        /**
         * The key ID of the Claimed Food Listing to pull back as a potential delivery.
         */
        public claimedFoodListingKey: number = null,
        /**
         * Determines the maximum distance (mi) from the requesting entity that donations must fall within.
         */
        public maxDistance: number = null,
        /**
         * The maximum estimated weight of the delivery.
         */
        public maxEstimatedWeight: number = null,
        /**
         * Determines the offset used when retrieving a limited segment of food listings.
         */
        public retrievalOffset: number = null,
        /**
         * Determines the number of food listings that will be contained in the limited segment of retrievals.
         */
        public retrievalAmount: number = null,
        /**
         * Determines if we should only retrieve unscheduled Delivery Food Listings (Food Listings that are claimed but have no uncancelled Delivery data).
         */
        public unscheduledDeliveries: boolean = null,
        /**
         * Determines if we should only retrieve Delivery Food Listings that are in process (at least scheduled) for this deliverer (Deliver Cart).
         */
        public myScheduledDeliveries: boolean = null,
        /**
         * Determines whether or not we should only pull back deliveries for Donors and Receivers whose availablility times match the logged in deliverer's regular times.
         * If not set true, then only Deliveries that are available for Delivery now will be pulled back.
         */
        public matchRegularAvailability: boolean = null,
        /**
         * If set, then only Deliveries with given state will be retrieved. Otherwise, all peranent Deliveries to current tab will be retrieved.
         */
        public deliveryState: DeliveryState = null,
        /**
         * The recommended vehicle type (size) for the delivery.
         */
        public recommendedVehicleType: string = null
    ) {}
}
