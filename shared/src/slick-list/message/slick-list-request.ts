import { SlickListFilters } from "../slick-list-filters/slick-list-filters";


/**
 * Request object used to retrieve list data from the server.
 * Intended to be extended, but also can be used as is.
 */
export interface GetListingsRequest <FILTERS_T extends SlickListFilters> {

    filters: FILTERS_T;
}


/**
 * Request object used to retrieve a single listing from the server.
 */
export interface GetListingRequest {

    listingId: number | string;
}
