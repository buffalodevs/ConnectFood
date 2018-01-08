import { Observable } from "rxjs/Observable";
import { Observer } from "rxjs/Observer";
import { Subscription } from "rxjs/Subscription";

import { GetListingsRequest } from "../slick-list-message/slick-list-request";
import { SlickListFilters } from "../../slick-list-filters/slick-list-filters";
import { RequestService } from "../../../../common-util/services/request.service";
import { GetListingsResponse } from "../slick-list-message/slick-list-response";


/**
 * A buffer for incrementally retrieving listings of any type from the server using filters of any type.
 * When listings are retrieved, this will hold extra listings for later display upon trigger.
 * This allows a smoother UI experience due to a lack of noticable lag when another increment of listings are to be displayed.
 */
export class ListingsBuffer <LIST_T, FILTERS_T extends SlickListFilters> {

    private buffer: LIST_T[];
    private bufferStartOffset: number;
    private endOfListingsOnServer: boolean;
    private currentServerQuerySubscription: Subscription;


    public constructor (
        private requestService: RequestService,
        /**
         * The size of the buffer. The buffer will always attempt to fill itself to this capacity with listings from the server. Default is 5.
         */
        private bufferCapacity: number = 5
    ) {
        this.clearBuffer();
    }


    /**
     * Clears out the buffer and cancels any current server query subscritions.
     */
    public clearBuffer(): void {

        this.buffer = [];
        this.bufferStartOffset = 0;
        this.endOfListingsOnServer = false;

        // Make sure we dispose of any current subscription (so we don't fill buffer with old subscription after refresh)!
        if (this.currentServerQuerySubscription != null) {
            this.currentServerQuerySubscription.unsubscribe();
            this.currentServerQuerySubscription = null;
        }
    }


    /**
     * Gets the buffer start offset (offset from 0 of first listing in buffer).
     * @return the buffer start offset.
     */
    public getBufferStartOffset(): number {
        return this.bufferStartOffset;
    }


    /**
     * Determines if we have more listings to retrieve (either from the buffer or the server).
     * @return true if more listings are available, false if not.
     */
    public hasMoreListings(): boolean {
        return ( this.buffer.length > 0 || !this.endOfListingsOnServer );
    }


    /**
     * Gets listings from the buffer. If the buffer does not hold any listings, then queries the server for the listings.
     * @param retrievalAmount The amount of listings to retrieve.
     * @param route The route (relative url) of the server route handler for retrieving more listings.
     * @param filters The filters used for listings retrieval.
     * @param returnAvailableImmediately Determines whether or not to return any buffered listings immediately even if they do not surmount to retrievalAmount.
     *                                   In other words, treats retrievalAmount more like a max retrieval amount rather than a strict amount.
     * @return An observable which resolves to the retrieved listings.
     */
    public getListings(retrievalAmount: number, route: string, filters: FILTERS_T, returnAvailableImmedialtey: boolean = false): Observable <LIST_T[]> {

        return Observable.create((observer: Observer <LIST_T[]>) => {

            const haveEnoughInBuffer: boolean = ( returnAvailableImmedialtey && this.buffer.length !== 0 ) || this.buffer.length === retrievalAmount;

            // If we have listings in the buffer, then we can immediately pull from buffer and query server in background to refill buffer.
            if (haveEnoughInBuffer) {
                this.getListingsFromBuffer(observer, retrievalAmount, route, filters);
            }
            // If we do not have (enough) listings in the buffer, but we have more on the server.
            else if (!this.endOfListingsOnServer) {
                this.getListingsFromServer(observer, retrievalAmount, route, filters);
            }
            // There are no more buffered listings or listings on the server, so return empty list in observable.
            else {
                observer.next([]);
            }

        });
    }


    /**
     * Gets a given increment of listings from the server at a given route using a set of given filters.
     * This shall be called only when we have no listings in the contained listings buffer.
     * @param observer An observer that is waiting for listings to be retrieved from the server. Will be notified when listings are available.
     * @param retrievalAmount The amount of listings to retrieve.
     * @param route The route on the server that listings are queried from.
     * @param filters The filters used when querying listings.
     */
    private getListingsFromServer(observer: Observer <LIST_T[]>, retrievalAmount: number, route: string, filters: FILTERS_T): void {

        // If we are not currently querying the server for data to load into the buffer, then start server query.
        if (this.currentServerQuerySubscription == null) {
            const totalRefillRetrievalAmount: number = ( retrievalAmount + this.bufferCapacity - this.buffer.length );
            this.currentServerQuerySubscription = this.sendMessageToServerForBufferRefill(this.bufferStartOffset, totalRefillRetrievalAmount, route, filters);
        }

        // Wait for the current server query to complete to grab retrieved listings from the cache.
        this.currentServerQuerySubscription.add(() => {

            // If we could not pull back any more lisings, then return empty list
            if (this.buffer.length === 0) {
                
                observer.next([]);
                observer.complete();
            }
            // Else we pulled back more listings from the server, so get them from the buffer.
            else {
                this.getListingsFromBuffer(observer, retrievalAmount, route, filters);
            }
        });
    }


    /**
     * Gets listings held the contained listings buffer. Also, refills the buffer after listings are retrieved from it.
     * @param observer An observer that is waiting for listings to be retrieved from the buffer. Will be notified when listings are available.
     * @param retrievalAmount The amount of listings to retrieve.
     * @param route The route on the server that listings are refilled from.
     * @param filters The filters used when refilling listings.
     */
    private getListingsFromBuffer(observer: Observer <LIST_T[]>, retrievalAmount: number, route: string, filters: FILTERS_T): void {

        // Take data from contained listings buffer and push it out to subscriber.
        observer.next(this.buffer.splice(0, retrievalAmount));
        this.bufferStartOffset += retrievalAmount;
        observer.complete();

        // (Re)fill buffer to full capacity if necessary and listings remain on server.
        if (this.shouldRefillBuffer()) {
            this.refillRemainingBufferCapacity(route, filters);
        }
    }


    /**
     * Determines whether or not the buffer should be (re)filled to capacity.
     * @return true if it should, false if not.
     */
    private shouldRefillBuffer(): boolean {
        return ( this.buffer.length < this.bufferCapacity && !this.endOfListingsOnServer && this.currentServerQuerySubscription == null );
    }


    /**
     * (Re)fills the remaining space in the buffer so that it is filled to capacity.
     * @param route The route (relative url) to contact the server at for the refill.
     * @param filters The filters to use when querying refill listings data.
     */
    private refillRemainingBufferCapacity(route: string, filters: FILTERS_T): void {

        // Set segment offset and amount (size) information for the refill.
        const bufferRefillOffset: number = ( this.bufferStartOffset + this.buffer.length );
        const bufferRefillAmount: number = ( this.bufferCapacity - this.buffer.length );

        this.currentServerQuerySubscription = this.sendMessageToServerForBufferRefill(bufferRefillOffset, bufferRefillAmount, route, filters);
    }


    /**
     * Gets a given increment of listings from the server at a given route using a set of given filters.
     * @param retrievalOffset The offset or beginning of the listings increment to retrieve.
     * @param retrievalAmount The amount of listings to retrieve.
     * @param route The route on the server that listings are queried from.
     * @param filters The filters used when querying listings.
     * @return A subscription on the server query observable that is used internally.
     */
    private sendMessageToServerForBufferRefill(retrievalOffset: number, retrievalAmount: number, route: string, filters: FILTERS_T): Subscription {

        const request: GetListingsRequest <FILTERS_T> = new GetListingsRequest <FILTERS_T>(filters);

        // Set our retrieval range information for the server to filter by.
        filters.retrievalOffset = retrievalOffset;
        filters.retrievalAmount = retrievalAmount;

        return this.requestService.post(route, request).subscribe(this.fillBufferFromServerResponse.bind(this, retrievalAmount, route, filters));
    }


    /**
     * Maps the response from the server to contained listings buffer.
     * @param retrievalAmount The amount of listings that should have been retrieved from the server (may receive less if running out).
     * @param route The route on which to contact the server for listings.
     * @param fitlers The filters used when querying listings.
     * @param getListingsResponse The response from the server, which on success contains the expected list of data.
     */
    private fillBufferFromServerResponse(retrievalAmount: number, route: string, filters: FILTERS_T, getListingsResponse: GetListingsResponse <LIST_T>): void {

        console.log(getListingsResponse.message);
        console.log('Got ' + getListingsResponse.listData.length + ' listings out of retrieval amount: ' + retrievalAmount);

        // Record if we have reached end of listings on server with given set of filters (didn't get all requested listings from server).
        this.endOfListingsOnServer = ( getListingsResponse.listData.length < retrievalAmount );

        // Append refill listings to buffer.
        this.buffer = this.buffer.concat(getListingsResponse.listData);

        // Dispose of and reset the subscrition so server can be contacted again.
        this.currentServerQuerySubscription.unsubscribe();
        this.currentServerQuerySubscription = null;

        // If buffer is still not full (due to buffer being emptied while server is being queried for refill), then attempt to fill it.
        if (this.shouldRefillBuffer()) {
            this.refillRemainingBufferCapacity(route, filters);
        }
    }
}
