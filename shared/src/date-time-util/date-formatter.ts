import * as moment from "moment";
import { Validation } from "../validation/validation";
import * as _ from "lodash";


class WallClockTime {

    public constructor (
        public hours?: number,
        public minutes?: number,
        public amOrPm?: string
    ) {}


    /**
     * Gets the wall clock time hours [0, 12] in millitary time hours [0, 23].
     * @return The wall clock time hours in millitary time scale.
     */
    public getMillitaryHours(): number {
        return (this.amOrPm.toUpperCase() === 'AM') ? this.hours + ( (this.hours === 12) ? -12 : 0)
                                                    : this.hours + ( (this.hours === 12) ? 0 : 12 );
    }
}


export class DateFormatter {


    public constructor() {}


    /**
     * Ensures that the input 'Date' object is in fact a date object and not a string representation.
     * This is necessary since TypeScript does not have runtime type checking, and when a date object is put in JSON format,
     * then it is converted into its string equivalent.
     * @param date Object to check if type is date (will be converted to Date if not and is convertable).
     * @return A date object equivalent to the input.
     */
    public ensureIsDate(date: Date): Date {
        
        if (!_.isDate(date)) {
            date = new Date(date);
        }
        return date;
    }


    /**
     * Gets the string format (MM/DD/YYYY) of a given date.
     * @param date The date to get the string format of.
     * @return The string format of the input date.
     */
    public dateToMonthDayYearString(date: Date): string {

        if (date != null) {
            // Check to see if we are in fact passed a Date object (may have been stringified in JSON response)!
            date = this.ensureIsDate(date);

            return ( (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear() );
        }

        return '';
    }


    /**
     * Gets the wall clock time string (hh:mm ['AM' | 'PM']) for a given date.
     * @param date The date to get the wall clock time string from.
     * @param discardSeconds Set to false if seconds should be included. Default is true for discard seconds.
     * @return The wall clock time string for the given date.
     */
    public dateToWallClockString(date: Date, discardSeconds: boolean = true): string {

        let wallClockString: string = null;

        if (date != null) {
            
            // Check to see if we are in fact passed a Date object (may have been stringified in JSON response)!
            date = this.ensureIsDate(date);

            const stringFormatConfig: Intl.DateTimeFormatOptions = discardSeconds ? { hour: '2-digit', minute: '2-digit' }
                                                                                  : { hour: '2-digit', minute: '2-digit', second: '2-digit' };

            wallClockString = date.toLocaleTimeString([], stringFormatConfig).replace('M', 'm');
        }

        return wallClockString;
    }


    /**
     * Gets the wall clock hours [1, 12] from a given date.
     * @param date The date to get the wall clock hours from.
     * @return The wall clock hours from the given date.
     */
    public getWallClockHours(date: Date): number {

        if (date != null) {

            date = this.ensureIsDate(date);

            const millitaryHours: number = date.getHours();
            return (millitaryHours > 12) ? (millitaryHours - 12)
                                         : millitaryHours;
        }

        return null;
    }


    /**
     * Determines whether or not the date has AM or PM wall clock time.
     * @param date The date from which to determine AM or PM from.
     * @return An AM or PM string based on the given date.
     */
    public getWallClockAmOrPm(date: Date): string {

        if (date != null) {

            date = this.ensureIsDate(date);

            return (date.getHours() > 12) ? 'PM'
                                          : 'AM';
        }

        return '';
    }


    /**
     * Sets the wall clock time for a given date based on a given wall clock time string (hh:mm ['AM' | 'PM']).
     * @param date The date to set the time of.
     * @param time The time string of format: /^([1-9]|1[0-2]):[0-5]\d(\s?)[AaPp][Mm]$/.
     * @return The input date with its time set. If an invalid time string is provided, then null is returned!
     */
    public setWallClockTimeForDate(date: Date, time: string): Date {

        if (!this.isWallClockFormat(time))  return null;

        let timeDate: Date = new Date(date.valueOf());
        let wallClockTime: WallClockTime = this.parseWallClockTime(time);

        timeDate.setHours(wallClockTime.getMillitaryHours(), wallClockTime.minutes, 0, 0);        
        return timeDate;
    }


    /**
     * Checks if a given string is in a proper wall clock format: /^([1-9]|1[0-2]):[0-5]\d(\s?)[AaPp][Mm]$/
     */
    public isWallClockFormat(time: string): boolean {
        const validation: Validation = new Validation();
        return (validation.TIME_REGEX).test(time);
    }


    /**
     * Compares ordering of wall-clock time strings with format: /^([1-9]|1[0-2]):[0-5]\d(\s?)[AaPp][Mm]$/
     * NOTE: This is like the C-style string compare function. See that for more details.
     * @param lhsTime The left-hand-side argument of the comparison.
     * @param rhsTime The right-hand-side argument of the comparison.
     * @return If both strings are valid times, then a negative number if lhsTime < rhsTime, 0 if lhsTime == rhsTime, and a positive number if lhsTime > rhsTime.
     *         If either of the input strings are invalid, then null is returned.
     */
    public wallClockTimeCompare(lhsTime: string, rhsTime: string): number {

        const nowDate = new Date();

        // Transform times into dates with date set to today so we can easily compare them.
        const lhsDate: Date = this.setWallClockTimeForDate(nowDate, lhsTime); 
        const rhsDate: Date = this.setWallClockTimeForDate(nowDate, rhsTime);

        return ( lhsDate != null && rhsDate != null ) ? ( lhsDate.valueOf() - rhsDate.valueOf() )
                                                      : null;
    }


    /**
     * Parses and extracts wall clock time data from a given correctly formatted wall clock time string.
     * @param time The time string to extract the wall clock time information from.
     * @return The wall clock time data.
     */
    private parseWallClockTime(time: string): WallClockTime {

        let hoursMinuntesSplit: string[] = time.split(':');
        let wallClockTime: WallClockTime = new WallClockTime();

        wallClockTime.hours =  Number.parseInt(hoursMinuntesSplit[0]);
        wallClockTime.minutes = Number.parseInt(hoursMinuntesSplit[1].substr(0, 2));
        wallClockTime.amOrPm = time.substr(time.length - 2).toUpperCase();

        return wallClockTime;
    }


    /**
     * Combination of dateToMonthDayYearString() and dateToWallClockString() methods (MM/DD/YYYY hh:mm ['AM' | 'PM']). See them for more details.
     * @param date The date to convert to the string format.
     * @return The string format for the date.
     */
    public dateToDateTimeString(date: Date): string {

        if (date != null) {
            // Check to see if we are in fact passed a Date object (may have been stringified in JSON response)!
            date = this.ensureIsDate(date);

            return ( this.dateToMonthDayYearString(date) + ' ' + this.dateToWallClockString(date) );
        }

        return '';
    }


    /**
     * Gets the date corresponding to the first day (Sunday) of the current week.
     * @return The date of the first day of the current week.
     */
    public getDateOfWeekStart(): Date {

        return moment().add(1, 'days').startOf('isoWeek').subtract(1, 'days').toDate();
    }


    /**
     * Converts an integer day of the week to a string day of the week.
     * @param weekdayInt The integer in range [0, 6] representing a day of the week [Sunday, Saturday] accordingly.
     * @return The proper noun string representation of the day of the week.
     */
    public covertWeekdayIntToString(weekdayInt: number): string {

        switch (weekdayInt) {
            case 0:     return 'Sunday';
            case 1:     return 'Monday';
            case 2:     return 'Tuesday';
            case 3:     return 'Wednesday';
            case 4:     return 'Thursday';
            case 5:     return 'Friday';
            case 6:     return 'Saturday';
            default:    throw new Error('Weekday int must be in range [0, 6], but this int was provided: ' + weekdayInt);
        }
    }


    /**
     * See convertWeekdayIntToString for more details. This is simply the reverse operation (but case insensitive).
     * @param weekdayString The string version of the day of the week (case insensitve).
     * @return The number representing the day of the week.
     */
    public convertWeekdayStringToInt(weekdayString: string): number {

        switch (weekdayString.toLowerCase()) {
            case 'sunday':      return 0;
            case 'monday':      return 1;
            case 'tuesday':     return 2;
            case 'wednesday':   return 3;
            case 'thursday':    return 4;
            case 'friday':      return 5;
            case 'saturday':    return 6;
            default:            throw new Error('Weekday string must be a valid day of the week, but this string was provided: ' + weekdayString);
        }
    }


    /**
     * Generates a date object from a given weekday and time. The generated Date object will be set on this weeks date for the given weekday. Time will be preserved.
     * @param weekday The weekday index (where [0, 6] = [Sunday, Saturday]).
     *                NOTE: An index of 7 may be provided b/c of overflow when converting from
     *                      local time to UTC time upon first receiving weekday times (see weekdayTimeRangesToUTC).
     * @param time The time to set for the generated date. Must be in wall clock time format: /^([1-9]|1[0-2]):[0-5]\d(\s?)[AaPp][Mm]$/ OR '12:00 AM' to '11:59 PM'.
     * @return The generated date object.
     *         NOTE: If the time is not in correct format, then null is returned.
     */
    public genDateFromWeekdayAndTime(weekday: number, time: string, ): Date {

        let date: Date = this.setWallClockTimeForDate(new Date(), time);

        return (date != null) ? this.setDateToNearestWeekday(date, weekday)
                              : null;
    }


    /**
     * Sets a given date to the present week's occurence of a given weekday while preserving the time.
     * @param date The date to set.
     * @param weekdayInt An optional weekday integer [0, 6]. If not provided, then the weekday on given date will be used.
     * @return The new date that has been set to the given weekday with time preserved.
     */
    public setDateToNearestWeekday(date: Date, weekday: number = null): Date {

        weekday = (weekday == null) ? date.getDay()
                                    : ( weekday % 7 ); // Use mod to account for weekday overflows generated when previously converting from local time to UTC time.

        // Note: moment.js iso time starts with weekday Monday = 1 to Sunday = 7, but we want Sunday = 0 to Saturday = 6 as our app standard, so subtract 1 from weekday!
        return moment(new Date()).add(1, 'days').startOf('isoWeek').add(weekday - 1, 'days')
                                 .add(date.getHours(), 'hours').add(date.getMinutes(), 'minutes').toDate();
    }


    /**
     * Rounds a given date up to the nearest half hour.
     * @param date The date to round up.
     * @return The rounded date.
     */
    public roundDateUpToNearestHalfHour(date: Date): Date {

        let m: moment.Moment = moment(date);
        const curMinute: number = m.minute();

        m = (curMinute < 30) ? m.add(30 - m.minute(), 'minute')
                             : m.add(60 - m.minute(), 'minute')

        return m.subtract(m.second(), 'second').subtract(m.millisecond(), 'millisecond').toDate();
    }


    /**
     * Checks if a given date is before today.
     * @param date The date to check.
     * @param utcOffsetMins The (optionsal) offset (in minutes) of the time zone that we are to use when comparing the dates.
     *                      Default is this computer's time zone.
     * @return true if the given date is before today, false if not.
     */
    public isDateOnOrBeforeToday(date: Date, utcOffsetMins: number = date.getTimezoneOffset()): boolean {

        // Get the current time in the timezone specified by utcOffsetMins.
        let now: Date = new Date();
        now = moment(now).subtract(now.getTimezoneOffset(), 'minutes').add(utcOffsetMins, 'minutes').toDate();

        // Transition the input comparison date to the correct time zone.
        date = moment(date).subtract(date.getTimezoneOffset(), 'minutes').add(utcOffsetMins, 'minutes').toDate();

        return ( date < now || (date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDay() === now.getDay()) );
    }
}
