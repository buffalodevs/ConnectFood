import { SlickListDialogData } from "../../../slick/slick-filtered-list/slick-list/slick-list-dialog/slick-list-dialog";
import { Delivery } from "../delivery-services/delivery-util.service";


/**
 * Expected input data for this dialog.
 * NOTE: Needed because this dialog will be globally generated and opened, and it cannot use traditional Input() slots.
 */
export class DeliveryListingDialogData extends SlickListDialogData <Delivery> {

    public constructor (
        public header: string,
        public isCart: boolean,
        selectedListing?: Delivery
    ) {
        super(selectedListing);
    }
}
