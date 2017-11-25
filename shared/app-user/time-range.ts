import { DateFormatter } from "../common-util/date-formatter";


/**
 * Encapsulates start and end timestamps representing a time range.
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
        // Ensure that we are given actual date objects and not date string equivalents, and convert strings to objects if possible.
        if (startTime != null)  this.startTime = DateFormatter.ensureIsDate(startTime);
        if (endTime != null)    this.endTime = DateFormatter.ensureIsDate(endTime);
    }


    /**
     * Converts a date format time range to a string format time range.
     * @param timeRange The time range containing startTime and endTime as dates.
     * @return The string format time range.
     */
    public static toTimeRangeStr(timeRange: TimeRange): TimeRangeStr {

        let timeRangeStr: TimeRangeStr = new TimeRangeStr();

        timeRangeStr.startTime = DateFormatter.dateToDateTimeString(timeRange.startTime);
        timeRangeStr.endTime = DateFormatter.dateToDateTimeString(timeRange.endTime);

        return timeRangeStr;
    }
}


/**
 * String version of Time Range. See TimeRange for more details.
 */
export class TimeRangeStr {
    
    public constructor (
        public startTime?: string,
        public endTime?: string
    ) { }


    /**
     * Converts a string format time range to a date format time range.
     * @param timeRangeStr The time range containing startTime and endTime as strings.
     * @return The date format time range.
     */
    public static toTimeRange(timeRangeStr: TimeRangeStr): TimeRange {

        let timeRange: TimeRange = new TimeRange();

        timeRange.startTime = new Date(timeRangeStr.startTime);
        timeRange.endTime = new Date(timeRangeStr.endTime);

        return timeRange;
    }
}
