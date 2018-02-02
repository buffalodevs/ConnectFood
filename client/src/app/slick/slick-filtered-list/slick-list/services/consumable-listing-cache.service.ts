import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/map';

import { ConsumableListingCache } from './consumable-listing-cache';
import { RequestService } from '../../../../common-util/services/request.service';

import { GetListingResponse } from '../../../../../../../shared/src/slick-list/message/slick-list-response';
import { FoodWebResponse } from '../../../../../../../shared/src/message-protocol/food-web-response';


@Injectable()
export class ConsumableListingCacheService <LIST_T> {

    private _consumableListingCache: ConsumableListingCache <LIST_T>


    public constructor (
        private _requestService: RequestService
    ) {}


    /**
     * Sets the cached listing (which may be consumed exactly one time).
     * @param listing The listing to set.
     * @param listingId The ID of the listing to set.
     */
    public setCachedListing(listing: LIST_T, listingId: number | string): void {
        this._consumableListingCache.setListing(listing, listingId);
    }

    
    /**
     * Gets a listing identified by given listingId.
     * If there is a cached listing that has not yet been consumed, then it is retrieved from held cache.
     * Else, the server must be contacted for the listing.
     * @param url The relative url (route) that should be used if the server must be queried for the listing.
     * @param listingId The ID of the listing to get.
     * @return An observable that resolves to the gotten listing.
     */
    private getListing(url: string, listingId: number | string): Observable <LIST_T> {

        // Consume last set cached listing (if empty or ID does not match, then null is set here). 
        const consumedListing: LIST_T = this._consumableListingCache.consumeListing(listingId);

        // If cache was a hit, then return. Else, must query server for the listing on cache miss.
        return (consumedListing != null) ? Observable.of(consumedListing)
                                         : this.getListingFromServer(url);
    }


    /**
     * Gets the required listing from the server.
     * @param url The relative url (route) that should be be used when querying the server.
     * @return An observable that resolves to the gotten listing.
     */
    private getListingFromServer(url: string): Observable <LIST_T> {

        return this._requestService.post(url, null)
            .map((response: FoodWebResponse) => {
                
                console.log(response.message);

                if (!response.success) {
                    alert('An unexpected error occured with message: ' + response.message);
                }

                return (<any>response).listing;
            });
    }
}