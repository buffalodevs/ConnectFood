import { deserializable, deepDeserializable } from '../deserialization/deserializer';
import { ImgData } from "./../img/img-data";
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
    @deepDeserializable(ImgData)    public imgData: ImgData[];


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
         * The (optional) image data associated with this Food Listing.
         * NOTE: The first image is always the primary one.
         */
        imgData: ImgData[] = null,
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
        this.imgData = imgData;
    }


    public hasReceiver(): boolean {
        return ( this.claimInfo != null && this.claimInfo.claimInfoKey != null );
    }


    public hasDeliverer(): boolean {
        return ( this.claimInfo != null && this.claimInfo.deliveryInfo != null && this.claimInfo.deliveryInfo.deliveryInfoKey != null);
    }


    public getDonorName(): string {
        return this.donorInfo.organization.name;
    }


    public getReceiverName(): string {
        return this.hasReceiver() ? this.claimInfo.receiverInfo.organization.name
                                  : 'None';
    }


    public getDelivererName(): string {
        return this.hasDeliverer() ? ( this.claimInfo.deliveryInfo.delivererInfo.firstName + ' ' + this.claimInfo.deliveryInfo.delivererInfo.lastName )
                                   : 'None';
    }
}
