"use strict";
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { FormGroup, AbstractControl, ValidationErrors } from '@angular/forms';

import { ValidationService, Validation } from '../../../common-util/services/validation.service';
export { ValidationService, Validation };

import { DateFormatter } from '../../../../../../shared/common-util/date-formatter';


@Injectable()
export class SlickTimeRangeValidationService extends ValidationService {

    public constructor() {
        super();
    }


    /**
     * Generates a validator function for determining if the startTime and endTime portions of the time range are in correct temporal order.
     * @param startTimeControlName The optional name of the start time control for the time range. Default is 'startTime'.
     * @param endTimeControlName The optional name of the end time control for the time range. Default is 'endTime'.
     */
    public timeOrder(startTimeControlName: string = 'startTime', endTimeControlName: string = 'endTime'): (group: FormGroup) => any {
        
        return function(group: FormGroup): {[key: string]: any} {

            // Get the time strings from the from controls.
            let startTime: string = group.get(startTimeControlName).value;
            let endTime: string = group.get(endTimeControlName).value;

            // Convert the time strings into dates for easy comparison.
            let startDate: Date = DateFormatter.setWallClockTimeForDate(new Date(), startTime);
            let endDate: Date = DateFormatter.setWallClockTimeForDate(new Date(), endTime);

            if (startDate != null && endDate != null) {
                
                // If the start time order is incorrect, than return appropriate error flag.
                if (startDate.valueOf() > endDate.valueOf())    return { timeOrder: 'Start time cannot be later than end time.' };
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

        let errors: ValidationErrors = control.errors;

        if (errors != null) {

            if (errors.hasOwnProperty('timeOrder'))     return errors.timeOrder;
            if (errors.hasOwnProperty('timeEquality'))  return errors.timeEquality;
            else                                        return 'Availability time range incomplete';
        }

        return null;
    }
}
