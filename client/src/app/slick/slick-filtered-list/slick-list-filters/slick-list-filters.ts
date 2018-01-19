/**
 * Abstract base class for list filters. Contains retrieval range data for selecting only a limited segment of results from the server.
 * The list loads segments of data in a fashion similar to a Facebook news feed (using this data).
 */
export abstract class SlickListFilters {

    protected constructor (
        public retrievalOffset?: number,
        public retrievalAmount?: number
    ) { }
}