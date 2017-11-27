import { Component, OnInit, Input, OnChanges, forwardRef, SimpleChange, SimpleChanges } from '@angular/core';
import { FormGroup, FormControl, ControlValueAccessor, NG_VALUE_ACCESSOR, FormBuilder, FormArray, Validators } from '@angular/forms';

import { ValidationService } from '../common-util/services/validation.service';

import { DateFormatter } from '../../../../shared/common-util/date-formatter';
import { TimeRange } from '../../../../shared/app-user/time-range';


@Component({
    selector: 'slick-weekday-scheduler',
    templateUrl: './slick-weekday-scheduler.component.html',
    styleUrls: ['./slick-weekday-scheduler.component.css'],
    providers: [
        { 
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => SlickWeekdaySchedulerComponent),
            multi: true
        }
    ]
})
export class SlickWeekdaySchedulerComponent implements OnInit, OnChanges, ControlValueAccessor {

    private readonly WEEKDAYS: string[];
    
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

    private weekdaySplits: string[][];
    /**
     * If set by parent component via model binding (implicitly calls registerOnChange method),
     * then this callback will be invoked whenever a change occurs.
     */
    private onChange: (value: TimeRange[]) => void;
    private timeRangesForm: FormGroup;


    public constructor (
        private formBuilder: FormBuilder,
        private validationService: ValidationService
    ) {
        this.WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        this.calcWeekdaySplits();
        this.displayOnly = false;
        this.allowAdd = true;
        this.allowRemove = true;
        this.timeRangesForm = new FormGroup({}, this.validationService.requireAtLeastOneField());
        this.onChange = (value: TimeRange[]) => {}; // If contained model is not bound to by parent, then swallow all changes here!
    }


    public ngOnInit(): void {

        // Construct the base form group (each member is a dynamic form array with weekday as key - holds TimeRange objects).
        for (let i: number = 0; i < this.WEEKDAYS.length; i++) {
            this.timeRangesForm.addControl(this.WEEKDAYS[i], this.formBuilder.array([]));
        }

        // Listen for any form value changes.
        this.timeRangesForm.valueChanges.subscribe(() => { this.onChange(this.readValue()); });

        // Trigger validate after full form initialization (if validate is set).
        this.ngOnChanges({ validate: new SimpleChange(this.validate, this.validate, false) });
    }


    public ngOnChanges(changes: SimpleChanges): void {
        
        // Make sure we validate the contained form when validate is marked as true.
        if (changes.validate && changes.validate.currentValue) {
            this.validationService.markAllAsTouched(this.timeRangesForm);
        }
        
        // Adjust the column splits based on the value of displayOnly and the number of weekdays we have data for.
        if (changes.displayOnly) {
            this.calcWeekdaySplits();
        }
    }


    /**
     * Calculates the (column) weekday splits used based off of the displayOnly input and the data bound to this component's model.
     */
    private calcWeekdaySplits(): void {

        // If in edit mode or we have not fully intialized the form (view model) yet.
        if (!this.displayOnly || this.timeRangesForm.get(this.WEEKDAYS[0]) == null) {
            this.weekdaySplits = [['Monday', 'Tuesday', 'Wednesday', 'Thursday'], ['Friday', 'Saturday', 'Sunday']];
        }
        else {

            // Determine the weekdays that actually have time range data.
            let nonEmptyWeekdays: string[] = [];
            for (let i: number = 0; i < 7; i++) {
                
                if ((<FormArray>this.timeRangesForm.get(this.WEEKDAYS[i])).length > 0) {
                    nonEmptyWeekdays.push(this.WEEKDAYS[i]);
                }
            }

            // Start with assumption of there only being one column.
            this.weekdaySplits = [[]];
            let firstSplitEnd: number = nonEmptyWeekdays.length;

            // Do we have enough non-empty weekdays for 2 columns?
            if (nonEmptyWeekdays.length >= 4) {
                firstSplitEnd = Math.ceil(nonEmptyWeekdays.length / 2);
                this.weekdaySplits.push([]);
            }

            // Enter data into first column.
            for (let i: number = 0; i < firstSplitEnd; i++) {
                this.weekdaySplits[0].push(nonEmptyWeekdays[i]);
            }

            // If two columns, then we will enter data here.
            for (let i: number = firstSplitEnd; i < nonEmptyWeekdays.length; i++) {
                this.weekdaySplits[1].push(nonEmptyWeekdays[i]);
            }
        }
    }


    /**
     * Adds a time range to a given weekday.
     * @param weekday The weekday to add the time range to.
     */
    private addTimeRange(weekday: string): void {
        
        if (!this.allowAdd)  throw new Error('Attempting to add time range when allowAdd is: ' + this.allowAdd);
        (<FormArray>this.timeRangesForm.controls[weekday]).push(new FormControl(null, Validators.required));
    }


    /**
     * Removes a time range from a given weekday at a given index.
     * @param weekday The weekday to remove the time range from.
     * @param index The index of the time range to remove.
     */
    private removeTimeRange(weekday: string, index: number): void {

        if (!this.allowRemove)  throw new Error('Attempting to remove time range when allowRemove is: ' + this.allowRemove);
        (<FormArray>this.timeRangesForm.controls[weekday]).removeAt(index);
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

        let weekdaysFormArr: FormArray = <FormArray>this.timeRangesForm.controls[weekday];
        let lastTimeRangeValid: boolean = ( weekdaysFormArr.length === 0 || weekdaysFormArr.at(weekdaysFormArr.length - 1).value != null );

        return ( this.allowAdd && lastTimeRangeValid );
    }


    /**
     * Gets the current value.
     * @return The current value.
     *         NOTE: If any time range input filed is incomplete, then an empty array is returned.
     */
    public readValue(): TimeRange[] {

        if (!this.timeRangesForm.valid)  return [];

        let timeRanges: TimeRange[] = [];

        for (let property in this.timeRangesForm.controls) {
            if (this.timeRangesForm.controls.hasOwnProperty(property)) {

                let weekdayTimeRanges: FormArray = <FormArray>this.timeRangesForm.controls[property];

                for (let i: number = 0; i < weekdayTimeRanges.length; i++) {
                    timeRanges.push(weekdayTimeRanges.at(i).value);
                }
            }
        }

        return timeRanges;
    }


    /**
     * Writes a new value to the contained view model. This function is part of the ControlValueAccessor
     * interface and is implicitely called by directives (such as ngModel) when the data within this component
     * should be updated by a parent component.
     * @param value The value to write.
     */
    public writeValue(value: TimeRange[]): void {

        // First, clear all time ranges!
        this.clearFormTimeRanges();
        
        if (value == null)  return;
        
        // Then, go through each weekday form array and add in time ranges.
        for (let i: number = 0; i < value.length; i++) {

            let weekday: string = DateFormatter.covertWeekdayIntToString(value[i].weekday);
            (<FormArray>this.timeRangesForm.controls[weekday]).push(new FormControl(value[i]));
        }

        this.calcWeekdaySplits();
    }


    /**
     * Clears the time ranges held within the timeRangesForm form group (model), which makes it ready for new ones.
     */
    private clearFormTimeRanges(): void {

        let weekdaysFormArr: FormArray;
        
        for (let i: number = 0; i < this.WEEKDAYS.length; i++) {

            weekdaysFormArr = <FormArray>this.timeRangesForm.controls[this.WEEKDAYS[i]];
            
            // NOTE: Important to remove all elements via loop instead of just setting to new FormArray object
            //       since this can unintentionally invalidate any listeners on given form arrays!!!
            while (weekdaysFormArr.length !== 0) {
                weekdaysFormArr.removeAt(0);
            }
        }
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
