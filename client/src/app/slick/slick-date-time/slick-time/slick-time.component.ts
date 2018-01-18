import { Component, Input, OnInit, AfterViewInit, ViewChild, forwardRef } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, Validators } from '@angular/forms';

import { AbstractModelDrivenComponent } from '../../../common-util/components/abstract-model-driven-component';
import { SlickTimeValidationService } from './slick-time-validation.service';
import { SlickTypeaheadService } from '../../slick-type-ahead/slick-type-ahead.service';
import { DateFormatterService } from '../../../common-util/services/date-formatter.service';

import { DateFormatter } from '../../../../../../shared/common-util/date-formatter';


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

    @Input() private validate: boolean;

    /**
     * A callback function provided by a parent component (via directive such as ngModel).
     * ControlValueAccessor interface's registerOnChange method is used to register this callback.
     */
    private onChange: (value: string) => void;
    /**
     * View model for contained input control.
     */
    private timeControl: FormControl;


    public constructor (
        protected validationService: SlickTimeValidationService,
        private typeaheadService: SlickTypeaheadService,
        private dateFormatter: DateFormatterService
    ) {
        super(validationService);

        this.validate = false;
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