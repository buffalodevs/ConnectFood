"use strict";
import { Injectable } from '@angular/core';
import { FormGroup, FormArray, FormControl } from '@angular/forms';


@Injectable()
export class WeekdaySplitService {

    public static readonly WEEKDAYS: string[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    private splits: string[][];


    public constructor() {
        this.updateWeekdaySplits(null, true);
    }


    /**
     * Gets the weekday splits that have been generated thus far via updateWeekdaySplits() method.
     * @return The currently generated weekday splits. Each index in the first dimension of the return 2D array represents a column.
     *         Then, each entry in the second dimension is a weekday that belongs to the containing column.
     */
    get weekdaySplits(): string[][] {
        return this.splits;
    }


    /**
     * Calculates the (column) weekday splits used based off of the data available for each weekday.
     * If there is data for 4 or more days, then 2 columns will be used. Otherwise, 1 column is used.
     * @param weekdayForm Form that contains the elements that belong to each weekday. Contains FormArray elements with keys being the days of the week.
     * @param useAllWeekdays an optional flag, which when set true determines that all weekdays should be incorporated, and timeRangeForm shall be ignored.
     */
    public updateWeekdaySplits(weekdayForm: FormGroup, useAllWeekdays: boolean = false): void {

        // If useAllWeekdays set or we have not fully intialized the form (view model) yet, then return all weekdays in 2 column split.
        if (useAllWeekdays || weekdayForm == null || weekdayForm.get(WeekdaySplitService.WEEKDAYS[0]) == null) {
            this.splits = [['Monday', 'Tuesday', 'Wednesday', 'Thursday'], ['Friday', 'Saturday', 'Sunday']];
        }

        else {

            // Determine the weekdays that actually have time range data.
            let nonEmptyWeekdays: string[] = [];
            for (let i: number = 0; i < WeekdaySplitService.WEEKDAYS.length; i++) {
                
                if ((<FormArray>weekdayForm.get(WeekdaySplitService.WEEKDAYS[i])).length > 0) {
                    nonEmptyWeekdays.push(WeekdaySplitService.WEEKDAYS[i]);
                }
            }

            // Start with assumption of there only being one column.
            this.splits = [[]];
            let firstSplitEnd: number = nonEmptyWeekdays.length;

            // Do we have enough non-empty weekdays for 2 columns?
            if (nonEmptyWeekdays.length >= 4) {
                firstSplitEnd = Math.ceil(nonEmptyWeekdays.length / 2);
                this.weekdaySplits.push([]);
            }

            // Enter data into first column.
            for (let i: number = 0; i < firstSplitEnd; i++) {
                this.weekdaySplits[0].push(nonEmptyWeekdays[i]);
            }

            // If two columns, then we will enter data here.
            for (let i: number = firstSplitEnd; i < nonEmptyWeekdays.length; i++) {
                this.weekdaySplits[1].push(nonEmptyWeekdays[i]);
            }
        }
    }
}
