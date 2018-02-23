import { Component, OnInit, OnChanges, Input, forwardRef, SimpleChanges, SimpleChange } from '@angular/core';
import { ControlValueAccessor, FormGroup, NG_VALUE_ACCESSOR, FormControl, ValidatorFn } from '@angular/forms';

import { ConcatPatternParserService } from './concat-pattern-parser.service';
import { ValidationService } from '../../common-util/services/validation.service';


/**
 * Ties form controls together under a single internal form. The values of these controls are assembled into a signle value.
 * This value can be the form of any object or string. If it is an object, then simply binding an object to the model of this componenet will suffice.
 * If it is a string, then a concatPattern input must be provided to instruct the component on how to assemble the values of the form into a signle string output.
 */
@Component({
    selector: 'slick-input-group',
    templateUrl: './slick-input-group.component.html',
    styleUrls: ['./slick-input-group.component.css'],
    providers: [
        ConcatPatternParserService,
        {
            provide: NG_VALUE_ACCESSOR,
            multi: true,
            useExisting: forwardRef(() => SlickInputGroupComponent),
        }
    ]
})
export class SlickInputGroupComponent extends FormGroup implements OnInit, OnChanges, ControlValueAccessor {

    /**
     * A concatenation pattern for the result that resembles a SQL prepared statement.
     * Variable slots, which represent the form members' values, are represented by the '`formControlName`' symbol where formControlName
     * is the name of the form control where the value will be retrieved from.
     * Constants are put in plain text throughout the string, and can appear anywhere.
     * 
     * Here is an example of a valid concatPattern for wall-clock time: '`hours`:`minutes` `amOrPm`'
     * The example could form a result string such as: '12:30 PM'
     * 
     * NOTE: A concatPattern can never be entered if it has two tangent variables. There must always be a constant separator between variables!
     * NOTE: If no concat pattern is provided, then the data format for input and output is expected to be an object whose members contain the full
     *       set of all formControlNames as their keys. In other words, the object shape/members must align with the contained form's shape/members!
     *       This allows parent to directly set and get an object through model binding without any extra work/code!
     */
    @Input() public concatPattern: string;
    /**
     * Each member of the input list cotains a list of validators corresponding to each control listed in concatPattern in order.
     * 
     * For example, let's say that concatPattern is `hh`:`mm` `amOrPm`, and validators is [[Validator.required], [Validator.required]].
     * Then, the hh and mm controls will be required, but no validation will be associated with the amOrPm control.
     */
    @Input() public validators: ValidatorFn[][];
    /**
     * When this value is set or changes to true, then the contained form will be forced to validate its controls and show any related errors.
     */
    @Input() public activateValidation: boolean;

    private _formValueSet: boolean = false;
    private onChange: (value: any) => void = () => {}; // If model not bound to from parent, simply swallow all changes here.


    public constructor (
        private validationService: ValidationService,
        private concatPatternParser: ConcatPatternParserService
    ) {
        super({});
    }

    
    public ngOnInit(): void {

        this.addFormControlsIfNotExist();
        this.valueChanges.subscribe(this.onValueChange.bind(this));

        this.ngOnChanges({ validate: new SimpleChange(this.activateValidation, this.activateValidation, false) });
    }


    public ngOnChanges(changes: SimpleChanges): void {
        
        // Make sure we validate the contained form when validate is marked as true.
        if (changes.activateValidation && changes.activateValidation.currentValue) {
            this.validationService.markAllAsTouched(this);
        }
    }


    /**
     * Adds form controls to this form if they do not yet exist.
     * @param writeObj The optional write object from which to model and get the form control data form.
     */
    private addFormControlsIfNotExist(writeObj?: any): void {

        if (this._formValueSet)  return;        

        // If the form control names are in the concatPattern string.
        if (this.concatPattern != null) {
            this.addFormControlsForConcatPattern();
        }
        // Else they are in a given value on write.
        else if (writeObj != null) {
            this.addFormControlsForWriteObject(writeObj);
        }
    }


    /**
     * Adds form controls to this form if they do not yet exist. The form controls will be based off of a concat pattern.
     */
    private addFormControlsForConcatPattern(): void {

        // Extract out formControlNames and add form controls.
        let formControlNames: string[] = this.concatPatternParser.getPatternVariableNames(this.concatPattern);
        for (let i: number = 0; i < formControlNames.length; i++) {
            this.addControl(formControlNames[i], new FormControl(null, (this.validators != null) ? this.validators[i]
                                                                                                 : undefined));
        }

        this._formValueSet = true;
    }


    /**
     * Adds form controls to this form if they do not yet exist. The form controls will be based off the structure and data of a write object.
     * @param writeObj The write object from which to model and get the form control data from.
     */
    private addFormControlsForWriteObject(writeObj: any): void {

        let i: number = 0;
        for (let property in writeObj) {
            if (writeObj.hasOwnProperty(property)) {
                this.addControl(property, new FormControl(null, (this.validators != null) ? this.validators[i++]
                                                                                          : undefined));
            }
        }

        this._formValueSet = true;
    }


    /**
     * Handles any value changes by reading the parsed value and sending it off to the parent's onChange callback function.
     */
    private onValueChange(): void {
        this.onChange(this.readValue());
    }


    /**
     * Gets the current value.
     * @return The current value.
     */
    public readValue(): any {
        return (this.concatPattern != null) ? this.concatPatternParser.parseConcatPattern(this.concatPattern, this.value)
                                            : this.value;
    }


    /**
     * Writes a new value to the contained view model. This function is part of the ControlValueAccessor
     * interface and is implicitely called by directives (such as ngModel) when the data within this component
     * should be updated by a parent component.
     * @param value The value to write.
     */
    public writeValue(value: any): void {

        if (value != null) {

            let formValue: any;

            // Are we writing to the form members based on a concatPattern and string value, or are we mapping from an object?
            if (this.concatPattern != null) {
                formValue = this.concatPatternParser.setFormValuesFromParsedString(this.concatPattern, value)
            }
            else {
                this.addFormControlsIfNotExist(value);
                formValue = value;
            }

            this.setValue(formValue);
        }
        else {
            this.setFormValsNull();
        }
    }


    /**
     * (Re)Sets all contained form values to null.
     */
    private setFormValsNull(): void {

        for (let property in this.controls) {
            if (this.controls.hasOwnProperty(property)) {
                this.get(property).setValue(null);
            }
        }
    }


    /**
     * Provides a callback function that shall be invoked whenever there is an update to this component's data.
     * @param onChange The callback function invoked on any change to contained time range data.
     */
    public registerOnChange(onChange: (value: any) => void): void {
        this.onChange = onChange;
    }


    /**
     * 
     * @param onTouched 
     */
    public registerOnTouched(onTouched: string): void {
        // TODO - not really necessary...
    }
}
