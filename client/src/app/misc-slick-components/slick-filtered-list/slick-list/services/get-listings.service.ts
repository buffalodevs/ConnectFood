"use strict";
import { Injectable, Optional } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/map';

import { RequestService } from "../../../../common-util/services/request.service";
import { SlickListFilters } from '../../slick-list-filters/slick-list-filters';
import { GetListingsRequest } from '../slick-list-message/slick-list-request';
import { GetListingsResponse } from '../slick-list-message/slick-list-response';
import { ListingsBuffer } from './listings-buffer';


@Injectable()
export class GetListingsService <LIST_T, FILTERS_T extends SlickListFilters> {
    
    private noMoreListingsToRetrieve: boolean;
    private listingsBuffer: ListingsBuffer <LIST_T, FILTERS_T>;

    private lastRoute: string;
    private lastFilters: FILTERS_T;

    private onGetMoreListingsCallback: () => void;
    private onReceivedMoreListingsCallback: (moreListings: LIST_T[]) => void;

    
    /**
     * @param requestService The Food Web App wrapper around http requests.
     * @param retrievalAmount Optional amount of items to be retrieved at a time. Default is 5.
     */
    public constructor (
        private requestService: RequestService,
        @Optional() private retrievalAmount: number
    ) {
        if (this.retrievalAmount == null)  this.retrievalAmount = 5;
        this.noMoreListingsToRetrieve = false;
        this.listingsBuffer = new ListingsBuffer(requestService);

        this.lastRoute = null;
        this.lastFilters = null;

        // Swallow changes here if no callbacks assigned later.
        this.onGetMoreListingsCallback = () => {};
        this.onReceivedMoreListingsCallback = (moreListings: LIST_T[]) => {};

        // Register our load more listings handler that fires when scrolling near bottom.
        window.onscroll = this.listenForLoadMoreListings.bind(this);
    }


    /**
     * Sets the retrieval amount. This is the number of elements that are retrieved at a time.
     * @param retrievalAmount The new retrieval amount.
     */
    public setRetrievalAmount(retrievalAmount: number): void {
        this.retrievalAmount = retrievalAmount;
    }


    /**
     * Sets the callback function that is notified whenever more liatings are going to be loaded (immediately before contacting server).
     * @param callback The callback function that will be set.
     */
    public onBeforeGetMoreListings(callback: () => void): void {
        this.onGetMoreListingsCallback = callback;
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
        if (this.lastFilters != null && (currentScrollPosition >= loadThresholdPosition)) {

            this.onGetMoreListingsCallback();
            let observer: Observable<LIST_T[]> = this.getListings(this.lastFilters, this.lastRoute, true);
            
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
        this.noMoreListingsToRetrieve = true; // We should not retrieve more listings until current request finished!

        // If we are refreshing (not getting more / appending), then clear the buffer (implicitly sets retrieval offset back to 0).
        if (!getMoreListings) {
            this.listingsBuffer.clearBuffer();
        }

        // Record the last route and filters used so we can make same call to get more listings with current criteria.
        this.lastRoute = route;
        this.lastFilters = filters;

        return this.listingsBuffer.getListings(this.retrievalAmount, route, filters, true)
                   .map(this.handleReceivedListings.bind(this));
    }


    /**
     * Determines whether or not more listings can be retrieved (if we have reached end or not).
     * @return true if more listings are available for retrieval, false if not.
     */
    private canGetMoreListings(): boolean {
        return (!this.noMoreListingsToRetrieve && this.lastFilters != null && this.lastRoute != null);
    }
    
    
    /**
     * Handles the reception of listings data from the listings buffer.
     * @param listData The list data that has been received from the listings buffer.
     * @return The received listings.
     */
    private handleReceivedListings(listData: LIST_T[]): LIST_T[] {
        this.noMoreListingsToRetrieve = ( listData.length === 0 );
        return listData;
    }
}
