import { Component, OnInit, Input, OnChanges, forwardRef, SimpleChange, SimpleChanges } from '@angular/core';
import { FormGroup, FormControl, ControlValueAccessor, NG_VALUE_ACCESSOR, FormArray, Validators, FormBuilder, Validator, AbstractControl } from '@angular/forms';

import { ValidationService } from '../../../common-util/services/validation.service';
import { DateFormatterService } from '../../../common-util/services/date-formatter.service';

import { AbstractModelDrivenComponent } from '../../../common-util/components/abstract-model-driven-component';
import { DateRange } from '../../../../../../shared/src/date-time-util/date-range';


@Component({
    selector: 'slick-date-time-schedule-builder',
    templateUrl: './slick-date-time-schedule-builder.component.html',
    styleUrls: ['./slick-date-time-schedule-builder.component.css', '../common-scheduler/schedule-builder.css'],
    providers: [
        { 
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => SlickDateTimeScheduleBuilderComponent),
            multi: true
        }
    ]
})
export class SlickDateTimeScheduleBuilderComponent extends AbstractModelDrivenComponent implements OnInit, OnChanges, ControlValueAccessor, Validator {
    
    public readonly AVAILABILITY_RANGES_CTRL_NAME: string;

    /**
     * Set to true if at least one entry should be required.
     * Default value is false (which will allow 0 entries to be entered).
     */
    @Input() public requireAtLeastOne: boolean;
    /**
     * Set to true if this component should be in display mode rather than edit mode.
     * Default value is false.
     */
    @Input() public displayOnly: boolean;
    @Input() public allowAdd: boolean;
    @Input() public allowRemove: boolean;
    /**
     * When this value is set or changes to true, then the contained form will be forced to validate its controls and show any related errors.
     */
    @Input() public activateValidation: boolean;

    /**
     * If set by parent component via model binding (implicitly calls registerOnChange method),
     * then this callback will be invoked whenever a change occurs.
     */
    private onChange: (value: DateRange[]) => void;


    public constructor (
        validationService: ValidationService,
        dateFormatter: DateFormatterService,
        formBuilder: FormBuilder
    ) {
        super(validationService, formBuilder);

        this.AVAILABILITY_RANGES_CTRL_NAME = 'availabilityRanges';

        this.requireAtLeastOne = false;
        this.displayOnly = false;
        this.allowAdd = true;
        this.allowRemove = true;
        this.onChange = (value: DateRange[]) => {}; // If contained model is not bound to by parent, then swallow all changes here!
    }


    public ngOnInit(): void {

        // Initialize form with correct validator.
        this.form = new FormGroup({}, this.requireAtLeastOne ? this.validationService.requireAtLeastOneField()
                                                             : null);
        this.form.addControl(this.AVAILABILITY_RANGES_CTRL_NAME, new FormArray([]));

        // Listen for any form value changes.
        this.form.valueChanges.subscribe(() => { this.onChange(this.readValue()); });

        // Trigger validate after full form initialization (if validate is set).
        this.ngOnChanges({ validate: new SimpleChange(this.activateValidation, this.activateValidation, false) });
    }


    public ngOnChanges(changes: SimpleChanges): void {
        
        // Make sure we validate the contained form when validate is marked as true.
        if (changes.activateValidation && changes.activateValidation.currentValue) {
            this.validationService.markAllAsTouched(this.form);
        }
    }


    /**
     * Adds an availability time range to the scheduler.
     */
    public addAvailabilityRange(): void {
        
        if (!this.allowAdd)  throw new Error('Attempting to add availability range when allowAdd is: ' + this.allowAdd);
        (<FormArray>this.control(this.AVAILABILITY_RANGES_CTRL_NAME)).push(new FormControl(null, Validators.required));
    }


    /**
     * Removes an availability time range from the scheduler at a given index.
     * @param index The index of the time range to remove.
     */
    public removeAvailabilityRange(index: number): void {

        if (!this.allowRemove)  throw new Error('Attempting to remove availability range when allowRemove is: ' + this.allowRemove);
        (<FormArray>this.control(this.AVAILABILITY_RANGES_CTRL_NAME)).removeAt(index);
    }


    /**
     * Checks if a new availability time range can be added to the scheduler.
     * @return true if a new time range can be added, false if not.
     */
    public canAddNewAvailabilityRange(): boolean {

        const availabilityFormArr: FormArray = <FormArray>this.control(this.AVAILABILITY_RANGES_CTRL_NAME);
        const lastAvailabilityRangeValid: boolean = ( availabilityFormArr.length === 0 || availabilityFormArr.at(availabilityFormArr.length - 1).value != null );

        return ( this.allowAdd && lastAvailabilityRangeValid && !this.displayOnly );
    }


    /**
     * Gets the current value.
     * @return The current value.
     *         NOTE: If any time range input filed is incomplete, then an empty array is returned.
     */
    public readValue(): DateRange[] {

        return this.form.valid ? this.form.get(this.AVAILABILITY_RANGES_CTRL_NAME).value
                               : [];
    }


    /**
     * Writes a new value to the contained view model. This function is part of the ControlValueAccessor
     * interface and is implicitely called by directives (such as ngModel) when the data within this component
     * should be updated by a parent component.
     * @param value The value to write.
     */
    public writeValue(value: DateRange[]): void {

        this.clearAvailabilityRanges();
        
        let avaialbilityFormArr: FormArray = <FormArray>this.form.get(this.AVAILABILITY_RANGES_CTRL_NAME);
        avaialbilityFormArr.setValue(value);
    }


    /**
     * Clears the time ranges held within the form form group (model), which makes it ready for new ones.
     */
    public clearAvailabilityRanges(): void {
                
        let avaialbilityFormArr: FormArray = <FormArray>this.form.get(this.AVAILABILITY_RANGES_CTRL_NAME);
        
        // NOTE: Important to remove all elements via loop instead of just setting to new FormArray object
        //       since this can unintentionally invalidate any listeners on given form arrays!!!
        while (avaialbilityFormArr.length !== 0) {
            avaialbilityFormArr.removeAt(0);
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
     * Performs custom validation for this component/control based off of contained form's validation state.
     */
    public validate(c: AbstractControl): { [key: string]: any; } {

        if (!this.form.valid) {

            // Is the error directly with the contained form, or is it for some child control?
            return (this.form.errors != null) ? this.form.errors
                                              : { 'invalidTimeRange': 'Please complete or fix any invalid time ranges.' };
        }

        return null;
    }


    public registerOnValidatorChange?(fn: () => void): void {}


    /**
     * @param onTouched 
     */
    public registerOnTouched(onTouched: string): void {}  // TODO - not really necessary...
}
