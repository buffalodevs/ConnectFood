"use strict";
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { FormGroup, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

import { ValidationService, Validation } from '../../common-util/services/validation.service';

export { Validation };


@Injectable()
export class AppUserValidationService extends ValidationService {

    public constructor() {
        super();
    }


    /**
     * Validator for determining if password fields are equal.
     * @param passwordControlName The name of the new password field. Default is 'password'.
     * @param confirmPasswordControlName The name of the confirm password field. Default is 'confirmPassword'.
     * @return null if the passwords are equal, { equalToPassword: true } validation object if they are not.
     */
    public confirmPasswordEqual(passwordControlName: string = 'password', confirmPasswordControlName: string = 'confirmPassword'): ValidatorFn {
        
        let self: AppUserValidationService = this; // Ensure we are referring to this object in return function!

        return (group: FormGroup) => {

            // Throw error since regual error information is very very vague.
            if (group.get(passwordControlName) == null || group.get(confirmPasswordControlName) == null) {
                throw new Error('Either password or confirm password control does not exist in confirmPasswordEqual Validator');
            }

            const errLabel: string = 'confirmPasswordEqual';
            const passEqual: boolean = ( group.get(passwordControlName).value === group.get(confirmPasswordControlName).value );

            let retErr: any = null;
            let confirmPasswordControl: AbstractControl = group.get(confirmPasswordControlName);

            if (!passEqual) {

                // Passwords are not equal, so add to the Confirm Password Control's errors.
                const errMsg: string = 'Confirm Password does not match Password'
                self.addError(confirmPasswordControl, errLabel, errMsg);
                retErr = {};
                retErr[errLabel] = errMsg;
            }
            else {
                // If passwords are equal, then we should remove error from confirm password control.
                self.removeErrors(confirmPasswordControl, [errLabel]);
            }

            return retErr;
        }
    }


    /**
     * Generates an error message for a given control (if there is an error).
     * @param control The control for which to generate the error message.
     * @param controlPath The path for the control for which to generate the error message.
     * @return The generated error message if an error exists. null if no error exists.
     */
    public errorMsgFor(control: AbstractControl, controlPath: string): string {

        let errors: ValidationErrors = control.errors;

        if (errors != null) {

            if (errors.hasOwnProperty('confirmPasswordEqual'))  return errors.confirmPasswordEqual;

            if (errors.hasOwnProperty('pattern')) {
                if (controlPath.indexOf('email') >= 0)      return 'Email has incorrect format';
                if (controlPath.indexOf('password') >= 0)   return 'Password must have at least 6 characters';
                if (controlPath.indexOf('zip') >= 0)        return 'Zip requires 5 digits';
                if (controlPath.indexOf('phone') >= 0)      return 'Phone number incomplete';
            }
        }

        return null;
    }
}
