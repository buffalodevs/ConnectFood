import { EventEmitter } from "@angular/core";


/**
 * Uniform definition for basic data that must be passed to a Slick List dialog (which is displayed upon selecting a listing).
 * NOTE: This may be extended by dialogs that require more data as inputs.
 */
export class SlickListDialogData <LISTING_T> {

    public constructor (
        public selectedListing?: LISTING_T
    ) {}
}


/**
 * Defines dialog events that the Slick List component can listen on.
 */
export abstract class SlickListDialog {

    public removeSelectedListing: EventEmitter <void>;


    protected constructor () {
        this.removeSelectedListing = new EventEmitter <void>();
    }
}