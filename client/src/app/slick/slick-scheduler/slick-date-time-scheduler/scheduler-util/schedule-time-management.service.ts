"use strict";
import { Injectable } from '@angular/core';
import { DateFormatterService } from '../../../../common-util/services/date-formatter.service';
import { DateRange } from '../../../../../../../shared/src/date-time-util/date-range';


/**
 * The granularity of time that each available time should be (apart from one another).
 */
export const enum TimeGranularity {
    QUARTER_HOUR = 900000,
    HALF_HOUR = 1800000,
    HOUR = 3600000
}


/**
 * Manager of availability date-times derived from availability time range data.
 * Constructs all possible times that a user can select from for an action such as scheduling a delivery.
 */
@Injectable()
export class ScheduleTimeManagementService {

    private _possibleScheduleDateStrs: string[];
    private _possibleScheduleTimes: Map <string, Date[]>;
    private _possibleDisplayScheduleTimes: Map <string, string[]>;


    public constructor (
        private _dateFormatter: DateFormatterService
    ) {
        this.refresh();
    }


    /**
     * Refreshes the contained available date-time values (empties all contianed Date data).
     */
    private refresh(): void {

        this._possibleScheduleDateStrs = [];
        this._possibleScheduleTimes = new Map <string, Date[]>();
        this._possibleDisplayScheduleTimes = new Map <string, string[]>();
    }


    /**
     * Sets possible schedule date-time data from given date-time ranges.
     * Date-times are extracted from within the given time ranges by a given time granularity interval.
     * @param dateRanges The date-time range data from which to extract all possible schedule date-times from.
     * @param timeGranularity: The time granularity in which to space out generated possible schedule times by.
     */
    public setPossibleScheduleTimes(dateRanges: DateRange[], timeGranularity: TimeGranularity = TimeGranularity.HALF_HOUR): void {

        const MS_IN_DAY: number = 86400000;

        // First, reset available schedule times data.
        this.refresh();

        // Then, iterate through time ranges, gathering possible schedule times from them.
        for (let i: number = 0; i < dateRanges.length; i++) {
            this.setPossibleScheduleTimesForDateRange(dateRanges[i], timeGranularity);
        }
    }


    /**
     * Extracts possible schedule date-time data from a given date-time range.
     * @param timeRange The time range to extract the possible schedule times from.
     * @param timeGranularity The time granularity at which to space out generated possible schedule times by.
     */
    private setPossibleScheduleTimesForDateRange(dateRange: DateRange, timeGranularity: TimeGranularity): void {

        // Extract start and end date-time in milliseconds since epoch format so we can generate all times in-between over given interval.
        let startMs: number = dateRange.startTime.valueOf();
        let endMs: number = ( dateRange.endTime.valueOf() - TimeGranularity.HALF_HOUR );
        let prevPossibleScheduleDateTime: Date = null;
        let possibleScheduleDateStr: string = null;

        // Generate each available time at timeGranularity interval apart.
        for (let timeMs: number = startMs; timeMs < endMs; timeMs += timeGranularity) {

            const possibleScheduleDateTime: Date = new Date(timeMs);

            // Only use availability date if it is after the current date-time.
            if (possibleScheduleDateTime > new Date()) {

                // If the previous possible schedule date-time that was analyzed had a different date, then we must generate date string for this new one.
                if (prevPossibleScheduleDateTime == null || possibleScheduleDateTime.getDay() !== prevPossibleScheduleDateTime.getDay()) {
                
                    possibleScheduleDateStr = this.genPossibleScheduleDateStr(possibleScheduleDateTime);
                    this.insertScheduleDateIfNotExists(possibleScheduleDateStr);
                }

                this._possibleScheduleTimes.get(possibleScheduleDateStr).push(possibleScheduleDateTime);
                this._possibleDisplayScheduleTimes.get(possibleScheduleDateStr).push(this._dateFormatter.dateToWallClockString(possibleScheduleDateTime));
                prevPossibleScheduleDateTime = possibleScheduleDateTime;
            }
        }
    }


    /**
     * Converts a given date time to a schedule date string (In format of <day_of_week> <mm/dd/yyyy>).
     * @param possibleScheduleDateTime The date time to convert to a schedule date stirng.
     * @return The schedule date string.
     */
    private genPossibleScheduleDateStr(possibleScheduleDateTime: Date): string {

        const weekday: string = this._dateFormatter.covertWeekdayIntToString(possibleScheduleDateTime.getDay());
        const dateStr: string = this._dateFormatter.dateToMonthDayYearString(possibleScheduleDateTime);

        return ( weekday + ' - ' + dateStr );
    }


    /**
     * Inserts a new schedule date (that will map to contained possible schedule times) if it does not already exist.
     * @param possibleScheduleDateStr The new schedule date to insert.
     */
    private insertScheduleDateIfNotExists(possibleScheduleDateStr: string): void {

        if (!this._possibleScheduleTimes.has(possibleScheduleDateStr)) {

            this._possibleScheduleTimes.set(possibleScheduleDateStr, []);
            this._possibleDisplayScheduleTimes.set(possibleScheduleDateStr, []);
            this._possibleScheduleDateStrs.push(possibleScheduleDateStr);
        }
    }


    /**
     * Gets all human readable date strings of dates that can have deliveries scheduled on them.
     * @return The date strings.
     */
    public getPossibleScheduleDateStrs(): string[] {
        return this._possibleScheduleDateStrs;
    }


    /**
     * Gets the available date-times for a given weekday.
     * @param possibleScheduleDateStr The date string that the times should map to.
     * @return The date-times in Date object format.
     */
    public getPossibleScheduleTimes(possibleScheduleDateStr: string): Date[] {
        return this._possibleScheduleTimes.get(possibleScheduleDateStr);
    }


    /**
     * Gets the displayable form of an availability time for a given weekday at a given index.
     * @param possibleScheduleDateStr The date string that the display times should map to.
     * @param index The index of the time to get within the weekday array.
     * @return The displayable form of the availability time.
     */
    public getDisplayPossibleScheduleTimeAt(possibleScheduleDateStr: string, index: number): string {
        return this._possibleDisplayScheduleTimes.get(possibleScheduleDateStr)[index];
    }
}
