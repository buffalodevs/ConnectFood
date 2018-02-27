import { Component, OnInit, Input, OnChanges, forwardRef, SimpleChange, SimpleChanges } from '@angular/core';
import { FormGroup, FormControl, ControlValueAccessor, NG_VALUE_ACCESSOR, FormArray, Validators, FormBuilder, AbstractControl, Validator, NG_VALIDATORS } from '@angular/forms';

import { WeekdaySplitService } from './weekday-util/weekday-split.service';
import { WeekdayForm } from './weekday-util/weekday-form';
import { ValidationService } from '../../../common-util/services/validation.service';
import { DateFormatterService } from '../../../common-util/services/date-formatter.service';

import { AbstractModelDrivenComponent } from '../../../common-util/components/abstract-model-driven-component';
import { DateRange } from '../../../../../../shared/src/date-time-util/date-range';


@Component({
    selector: 'slick-weekday-schedule-builder',
    templateUrl: './slick-weekday-schedule-builder.component.html',
    styleUrls: ['./slick-weekday-schedule-builder.component.css', '../common-scheduler/schedule-builder.css'],
    providers: [
        { 
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => SlickWeekdayScheduleBuilderComponent),
            multi: true
        },
        {
            provide: NG_VALIDATORS,
            useExisting: forwardRef(() => SlickWeekdayScheduleBuilderComponent),
            multi: true,
        },
        WeekdaySplitService
    ]
})
export class SlickWeekdayScheduleBuilderComponent extends AbstractModelDrivenComponent implements OnInit, OnChanges, ControlValueAccessor, Validator {
    
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
     * If set by parent component via model binding (implicitly calls registerOnChange method),
     * then this callback will be invoked whenever a change occurs.
     */
    private onChange: (value: DateRange[]) => void;
    public form: WeekdayForm;


    public constructor (
        public weekdaySplitService: WeekdaySplitService,
        private _dateFormatter: DateFormatterService,
        validationService: ValidationService,
        formBuilder: FormBuilder
    ) {
        super(validationService, formBuilder);

        this.requireAtLeastOne = false;
        this.displayOnly = false;
        this.allowAdd = true;
        this.allowRemove = true;
        this.onChange = (value: DateRange[]) => {}; // If contained model is not bound to by parent, then swallow all changes here!
    }


    public ngOnInit(): void {

        // Initialize weekday form with correct validator.
        this.form = new WeekdayForm(this._dateFormatter, null, this.requireAtLeastOne ? this.validationService.requireAtLeastOneField()
                                                                                      : null);

        // Listen for any form value changes.
        this.form.valueChanges.subscribe(() => { this.onChange(this.readValue()); });

        // Trigger validate after full form initialization (if validate is set).
        this.ngOnChanges({ validate: new SimpleChange(this.activateValidation, this.activateValidation, false) });
    }


    public ngOnChanges(changes: SimpleChanges): void {

        super.ngOnChanges(changes);
        
        // Make sure we validate the contained form when validate is marked as true.
        if (changes.activateValidation && changes.activateValidation.currentValue) {
            this.validationService.markAllAsTouched(this.form);
        }
        
        // Adjust the column splits based on the value of displayOnly and the number of weekdays we have data for.
        if (changes.displayOnly) {
            this.weekdaySplitService.updateWeekdaySplits(this.form, !this.displayOnly);
        }
    }


    /**
     * Adds a time range to a given weekday.
     * @param weekday The weekday to add the time range to.
     */
    private addAvailabilityRange(weekday: string): void {
        
        if (!this.allowAdd)  throw new Error('Attempting to add time range when allowAdd is: ' + this.allowAdd);
        this.form.addAvailabilityRange(weekday);
    }


    /**
     * Removes a time range from a given weekday at a given index.
     * @param weekday The weekday to remove the time range from.
     * @param index The index of the time range to remove.
     */
    private removeAvailabilityRange(weekday: string, index: number): void {

        if (!this.allowRemove)  throw new Error('Attempting to remove time range when allowRemove is: ' + this.allowRemove);
        this.form.removeAvailabilityRange(weekday, index);
    }


    /**
     * Checks if a new time range can be added for a given weekday.
     * @param weekday The weekday that is being checked.
     * @return true if a new time range can be added, false if not.
     */
    private canAddNewAvailabilityRange(weekday: string): boolean {

        let weekdaysFormArr: FormArray = <FormArray>this.form.get(weekday);
        let lastAvailabilityRangeValid: boolean = ( weekdaysFormArr.length === 0 || weekdaysFormArr.at(weekdaysFormArr.length - 1).value != null );

        return ( this.allowAdd && lastAvailabilityRangeValid && !this.displayOnly );
    }


    /**
     * Gets the current value.
     * @return The current value.
     *         NOTE: If any time range input filed is incomplete, then an empty array is returned.
     */
    public readValue(): DateRange[] {

        if (!this.form.valid)  return [];
        return this.form.getAvailabilityRanges();
    }


    /**
     * Writes a new value to the contained view model. This function is part of the ControlValueAccessor
     * interface and is implicitely called by directives (such as ngModel) when the data within this component
     * should be updated by a parent component.
     * @param value The value to write.
     */
    public writeValue(value: DateRange[]): void {
        this.form.setAvailabilityRanges(value);
        this.weekdaySplitService.updateWeekdaySplits(this.form, !this.displayOnly);
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
