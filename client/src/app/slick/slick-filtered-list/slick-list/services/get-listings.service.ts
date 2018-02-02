"use strict";
import { Injectable, Optional } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/map';

import { ListingsBuffer } from './listings-buffer';
import { RequestService } from "../../../../common-util/services/request.service";

import { SlickListFilters } from '../../../../../../../shared/src/slick-list/slick-list-filters/slick-list-filters';
import { GetListingsRequest } from '../../../../../../../shared/src/slick-list/message/slick-list-request';
import { GetListingsResponse } from '../../../../../../../shared/src/slick-list/message/slick-list-response';


@Injectable()
export class GetListingsService <LIST_T, FILTERS_T extends SlickListFilters> {
    
    private _retrievalAmount: number;
    private _noMoreListingsToRetrieve: boolean;
    private _listingsBuffer: ListingsBuffer <LIST_T, FILTERS_T>;

    private _previousRoute: string;
    private _previousFilters: FILTERS_T;

    private onBeforeGetMoreListingsCallback: () => void;
    private onReceivedMoreListingsCallback: (moreListings: LIST_T[]) => void;

    
    /**
     * @param _requestService The Food Web App wrapper around http requests.
     */
    public constructor (
        private _requestService: RequestService
    ) {
        this._retrievalAmount = 5;
        this._noMoreListingsToRetrieve = false;
        this._listingsBuffer = new ListingsBuffer(_requestService);

        this._previousRoute = null;
        this._previousFilters = null;

        // Swallow changes here if no callbacks assigned later.
        this.onBeforeGetMoreListingsCallback = () => {};
        this.onReceivedMoreListingsCallback = (moreListings: LIST_T[]) => {};

        // Register our load more listings handler that fires when scrolling near bottom.
        window.onscroll = this.listenForLoadMoreListings.bind(this);
    }


    /**
     * Sets the retrieval amount. This is the number of elements that are retrieved at a time.
     * @param retrievalAmount The new retrieval amount.
     */
    public setRetrievalAmount(retrievalAmount: number): void {
        this._retrievalAmount = retrievalAmount;
    }


    /**
     * Sets the callback function that is notified whenever more liatings are going to be loaded (immediately before contacting server).
     * @param callback The callback function that will be set.
     */
    public onBeforeGetMoreListings(callback: () => void): void {
        this.onBeforeGetMoreListingsCallback = callback;
    }


    /**
     * Sets the callback function that is notified when more listings have been received due to scrolling webpage near to bottom.
     * @param callback The callback function that will be set.
     */
    public onAfterGetMoreListings(callback: (moreListings: LIST_T[]) => void): void {
        this.onReceivedMoreListingsCallback = callback;
    }


    /**
     * Listens for the user to scroll the listings near the bottom and then loads more listings.
     */
    private listenForLoadMoreListings(): void {

        // Break out immediately if we cannot get any more liistings right now.
        if (!this.canGetMoreListings())  return;

        // Get the current bottom scroll position and the threshold for loading more.
        const currentScrollPosition: number = ( window.scrollY + window.innerHeight );
        const documentHeight: number = Math.max( document.body.scrollHeight, document.body.offsetHeight, document.documentElement.clientHeight,
                                                 document.documentElement.scrollHeight, document.documentElement.offsetHeight );
        const loadThresholdPosition: number = ( documentHeight - 100 );

        // If we are near the bottom of the page, then load more listings!
        if (this._previousFilters != null && (currentScrollPosition >= loadThresholdPosition)) {

            this.onBeforeGetMoreListingsCallback();
            let observer: Observable<LIST_T[]> = this.getListings(this._previousFilters, this._previousRoute, true);
            
            // Notify listening component that more listings have been received (should be concatenated to held ones)!
            observer.subscribe((listData: LIST_T[]) => {
                this.onReceivedMoreListingsCallback(listData)   
            });
        }
    }


    /**
     * Retrieves listings based off of optional filter criteria.
     * @param filters The filter criteria for selecting list data from the server.
     * @param route The route for selecting list data from the server.
     * @param getMoreListings Set to true if the server should get more listings to be diplayed, otherwise, it will get listings to replace
     *                        the current ones with (will start back at 0 retrieval offset).
     * @return An observable object that resolves to the list data response from the server (Empty if an error occured or no listings are available).
     */
    public getListings(filters: FILTERS_T, route: string, getMoreListings: boolean = false): Observable <LIST_T[]> {

        // Break out immediately if we are attempting to get more listings but have reached end!
        if (getMoreListings && !this.canGetMoreListings())  return;
        this._noMoreListingsToRetrieve = true; // We should not retrieve more listings until current request finished!

        // If we are refreshing (not getting more / appending), then clear the buffer (implicitly sets retrieval offset back to 0).
        if (!getMoreListings) {
            this._listingsBuffer.clearBuffer();
        }

        // Record the last route and filters used so we can make same call to get more listings with current criteria.
        this._previousRoute = route;
        this._previousFilters = filters;

        return this._listingsBuffer.getListings(this._retrievalAmount, route, filters, true)
                   .map(this.handleReceivedListings.bind(this));
    }


    /**
     * Determines whether or not more listings can be retrieved (if we have reached end or not).
     * @return true if more listings are available for retrieval, false if not.
     */
    private canGetMoreListings(): boolean {
        return (!this._noMoreListingsToRetrieve && this._previousFilters != null && this._previousRoute != null);
    }
    
    
    /**
     * Handles the reception of listings data from the listings buffer.
     * @param listData The list data that has been received from the listings buffer.
     * @return The received listings.
     */
    private handleReceivedListings(listData: LIST_T[]): LIST_T[] {
        this._noMoreListingsToRetrieve = ( listData.length === 0 );
        return listData;
    }


    /**
     * Gets the filters used in the most recent (previous) getListings call.
     * @return The previous filters.
     */
    public getPreviousFilters(): FILTERS_T {
        return this._previousFilters;
    }
}
