/**
 * A container for holding data used in the upload of a new food listing.
 */
export class FoodListingUpload {

    public constructor (
        /**
         * Primary identifier of the Food Listing if editing.
         */
        public foodListingKey?: number,
        /**
         * List of all contained Food Types.
         */
        public foodTypes?: string[],
        /**
         * Required (short) food description or title.
         */
        public foodTitle?: string,
        /**
         * Can the food listing spoil?
         */
        public needsRefrigeration?: boolean,
        /**
         * Date that the donated Food Listing will no longer be available at (of the format mm/dd/yyyy)
         */
        public availableUntilDate?: Date,
        /**
         * Optional estimated weight of Food Listing (in pounds).
         */
        public estimatedWeight?: number,
        /**
         * Optional estimated monetary value of Food Listing (in $).
         */
        public estimatedValue?: number,
        /**
         * Optional (long) food description.
         */
        public foodDescription?: string,
        /**
         * The string representation of the image(s) associated with the listing.
         * Should only be populated for the addition or upload of a new Food Listing.
         */
        public imageUploads?: string[]
    ) {}
}
