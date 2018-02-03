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
 * Converts (relative) availability date ranges to absolutely positioned date ranges whose start and end time members fall on the same weekdays as the availaiblity date range
 * start and end time members. Also, the resulting time ranges will either contain the current time or fall on the closest aligned time after the current time.
 * @param availabilityDateRanges The (relative) availability date ranges that are to be converted.
 * @param utcOffsetMins The offset (minutes) of the client's time zone form UTC time zone.
 * @return The absolute date ranges.
 */
export function availabilityToAbsDateRanges(availabilityDateRanges: DateRange[], utcOffsetMins: number): DateRange[] {

    let absDateRanges: DateRange[] = [];

    for (let i: number = 0; i < availabilityDateRanges.length; i++) {

        const genAbsDateRanges: DateRange[] = availabilityToAbsDateRange(availabilityDateRanges[i], utcOffsetMins);
        absDateRanges = absDateRanges.concat(genAbsDateRanges);
    }

    return absDateRanges.sort(DateRange.compare);
}


/**
 * Converts an availability date range to absolute positoned date range(s) that falls on the date nearest to today with a weekday that
 * aligns with the availability dates weekday. Can generate up to 2 date ranges if the current time falls within a given availability range (will be split between
 * range portion that falls immediately after current time and the portion that falls before offset by one week).
 * @param availabilityDateRange The availability date range to convert.
 * @param utcOffsetMins The offset (minutes) of the client's time zone form UTC time zone.
 * @return The absolutely positioned date range(s) which corresponds with the availability date range input. The date ranges returned are garunteed to fall after the
 *         current time.
 */
function availabilityToAbsDateRange(availabilityDateRange: DateRange, utcOffsetMins): DateRange[] {

    let absDateRange: DateRange = new DateRange (
        DATE_FORMATTER.setDateToNearestWeekday(availabilityDateRange.startTime),
        DATE_FORMATTER.setDateToNearestWeekday(availabilityDateRange.endTime)
    );

    return ensureDateRangeContainsOrAfterNow(absDateRange, utcOffsetMins);
}


/**
 * Ensures that a given absolutely positioned date range falls after the current time. If a portion of it or all of it falls before the current time,
 * then either the portion that falls before or the whole range that falls before is shifted to the next week.
 * @param absDateRange The absolutely positione date range to check.
 * @param utcOffsetMins The offset (minutes) of the client's time zone form UTC time zone.
 * @return An array containing the date range corrections. If no corrections were made, then it simply contains the input date range.
 */
function ensureDateRangeContainsOrAfterNow(absDateRange: DateRange, utcOffsetMins: number): DateRange[] {

    const now: Date = new Date();
    let retDateRanges: DateRange[] = [];
    
    // If the absolute date range falls at least paritally after the current time, then take portion of range that falls on or after current time.
    if (absDateRange.endTime > now) {

        // Generate Date range that falls completely after now (without offsetting it by one week).
        const startTimeAfterNow: Date = (absDateRange.startTime > now) ? absDateRange.startTime
                                                                       : DATE_FORMATTER.roundDateUpToNearestHalfHour(absDateRange.startTime);
        const dateRangeAfterNow: DateRange = new DateRange(startTimeAfterNow, absDateRange.endTime);

        retDateRanges.push(dateRangeAfterNow);
    }

    // If the absolute date range falls partially on the current day, then we will generate the date range for next week as well.
    if (DATE_FORMATTER.isDateOnOrBeforeToday(absDateRange.startTime, utcOffsetMins)) {

        const offsetDateRange: DateRange = new DateRange (
            moment(absDateRange.startTime).add(7, 'days').toDate(),
            moment(absDateRange.endTime).add(7, 'days').toDate()
        );

        retDateRanges.push(offsetDateRange);
    }

    return retDateRanges;
}
