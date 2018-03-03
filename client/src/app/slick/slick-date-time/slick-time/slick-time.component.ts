import * as moment from 'moment';
import { Component, Input, OnInit, AfterViewInit, ViewChild, forwardRef, SimpleChanges, OnChanges } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, Validators, ValidatorFn, FormBuilder, FormGroup, AbstractControl } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material';
import { NGXLogger } from 'ngx-logger';

import { AbstractModelDrivenComponent } from '../../../common-util/components/abstract-model-driven-component';
import { SlickTimeValidationService } from './slick-time-validation.service';
import { SlickTypeaheadService } from '../../slick-type-ahead/slick-type-ahead.service';
import { DateFormatterService } from '../../../common-util/services/date-formatter.service';

import { DateFormatter } from '../../../../../../shared/src/date-time-util/date-formatter';


@Component({
    selector: 'slick-time',
    templateUrl: './slick-time.component.html',
    styleUrls: ['./slick-time.component.css'],
    providers: [
        { 
          provide: NG_VALUE_ACCESSOR,
          multi: true,
          useExisting: forwardRef(() => SlickTimeComponent),
        },
        SlickTimeValidationService
    ]
})
export class SlickTimeComponent extends AbstractModelDrivenComponent implements OnInit, OnChanges, ControlValueAccessor {

    public readonly GROUP_VALIDATORS: ValidatorFn[][];

    @Input() public includeDate: boolean = false;
    @Input() public errorStateMatcher: ErrorStateMatcher = null;


    /**
     * A callback function provided by a parent component (via directive such as ngModel).
     * ControlValueAccessor interface's registerOnChange method is used to register this callback.
     */
    private onChange: (value: Date) => void = () => {};


    public constructor (
        public validationService: SlickTimeValidationService,
        public typeaheadService: SlickTypeaheadService,
        public dateFormatter: DateFormatterService,
        private _logger: NGXLogger,
        formBuilder: FormBuilder
    ) {
        super(validationService, formBuilder);

        // Set required validators for contained Slick Input Group controls.
        this.GROUP_VALIDATORS = [
            [ Validators.required, Validators.pattern(this.validationService.HH_REGEX) ],
            [ Validators.required, Validators.pattern(this.validationService.MM_REGEX) ],
            [ Validators.required, Validators.pattern(this.validationService.AM_OR_PM_REGEX) ]
        ];

        const timeCtrlValidators: ValidatorFn[] = [ Validators.required, Validators.pattern(this.validationService.TIME_REGEX) ];

        this.form = this._formBuilder.group({
            'timeStr': [ null, timeCtrlValidators ]
        });
        this.form.valueChanges.subscribe(this.listenForChange.bind(this));
    }


    public ngOnInit(): void {
        this.updtIncludeDate();
    }


    public ngOnChanges(changes: SimpleChanges): void {

        super.ngOnChanges(changes);
        
        if (changes.includeDate) {
            this.updtIncludeDate();
        }
    }


    /**
     * Updates the inclusion of a date field. If the date field
     */
    private updtIncludeDate(): void {

        if (this.includeDate && !this.form.contains('date')) {
            this.form.addControl('date', new FormControl(null, Validators.required));
        }
        else if (!this.includeDate && this.form.contains('date')) {
            this.form.removeControl('date');
        }
    }


    /**
     * Writes a value to the underlying input control.
     * @param value The new value to write.
     */
    public writeValue(value: Date): void {
        if (this.includeDate) this.form.get('date').setValue(value);
        this.form.get('timeStr').setValue(this.dateFormatter.dateToWallClockString(value));
    }


    /**
     * Registers a change listener in the underlying input control.
     * Associated with ngModel or formControl directives.
     * @param onChange The change listener function.
     */
    public registerOnChange(onChange: (value: Date) => void): void {
        this.onChange = onChange;
    }


    /**
     * Listens for the input value to update.
     */
    private listenForChange(): void {

        let valueUpdt: Date = null;

        // If the form date and timeStr controls are valid, then grab value.
        if (this.form.valid) {

            valueUpdt = this.includeDate ? this.form.get('date').value
                                         : new Date();
            valueUpdt = this.dateFormatter.setWallClockTimeForDate(valueUpdt, this.form.get('timeStr').value);

            this._logger.error('New Date object: ' + new Date());
            this._logger.error('Moment format: ' + moment().format());
            this._logger.error('New Date with str construct: ' + new Date(new Date().toLocaleDateString() + ' 12:00 AM'));
            this._logger.error('Date to string: ' + valueUpdt.toString());
            this._logger.error('Date to local date string: ' + valueUpdt.toLocaleDateString());
            this._logger.error('Client timezone: ' + Intl.DateTimeFormat().resolvedOptions().timeZone + ' (' + valueUpdt.getTimezoneOffset() + ')');
            this._logger.error('Date to JSON: ' + JSON.stringify(valueUpdt));
        }

        // Notify parent component's listener of change.
        this.onChange(valueUpdt);
    }


    public registerOnTouched(fn: any): void {}
}
