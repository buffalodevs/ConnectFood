import { Component, OnInit, forwardRef, Input, SimpleChange, SimpleChanges } from '@angular/core';
import { FormControl, ControlValueAccessor, NG_VALUE_ACCESSOR, Validators, FormBuilder, FormGroup, ValidatorFn } from '@angular/forms';

import { AppUserConstantsService } from '../../common-app-user/app-user-constants.service';

import { StringManipulation } from '../../../../../../shared/common-util/string-manipulation';


@Component({
    selector: 'phone',
    templateUrl: './phone.component.html',
    styleUrls: ['./phone.component.css'],
    providers: [
        { 
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => PhoneComponent),
            multi: true
        }
    ]
})
export class PhoneComponent implements OnInit, ControlValueAccessor {

    /**
     * Set to false if no 'Phone:' label should be included.
     * Default is true.
     */
    @Input() private includeLabel: boolean;
    @Input() private floatPlaceholder: string;
    @Input() private required: boolean;
    /**
     * When this value is set or changes to true, then the contained form will be forced to validate its controls and show any related errors.
     */
    @Input() private validate: boolean;

    private onChange: (value: any) => void;
    private phoneControl: FormControl;
    private groupValidators: ValidatorFn[][];


    public constructor (
        private formBuilder: FormBuilder,
        private appUserConstants: AppUserConstantsService
    ) {
        this.includeLabel = true;
        this.floatPlaceholder = 'never';
        this.required = false;
        this.onChange = (value: any) => {}; // If model of this component is not bound to by parent, then swallow all changes here!
    }


    public ngOnInit(): void {

        // The input required may have been set as a string, so convert it to a boolean if it is a string here!
        this.required = StringManipulation.strToBoolean(this.required);

        this.phoneControl = new FormControl(null);

        // Get required validation state and add slick input group from to parent phone form.
        this.groupValidators = [
            [Validators.pattern(/^\d{3}?/)].concat(this.required ? [Validators.required] : []),
            [Validators.pattern(/^\d{3}?/)].concat(this.required ? [Validators.required] : []),
            [Validators.pattern(/^\d{4}?/)].concat(this.required ? [Validators.required] : [])
        ];

        this.phoneControl.valueChanges.subscribe(() => { this.onChange(this.readValue()); });

        // If the validate flag is true from the start, then mark all form fields a touched!
        this.ngOnChanges({ validate: new SimpleChange(this.validate, this.validate, false) });
    }


    public ngOnChanges(changes: SimpleChanges): void {
        
        // Make sure we validate the contained form when validate is marked as true.
        if (changes.validate && changes.validate.currentValue) {
            this.phoneControl.markAsTouched();
        }
    }


    /**
     * Gets the value.
     * @return The current value.
     */
    public readValue(): string {
        return this.phoneControl.value;
    }


    /**
     * Writes a new value to the contained view model. This function is part of the ControlValueAccessor
     * interface and is implicitely called by directives (such as ngModel) when the data within this component
     * should be updated by a parent component.
     * @param timeRange The value to write.
     */
    public writeValue(value: string): void {
        this.phoneControl.setValue(value);
    }


    /**
     * Provides a callback function that shall be invoked whenever there is an update to this component's data.
     * @param onChange The callback function invoked on any change to contained data.
     */
    public registerOnChange(onChange: (value: string) => void): void {
        this.onChange = onChange;
    }


    public registerOnTouched(onTouched: any): void {}
}