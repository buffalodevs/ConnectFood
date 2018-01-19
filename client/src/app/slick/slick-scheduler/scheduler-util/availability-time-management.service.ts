"use strict";
import { Injectable } from '@angular/core';

import { WeekdaySplitService } from './weekday-split.service';
import { DateFormatterService } from '../../../common-util/services/date-formatter.service';

import { TimeRange } from '../../../../../../shared/app-user/time-range';


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
export class AvailabilityTimeManagementService {

    private nonEmptyWeekdays: string[];
    private availableTimes: Map<string, Date[]>;
    private displayAvailableTimes: Map<string, string[]>;


    public constructor (
        private dateFormatter: DateFormatterService
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
     * Sets contained available time data from given time range data.
     * These times fall in all given time ranges and are spaced out at a set time granularity for the user to select from.
     * @param timeRanges The time range data from which to extract all available times from.
     * @param timeGranularity: The time granularity in which to space out generated availability times by.
     */
    public set(timeRanges: TimeRange[], timeGranularity: TimeGranularity = TimeGranularity.HALF_HOUR): void {

        const MS_IN_DAY: number = 86400000;

        // First, reset available times data.
        this.refresh();

        // Then, iterate through time ranges.
        for (let i: number = 0; i < timeRanges.length; i++) {

            // Generate weekday index and string.
            const weekdayIndex: number = timeRanges[i].startTime.getDay();
            const weekdayStr: string = this.dateFormatter.covertWeekdayIntToString(weekdayIndex);

            // Extract wall-clock time strings from time range.
            let startWallClockStr: string = this.dateFormatter.dateToWallClockString(timeRanges[i].startTime);
            let endWallClockStr: string = this.dateFormatter.dateToWallClockString(timeRanges[i].endTime);
            
            // Extract start and end date-time data in milliseconds since epoch format so we can generate all times in-between over given interval.
            let startMs: number = this.dateFormatter.genDateFromWeekdayAndTime(weekdayIndex, startWallClockStr).getTime();
            let endMs: number = ( this.dateFormatter.genDateFromWeekdayAndTime(weekdayIndex, endWallClockStr).getTime() - TimeGranularity.HALF_HOUR );

            // Generate each available time at timeGranularity interval apart.
            for (let timeMs: number = startMs; timeMs < endMs; timeMs += timeGranularity) {

                const availabilityDate: Date = new Date(timeMs);
                this.availableTimes.get(weekdayStr).push(availabilityDate);
                this.displayAvailableTimes.get(weekdayStr).push(this.dateFormatter.dateToWallClockString(availabilityDate));
            }
        }

        this.setNonEmptyWeekdays();
    }


    /**
     * Sets the weekdays that are non-empty (have availability times to select from).
     */
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
     * Gets the displayable form of an availability time for a given weekday at a given index.
     * @param weekday The weekday of the array to look in for the time.
     * @param index The index of the time to get within the weekday array.
     * @return The displayable form of the availability time.
     */
    public getDisplayFormAt(weekday: string, index: number): string {
        return this.displayAvailableTimes.get(weekday)[index];
    }


    /**
     * Gets all weekdays that have availabiilty times in them for the user to select from.
     */
    public getNonEmptyWeekdays(): string[] {
        return this.nonEmptyWeekdays;
    }
}
