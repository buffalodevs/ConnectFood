"use strict";
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { FormGroup, AbstractControl, ValidationErrors, FormControl } from '@angular/forms';

import { DateFormatterService } from '../../../common-util/services/date-formatter.service';
import { ValidationService, Validation } from '../../../common-util/services/validation.service';
export { ValidationService, Validation };

import { DateFormatter } from '../../../../../../shared/src/date-time-util/date-formatter';


@Injectable()
export class SlickTimeRangeValidationService extends ValidationService {

    public constructor (
        private _dateFormatter: DateFormatterService
    ) {
        super();
    }


    /**
     * Generates a validator function for determining if the startTime and endTime portions of the time range are in correct temporal order.
     * @param startTimeControlName The optional name of the start time control for the time range. Default is 'startTime'.
     * @param endTimeControlName The optional name of the end time control for the time range. Default is 'endTime'.
     */
    public timeOrder(startTimeControlName: string = 'startTimeStr', endTimeControlName: string = 'endTimeStr'): (group: FormGroup) => any {
        
        return (group: FormGroup): {[key: string]: any} => {

            const startTimeStrControl: AbstractControl = group.get(startTimeControlName);
            const endTimeStrControl: AbstractControl = group.get(endTimeControlName);

            // Ensure that controls exist with given control names!
            if (startTimeStrControl == null)    throw new Error('Start time control does not exist with name: ' + startTimeControlName);
            if (endTimeStrControl == null)      throw new Error('End time control does not exist with name: ' + endTimeControlName);

            // Convert the time strings into dates for easy comparison.
            const startDate: Date = this._dateFormatter.setWallClockTimeForDate(new Date(), startTimeStrControl.value);
            const endDate: Date = this._dateFormatter.setWallClockTimeForDate(new Date(), endTimeStrControl.value);

            if (startDate != null && endDate != null) {
                
                // If the start time order is incorrect, than return appropriate error flag.
                if (startDate.valueOf() > endDate.valueOf())    return { timeOrder: 'Start time later than end time.' };
                if (startDate.valueOf() === endDate.valueOf())  return { timeEquality: 'Start time cannot equal end time.' };
            }

            return null;
        }
    }


    /**
     * Generates an error message for a given control (if there is an error).
     * @param control The control for which to generate the error message for.
     * @return The generated error message if an error exists. null if no error exists.
     */
    public errorMsgFor(control: AbstractControl): string {

        const errors: ValidationErrors = control.errors;

        if (errors != null) {

            if (errors.hasOwnProperty('timeOrder'))     return errors.timeOrder;
            if (errors.hasOwnProperty('timeEquality'))  return errors.timeEquality;
            else                                        return 'Availability time range incomplete';
        }

        return null;
    }
}
