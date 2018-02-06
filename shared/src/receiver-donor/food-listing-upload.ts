import { deserializable, deepDeserializable } from "../deserialization/deserializer";


/**
 * A container for holding data used in the upload of a new food listing.
 */
@deserializable('FoodListingUpload')
export class FoodListingUpload {

    @deepDeserializable(Date)
    public availableUntilDate: Date;


    public constructor (
        /**
         * Primary identifier of the Food Listing if editing.
         */
        public foodListingKey: number = null,
        /**
         * List of all contained Food Types.
         */
        public foodTypes: string[] = null,
        /**
         * Required (short) food description or title.
         */
        public foodTitle: string = null,
        /**
         * Can the food listing spoil?
         */
        public needsRefrigeration: boolean = null,
        /**
         * Date that the donated Food Listing will no longer be available at (of the format mm/dd/yyyy)
         */
        availableUntilDate: Date = null,
        /**
         * Optional estimated weight of Food Listing (in pounds).
         */
        public estimatedWeight: number = null,
        /**
         * Optional estimated monetary value of Food Listing (in $).
         */
        public estimatedValue: number = null,
        /**
         * Optional (long) food description.
         */
        public foodDescription: string = null,
        /**
         * The string representation of the image(s) associated with the listing.
         * Should only be populated for the addition or upload of a new Food Listing.
         */
        public imageUploads: string[] = null,
        /**
         * The recommended vehicle type (size) for the delivery.
         */
        public recommendedVehicleType: string = null,
    ) {
        this.availableUntilDate = availableUntilDate;
    }
}
