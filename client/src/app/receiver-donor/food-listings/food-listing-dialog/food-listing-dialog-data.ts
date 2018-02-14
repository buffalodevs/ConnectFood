import { SlickListDialogData } from "../../../slick/slick-filtered-list/slick-list/slick-list-dialog/slick-list-dialog";
import { FoodListing } from "../../../../../../shared/src/common-receiver-donor-deliverer/food-listing";


/**
 * Expected input data for this dialog.
 * NOTE: Needed because this dialog will be globally generated and opened, and it cannot use traditional Input() slots.
 */
export class FoodListingDialogData extends SlickListDialogData <FoodListing> {

    public constructor (
        public header: string,
        public isClaimedCart: boolean,
        public isDonatedCart: boolean,
        selectedListing?: FoodListing
    ) {
        super(selectedListing);
    }
}
