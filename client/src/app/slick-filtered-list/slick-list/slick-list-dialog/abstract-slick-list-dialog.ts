import { EventEmitter } from "@angular/core";
import { SlickListDialogComponent } from "./slick-list-dialog.component";


/**
 * Handles implementations of opening and closing dialog. Simply need to assign an actual implementation of SlickListDialogInterface to slickListDialog member.
 * This can be done by redeclaring it in the child as a view child (and the view child can be SlickListDialogComponent).
 */
export abstract class AbstractSlickListDialog<LIST_T> {

    protected slickListDialog: SlickListDialogComponent;
    protected dialogData: LIST_T;
    public removeListing: EventEmitter<boolean>;

    
    protected constructor() {
        this.removeListing = new EventEmitter<boolean>();
    }


    /**
     * Displays the listing details modal dialog.
     * @param dialogData The data to display in the dialog.
     */
    public open(dialogData: LIST_T): void {
        this.dialogData = dialogData;
        if (this.slickListDialog != null)  this.slickListDialog.open();
    }


    /**
     * Checks if the dialog is open.
     * @return true if the dialog is open, false if not.
     */
    public isOpen(): boolean {
        return (this.slickListDialog != null) ? this.slickListDialog.isOpen()
                                              : false;
    }


    /**
     * Hides (or closes) the listing details dialog.
     */
    public close(): void {
        if (this.slickListDialog != null)  this.slickListDialog.close();
    }
}
