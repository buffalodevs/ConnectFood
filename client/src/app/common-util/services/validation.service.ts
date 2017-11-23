import { Injectable } from '@angular/core';
import { AbstractControl, ValidatorFn, FormGroup, FormArray, FormControl, ValidationErrors } from '@angular/forms';

import { ObjectManipulation } from '../../../../../shared/common-util/object-manipulation';
import { Validation } from '../../../../../shared/common-util/validation';

export { Validation };


@Injectable()
export class ValidationService {

    public constructor() {}


    /**
     * Angular 4 validator for determining if password fields are equal.
     * @param passwordControlName The name of the new password field. Default is 'password'.
     * @param confirmPasswordControlName The name of the confirm password field. Default is 'confirmPassword'.
     * @return null if the passwords are equal, { equalToPassword: true } validation object if they are not.
     */
    public confirmPasswordEqual(passwordControlName: string = 'password', confirmPasswordControlName: string = 'confirmPassword'): (group: FormGroup) => any {
        
        let self: ValidationService = this; // Ensure we are referring to this object in return function!

        return function(group: FormGroup): any {

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
                self.addError(confirmPasswordControl, errLabel);
                retErr = {};
                retErr[errLabel] = true;
            }
            else {
                // If passwords are equal, then we should remove error from confirm password control.
                self.removeErrors(confirmPasswordControl, [errLabel]);
            }

            return retErr;
        }
    }


    /**
     * Adds a given error to a given control's error list.
     * @param control The control to add the error to (IS INTERNALLY MODIFIED).
     * @param errToAdd The label of the error to add.
     */
    public addError(control: AbstractControl, errToAdd: string): void {

        let controlErrs: any = control.errors;
        if (controlErrs == null) controlErrs = {};

        controlErrs[errToAdd] = true;
        control.setErrors(controlErrs);
    }


    /**
     * Internally modifies a given control by removing a given set of errors.
     * @param control The control from which to remove the given errors (WILL BE INTERNALLY MODIFIED).
     * @param removeErrs A list of the labels of errors to remove.
     */
    public removeErrors(control: AbstractControl, removeErrs: string[]): void {
        
        let curErrs: any = control.errors;

        if (curErrs != null && (removeErrs.length > 1 || curErrs[removeErrs[0]] != null)) {
            let newErrs = {};
            ObjectManipulation.shallowCopy(curErrs, newErrs, removeErrs, false);
            newErrs = ObjectManipulation.isEmpty(newErrs) ? null
                                                            : newErrs;
            control.setErrors(newErrs);
        }
    }


    /**
     * Sets the validators for a given control and refreshes the control's validation.
     * @param control The control to set the validators for (WILL BE INTERNALLY MODIFIED).
     * @param validators The validators that are to be set.
     */
    public setValidatorsAndRefresh(control: AbstractControl, validators: ValidatorFn[]): void {

        control.setValidators(validators);
        control.updateValueAndValidity();
    }


    /**
     * Determines if a given control contains a 'required' validator.
     * @param control The control to check.
     * @return true if it contains the required validator, false if not.
     */
    public containsRequiredValidator(control: AbstractControl): boolean {
        
        let errors: ValidationErrors = ( control.validator && control.validator(new FormControl()) );
        return ( errors != null && errors.required );
    }


    /**
     * Marks all members of the given from group or array as touched, and all of its ancestors too.
     * @param group The form group or array to mark as touched.
     */
    public markAllAsTouched(group: FormGroup | FormArray): void {

        group.markAsTouched()

        for (let i in group.controls) {
            if (group.controls[i] instanceof FormControl) {
                (<FormControl>group.controls[i]).markAsTouched();
            }
            else {
                this.markAllAsTouched(group.controls[i]);
            }
        }
    }
}
