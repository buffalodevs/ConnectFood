import { DateFormatter } from "../common-util/date-formatter";
import { StringManipulation } from "../common-util/string-manipulation";


/**
 * Encapsulates start and end timestamps representing a time range.
 */
export class TimeRange {

    public constructor (
        /**
         * An integer representing the weekday [0, 6] => ['Sunday', 'Saturday'].
         */
        public weekday?: number,
        /**
         * The start time of the time range.
         */
        public startTime?: string,
        /**
         * The end time of the time range.
         */
        public endTime?: string
    ) {}
}
