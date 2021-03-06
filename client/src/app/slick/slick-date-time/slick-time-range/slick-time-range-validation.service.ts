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
     * @param startDateControlName The optional name of the start time control for the time range. Default is 'startTime'.
     * @param endDateControlName The optional name of the end time control for the time range. Default is 'endTime'.
     */
    public timeOrder(canBeEqual: boolean = false, startDateControlName: string = 'startDate', endDateControlName: string = 'endDate'): (group: FormGroup) => any {

        // Return our generated validator Fn.
        return (group: FormGroup): { [key: string]: any } => {

            // NOTE: Following 2 may not exist, and it is ok as long as includeDate flag is false.
            const startDateControl: AbstractControl = group.get(startDateControlName);
            const endDateControl: AbstractControl = group.get(endDateControlName);

            // Ensure that time controls exist with given control names!
            if (startDateControl == null)    throw new Error('Start time control does not exist with name: ' + startDateControlName);
            if (endDateControl == null)      throw new Error('End time control does not exist with name: ' + endDateControlName);

            return this.checkTimeOrder(canBeEqual, startDateControl, endDateControl);
        }
    }


    /**
     * Performs the checking of the time order based off of given date-time range controls.
     * @param includeDate Flag to determine if date-picker form members are included in time range.
     * @param startDateControl The start date(-picker) control. NOTE: May not exist if includeDate is false.
     * @param endDateControl The end date(-picker) control. NOTE: May not exist if includeDate is false.
     * @return If an error exists, then an object whose key is the error code and value is the error message is returned.
     *         Else, if no error exists, then null is returned.
     */
    private checkTimeOrder(canBeEqual: boolean, startDateControl: AbstractControl, endDateControl: AbstractControl): { [key: string]: any } {

        const startDate: Date = startDateControl.value;
        const endDate: Date = endDateControl.value;

        // Ensure the dates are not null (if using date controls, they can be empty/incomplete rendering null values).
        if (startDate != null && endDate != null) {
            
            // If the start time order is incorrect, than return appropriate error flag.
            if (startDate.valueOf() > endDate.valueOf())                  return { timeOrder: 'Start time later than end time.' };
            if (!canBeEqual && startDate.valueOf() === endDate.valueOf()) return { timeEquality: 'Start time cannot equal end time.' };
        }

        return null; // No ordering error present (although portions of time range can still be missing).
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
