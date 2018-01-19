"use strict";
import { Injectable } from '@angular/core';
import { FormControl } from '@angular/forms';

import { ValidationService, Validation } from '../../../common-util/services/validation.service';
export { ValidationService, Validation };


@Injectable()
export class SlickTimeValidationService extends ValidationService {

    // Regular expressions used to dynaimcally filter hours and minutes inputs.
    public readonly DYNAMIC_HH_REG_EXP: RegExp;
    public readonly DYNAMIC_MM_REG_EXP: RegExp;


    public constructor() {
        super();

        this.DYNAMIC_HH_REG_EXP = /^(0?[1-9]?|1[0-2]?)$/;
        this.DYNAMIC_MM_REG_EXP = /^([0-5][0-9]?)$/;
    }


    /**
     * Ensures that each minute input has 2 digits when they lose focus and have data in them.
     * @param mmControl The minute form control that is being checked.
     */
    public ensureMinutes2Digits(mmControl: FormControl): void {

        if (mmControl != null && mmControl.value != null && mmControl.value.length === 1) {
            mmControl.setValue('0' + mmControl.value);
        }
    }
}
