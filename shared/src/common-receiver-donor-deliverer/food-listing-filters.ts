import { deserializable, deepDeserializable } from "../deserialization/deserializer";
import { DateRange } from "./../date-time-util/date-range";
import { SlickListFilters } from "../slick-list/slick-list-filters/slick-list-filters";
import { DeliveryState } from "./delivery-state-info";
import { FoodType } from "./food-listing-domain/food-type";
import { FoodListingsStatus } from "./food-listing-domain/food-listings-status";
import { MAX_DISTANCE_VALUES } from "./food-listing-domain/max-distance"

export { FoodType, FoodListingsStatus };


/**
 * A basic container for Food Listing filter data that may be sent to/from the server/client.
 */
@deserializable('FoodListingFilters')
export class FoodListingFilters implements SlickListFilters {

    /**
     * Determines the offset used when retrieving a limited segment of food listings.
     */
    public retrievalOffset: number = 0;

    /**
     * Determines the number of food listings that will be contained in the limited segment of retrievals.
     */
    public retrievalAmount: number = 10;

    /**
     * The key ID of the Food Listing to retrieve.
     */
    public foodListingKey: number = null;

    /**
     * The key ID of the claim that should be associated with the food listing that is being retrieved.
     */
    public claimInfoKey: number = null;

    /**
     * The key ID of the Delivery Food Listing to pull back.
     */
    public deliveryInfoKey: number = null;

    /**
     * Determines what food types the results should contain.
     */
    public foodTypes: FoodType[] = [];

    /**
     * Determines if results should include perishable elements.
     */
    public needsRefrigeration: boolean = false;

    /**
     * Determines if results should include non-perishable elements.
     */
    public notNeedsRefrigeration: boolean = false;

    /**
     * Determines the minimum date that retrieved items must still be available by.
     */
    @deepDeserializable(Date)
    public availableAfterDate: Date = null;

    /**
     * Determines the maximum distance from the requesting entity that donations must fall within.
     */
    public maxDistance: number = MAX_DISTANCE_VALUES[1];

    /**
     * The maximum estimated weight of the delivery.
     */
    public maxEstimatedWeight: number = null;

    /**
     * Determines whether or not we should only pull back deliveries for Donors and Receivers whose availablility times match the logged in deliverer's regular times.
     */
    public matchRegularAvailability: boolean = true;

    /**
     * If present, brings back Food Listings whose availability not only matches user's availability, but also matches these given specificAvailabilityTimes.
     */
    public specificAvailabilityTimes: DateRange[] = null;

    /**
     * Determines whether or not we should only pull back Food Listings that are available now for delivery.
     * NOTE: This will override matchRegularAvailability and any provided specificAvailabilityTimes.
     */
    public matchAvailableNow: boolean = false;

    /**
     * If set, then only Deliveries with given state will be retrieved. Otherwise, all peranent Deliveries to current tab will be retrieved.
     */
    public deliveryState: DeliveryState = null;

    /**
     * The recommended vehicle type (size) for the delivery.
     */
    public recommendedVehicleType: string = null;

    /**
     * Determines what food listings we should bring back based off of their status (unclaimed = null, claimed = null, or donated relative to the current user).
     */
    public foodListingsStatus: FoodListingsStatus = null;

    /**
     * Determines that we should only bring back Food Listing that are scheduled for delivery on or before the contained date.
     */
    @deepDeserializable(Date)
    public scheduledDeliveryBefore: Date = null;


    public constructor() {}
}
