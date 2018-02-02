"use strict";
import { FormGroup, FormArray, FormControl, ValidatorFn } from '@angular/forms';

import { WeekdaySplitService } from './weekday-split.service';
import { DateFormatterService } from '../../../../common-util/services/date-formatter.service';

import { DateRange } from '../../../../../../../shared/src/date-time-util/date-range';
import { DateFormatter } from '../../../../../../../shared/src/date-time-util/date-formatter';


/**
 * Extendsion of regular Reactive Angular Form to support reading and writing availability time range values when building or modifying regular availablity schedules.
 */
export class WeekdayForm extends FormGroup {

    public constructor (
        private _dateFormatter: DateFormatterService,
        availabilityRanges?: DateRange[],
        validatorFn?: ValidatorFn
    ) {
        super({}, validatorFn);

        // Construct the base form group (each member is a dynamic form array with weekday as key - holds TimeRange objects).
        for (let i: number = 0; i < WeekdaySplitService.WEEKDAYS.length; i++) {
            this.addControl(WeekdaySplitService.WEEKDAYS[i], new FormArray([]));
        }

        this.setAvailabilityRanges(availabilityRanges);
    }


    /**
     * Gets all availability ranges held within this form.
     * Also, sets all time range dates to be on the nearest weekday that they are a form member of. 
     * @return The availability time ranges.
     */
    public getAvailabilityRanges(): DateRange[] {

        const dateFormatter: DateFormatter = new DateFormatter();
        let availabilityRanges: DateRange[] = [];
        
        // Iterate through each weekday in form, grabbing availability time ranges from each.
        for (let property in this.controls) {
            if (this.controls.hasOwnProperty(property)) {
                availabilityRanges = availabilityRanges.concat(this.getAvailabilityRangesFromWeekday(property));
            }
        }

        return availabilityRanges;
    }


    /**
     * Gets availability time ranges corresponding to a certain weekday within this form.
     * @param weekday The weekday to get the time ranges from.
     * @return The retrieved time ranges.
     */
    private getAvailabilityRangesFromWeekday(weekday: string): DateRange[] {

        const weekdayTimeRanges: FormArray = <FormArray>this.get(weekday);
        const weekdayInt: number = this._dateFormatter.convertWeekdayStringToInt(weekday);
        let availabilityRanges: DateRange[] = [];

        for (let i: number = 0; i < weekdayTimeRanges.length; i++) {

            // Grab time range and make sure we set the date to be on the weekday that the time range belongs to.
            let availabilityRange: DateRange = weekdayTimeRanges.at(i).value;
            availabilityRange.startTime = this._dateFormatter.setDateToNearestWeekday(availabilityRange.startTime, weekdayInt);
            availabilityRange.endTime = this._dateFormatter.setDateToNearestWeekday(availabilityRange.endTime, weekdayInt);

            availabilityRanges.push(availabilityRange);
        }

        return availabilityRanges;
    }


    /**
     * Modifies form by first clearing all old TimeRange data and adding new data from given availabilityRanges array.
     * @param availabilityRanges The time range data to fill the form with.
     */
    public setAvailabilityRanges(availabilityRanges: DateRange[]): void {

        // First, clear all time ranges (old form data)!
        this.clearAvailabilityRanges();

        // If form is being cleared, then jump out here!
        if (availabilityRanges == null) return;

        // Then, go through each weekday form array and add in time ranges.
        for (let i: number = 0; i < availabilityRanges.length; i++) {
            
            const weekday: string = this._dateFormatter.covertWeekdayIntToString(availabilityRanges[i].startTime.getDay());
            (<FormArray>this.get(weekday)).push(new FormControl(new DateRange(availabilityRanges[i].startTime, availabilityRanges[i].endTime)));
        }
    }


    /**
     * Clears the time ranges held within the form form group (model), which makes it ready for new ones.
     */
    public clearAvailabilityRanges(): void {
                
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
