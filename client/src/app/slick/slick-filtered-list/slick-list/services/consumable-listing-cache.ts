/**
 * A cache that holds only one listing value (and associated ID).
 * The cache can only be hit once before its value is cleared (consumed).
 */
export class ConsumableListingCache <LIST_T> {

    public constructor (
        private listing?: LIST_T,
        private listingId?: number | string
    ) {}


    /**
     * Sets a new consumable cached listing, clearing out any old value.
     * @param listing The new listing to set.
     * @param listingId The ID of the new listing to set.
     */
    public setListing(listing: LIST_T, listingId: number | string): void {
        this.listing = listing;
        this.listingId = listingId;
    }


    /**
     * Consumes the cached listing. This entails Grabbing its value once and clearing saved value so it cannot be grabbed again.
     * The chached listing's ID must match the given listingId to be grabbed. Otherwise, null is returned.
     * NOTE: Regardless of listingId match (or lack of), the cache will be cleared.
     * @param listingId The ID of the listing that should be grabbed.
     * @return If the given listingId matches the cached listing's ID, then the listing is returned.
     *         Else if there is no match, then null is returned. Either way, the cache is cleared.
     */
    public consumeListing(listingId: number | string): LIST_T {

        // Grab the listing if its ID matches the given ID, else grab null for return.
        const listing: LIST_T = (this.listingId === listingId) ? this.listing
                                                               : null;
        
        // Clear out the cached value.
        this.listing = null;
        this.listingId = null;

        return listing;
    }
}