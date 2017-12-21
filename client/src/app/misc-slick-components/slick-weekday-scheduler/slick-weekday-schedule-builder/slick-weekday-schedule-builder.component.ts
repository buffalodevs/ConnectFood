import { Component, OnInit, Input, OnChanges, forwardRef, SimpleChange, SimpleChanges } from '@angular/core';
import { FormGroup, FormControl, ControlValueAccessor, NG_VALUE_ACCESSOR, FormBuilder, FormArray, Validators } from '@angular/forms';

import { WeekdaySplitService } from '../scheduler-util/weekday-split.service';
import { WeekdayForm } from '../scheduler-util/weekday-form';
import { ValidationService } from '../../../common-util/services/validation.service';

import { DateFormatter } from '../../../../../../shared/common-util/date-formatter';
import { TimeRange } from '../../../../../../shared/app-user/time-range';
import { AbstractModelDrivenComponent } from '../../../common-util/components/abstract-model-driven-component';


@Component({
    selector: 'slick-weekday-schedule-builder',
    templateUrl: './slick-weekday-schedule-builder.component.html',
    styleUrls: ['./slick-weekday-schedule-builder.component.css'],
    providers: [
        { 
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => SlickWeekdayScheduleBuilderComponent),
            multi: true
        }
    ]
})
export class SlickWeekdayScheduleBuilderComponent extends AbstractModelDrivenComponent implements OnInit, OnChanges, ControlValueAccessor {
    
    /**
     * Set to true if this component should be in display mode rather than edit mode.
     * Default value is false.
     */
    @Input() private displayOnly: boolean;
    @Input() private allowAdd: boolean;
    @Input() private allowRemove: boolean;
    /**
     * When this value is set or changes to true, then the contained form will be forced to validate its controls and show any related errors.
     */
    @Input() private validate: boolean;

    /**
     * If set by parent component via model binding (implicitly calls registerOnChange method),
     * then this callback will be invoked whenever a change occurs.
     */
    private onChange: (value: TimeRange[]) => void;
    protected form: WeekdayForm;


    public constructor (
        private formBuilder: FormBuilder,
        private weekdaySplitService: WeekdaySplitService,
        protected validationService: ValidationService
    ) {
        super(validationService);

        this.displayOnly = false;
        this.allowAdd = true;
        this.allowRemove = true;
        this.form = new WeekdayForm(null, this.validationService.requireAtLeastOneField());
        this.onChange = (value: TimeRange[]) => {}; // If contained model is not bound to by parent, then swallow all changes here!
    }


    public ngOnInit(): void {

        // Listen for any form value changes.
        this.form.valueChanges.subscribe(() => { this.onChange(this.readValue()); });

        // Trigger validate after full form initialization (if validate is set).
        this.ngOnChanges({ validate: new SimpleChange(this.validate, this.validate, false) });
    }


    public ngOnChanges(changes: SimpleChanges): void {
        
        // Make sure we validate the contained form when validate is marked as true.
        if (changes.validate && changes.validate.currentValue) {
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
    private addTimeRange(weekday: string): void {
        
        if (!this.allowAdd)  throw new Error('Attempting to add time range when allowAdd is: ' + this.allowAdd);
        (<FormArray>this.control(weekday)).push(new FormControl(null, Validators.required));
    }


    /**
     * Removes a time range from a given weekday at a given index.
     * @param weekday The weekday to remove the time range from.
     * @param index The index of the time range to remove.
     */
    private removeTimeRange(weekday: string, index: number): void {

        if (!this.allowRemove)  throw new Error('Attempting to remove time range when allowRemove is: ' + this.allowRemove);
        (<FormArray>this.control(weekday)).removeAt(index);
    }


    /**
     * See DateFormatter.convertWeekdayStringToInt.
     * @param weekday See DateFormatter.convertWeekdayStringToInt.
     * @return See DateFormatter.convertWeekdayStringToInt.
     */
    private getWeekdayInd(weekday: string): number {
        return DateFormatter.convertWeekdayStringToInt(weekday);
    }


    /**
     * Checks if a new time range can be added for a given weekday.
     * @param weekday The weekday that is being checked.
     * @return true if a new time range can be added, false if not.
     */
    private canAddNewTimeRange(weekday: string): boolean {

        let weekdaysFormArr: FormArray = <FormArray>this.control(weekday);
        let lastTimeRangeValid: boolean = ( weekdaysFormArr.length === 0 || weekdaysFormArr.at(weekdaysFormArr.length - 1).value != null );

        return ( this.allowAdd && lastTimeRangeValid && !this.displayOnly );
    }


    /**
     * Gets the current value.
     * @return The current value.
     *         NOTE: If any time range input filed is incomplete, then an empty array is returned.
     */
    public readValue(): TimeRange[] {

        if (!this.form.valid)  return [];
        return this.form.getTimeRanges();
    }


    /**
     * Writes a new value to the contained view model. This function is part of the ControlValueAccessor
     * interface and is implicitely called by directives (such as ngModel) when the data within this component
     * should be updated by a parent component.
     * @param value The value to write.
     */
    public writeValue(value: TimeRange[]): void {
        this.form.setTimeRanges(value);
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
     * @param onTouched 
     */
    public registerOnTouched(onTouched: string): void {
        // TODO - not really necessary...
    }
}
