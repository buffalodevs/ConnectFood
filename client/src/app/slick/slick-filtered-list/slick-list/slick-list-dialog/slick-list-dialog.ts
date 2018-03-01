import { EventEmitter } from "@angular/core";


/**
 * Uniform interface for basic data that must be passed to a Slick List dialog (which is displayed upon selecting a listing).
 * NOTE: This may be extended by dialogs that require more data as inputs.
 */
export interface SlickListDialogData <LISTING_T, FILT_T> {

    selectedListing: LISTING_T;
    currentFilters: FILT_T;
}


/**
 * Defines dialog events that the Slick List component can listen on.
 */
export interface SlickListDialog {

    removeSelectedListing: EventEmitter <void>;
}
