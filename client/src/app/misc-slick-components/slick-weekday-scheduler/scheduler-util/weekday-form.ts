"use strict";
import { FormGroup, FormArray, FormControl, ValidatorFn } from '@angular/forms';

import { WeekdaySplitService } from './weekday-split.service';

import { TimeRange } from '../../../../../../shared/app-user/time-range';
import { DateFormatter } from '../../../../../../shared/common-util/date-formatter';


export class WeekdayForm extends FormGroup {

    public constructor (
        timeRanges?: TimeRange[],
        validatorFn?: ValidatorFn
    ) {
        super({}, validatorFn);

        // Construct the base form group (each member is a dynamic form array with weekday as key - holds TimeRange objects).
        for (let i: number = 0; i < WeekdaySplitService.WEEKDAYS.length; i++) {
            this.addControl(WeekdaySplitService.WEEKDAYS[i], new FormArray([]));
        }

        this.setTimeRanges(timeRanges);
    }


    public getTimeRanges(): TimeRange[] {

        let timeRanges: TimeRange[] = [];
        
        for (let property in this.controls) {
            if (this.controls.hasOwnProperty(property)) {

                let weekdayTimeRanges: FormArray = <FormArray>this.get(property);

                for (let i: number = 0; i < weekdayTimeRanges.length; i++) {
                    timeRanges.push(weekdayTimeRanges.at(i).value);
                }
            }
        }

        return timeRanges;
    }


    /**
     * Modifies form by first clearing all old TimeRange data and adding new data from given timeRanges array.
     * @param timeRanges The time range data to fill the form with.
     */
    public setTimeRanges(timeRanges: TimeRange[]): void {

        // First, clear all time ranges (old form data)!
        this.clearTimeRanges();

        // If form is being cleared, then jump out here!
        if (timeRanges == null) return;

        // Then, go through each weekday form array and add in time ranges.
        for (let i: number = 0; i < timeRanges.length; i++) {
            
            let weekday: string = DateFormatter.covertWeekdayIntToString(timeRanges[i].weekday);
            (<FormArray>this.get(weekday)).push(new FormControl(timeRanges[i]));
        }
    }


    /**
     * Clears the time ranges held within the form form group (model), which makes it ready for new ones.
     */
    public clearTimeRanges(): void {
                
        for (let i: number = 0; i < WeekdaySplitService.WEEKDAYS.length; i++) {

            let weekdaysFormArr: FormArray = <FormArray>this.get(WeekdaySplitService.WEEKDAYS[i]);
            
            // NOTE: Important to remove all elements via loop instead of just setting to new FormArray object
            //       since this can unintentionally invalidate any listeners on given form arrays!!!
            while (weekdaysFormArr.length !== 0) {
                weekdaysFormArr.removeAt(0);
            }
        }
    }
}
