export class DateFormatter {

    // All timestamps for weekdays are based on date 11/12/2017 (Sunday).
    private static readonly REF_DATE_MONTH: number = 11;
    private static readonly REF_DATE_DAY: number = 12;
    private static readonly REF_DATE_YEAR: number = 2017;


    // Pure static class!
    private constructor() {}


    /**
     * Ensures that the input 'Date' object is in fact a date object and not a string representation.
     * This is necessary since TypeScript does not have runtime type checking, and when a date object is put in JSON format,
     * then it is converted into its string equivalent.
     * @param date Object to check if type is date (will be converted to Date if not and is convertable).
     * @return A date object equivalent to the input.
     */
    public static ensureIsDate(date: Date): Date {
        if (!(date instanceof Date))  date = new Date(date);
        return date;
    }


    /**
     * Gets the string format (MM/DD/YYYY) of a given date.
     * @param date The date to get the string format of.
     * @return The string format of the input date.
     */
    public static dateToMonthDayYearString(date: Date): string {

        if (date != null) {
            // Check to see if we are in fact passed a Date object (may have been stringified in JSON response)!
            date = DateFormatter.ensureIsDate(date);

            return ( (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear() );
        }

        return '';
    }


    /**
     * Gets the wall clock time string (hh:mm ['AM' | 'PM']) for a given date.
     * @param date The date to get the wall clock time string from.
     * @return The wall clock time string for the given date.
     */
    public static dateToWallClockString(date: Date): string {

        if (date != null) {
            // Check to see if we are in fact passed a Date object (may have been stringified in JSON response)!
            date = DateFormatter.ensureIsDate(date);

            return ( DateFormatter.getWallClockHours(date) + ':' + date.getMinutes() + ' ' + DateFormatter.getWallClockAmOrPm(date) );
        }

        return '';
    }


    /**
     * Gets the wall clock hours [1, 12] from a given date.
     * @param date The date to get the wall clock hours from.
     * @return The wall clock hours from the given date.
     */
    public static getWallClockHours(date: Date): number {

        if (date != null) {

            date = DateFormatter.ensureIsDate(date);

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
    public static getWallClockAmOrPm(date: Date): string {

        if (date != null) {

            date = DateFormatter.ensureIsDate(date);

            return (date.getHours() > 12) ? 'PM'
                                        : 'AM';
        }

        return '';
    }


    /**
     * Combination of dateToMonthDayYearString() and dateToWallClockString() methods (MM/DD/YYYY hh:mm ['AM' | 'PM']). See them for more details.
     * @param date The date to convert to the string format.
     * @return The string format for the date.
     */
    public static dateToMonthDayYearWallClickString(date: Date): string {

        if (date != null) {
            // Check to see if we are in fact passed a Date object (may have been stringified in JSON response)!
            date = DateFormatter.ensureIsDate(date);

            return ( DateFormatter.dateToMonthDayYearString(date) + ' ' + DateFormatter.dateToWallClockString(date) );
        }

        return '';
    }


    /**
     * Converts an integer day of the week to a string day of the week.
     * @param weekdayInt The integer in range [0, 6] representing a day of the week [Sunday, Saturday] accordingly.
     * @return The proper noun string representation of the day of the week.
     */
    public static covertWeekdayIntToString(weekdayInt: number): string {

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
    public static convertWeekdayStringToInt(weekdayString: string): number {

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
     * Converts a weekday time to a standard Date timestamp that is placed within the week of 11/12/2017.
     * This is done for compactness of the time representation, easy comparison, and efficient storage.
     * @param weekday The day of the week in string format (case insensitive).
     * @param time The time in string format. Will be wall clock time with AM or PM after the time.
     * @return The compact Date timestamp version of the weekday time.
     */
    public static convertWeekdayTimeToDate(weekday: string, time: string): Date {

        const dateDay: number = ( DateFormatter.REF_DATE_DAY + DateFormatter.convertWeekdayStringToInt(weekday) );
        return new Date(DateFormatter.REF_DATE_MONTH + '/' + dateDay + '/' + DateFormatter.REF_DATE_YEAR + ' ' + time);
    }
}
