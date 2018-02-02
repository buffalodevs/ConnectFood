import * as moment from "moment";

import { DateRange } from "../../../shared/src/date-time-util/date-range";
import { DateFormatter } from "../../../shared/src/date-time-util/date-formatter";


const DATE_FORMATTER: DateFormatter = new DateFormatter();

// The following contain the base date for the availability dates. All availability dates are relative to this date (based on their absolute weekdays).
const BASE_AVAILABILITY_DATE_MONTH: number = 11;
const BASE_AVAILABILITY_DATE_DAY: number = 12;
const BASE_AVAILABILITY_DATE_YEAR: number = 2017;


/**
 * Converts absolute date ranges to (relative) availability date ranges. Basically, sets all contained dates to be offset from a base date of 11/12/2017.
 * To do this, the weekdays of the given absolute dates are extracted, and the absolute dates are transitioned to the weekdays falling immedialtey on/after 11/12/2017.
 * The time data remains the same. By doing this, we can store the weekly availibility dates for each user in a condensed timestamp, and enable them to be easily comparable.
 * NOTE: Since there can be an overflow beyond the week of 11/12/2017 when converting from client's local time to this server's time zone, and an abolute positioned
 *       saturday date is pushed to the nex sunday, the date range span from 11/12/2017 to 11/19/2017.
 * @param absDateRanges The absolute date ranges that are to be converted.
 * @return The (relative) availability date ranges.
 */
export function absToAvailabililityDateRanges(absDateRanges: DateRange[]): DateRange[] {

    let availabilityDateRanges: DateRange[] = [];

    for (let i: number = 0; i < absDateRanges.length; i++) {

        // Ensure our given absolute date ranges have no errors.
        absDateRanges[i].ifHasErrorThrowException();

        // Convert absolute dates to availability dates (relative to week of 11/12/2017).
        let availabilityDateRange: DateRange = new DateRange (
            absDateToAvailabilityDate(absDateRanges[i].startTime),
            absDateToAvailabilityDate(absDateRanges[i].endTime)
        );
        availabilityDateRange = checkForAndFixAvailabilityWeekOverflow(availabilityDateRange);        

        availabilityDateRanges.push(availabilityDateRange);
    }

    return availabilityDateRanges;
}


/**
 * See definition of absToAvailabilityDateRanges for details.
 * @param absDate The absolute date to convert.
 * @return The (relative) availability date.
 */
function absDateToAvailabilityDate(absDate: Date): Date {

    const availabilityDateStr: string = ( '' + BASE_AVAILABILITY_DATE_MONTH + '/' + (BASE_AVAILABILITY_DATE_DAY + absDate.getDay()) + '/' + BASE_AVAILABILITY_DATE_YEAR );
    const absTimeStr: string = DATE_FORMATTER.dateToWallClockString(absDate);
    return new Date(availabilityDateStr + ' ' + absTimeStr);
}


/**
 * Checks for overflow within a given availability date range. Since absolute dates (from the client) are converted to the nearest dates on/after 11/12/2017,
 * and client dates are also converted from local time on client to this server's time zone, there can be an overflow when a date which fell on a
 * Sunday is pushed to a Saturday (vice versa), we must check for this overflow and fix it by ensuring all end dates in generated ranges fall after start dates.
 * @param availabilityDateRange The availability date range to check and potentially fix (if a problem exists).
 * @return The checked (and potentially fixed) availability date ranges.
 */
function checkForAndFixAvailabilityWeekOverflow(availabilityDateRange: DateRange): DateRange {

    let fixedAvailabilityDateRange: DateRange = availabilityDateRange;

    // If there was an overflow, then add 7 days to the end time (keep start time the same).
    if (availabilityDateRange.checkForOrderErr() != null) {

        fixedAvailabilityDateRange = new DateRange (
            availabilityDateRange.startTime,
            moment(availabilityDateRange.endTime).add(7, 'days').toDate()
        );
    }

    return fixedAvailabilityDateRange;
}


/**
 * Converts (relative) availability date ranges to absolutely positioned date ranges that all contain the current time
 * or fall on the closest aligned time after the current time.
 * @param availabilityDateRanges The (relative) availability date ranges that are to be converted.
 * @return The absolute date ranges.
 */
export function availabilityToAbsDateRanges(availabilityDateRanges: DateRange[]): DateRange[] {

    let absDateRanges: DateRange[] = [];

    for (let i: number = 0; i < availabilityDateRanges.length; i++) {

        let absDateRange: DateRange = availabilityToAbsDateRange(availabilityDateRanges[i]);
        absDateRange = ensureDateRangeContainsOrAfterNow(absDateRange);
        absDateRanges.push(absDateRange);
    }

    return absDateRanges.sort(DateRange.compare);
}


/**
 * Converts an availability date range to an absolute positoned date range that falls on the date nearest to today with a weekday that
 * aligns with the availability dates weekday.
 * NOTE: The generated time range will either contain the current time or fall completely after it (it will never fall completely before it).
 * @param availabilityDateRange The availability date range to convert.
 * @return The absolutely positioned date range (positioned around or after the current time), which corresponds with the availability date range input.
 */
function availabilityToAbsDateRange(availabilityDateRange: DateRange): DateRange {

    let absDateRange: DateRange = new DateRange (
        DATE_FORMATTER.setDateToNearestWeekday(availabilityDateRange.startTime),
        DATE_FORMATTER.setDateToNearestWeekday(availabilityDateRange.endTime)
    );

    return ensureDateRangeContainsOrAfterNow(absDateRange);
}


/**
 * Ensures that a given absolutely positioned date range either contains the current time or completely falls after the current time (never completely before).
 * @param absDateRange The absolutely positione date range to check.
 * @return The (possibly) corrected absolutely positioned date range.
 */
function ensureDateRangeContainsOrAfterNow(absDateRange: DateRange): DateRange {

    const now: Date = new Date();
    let retDateRange: DateRange = absDateRange;

    if (absDateRange.endTime <= now) {
        retDateRange = new DateRange (
            moment(absDateRange.startTime).add(7, 'days').toDate(),
            moment(absDateRange.endTime).add(7, 'days').toDate()
        )
    }

    return retDateRange;
}
