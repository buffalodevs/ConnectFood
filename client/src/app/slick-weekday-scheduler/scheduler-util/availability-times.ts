"use strict";
import { TimeRange } from '../../../../../shared/app-user/time-range';
import { DateFormatter } from '../../../../../shared/common-util/date-formatter';
import { WeekdaySplitService } from './weekday-split.service';


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
 */
export class AvailabilityTimes {

    private nonEmptyWeekdays: string[];
    private availableTimes: Map<string, Date[]>;
    private displayAvailableTimes: Map<string, string[]>;


    public constructor (
        private timeGranularity: TimeGranularity = TimeGranularity.HALF_HOUR
    ) {
        this.nonEmptyWeekdays = [];
        this.availableTimes = new Map();
        this.displayAvailableTimes = new Map();
        this.refresh();
    }


    /**
     * Refreshes the contained available date-time values (empties all contianed Date data).
     */
    private refresh(): void {

        this.nonEmptyWeekdays = [];
        
        for (let i: number = 0; i < WeekdaySplitService.WEEKDAYS.length; i++) {
            this.availableTimes.set(WeekdaySplitService.WEEKDAYS[i], []);
            this.displayAvailableTimes.set(WeekdaySplitService.WEEKDAYS[i], []);
        }
    }


    /**
     * Sets contained available time Date-Time data from given time range data.
     * @param timeRanges The time range data from which to extract all available times from.
     */
    public set(timeRanges: TimeRange[]): void {

        const MS_IN_DAY: number = 86400000;
        let weekStartMs: number = DateFormatter.getDateOfWeekStart().getTime();

        // First, reset available times data.
        this.refresh();

        // Then, iterate through time ranges.
        for (let i: number = 0; i < timeRanges.length; i++) {

            // Extract start and end date-time data in Date object format.
            const weekday: string = DateFormatter.covertWeekdayIntToString(timeRanges[i].weekday);
            const baseDate: Date = new Date(weekStartMs + (timeRanges[i].weekday * MS_IN_DAY));
            let startMs: number = DateFormatter.setWallClockTimeForDate(baseDate, timeRanges[i].startTime).getTime();
            let endMs: number = ( DateFormatter.setWallClockTimeForDate(baseDate, timeRanges[i].endTime).getTime() - TimeGranularity.HALF_HOUR );

            // Generate each available time at timeGranularity interval apart.
            for (let timeMs: number = startMs; timeMs < endMs; timeMs += this.timeGranularity) {

                const availabilityDate: Date = new Date(timeMs);
                this.availableTimes.get(weekday).push(availabilityDate);
                this.displayAvailableTimes.get(weekday).push(DateFormatter.dateToWallClockString(availabilityDate));
            }
        }

        this.setNonEmptyWeekdays();
    }


    private setNonEmptyWeekdays(): void {

        for (let i: number = 0; i < WeekdaySplitService.WEEKDAYS.length; i++) {
            if (this.availableTimes.get(WeekdaySplitService.WEEKDAYS[i]).length !== 0) {
                this.nonEmptyWeekdays.push(WeekdaySplitService.WEEKDAYS[i]);
            }
        }
    }


    /**
     * Gets the available date-times for a given weekday.
     * @param weekday The weekday to get the times for.
     * @return The date-times in Date object format.
     */
    public get(weekday: string): Date[] {
        return this.availableTimes.get(weekday);
    }


    /**
     * Gets the available times in a displayable string format (wall-clock time format).
     * @param weekday The weekday to get the displayable time strings for.
     * @return The times in wall-clock time string format.
     */
    public getDisplayForm(weekday: string): string[] {
        return this.displayAvailableTimes.get(weekday);
    }


    public getNonEmptyWeekdays(): string[] {
        return this.nonEmptyWeekdays;
    }
}
