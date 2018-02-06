import { Pipe } from '@angular/core';
import { AbstractControl, ValidatorFn, FormGroup, FormArray, FormControl, ValidationErrors } from '@angular/forms';
import createAutoCorrectedDatePipe from 'text-mask-addons/dist/createAutoCorrectedDatePipe';
import createNumberMask from 'text-mask-addons/dist/createNumberMask.js';
import * as _ from "lodash";

import { ObjectManipulation } from '../../../../../shared/src/common-util/object-manipulation';
import { Validation } from '../../../../../shared/src/validation/validation';

export { Validation };


export class ValidationService extends Validation {

    /**
     * Configuration for a date text-mask (with auto correct functionality).
     */
    public readonly DATE_MASK_CONFIG: { mask: Array <string | RegExp>, keepCharPositions: boolean, pipe: Pipe, placeholder: string };

    /**
     * Configuration for a money text-mask.
     */
    public readonly MONEY_MASK_CONFIG: { mask: Array <string | RegExp>, placeholder: string };


    public constructor() {

        super();

        this.DATE_MASK_CONFIG = {
            mask: [ /\d/, /\d/, '/', /\d/, /\d/, '/', /\d/, /\d/, /\d/, /\d/ ],
            keepCharPositions: true,
            pipe: createAutoCorrectedDatePipe('mm/dd/yyyy'),
            placeholder: '\u2000'
        };

        this.MONEY_MASK_CONFIG = {
            mask: createNumberMask({
                prefix: '',
                suffix: '',
                integerLimit: 4,
                decimalLimit: 2,
                includeThousandsSeparator: true,
                allowDecimal: true
            }),
            placeholder: '\u2000'
        };
    }


    /**
     * Generates an error message for a given control (if there is an error).
     * @param control The control for which to generate the error message.
     * @param controlPath The path for the control for which to generate the error message.
     * @return The generated error message if an error exists. null if no error exists.
     */
    public errorMsgFor(control: AbstractControl, controlPath?: string): string {
        
        if (control.hasError('required') || control.hasError('requiredTrue'))   return '* required';
        if (control.hasError('pattern'))                                        return 'Incorrect format';
        if (control.hasError('maxLength'))                                      return 'Entry too long';
        if (control.hasError('minLength'))                                      return 'Entry too short';
        if (control.hasError('max'))                                            return 'Value too large';
        if (control.hasError('min'))                                            return 'Value too small';

        return null;
    }


    /**
     * Generic validator for requiring at least one field to be validly filled out in a form group.
     * @param group The form group to check for at least one valid filled field in.
     * @return If the validator fails (on error), then an object of { 'required': true } is returned. Otherwise null if no error.
     */
    public requireAtLeastOneField(): ValidatorFn {

        // Must set self reference to this so that we can refer to it in function that may be called as first class variable (not with correct this scope).
        let self: ValidationService = this;

        return (group: FormGroup | FormArray) => {

            if (group && group.controls) {

                for (const control in group.controls) {
                    if (group.controls.hasOwnProperty(control)) {

                        // If the current control is a nested form group/array, then recursively call on the child form group/array.
                        if (group.controls[control] instanceof FormGroup || group.controls[control] instanceof FormArray) {
                            if (self.requireAtLeastOneField()(<FormGroup | FormArray>group.controls[control]) == null)
                            { return null; }
                        }

                        // Else if current control is a form control, check for valid value.
                        else if (group.controls[control].valid && group.controls[control].value) {
                            return null;
                        }
                    }
                }
            }

            // If here, then we could not find a child of the form group with a valid value.
            return { 'required': true };
        }
    }


    /**
     * Adds a given error to a given control's error list.
     * @param control The control to add the error to (IS INTERNALLY MODIFIED).
     * @param errToAdd The label of the error to add.
     * @param value The optional value of the error (can be set to a specific message). Default is true.
     */
    public addError(control: AbstractControl, errToAdd: string, value: any = true): void {

        let controlErrs: any = control.errors;
        if (controlErrs == null) controlErrs = {};

        controlErrs[errToAdd] = value;
        control.setErrors(controlErrs);
    }


    /**
     * Removes all errors from a given form group (including all of its children).
     * @param formGroup The form group to remove all errors from.
     */
    public removeAllFormErrors(formGroup: FormGroup): void {

        formGroup.setErrors(null, { emitEvent: false });

        for (let control in formGroup.controls) {

            formGroup.controls[control].setErrors(null, { emitEvent: false });

            // If control is a form group (not a simple form control).
            if (!(formGroup.controls[control] instanceof FormControl)) {
                this.removeAllFormErrors(<FormGroup>formGroup.controls[control]);
            }
        }

        formGroup.updateValueAndValidity();
    }


    /**
     * Internally modifies a given control by removing a given set of errors.
     * @param control The control from which to remove the given errors (WILL BE INTERNALLY MODIFIED).
     * @param removeErrs A list of the labels of errors to remove.
     */
    public removeErrors(control: AbstractControl, removeErrs: string[]): void {
        
        let curErrs: any = control.errors;

        if (curErrs != null && (removeErrs.length > 1 || curErrs[removeErrs[0]] != null)) {
            let keepErrs = {};
            ObjectManipulation.shallowCopy(curErrs, keepErrs, removeErrs, false);
            keepErrs = _.isEmpty(keepErrs) ? null
                                                            : keepErrs;
            control.setErrors(keepErrs);
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
