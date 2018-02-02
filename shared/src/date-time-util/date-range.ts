import { DateFormatter } from "./date-formatter";
import { deserializable, deepDeserializable, requireDeserializable } from "../deserialization/deserializer";
import { Deserializer } from "../deserialization/deserializer";


export type DateRangeErr = string;


export class DateRangeErrs {
    // Various error codes for a Date Range.
    public static readonly START_DATE_NULL_ERR: DateRangeErr = 'START_DATE_NULL';
    public static readonly END_DATE_NULL_ERR: DateRangeErr = 'END_DATE_NULL';
    public static readonly DATE_ORDER_INCORRECT_ERR: DateRangeErr = 'DATE_ORDER_INCORRECT';
}


/**
 * Encapsulates start and end timestamps representing a time range.
 */
@deserializable('DateRange')
export class DateRange {
    
    private static readonly DATE_FORMATTER: DateFormatter = new DateFormatter();
    

    @deepDeserializable(Date)
    @requireDeserializable()
    private _startTime: Date;

    public get startTime(): Date {
        return this._startTime;
    }
    public set startTime(startTime: Date) {
        // Ensure we are given a valid date!
        this._startTime = isNaN(startTime.valueOf()) ? null
                                                     : startTime;
    }


    @deepDeserializable(Date)
    @requireDeserializable()
    private _endTime: Date;
    
    public get endTime(): Date {
        return this._endTime;
    }
    public set endTime(endTime: Date) {
        // Ensure we are given a valid date!
        this._endTime = isNaN(endTime.valueOf()) ? null
                                                 : endTime;
    }


    public constructor (
        /**
         * The start date of the date range.
         */
        startDate: Date = null,
        /**
         * The end date of the date range.
         */
        endDate: Date = null,
        /**
         * Determines whether or not this Time Range should be considered disabled.
         * Default value is false (for NOT disabled).
         */
        public disabled: boolean = false
    ) {
        // Make sure given dates are of a correct format.
        if (!isNaN(startDate.valueOf()))    this._startTime = startDate;
        if (!isNaN(endDate.valueOf()))      this._endTime = endDate;
    }


    /**
     * Checks specifically for empty field errors.
     * @return The error code if an empty field error exists, or null if none exists.
     */
    public checkForEmptyErr(): DateRangeErr {

        if (this._startTime == null)    return DateRangeErrs.START_DATE_NULL_ERR;
        if (this._endTime == null)      return DateRangeErrs.END_DATE_NULL_ERR;

        return null; // No error present.
    }


    /**
     * Checks specifically for ordering errors.
     * @param allowEqual Set to true if equal start and end times are allowed. Default is false for equality NOT allowed.
     * @return The error code if an ordering error exists, or null if none exists.
     */
    public checkForOrderErr(allowEqual: boolean = false): DateRangeErr {

        const timeMsDifference: number = ( this.startTime.valueOf() - this.endTime.valueOf() );
        if (timeMsDifference >= 0 && !( allowEqual && timeMsDifference === 0 )) {
            return DateRangeErrs.DATE_ORDER_INCORRECT_ERR;
        }

        return null; // No error present.
    }


    /**
     * Checks if there are any errors with this date range (such as missing a poriton of it, incorrect formats, or incorrect ordering).
     * @param allowEqual Set to true if equal start and end times are allowed. Default is false for equality NOT allowed.
     * @return The error from TimeRangeErr enum if one is preset. Otherwise, null.
     */
    public checkForErr(allowEqual: boolean = false): DateRangeErr {

        let err: DateRangeErr = this.checkForEmptyErr();
        
        err = ( err == null ) ? this.checkForOrderErr(allowEqual)
                              : null;

        return err;
    }


    /**
     * Checks if there are any errors with this date range. If there are, then an exception is thrown with the corresponding error code.
     * @param allowEqual Set to true if equal start and end times are allowed. Default is false for equality NOT allowed.
     */
    public ifHasErrorThrowException(allowEqual: boolean = false): void {

        const err: DateRangeErr = this.checkForErr(allowEqual);

        if (err != null) {
            throw new Error('Date range has error with code: ' + err);
        }
    }


    /**
     * C-style comparison method for comparing two date ranges (using start times as compare fields).
     * @param lhs The date range on the left hand side of comparison.
     * @param rhs The date range on the right hand side of comparison.
     * @return A negative number if lhs < rhs, 0 if lhs == rhs, and a positive number if lhs > rhs.
     *         NOTE: This number corresponds to the difference in milliseconds between start time of lhs and rhs.
     */
    public static compare(lhs: DateRange, rhs: DateRange): number {
        return ( lhs.startTime.valueOf() - rhs.startTime.valueOf() );
    }
}
