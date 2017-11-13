import { DateFormatter } from "../common-util/date-formatter";


/**
 * Encapsulates start and end timestamps representing a time range.
 */
export class TimeRange {

    public constructor (
        /**
         * The start time of the time range.
         */
        public startTime: Date,
        /**
         * The end time of the time range.
         */
        public endTime: Date
    ) {
        // Ensure that we are given actual date objects and not date string equivalents, and convert strings to objects if possible.
        this.startTime = DateFormatter.ensureIsDate(startTime);
        this.endTime = DateFormatter.ensureIsDate(endTime);
    }
}
