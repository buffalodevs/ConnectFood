import { Component, OnInit, Input, forwardRef, OnChanges, SimpleChanges, SimpleChange } from '@angular/core';
import { ControlValueAccessor, FormGroup, NG_VALUE_ACCESSOR, FormControl, FormBuilder, Validators, ValidatorFn } from '@angular/forms';

import { ValidationService } from '../../common-util/services/validation.service';

import { DateFormatter } from '../../../../../shared/common-util/date-formatter';
import { TimeRange } from '../../../../../shared/app-user/time-range';
import { SlickTimeRangeValidationService } from './validation/slick-time-range-validation.service';


@Component({
    selector: 'slick-time-range',
    templateUrl: './slick-time-range.component.html',
    styleUrls: ['./slick-time-range.component.css'],
    providers: [
        { 
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => SlickTimeRangeComponent),
            multi: true
        },
        SlickTimeRangeValidationService
    ]
})
export class SlickTimeRangeComponent implements OnInit, OnChanges, ControlValueAccessor {
    
    // Regular expressions used to filter hours and minutes inputs.
    private readonly HH_REG_EXP: RegExp;
    private readonly MM_REG_EXP: RegExp;

    /**
     * The base calendar date associated with the time.
     * If none is given, then today's date is used.
     */
    @Input() private calendarDateBase: Date;
    /**
     * When this value is set or changes to true, then the contained form will be forced to validate its controls and show any related errors.
     */
    @Input() private validate: boolean;

    private timeRangeForm: FormGroup;
    private groupValidators: ValidatorFn[][];
    /**
     * A callback function provided by a parent component (via directive such as ngModel).
     * ControlValueAccessor interface's registerOnChange method is used to register this callback.
     */
    private onChange: (timeRange: TimeRange) => void;


    public constructor (
        private formBuilder: FormBuilder,
        private validationService: SlickTimeRangeValidationService
    ) {

        this.HH_REG_EXP = /^([2-9]|1[0-2]?)$/;
        this.MM_REG_EXP = /^([0-5][0-9]?)$/;

        this.calendarDateBase = new Date(); // Default Now for Base Calendar Date.
        this.onChange = (timeRange: TimeRange) => {}; // If not bound to by parent component, then swallow all changes here!
    }


    public ngOnInit(): void {

        this.calendarDateBase = DateFormatter.ensureIsDate(this.calendarDateBase);
        this.timeRangeForm = this.formBuilder.group({
            'startTime':    [null, Validators.required],
            'endTime':      [null, Validators.required]
        }, { validator: this.validationService.timeOrder() });

        // Set required validators for contained Slick Input Group controls.
        this.groupValidators = [
            [Validators.required, Validators.pattern(this.HH_REG_EXP)],
            [Validators.required, Validators.pattern(/^([0-5][0-9])$/)],
            [Validators.required, Validators.pattern(/^([aApP][mM])$/)]
        ];

        // Listen for any form changes and notify any listening components of change.
        this.timeRangeForm.valueChanges.subscribe(data => {
            this.onChange(this.readValue());
        });

        this.ngOnChanges({ validate: new SimpleChange(this.validate, this.validate, false) });
    }


    public ngOnChanges(changes: SimpleChanges): void {
        
        // Make sure we validate the contained form when validate is marked as true.
        if (changes.validate && changes.validate.currentValue) {
            this.validationService.markAllAsTouched(this.timeRangeForm);
        }
    }


    /**
     * Checks if the current value is valid, and the current state of the form is complete.
     * @return true if it is valid, false if not.
     */
    public isValueValid(): boolean {
        return ( this.readValue() != null );
    }


    /**
     * Gets the time range value input by the user.
     * @return The time range value.
     *         NOTE: If the current state of the time range form is invalid, then null is returned.
     */
    public readValue(): TimeRange {

        let timeRange: TimeRange = null;

        // Extract start and end time strings from form.
        let startTime: string = this.timeRangeForm.controls.startTime.value;
        let endTime: string = this.timeRangeForm.controls.endTime.value;

        // Take calendar base date and construct new date with additional times. If time strings are missing parts, then null is generated here!
        let startDate: Date = DateFormatter.setWallClockTimeForDate(this.calendarDateBase, startTime);
        let endDate: Date = DateFormatter.setWallClockTimeForDate(this.calendarDateBase, endTime);

        // If the date strings are in correct format and they are in correct temporal order.
        const datesCorrectFormat: boolean = ( startDate != null && endDate != null );
        if (datesCorrectFormat && startDate.valueOf() < endDate.valueOf()) {
            timeRange = new TimeRange(startDate, endDate);
        }

        return timeRange;
    }


    /**
     * Writes a new value to the contained view model. This function is part of the ControlValueAccessor
     * interface and is implicitely called by directives (such as ngModel) when the data within this component
     * should be updated by a parent component.
     * @param timeRange The time range value to write.
     */
    public writeValue(timeRange: TimeRange): void {

        // Ingore undefined values!
        if (timeRange === undefined)  return;

        // If given a non-null value, then write it.
        if (timeRange !== null) {
            this.timeRangeForm.setValue(timeRange);
        }
        // Else we were given null, so set contained value back to empty.
        else {
            this.timeRangeForm.setValue(new TimeRange(null, null));
        }
    }


    /**
     * Provides a callback function that shall be invoked whenever there is an update to this component's time range data.
     * @param onChange The callback function invoked on any change to contained time range data.
     */
    public registerOnChange(onChange: (timeRange: TimeRange) => void): void {
        this.onChange = onChange;
    }


    /**
     * 
     * @param onTouched 
     */
    public registerOnTouched(onTouched: any): void {
        // TODO - not really necessary...
    }


    /**
     * Ensures that each minute input has 2 digits when they lose focus and have data in them.
     * @param mmControl The minute form control that is being checked.
     */
    private ensureMinutes2Digits(mmControl: FormControl): void {

        if (mmControl != null && mmControl.value != null && mmControl.value.length === 1) {
            mmControl.setValue('0' + mmControl.value);
        }
    }
}
