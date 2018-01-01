import { Component, OnInit, Input, forwardRef, OnChanges, SimpleChanges, SimpleChange } from '@angular/core';
import { ControlValueAccessor, FormGroup, NG_VALUE_ACCESSOR, FormControl, FormBuilder, Validators, ValidatorFn } from '@angular/forms';
import * as moment from 'moment';

import { SlickTimeRangeValidationService, ValidationService, Validation } from './slick-time-range-validation.service';
import { AbstractModelDrivenComponent } from '../../../../common-util/components/abstract-model-driven-component';

import { DateFormatter } from '../../../../../../../shared/common-util/date-formatter';
import { TimeRange } from '../../../../../../../shared/app-user/time-range';


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
export class SlickTimeRangeComponent extends AbstractModelDrivenComponent implements OnInit, OnChanges, ControlValueAccessor {
    
    // Regular expressions used to dynaimcally filter hours and minutes inputs.
    private readonly DYNAMIC_HH_REG_EXP: RegExp;
    private readonly DYNAMIC_MM_REG_EXP: RegExp;

    /**
     * The weekday that the time range is for [0, 6] => ['Sunday', 'Saturday'].
     */
    @Input() private weekday: number;
    /**
     * When this value is set or changes to true, then the contained form will be forced to validate its controls and show any related errors.
     */
    @Input() private validate: boolean;
    @Input() private displayOnly: boolean;

    private groupValidators: ValidatorFn[][];
    /**
     * A callback function provided by a parent component (via directive such as ngModel).
     * ControlValueAccessor interface's registerOnChange method is used to register this callback.
     */
    private onChange: (timeRange: TimeRange) => void;


    public constructor (
        private formBuilder: FormBuilder,
        protected validationService: SlickTimeRangeValidationService
    ) {
        super(validationService);

        this.DYNAMIC_HH_REG_EXP = /^(0?[1-9]?|1[0-2]?)$/;
        this.DYNAMIC_MM_REG_EXP = /^([0-5][0-9]?)$/;

        this.onChange = (timeRange: TimeRange) => {}; // If not bound to by parent component, then swallow all changes here!
    }


    public ngOnInit(): void {

        this.form = this.formBuilder.group({
            'startTime':    [null, Validators.required],
            'endTime':      [null, Validators.required]
        }, { validator: this.validationService.timeOrder() });

        // Set required validators for contained Slick Input Group controls.
        this.groupValidators = [
            [ Validators.required, Validators.pattern(Validation.HH_REGEX) ],
            [ Validators.required, Validators.pattern(Validation.MM_REGEX) ],
            [ Validators.required, Validators.pattern(Validation.AM_OR_PM_REGEX) ]
        ];

        // Listen for any form changes and notify any listening components of change.
        this.form.valueChanges.subscribe(data => {
            this.onChange(this.readValue());
        });

        // ngOnInit() happens after ngOnChanges, so make sure we handle latest validate value here in uniform way!
        this.ngOnChanges({ validate: new SimpleChange(this.validate, this.validate, false) });
    }


    public ngOnChanges(changes: SimpleChanges): void {
        
        // Make sure we validate the contained form when validate is marked as true.
        if (changes.validate && changes.validate.currentValue && this.form) {
            this.validationService.markAllAsTouched(this.form);
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
        let startTime: string = this.form.controls.startTime.value;
        let endTime: string = this.form.controls.endTime.value;

        // Take calendar base date and construct new date with additional times. If time strings are missing parts, then null is generated here!
        let startDate: Date = DateFormatter.genDateFromWeekdayAndTime(this.weekday, startTime); 
        let endDate: Date = DateFormatter.genDateFromWeekdayAndTime(this.weekday, endTime);

        const datesCorrectFormat: boolean = ( startDate != null && endDate != null );  

        // If the date strings are in correct format and they are in correct temporal order.
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
            this.form.setValue({
                startTime:  DateFormatter.dateToWallClockString(timeRange.startTime),
                endTime:    DateFormatter.dateToWallClockString(timeRange.endTime)
            });
        }
        // Else we were given null, so set contained value back to empty.
        else {
            this.form.setValue({ startTime: null, endTime: null });
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
     * @param onTouched 
     */
    public registerOnTouched(onTouched: any): void {} // TODO - not really necessary...


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
