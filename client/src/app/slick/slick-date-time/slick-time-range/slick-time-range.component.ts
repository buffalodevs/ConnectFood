import { Component, OnInit, Input, forwardRef, OnChanges, SimpleChanges, SimpleChange } from '@angular/core';
import { ControlValueAccessor, FormGroup, NG_VALUE_ACCESSOR, FormControl, FormBuilder, Validators, ValidatorFn } from '@angular/forms';
import * as moment from 'moment';

import { AbstractModelDrivenComponent } from '../../../common-util/components/abstract-model-driven-component';
import { DateFormatterService } from '../../../common-util/services/date-formatter.service';
import { SlickTimeRangeValidationService } from './slick-time-range-validation.service';

import { DateRange, DateRangeErr } from '../../../../../../shared/src/date-time-util/date-range';


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

    /**
     * When this value is set or changes to true, then the contained form will be forced to validate its controls and show any related errors.
     */
    @Input() public activateValidation: boolean;
    @Input() public displayOnly: boolean;
    @Input() public includeDate: boolean;

    /**
     * A callback function provided by a parent component (via directive such as ngModel).
     * ControlValueAccessor interface's registerOnChange method is used to register this callback.
     */
    private onChange: (timeRange: DateRange) => void;


    public constructor (
        public validationService: SlickTimeRangeValidationService,
        public dateFormatter: DateFormatterService,
        formBuilder: FormBuilder
    ) {
        super(validationService, formBuilder);

        this.activateValidation = false;
        this.displayOnly = false;
        this.includeDate = false;

        this.onChange = (timeRange: DateRange) => {}; // If not bound to by parent component, then swallow all changes here!
    }


    public ngOnInit(): void {

        this.initForm();

        // Listen for any form changes and notify any listening components of change.
        this.form.valueChanges.subscribe(data => {
            this.onChange(this.readValue());
        });

        // ngOnInit() happens after ngOnChanges, so make sure we handle latest validate value here in uniform way!
        this.ngOnChanges({ validate: new SimpleChange(this.activateValidation, this.activateValidation, false) });
    }


    /**
     * Initiailzes the date-time range form for this component.
     */
    private initForm(): void {

        const timeCtrlValidators: ValidatorFn[] = [ Validators.required, Validators.pattern(this.validationService.TIME_REGEX) ];

        this.form = this._formBuilder.group({
            'startDate':    [ null, Validators.required ],
            'endDate':      [ null, Validators.required ],
            'startTimeStr': [ null, timeCtrlValidators ],
            'endTimeStr':   [ null, timeCtrlValidators ]
        }, { validator: this.validationService.timeOrder(this.includeDate) });
        this.writeValue(null);
    }


    public ngOnChanges(changes: SimpleChanges): void {
        
        // Make sure we validate the contained form when validate is marked as true.
        if (changes.activateValidation && changes.activateValidation.currentValue && this.form) {
            this.validationService.markAllAsTouched(this.form);
        }

        // Ensure we update form validator to include or not include date form controls.
        if (changes.includeDate && this.form) {
            
            this.form.setValidators(this.validationService.timeOrder(this.includeDate));

            // If we are changing to not include the date, then we must default start and end date to today if they do not already have values.
            if (!this.includeDate) {
                
                const currentDate: Date = new Date();
                if (this.form.get('startDate').value == null)   this.form.get('startDate').setValue(currentDate);
                if (this.form.get('endDate').value == null)     this.form.get('endDate').setValue(currentDate);
            }
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
     * @return The time range value. The times are simply wrapped in Date objects with the calendar date set to today.
     *         NOTE: If the current state of the time range form is invalid, then null is returned.
     */
    public readValue(): DateRange {

        if (!this.form.valid)   return undefined;

        // Extract start and end time strings from form.
        let startDate: Date = this.includeDate ? this.form.get('startDate').value
                                               : new Date();
        let endDate: Date = this.includeDate ? this.form.get('endDate').value
                                             : new Date();
        let startTimeStr: string = this.form.get('startTimeStr').value;
        let endTimeStr: string = this.form.get('endTimeStr').value;

        return this.genTimeRangeFromFormVals(startDate, endDate, startTimeStr, endTimeStr);
    }


    /**
     * Generates a time range based off of given date-time values extracted from this component's contained form.
     * @param startDate The start date.
     * @param endDate The end date.
     * @param startTimeStr The start time string.
     * @param endTimeStr The end time string.
     * @return The generated time range. If any provided values are empty, malformed, or not ordered correctly, then null is returned.
     */
    private genTimeRangeFromFormVals(startDate: Date, endDate: Date, startTimeStr: string, endTimeStr: string): DateRange {

        const startDateStr: string = this.dateFormatter.dateToMonthDayYearString(startDate);
        const endDateStr: string = this.dateFormatter.dateToMonthDayYearString(endDate);

        // Generate the time range and check for any format/order error(s).
        let timeRange = new DateRange(new Date(startDateStr + ' ' + startTimeStr), new Date(endDateStr + ' ' + endTimeStr));

        // If the date strings are not in correct format or temporal order.
        if (timeRange.checkForErr() != null) {
            timeRange = undefined;
        }

        return timeRange;
    }


    /**
     * Writes a new value to the contained view model. This function is part of the ControlValueAccessor
     * interface and is implicitely called by directives (such as ngModel) when the data within this component
     * should be updated by a parent component.
     * @param timeRange The time range value to write.
     */
    public writeValue(timeRange: DateRange): void {

        const defaultDate: Date =  this.includeDate ? null
                                                    : new Date();

        let formValue = {
            startDate: defaultDate,
            endDate: defaultDate,
            startTimeStr: null,
            endTimeStr: null
        }

        if (timeRange != null) {

            formValue.startDate = timeRange.startTime;
            formValue.endDate = timeRange.endTime;
            formValue.startTimeStr = this.dateFormatter.dateToWallClockString(timeRange.startTime);
            formValue.endTimeStr = this.dateFormatter.dateToWallClockString(timeRange.endTime);
        }

        this.form.setValue(formValue);
    }


    /**
     * Provides a callback function that shall be invoked whenever there is an update to this component's time range data.
     * @param onChange The callback function invoked on any change to contained time range data.
     */
    public registerOnChange(onChange: (timeRange: DateRange) => void): void {
        this.onChange = onChange;
    }


    /**
     * @param onTouched 
     */
    public registerOnTouched(onTouched: any): void {} // TODO - not really necessary...
}
