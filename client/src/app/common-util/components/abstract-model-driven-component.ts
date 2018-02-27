import { FormGroup, AbstractControl, FormArray, ValidatorFn, FormBuilder } from "@angular/forms";
import { Input, OnChanges, SimpleChanges } from "@angular/core";
import * as _ from "lodash";

import { ValidationService } from "../services/validation.service";


export abstract class AbstractModelDrivenComponent implements OnChanges {

    @Input() public activateValidation: boolean = false;

    /**
     * The base or primary form for the component.
     */
    public form: FormGroup;


    protected constructor (
        /**
         * The validation service for this component.
         */
        public validationService: ValidationService,
        protected _formBuilder: FormBuilder
    ) {}


    public ngOnChanges(changes: SimpleChanges): void {

        if (changes.activateValidation && this.form != null) {
            this.activateValidation ? this.form.markAsTouched()
                                    : this.form.markAsUntouched();
        }
    }


    public genFormGroupFromObject(obj: any, uniformValidators?: ValidatorFn[], specificValidators: { [key: string]: ValidatorFn[] } = {}): FormGroup {

        // IMPORTANT: Initialize empty uniformValidators argument to an empty array so we can easly integrate in further functionality.
        if (uniformValidators == null) {
            uniformValidators = [];
        }

        return this.genFormGroup(obj, uniformValidators, specificValidators);
    }


    /**
     * Generates a form group based on a given obj. Each member of obj that is a (non-array) primative value is transformed into a FormControl.
     * Each member that is an object is transformed into a sub form group. Each memeber that is an array is transformed into a FormArray.
     * @param obj The obj to generate the form group from.
     * @param uniformValidators The validators to apply to all generated FormGroup members.
     * @param specificValidators An object mapping of specific validators for specific FormGroup keys (also keys of object). Utilizes '.' notation.
     * @param baseControlPath Ignore, used for recursive call when generating sub-form groups.
     */
    private genFormGroup(obj: any, uniformValidators: ValidatorFn[], specificValidators: { [key: string]: ValidatorFn[] }, baseControlPath: string = ''): FormGroup {

        let formGroup: FormGroup = new FormGroup({});

        for (let property in obj) {
            if (obj.hasOwnProperty(property)) {

                let abstractControl: AbstractControl;

                // Is a form array.
                if (Array.isArray(obj[property])) {
                    abstractControl = this._formBuilder.array(obj[property]);
                }
                // Is a sub-form group.
                else if (typeof obj[property] === 'object') {

                    const controlPath: string = (baseControlPath.length === 0) ? property
                                                                               : ( baseControlPath + '.' + property );
                    abstractControl = this.genFormGroup(obj[property], uniformValidators, specificValidators, controlPath);
                }
                // Is a form control.
                else {
                    abstractControl = this._formBuilder.control(obj[property]);
                }

                abstractControl.setValidators(this.genValidatorsForControl(property, uniformValidators, specificValidators, baseControlPath));
                formGroup.addControl(property, abstractControl);
            }
        }

        return formGroup;
    }


    private genValidatorsForControl(controlName: string, uniformValidators: ValidatorFn[], specificValidators: { [key: string]: ValidatorFn[] }, controlPath: string): ValidatorFn[] {

        const specificValidatorsForControl: ValidatorFn[] = _.get(specificValidators, controlPath + '.' + controlName);

        return (typeof specificValidatorsForControl === 'undefined') ? uniformValidators
                                                                     : uniformValidators.concat(specificValidatorsForControl);
    }


    /**
     * Applies a given applyFn() callback to each (Abstract) Form Control that is a member of this object's contained form instance.
     * @param thisArg The this arg used when invoking the given applyFn() callback.
     * @param applyFn The applyFn() callback that is invoked for each (abstract) control that is a member of the contained form.
     * @param formControlsOnly Set to true if only Form Controls should be targeted (not Form Groups or Form Arrays).
     */
    public applyFormControls(thisArg: any, applyFn: (controlPath: string, control: AbstractControl) => void, formControlsOnly: boolean = false): void {
        this.applySubFormControls(thisArg, this.form, applyFn, formControlsOnly);
    }


    private applySubFormControls (
        thisArg: any,
        form: FormGroup | FormArray,
        applyFn: (controlPath: string, control: AbstractControl) => void,
        formControlsOnly: boolean,
        basePath: string = ''): void
    {
        for (let controlName in form.controls) {
            if (form.controls.hasOwnProperty(controlName)) {

                const formControl: AbstractControl = form.controls[controlName];
                const isFormGroupArr: boolean = ( form.controls[controlName] instanceof FormGroup || form.controls[controlName] instanceof FormArray );

                // If abstract control is a form group or array, recursively call applyFn() on children.
                if (isFormGroupArr) {

                    const controlPath = ( basePath.length === 0 ) ? controlName
                                                                  : ( basePath + '.' + controlName );
                    this.applySubFormControls(thisArg, form.controls[controlName], applyFn, formControlsOnly, controlPath);
                }
                
                // If abstract control is not a form group or array, or we can call the applyFn() on form groups/arrays.
                if (!isFormGroupArr || !formControlsOnly) {

                    const controlPath: string = ( basePath.length === 0 ) ? controlName
                                                                          : ( basePath + '.' + controlName );
                    applyFn.call(thisArg, controlPath, form.get(controlName));
                }
            }
        }
    }


    /**
     * Sets the validators for a given form based off of a list of uniform validators and specific member validators.
     * @param form The form group or array to set validators for.
     * @param uniformValidators A list of validator functions that will be set among all members of the given form.
     * @param specificValidators Specific validator function mappings that will be set for specific members of the given form. Accepts form.get() notation for keys.
     */
    public setFormValidators(form: FormGroup | FormArray, uniformValidators?: ValidatorFn[], specificValidators: { [key: string]: ValidatorFn[] } = {}): void {

        if (uniformValidators != null) {
            this.setUniformControlValidators(form, uniformValidators, specificValidators);
        }
        else {
            uniformValidators = []; // Set to empty array for ease of use below.
        }
        
        // Set specific validator(s) in addition to uniform validators for specified controls.
        for (let controlName in specificValidators) {
            if (specificValidators.hasOwnProperty(controlName)) {

                const validators: ValidatorFn[] = uniformValidators.concat(specificValidators[controlName]);
                form.get(controlName).setValidators(validators);
            }
        }
    }


    private setUniformControlValidators (
        form: FormGroup | FormArray,
        uniformValidators?: ValidatorFn[],
        specificValidators: { [key: string]: ValidatorFn[] } = {},
        baseControlPath: string = ''): void
    {
        // Set uniform validator(s) for each control that isn't listed to contain specific validator(s).
        for (let controlName in form.controls) {
            if (form.controls.hasOwnProperty(controlName)) {

                const formControl: AbstractControl = form.controls[controlName];

                // If abstract control is a form group or array, recursively set validators for child control(s).
                if (form.controls[controlName] instanceof FormGroup || form.controls[controlName] instanceof FormArray) {

                    baseControlPath = ( baseControlPath.length === 0 ) ? controlName
                                                                       : ( '.' + controlName );
                    this.setUniformControlValidators(form.controls[controlName], uniformValidators, specificValidators, baseControlPath);
                }
                
                // If we don't have specific validator(s) for this control.
                if (typeof specificValidators[baseControlPath + '.' + controlName] === 'undefined') {
                    form.get(controlName).setValidators(uniformValidators);
                }
            }
        }
    }


    /**
     * Determines if a given control has any error(s).
     * @param controlPath The path of the control relative to the base form.
     * @param errorCode An optional error code to check for if a specific error is being examined. Default is null for any error.
     * true if an error(s) exist, false if not.
     */
    public hasError(controlPath: string, errorCode?: string): boolean {

        let control: AbstractControl = (controlPath === '.') ? this.form
                                                             : this.form.get(controlPath);

        return ( control.errors != null && (errorCode == null || control.hasError(errorCode)));
    }


    /**
     * Generates an error message for a given control (assuming the control has an error).
     * @param controlPath The path of the control relative to the base form.
     * @return The error message for the given control.
     */
    public errorMsgFor(controlPath: string): string {

        let control: AbstractControl = (controlPath === '.') ? this.form
                                                             : this.form.get(controlPath);

        return this.validationService.errorMsgFor(control, controlPath);
    }
}
