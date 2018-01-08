import { Component, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { ComponentType } from '@angular/cdk/portal';
import { MatDialog, MAT_DIALOG_DATA, MatDialogConfig, MatDialogRef } from '@angular/material';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/finally';

import { GetListingsService } from './services/get-listings.service';
import { ConsumableListingCacheService } from './services/consumable-listing-cache.service';
import { SlickListDialogData, SlickListDialog } from './slick-list-dialog/slick-list-dialog';


/**
 * Abstract class to be extended by an actual implementation of a Slick List Component.
 * Contains logic for getting, maintaining, and updating list data. Also contains logic for showing Slick List Dialog and listening for its events.
 */
export abstract class SlickListComponent <LIST_T, FILT_T = any> {

    /**
     * Emitted whenever there is an update to the held list data (a refresh, append, or removal will trigger this).
     */
    @Output() public dataUpdated: EventEmitter <Array <LIST_T>>
    
    /**
     * The data held by this list.
     */
    protected listData: Array <LIST_T>;
    /**
     * The index of the selected list item.
     */
    protected selectedListIndex: number;
    protected gettingMoreListings: boolean;
    protected showProgressSpinner: boolean;


    /**
     * @param ROUTE Route that will be used to fetch (possibly filtered) list data.
     * @param getListingsService The service used to get listings from the server (Can either be GetListingsService or a derived class).
     * @param dialogService The service for displaying a dialog component.
     */
    protected constructor (
        protected readonly ROUTE: string,
        protected getListingsService: GetListingsService <LIST_T, FILT_T>,
        protected consumableListingCacheService: ConsumableListingCacheService <LIST_T>,
        protected router: Router,
        protected dialogService: MatDialog
    ) {

        // Ensure we are given a route to retrieve listings via.
        if (this.ROUTE == null) {
            throw new Error('ROUTE required as Slick List Component constructor argument so that listings can be retrieved from server!');
        }

        this.dataUpdated = new EventEmitter <Array <LIST_T>>();

        // Initialize instance variables.
        this.listData = new Array <LIST_T>();
        this.selectedListIndex = null;
        this.showProgressSpinner = false;

        // Setup callbacks (listeners) for notification before and after retrieval of more listings.
        this.getListingsService.onBeforeGetMoreListings(this.onBeforeGetMoreListings.bind(this));
        this.getListingsService.onAfterGetMoreListings(this.onAfterGetMoreListings.bind(this));
    }


    /**
     * Callback that is invoked by getListingsService whenever it is about to load more listings due to scrolling near bottom of web page (before contact server).
     */
    protected onBeforeGetMoreListings(): void {
        this.gettingMoreListings = true;
    }


    /**
     * Callback that is invoked by getListingsService whenever it has retrieved more listings due to scrolling near bottom of web page.
     * @param moreListings The additional listings that have been retrieved.
     */
    protected onAfterGetMoreListings(moreListings: Array <any>): void {
        this.gettingMoreListings = false;
        this.updateListData(moreListings, false);
    }


    /**
     * Refreshes the listings using the new set of filters criteria. The offset used to retreive a certain range of listings will be reset to 0.
     * @param filters The filter criteria. 
     */
    public refreshList(filters: FILT_T): void {

        let observer: Observable <Array <LIST_T>> = this.getListingsService.getListings(filters, this.ROUTE);
        this.showProgressSpinner = true;
        this.listData = []; // Empty our current model list while we wait for server results.

        observer.finally(() => { this.showProgressSpinner = false; })
                .subscribe(this.updateListData.bind(this));
    }


    /**
     * Updates the list data by either appending the given data or replacing it (refresh).
     * @param newListData The new list data for the update.
     * @param isRefresh If set true, then current list data is repalced by newListData. If set false, then newListData is appended to current data.
     */
    public updateListData(newListData: Array <LIST_T>, isRefresh: boolean = true): void {

        this.filterNewListings(newListData);

        this.listData = isRefresh ? newListData
                                  : this.listData.concat(newListData);
        this.dataUpdated.emit(this.listData);
    }


    /**
     * Filter applied to any new list data that has been received (on all append, refresh, or update operations).
     * @param newListData The new list data that will be filtered.
     */
    protected filterNewListings(newListData: Array <LIST_T>): void {
        // Can be overriden by child class to apply filter to any received new litings.
    }


    /**
     * Sets a given list item as selected.
     * @param selectedListIndex The index of the list item to select.
     */
    public selectListing(selectedListIndex: number): void;


    /**
     * Sets a given list item as selected.
     * If a route is given, additioanlly fills a consumable listing cache for another route to get the selected listing and switches to the given route. 
     * @param selectedListIndex The index of the list item to select.
     * @param href The route to switch to.
     * @param id The numeric id of the selected listing (used to identify it in the consumable listing cache).
     */
    public selectListing(selectedListIndex: number, href: string, id: number): void;


    /**
     * Sets a given list item as selected.
     * If a route is given, additioanlly fills a consumable listing cache for another route to get the selected listing and switches to the given route. 
     * @param selectedListIndex The index of the list item to select.
     * @param href The optional route to switch to.
     * @param id The optional string id of the selected listing (used to identify it in the consumable listing cache).
     */
    public selectListing(selectedListIndex: number, href: string, id: string): void;


    /**
     * Sets a given list item as selected and displays a given dialog component.
     * @param selectedListIndex The index of the list item to select.
     * @param hrefOrDialogType The component type of the dialog to display.
     * @param dialogConfig The optional configuration for the dialog. If not provided, then an internal configuration is used.
     *                     NOTE: the selectedListing member of the configuration data will be set internally (hence selected listing data is automatically provided to dialog)!
     */
    public selectListing(selectedListIndex: number, dialogType: ComponentType <SlickListDialog>, dialogConfig?: MatDialogConfig <SlickListDialogData <LIST_T>>): void;


    public selectListing(selectedListIndex: number, hrefOrDialogType?: string | ComponentType <SlickListDialog>,
                         idOrDialogConfig?: number | string | MatDialogConfig <SlickListDialogData <LIST_T>>): void
    {
        this.selectedListIndex = selectedListIndex;

        if (hrefOrDialogType != null) {

            const selectedListing: LIST_T = this.listData[selectedListIndex];

            // If we were provided with an href for linking to a route.
            if (typeof hrefOrDialogType === 'string') {
                this.gotoRoute(selectedListing, <string> hrefOrDialogType, <number | string>idOrDialogConfig);
            }
            // Else we wish to display the dialog and we have one set, then open it.
            else {
                this.openDialog(selectedListing, <ComponentType<SlickListDialog>> hrefOrDialogType, <MatDialogConfig <SlickListDialogData <LIST_T>>> idOrDialogConfig);
            }
        }
    }


    /**
     * Routes to a given href location in the app.
     * Before routing, fills the consumable listing cache so that route can get selected listing without querying server.
     * @param selectedListing The selected listing to set in the consumable listing cache.
     * @param href The address of the route to link to.
     * @param selectedListingId The ID of the selected listing so that it can be uniquely identified in the cache.
     */
    protected gotoRoute(selectedListing: LIST_T, href: string, selectedListingId: number | string): void {
        this.consumableListingCacheService.setCachedListing(selectedListing, selectedListingId);
        this.router.navigate([href]);
    }


    /**
     * Opens a selected listing dialog with given dialog component type and configuration.
     * @param dialogType The type of the dialog to open.
     * @param dialogConfig The configuration for the dialog (also contains selected listing data and any other data provided by caller).
     */
    protected openDialog(selectedListing: LIST_T, dialogType: ComponentType <SlickListDialog>, dialogConfig?: MatDialogConfig <SlickListDialogData <LIST_T>>): void {

        // First, ensure that we have a dialog config (either given one or generate one).
        dialogConfig = (dialogConfig == null) ? new MatDialogConfig<SlickListDialogData<LIST_T>>()
                                              : dialogConfig;

        // Then, add selected data to dialog config.
        dialogConfig.data.selectedListing = selectedListing;
        dialogConfig.hasBackdrop = true;

        // Add css class names for custom styling.
        dialogConfig.backdropClass = (dialogConfig.backdropClass == '') ? 'slick-list-dialog-backdrop'
                                                                        : dialogConfig.backdropClass;
        dialogConfig.panelClass = (dialogConfig.panelClass == '') ? 'slick-list-dialog'
                                                                  : dialogConfig.panelClass;

        // Open dialog and grab a reference to it.
        const dialogRef: MatDialogRef <SlickListDialog> = this.dialogService.open(dialogType, dialogConfig);

        // Listen for removeSelectedListing event.
        dialogRef.componentInstance.removeSelectedListing.subscribe(this.removeSelectedListing.bind(this));
    }


    /**
     * Gets the currently held list data from the server.
     * @return The currently held list data.
     */
    public getListData(): Array <LIST_T> {
        return this.listData;
    }


    /**
     * Gets the selected listing.
     * @return The selected listing data.
     */
    public getSelectedListing(): LIST_T {

        return (this.selectedListIndex != null) ? this.listData[this.selectedListIndex]
                                                : null;
    }


    /**
     * Removes the selected listing.
     */
    public removeSelectedListing(): void {
        this.listData.splice(this.selectedListIndex, 1);
        this.selectedListIndex = null;
    }
}
