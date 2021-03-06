import { SlickListDialogData } from "../../../slick/slick-filtered-list/slick-list/slick-list-dialog/slick-list-dialog";
import { FoodListing } from "../../../../../../shared/src/common-user/food-listing";
import { FoodListingFilters } from "../../../../../../shared/src/common-user/food-listing-filters";


/**
 * Expected input data for this dialog.
 * NOTE: Needed because this dialog will be globally generated and opened, and it cannot use traditional Input() slots.
 */
export class FoodListingDialogData implements SlickListDialogData <FoodListing, FoodListingFilters> {

    public constructor (
        public header: string,
        public isClaimedCart: boolean,
        public isDonatedCart: boolean,
        public selectedListing: FoodListing = null,
        public currentFilters: FoodListingFilters = null
    ) {}
}
