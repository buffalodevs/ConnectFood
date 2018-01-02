import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { GetListingsService } from './get-listings.service';
import { SlickListDialogComponent } from './slick-list-dialog/slick-list-dialog.component';


@Component({
    selector: 'slick-list',
    templateUrl: './slick-list.component.html',
    styleUrls: ['./slick-list.component.css']
})
export class SlickListComponent {

    /**
     * Route that will be used to fetch (possibly filtered) list data.
     */
    @Input() private route: string;
    /**
     * Title of the list. Default is 'Listings'.
     */
    @Input() private header: string;
    /**
     * The Slick List Dialog associated with this list. Should be shadowed by child class so that list interaction with dialog is automatically handled in this base class.
     */
    @Input() private dialog: SlickListDialogComponent;

    /**
     * Emitted whenever there is an update to the held list data (a refresh, append, or removal will trigger this).
     */
    @Output() public dataUpdated: EventEmitter<Array<any>>
    
    /**
     * The data held by this list.
     */
    private listData: Array<any>;
    /**
     * The index of the selected list item.
     */
    private selectedListIndex: number;
    /**
     * The most recent selected listing that had a valid (non-null) value. This can be the current selected listing or a previously selected one.
     */
    private lastValidSelection: any;
    private gettingMoreListings: boolean;
    private showProgressSpinner: boolean;


    /**
     * @param getListingsService The service used to get listings from the server (Can either be GetListingsService or a derived class).
     */
    public constructor (
        private getListingsService: GetListingsService<any, any>
    ) {
        this.header = 'Listings';
        this.dataUpdated = new EventEmitter<Array<any>>();

        // Initialize instance variables.
        this.listData = new Array<any>();
        this.selectedListIndex = null;
        this.showProgressSpinner = false;

        // Setup callbacks (listeners) for notification before and after retrieval of more listings.
        this.getListingsService.onGetMoreListings(this.onGetMoreListings.bind(this));
        this.getListingsService.onReceivedMoreListings(this.onReceivedMoreListings.bind(this));
    }


    public ngOnInit(): void {

        // Ensure we are given a route to retrieve listings via.
        if (this.route == null) {
            throw new Error('Route required as Slick List Component input so that listings can be retrieved from server!');
        }
    }


    /**
     * Callback that is invoked by getListingsService whenever it is about to load more listings due to scrolling near bottom of web page (before contact server).
     */
    private onGetMoreListings(): void {
        this.gettingMoreListings = true;
    }


    /**
     * Callback that is invoked by getListingsService whenever it has retrieved more listings due to scrolling near bottom of web page.
     * @param moreListings The additional listings that have been retrieved.
     */
    private onReceivedMoreListings(moreListings: Array<any>): void {
        this.gettingMoreListings = false;
        this.listData = this.listData.concat(moreListings);
        this.dataUpdated.emit(this.listData);
    }


    /**
     * Refreshes the listings using the new set of filters criteria. The offset used to retreive a certain range of listings will be reset to 0.
     * @param filters The filter criteria. 
     */
    public refreshList(filters: any): void {

        let observer: Observable<Array<any>> = this.getListingsService.getListings(filters, this.route);
        this.showProgressSpinner = true;
        this.listData = []; // Empty our current model list while we wait for server results.

        observer.finally(() => { this.showProgressSpinner = false; })
                .subscribe((listData: Array<any>) => {
                    this.listData = listData;
                    this.dataUpdated.emit(this.listData);
                });
    }


    /**
     * Sets a given list item as selected and displays a set dialog if there is one.
     * @param selectedListIndex The index of the list item to select.
     * @param displayDialog Default is true. Set to false if the set dialog should not be displayed upon selection.
     */
    public selectListing(selectedListIndex: number, displayDialog: boolean = true): void {

        this.selectedListIndex = selectedListIndex;
        this.lastValidSelection = this.listData[selectedListIndex];

        // If we wish to display the dialog and we have one set, then open it.
        if (displayDialog && this.dialog != null) {
            this.dialog.open();
        }
    }


    /**
     * Gets the selected listing.
     * @return The selected listing data.
     */
    public getSelectedListing(): any {

        if (this.selectedListIndex != null) {
            return this.listData[this.selectedListIndex];
        }
        return null;
    }


    /**
     * The most recent selected listing that had a valid (non-null) value. This can be the current selected listing or a previously selected one.
     * @return The most recent valid selected listing (can be null if none have been selected thus far).
     */
    public getLastValidSelection(): any {
        return this.lastValidSelection;
    }


    /**
     * Removes the selected listing.
     * @param closeDialog Default is true. Determines whether or not to also close any open dialog.
     */
    public removeSelectedListing(closeDialog: boolean = true): void {

        // Close any modal details popup related to the listing we are deleting.
        if (closeDialog && this.dialog != null && this.dialog.isOpen()) {
            this.dialog.close();
        }
        
        // Remove the listing from the contained array model.
        this.listData.splice(this.selectedListIndex, 1);
        this.selectedListIndex = null;
    }
}
