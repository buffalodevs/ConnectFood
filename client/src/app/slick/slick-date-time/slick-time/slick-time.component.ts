import { Component, Input, OnInit, AfterViewInit, ViewChild, forwardRef } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, Validators, ValidatorFn, FormBuilder } from '@angular/forms';

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
export class SlickTimeComponent extends AbstractModelDrivenComponent implements OnInit, ControlValueAccessor {

    public readonly GROUP_VALIDATORS: ValidatorFn[][];

    @Input() public activateValidation: boolean;

    /**
     * View model for contained input control.
     */
    public timeControl: FormControl;
    /**
     * A callback function provided by a parent component (via directive such as ngModel).
     * ControlValueAccessor interface's registerOnChange method is used to register this callback.
     */
    private onChange: (value: string) => void;


    public constructor (
        public validationService: SlickTimeValidationService,
        public typeaheadService: SlickTypeaheadService,
        public dateFormatter: DateFormatterService,
        formBuilder: FormBuilder
    ) {
        super(validationService, formBuilder);

        // Set required validators for contained Slick Input Group controls.
        this.GROUP_VALIDATORS = [
            [ Validators.required, Validators.pattern(this.validationService.HH_REGEX) ],
            [ Validators.required, Validators.pattern(this.validationService.MM_REGEX) ],
            [ Validators.required, Validators.pattern(this.validationService.AM_OR_PM_REGEX) ]
        ];

        this.activateValidation = false;
        this.onChange = (value: any) => {}; // If no change listener given later, then all change will be swallowed here!
        this.timeControl = new FormControl();
    }


    public ngOnInit(): void {

        this.timeControl.valueChanges.subscribe(this.listenForChange.bind(this));
    }


    /**
     * Writes a value to the underlying input control.
     * @param value The new value to write.
     */
    public writeValue(value: string): void {
        this.timeControl.setValue(value);
    }


    /**
     * Registers a change listener in the underlying input control.
     * Associated with ngModel or formControl directives.
     * @param onChange The change listener function.
     */
    public registerOnChange(onChange: (value: string) => void): void {
        this.onChange = onChange;
    }


    /**
     * Listens for the input value to update.
     * @param value The updated value of the input.
     */
    private listenForChange(value: string): void {

        // First, check if the time form contains a valid (wall clock formatted) time. If not, then give null to change listener!
        value = this.dateFormatter.isWallClockFormat(value) ? value
                                                            : null;

        // Notify parent component's listener of change.
        this.onChange(value);
    }


    public registerOnTouched(fn: any): void {}
}
