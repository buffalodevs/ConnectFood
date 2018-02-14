/**
 * Abstract base class for list filters. Contains retrieval range data for selecting only a limited segment of results from the server.
 * The list loads segments of data in a fashion similar to a Facebook news feed (using this data).
 */
export interface SlickListFilters {

    /**
     * The offset of the first listing to retrieve.
     */
    retrievalOffset: number;
    /**
     * The amount of listings to retrieve.
     */
    retrievalAmount: number;
}
