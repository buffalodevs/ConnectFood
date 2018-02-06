import { Component, OnInit, Input, forwardRef, OnChanges, SimpleChanges, SimpleChange } from '@angular/core';
import { ControlValueAccessor, FormGroup, NG_VALUE_ACCESSOR, FormControl, FormBuilder, Validators } from '@angular/forms';
import * as moment from 'moment';

import { AbstractModelDrivenComponent } from '../../../common-util/components/abstract-model-driven-component';
import { DateFormatterService } from '../../../common-util/services/date-formatter.service';
import { SlickTimeRangeValidationService } from './slick-time-range-validation.service';

import { DateRange, DateRangeErr } from '../../../../../../shared/src/date-time-util/date-range';
import * as _ from 'lodash';


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
    @Input() public validate: boolean;
    @Input() public displayOnly: boolean;

    /**
     * A callback function provided by a parent component (via directive such as ngModel).
     * ControlValueAccessor interface's registerOnChange method is used to register this callback.
     */
    private onChange: (timeRange: DateRange) => void;


    public constructor (
        public validationService: SlickTimeRangeValidationService,
        private _dateFormatter: DateFormatterService,
        formBuilder: FormBuilder
    ) {
        super(validationService, formBuilder);

        this.onChange = (timeRange: DateRange) => {}; // If not bound to by parent component, then swallow all changes here!
    }


    public ngOnInit(): void {

        this.form = this._formBuilder.group({
            'startTimeStr': [null, Validators.required],
            'endTimeStr':   [null, Validators.required]
        }, { validator: this.validationService.timeOrder() });

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
     * @return The time range value. The times are simply wrapped in Date objects with the calendar date set to today.
     *         NOTE: If the current state of the time range form is invalid, then null is returned.
     */
    public readValue(): DateRange {

        let timeRange: DateRange = null;

        // Extract start and end time strings from form.
        let startTimeStr: string = this.form.get('startTimeStr').value;
        let endTimeStr: string = this.form.get('endTimeStr').value;

        if (!_.isEmpty(startTimeStr) && !_.isEmpty(endTimeStr)) {

            const currentDateStr: string = this._dateFormatter.dateToMonthDayYearString(new Date());

            // Generate the time range and check for any format/order error(s).
            timeRange = new DateRange(new Date(currentDateStr + ' ' + startTimeStr), new Date(currentDateStr + ' ' + endTimeStr));

            // If the date strings are not in correct format or temporal order.
            if (timeRange.checkForErr() != null) {
                timeRange = null;
            }
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

        const startTimeStr: string = (timeRange != null) ? this._dateFormatter.dateToWallClockString(timeRange.startTime)
                                                         : null;

        const endTimeStr: string = (timeRange != null) ? this._dateFormatter.dateToWallClockString(timeRange.endTime)
                                                       : null;

        this.form.setValue({ startTimeStr: startTimeStr, endTimeStr: endTimeStr });
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
