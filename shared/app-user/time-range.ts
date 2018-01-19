import { DateFormatter } from "../common-util/date-formatter";


/**
 * Encapsulates start and end timestamps representing a time range.
 * NOTE: The times here do not necessarily have meaningful calendar dates. The only meaningful portion of the Date objects are the weekday and time of day.
 */
export class TimeRange {

    public constructor (
        /**
         * The start time of the time range.
         */
        public startTime?: Date,
        /**
         * The end time of the time range.
         */
        public endTime?: Date
    ) {
        const dateFormatter: DateFormatter = new DateFormatter();

        // Ensure that input dates are in-fact dates and not string equivalents, and convert if date strings.
        this.startTime = dateFormatter.ensureIsDate(this.startTime);
        this.endTime = dateFormatter.ensureIsDate(this.endTime);
    }
}
