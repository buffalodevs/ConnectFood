import { Component, Output, EventEmitter, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { ComponentType } from '@angular/cdk/portal';
import { MatDialog, MAT_DIALOG_DATA, MatDialogConfig, MatDialogRef } from '@angular/material';
import * as _ from "lodash";
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/finally';
import 'rxjs/add/operator/debounce';
import 'rxjs/add/observable/timer';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/do';
import { Subscriber } from 'rxjs/Subscriber';

import { GetListingsService } from './services/get-listings.service';
import { ConsumableListingCacheService } from './services/consumable-listing-cache.service';
import { SlickListDialogData, SlickListDialog } from './slick-list-dialog/slick-list-dialog';

import { SlickListFilters } from '../../../../../../shared/src/slick-list/slick-list-filters/slick-list-filters';


/**
 * Abstract class to be extended by an actual implementation of a Slick List Component.
 * Contains logic for getting, maintaining, and updating list data. Also contains logic for showing Slick List Dialog and listening for its events.
 */
export abstract class SlickListComponent <LIST_T, FILT_T extends SlickListFilters = any> {

    /**
     * Emitted whenever there is an update to the held list data (a refresh, append, or removal will trigger this).
     */
    @Output() public dataUpdated: EventEmitter <LIST_T[]>
    
    /**
     * The data held by this list.
     */
    public listData: LIST_T[];
    /**
     * Will be set true when there is a refresh of the listings and a progress spinner should be shown.
     */
    public showProgressSpinner: boolean;
    /**
     * The index of the selected list item.
     */
    protected _selectedListIndex: number;
    protected _gettingMoreListings: boolean;
    private _hadPreviousRefreshes: boolean;


    /**
     * @param _ROUTE Route that will be used to fetch (possibly filtered) list data.
     * @param _getListingsService The service used to get listings from the server (Can either be GetListingsService or a derived class).
     * @param _dialogService The service for displaying a dialog component.
     */
    protected constructor (
        protected readonly _ROUTE: string,
        protected _elementRef: ElementRef,
        protected _getListingsService: GetListingsService <LIST_T, FILT_T>,
        protected _consumableListingCacheService: ConsumableListingCacheService <LIST_T>,
        protected _router: Router,
        protected _dialogService: MatDialog,
        protected _debounceTimeMs: number = 1500
    ) {

        // Ensure we are given a route to retrieve listings via.
        if (this._ROUTE == null) {
            throw new Error('_ROUTE required as Slick List Component constructor argument so that listings can be retrieved from server!');
        }

        this.dataUpdated = new EventEmitter <LIST_T[]>();

        // Initialize instance variables.
        this.listData = [];
        this.showProgressSpinner = false;
        this._selectedListIndex = null;
        this._hadPreviousRefreshes = false;

        // Setup callbacks (listeners) for notification before and after retrieval of more listings.
        this._getListingsService.onBeforeGetMoreListings(this.onBeforeGetMoreListings.bind(this));
        this._getListingsService.onAfterGetMoreListings(this.onAfterGetMoreListings.bind(this));
    }


    /**
     * Callback that is invoked by _getListingsService whenever it is about to load more listings due to scrolling near bottom of web page (before contact server).
     */
    protected onBeforeGetMoreListings(): void {
        this._gettingMoreListings = true;
    }


    /**
     * Callback that is invoked by _getListingsService whenever it has retrieved more listings due to scrolling near bottom of web page.
     * @param moreListings The additional listings that have been retrieved.
     */
    protected onAfterGetMoreListings(moreListings: any[]): void {
        this._gettingMoreListings = false;
        this.updateListData(moreListings, false);
    }


    /**
     * Sets observable that will be used to generate filters for list refresh.
     * The list will refresh whenever the observable resolves.
     * @param filtersObservable An observable that will be subscribed to for list refresh.
     */
    public refreshListOn(filtersObservable: Observable <FILT_T>, initRefreshFilts?: FILT_T): void {

        // Listen to filters observable show we can show progress spinner and refresh whenever filters update.
        filtersObservable
            .do(() => { this.showProgressSpinner = true; })
            .debounce(this.genDebounceTime.bind(this))                  // Wait debounce time duration to send request (only after initial request sent).
            .distinctUntilChanged(this.filtersNotChanged.bind(this))    // Only send request if filters are different than last.
            .subscribe(this.refreshList.bind(this));
    }


    /**
     * Generates the debounce time for the refresh based on whether or not there have been previous refreshes.
     * @return An observable that controls the debounce timing.
     */
    private genDebounceTime(): Observable <number> {

        // If not first refresh, then wait for _debounceTimeMs input time, else 0 for immediately on first refresh.
        return Observable.timer(this._hadPreviousRefreshes ? this._debounceTimeMs
                                                          : 0);
    }


    /**
     * Checks if there was no change in filters value between previous and current refresh.
     * Also, if no chang occured, then turns off any running progress spinner.
     * @param unused The previous filters held by the observable cache (not used since it can be circumvented by a direct call to refreshList()).
     * @param currentFilters The current filters value.
     * @return true if no change occured, false if a change did occur.
     */
    private filtersNotChanged(unused: SlickListFilters, currentFilters: SlickListFilters): boolean {

        const currentRetrievalAmount = currentFilters.retrievalAmount;
        const currentRetrievalOffset = currentFilters.retrievalOffset;
        const previousFilters: FILT_T = this._getListingsService.getPreviousFilters();

        // Make sure we don't include retrieval amount & offset members in comparison (only want filter form values)! Set equal and then revert back to individual values.
        currentFilters.retrievalAmount = previousFilters.retrievalAmount;
        currentFilters.retrievalOffset = previousFilters.retrievalOffset;
        const noChange: boolean = _.isEqual(previousFilters, currentFilters);
        currentFilters.retrievalAmount = currentRetrievalAmount;
        currentFilters.retrievalOffset = currentRetrievalOffset;

        // If noChange, then be sure to stop progress spinner since we will not end up sending refresh requet!
        this.showProgressSpinner = !noChange;
        return noChange;
    }


    /**
     * Refreshes the listings using the new set of filters criteria. The offset used to retreive a certain range of listings will be reset to 0.
     * @param filters The filter criteria. 
     */
    public refreshList(filters: FILT_T, scrollToTop: boolean = true): void {

        if (scrollToTop)  this.scrollToListTop();
        this.listData = [];
        this.showProgressSpinner = true;
        
        this._getListingsService.getListings(filters, this._ROUTE)
            .finally(() => {
                this.showProgressSpinner = false;
                this._hadPreviousRefreshes = true;
            })
            .subscribe(this.updateListData.bind(this));
    }


    private scrollToListTop(): void {

        // Find out amount that we must scroll to get to top of Slick List element. 
        const scrollAmount: number = this._elementRef.nativeElement.getBoundingClientRect().top;
        const slickListTop: number = ( window.scrollY + scrollAmount );

        // Only scroll to the top of the Slick List if the scroll amount is negative (scroll up).
        if (scrollAmount < 0) {
            window.scrollTo(window.scrollX, slickListTop);
        }
    }


    /**
     * Updates the list data by either appending the given data or replacing it (refresh).
     * @param newListData The new list data for the update.
     * @param isRefresh If set true, then current list data is repalced by newListData. If set false, then newListData is appended to current data.
     */
    public updateListData(newListData: LIST_T[], isRefresh: boolean = true): void {

        this.filterNewListings(newListData);

        this.listData = isRefresh ? newListData
                                  : this.listData.concat(newListData);
        this.dataUpdated.emit(this.listData);
    }


    /**
     * Filter applied to any new list data that has been received (on all append, refresh, or update operations).
     * @param newListData The new list data that will be filtered.
     */
    protected filterNewListings(newListData: LIST_T[]): void {
        // Can be overriden by child class to apply filter to any received new litings.
    }


    /**
     * Sets a given list item as selected.
     * @param _selectedListIndex The index of the list item to select.
     */
    public selectListing(_selectedListIndex: number): void;


    /**
     * Sets a given list item as selected.
     * If a route is given, additioanlly fills a consumable listing cache for another route to get the selected listing and switches to the given route. 
     * @param _selectedListIndex The index of the list item to select.
     * @param href The route to switch to.
     * @param id The numeric id of the selected listing (used to identify it in the consumable listing cache).
     */
    public selectListing(_selectedListIndex: number, href: string, id: number): void;


    /**
     * Sets a given list item as selected.
     * If a route is given, additioanlly fills a consumable listing cache for another route to get the selected listing and switches to the given route. 
     * @param _selectedListIndex The index of the list item to select.
     * @param href The optional route to switch to.
     * @param id The optional string id of the selected listing (used to identify it in the consumable listing cache).
     */
    public selectListing(_selectedListIndex: number, href: string, id: string): void;


    /**
     * Sets a given list item as selected and displays a given dialog component.
     * @param _selectedListIndex The index of the list item to select.
     * @param hrefOrDialogType The component type of the dialog to display.
     * @param dialogConfig The optional configuration for the dialog. If not provided, then an internal configuration is used.
     *                     NOTE: the selectedListing member of the configuration data will be set internally (hence selected listing data is automatically provided to dialog)!
     */
    public selectListing(_selectedListIndex: number, dialogType: ComponentType <SlickListDialog>, dialogConfig?: MatDialogConfig <SlickListDialogData <LIST_T, FILT_T>>): void;


    public selectListing(_selectedListIndex: number, hrefOrDialogType?: string | ComponentType <SlickListDialog>,
                         idOrDialogConfig?: number | string | MatDialogConfig <SlickListDialogData <LIST_T, FILT_T>>): void
    {
        this._selectedListIndex = _selectedListIndex;

        if (hrefOrDialogType != null) {

            const selectedListing: LIST_T = this.listData[_selectedListIndex];

            // If we were provided with an href for linking to a route.
            if (typeof hrefOrDialogType === 'string') {
                this.gotoRoute(selectedListing, <string> hrefOrDialogType, <number | string>idOrDialogConfig);
            }
            // Else we wish to display the dialog and we have one set, then open it.
            else {
                this.openDialog(selectedListing, <ComponentType<SlickListDialog>> hrefOrDialogType, <MatDialogConfig <SlickListDialogData <LIST_T, FILT_T>>> idOrDialogConfig);
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
        this._consumableListingCacheService.setCachedListing(selectedListing, selectedListingId);
        this._router.navigate([href]);
    }


    /**
     * Opens a selected listing dialog with given dialog component type and configuration.
     * @param dialogType The type of the dialog to open.
     * @param dialogConfig The configuration for the dialog (also contains selected listing data and any other data provided by caller).
     */
    protected openDialog(selectedListing: LIST_T, dialogType: ComponentType <SlickListDialog>, dialogConfig?: MatDialogConfig <SlickListDialogData <LIST_T, FILT_T>>): void {

        // First, ensure that we have a dialog config (either given one or generate one).
        dialogConfig = (dialogConfig == null) ? new MatDialogConfig<SlickListDialogData<LIST_T, FILT_T>>()
                                              : dialogConfig;

        // Then, add selected data to dialog config.
        dialogConfig.data.selectedListing = selectedListing;
        dialogConfig.data.currentFilters = this._getListingsService.getPreviousFilters();
        dialogConfig.hasBackdrop = true;

        // Add css class names for custom styling.
        dialogConfig.backdropClass = (dialogConfig.backdropClass == '') ? 'slick-list-dialog-backdrop'
                                                                        : dialogConfig.backdropClass;
        dialogConfig.panelClass = (dialogConfig.panelClass == '') ? 'slick-list-dialog'
                                                                  : dialogConfig.panelClass;

        // Open dialog and grab a reference to it.
        const dialogRef: MatDialogRef <SlickListDialog> = this._dialogService.open(dialogType, dialogConfig);

        // Listen for removeSelectedListing event.
        dialogRef.componentInstance.removeSelectedListing.subscribe(this.removeSelectedListing.bind(this));
    }


    /**
     * Gets the currently held list data from the server.
     * @return The currently held list data.
     */
    public getListData(): LIST_T[] {
        return this.listData;
    }


    /**
     * Gets the selected listing.
     * @return The selected listing data.
     */
    public getSelectedListing(): LIST_T {

        return (this._selectedListIndex != null) ? this.listData[this._selectedListIndex]
                                                : null;
    }


    /**
     * Removes the selected listing.
     */
    public removeSelectedListing(): void {
        this.listData.splice(this._selectedListIndex, 1);
        this._selectedListIndex = null;
    }
}
