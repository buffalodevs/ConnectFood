import { Component, OnInit, Input, OnChanges, forwardRef, SimpleChange, SimpleChanges } from '@angular/core';
import { FormGroup, FormControl, ControlValueAccessor, NG_VALUE_ACCESSOR, FormBuilder, FormArray, Validators } from '@angular/forms';

import { AbstractModelDrivenComponent } from '../../../common-util/components/abstract-model-driven-component';
import { ScheduleTimeManagementService } from './scheduler-util/schedule-time-management.service';
import { ValidationService } from '../../../common-util/services/validation.service';
import { DateFormatterService } from '../../../common-util/services/date-formatter.service';

import { DateRange } from '../../../../../../shared/src/date-time-util/date-range';


@Component({
    selector: 'slick-date-time-scheduler',
    templateUrl: './slick-date-time-scheduler.component.html',
    styleUrls: ['./slick-date-time-scheduler.component.css'],
    providers: [
        { 
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => SlickDateTimeSchedulerComponent),
            multi: true
        },
        ScheduleTimeManagementService
    ]
})
export class SlickDateTimeSchedulerComponent extends AbstractModelDrivenComponent implements OnInit, OnChanges, ControlValueAccessor {
    
    @Input() public possibleScheduleTimeRanges: DateRange[];

    /**
     * If set by parent component via model binding (implicitly calls registerOnChange method),
     * then this callback will be invoked whenever a change occurs.
     */
    private onChange: (value: Date) => void;


    public constructor (
        public scheduleTimeManagement: ScheduleTimeManagementService,
        private _dateFormatter: DateFormatterService,
        validationService: ValidationService,
        formBuilder: FormBuilder
    ) {
        super(validationService, formBuilder);

        this.form = formBuilder.group({
            'scheduledDate': [null, Validators.required]
        })
        this.onChange = (value: Date) => {};
    }


    public ngOnInit(): void {

        // Listen for any form value changes.
        this.form.valueChanges.subscribe(() => {
            this.onChange(this.readValue());
        });

        // Trigger validate after full form initialization (if validate is set).
        this.ngOnChanges({ validate: new SimpleChange(this.activateValidation, this.activateValidation, false) });
    }


    public ngOnChanges(changes: SimpleChanges): void {
        
        super.ngOnChanges(changes);
        
        // Adjust the column splits based on the value of possibleScheduleTimeRanges (number of weekdays we have data for).
        if (changes.possibleScheduleTimeRanges) {
            this.scheduleTimeManagement.setPossibleScheduleTimes(this.possibleScheduleTimeRanges);
        }
    }


    /**
     * See DateFormatter.convertWeekdayStringToInt.
     * @param weekday See DateFormatter.convertWeekdayStringToInt.
     * @return See DateFormatter.convertWeekdayStringToInt.
     */
    private getWeekdayInd(weekday: string): number {
        return this._dateFormatter.convertWeekdayStringToInt(weekday);
    }


    /**
     * Gets the current value.
     * @return The current value.
     */
    public readValue(): Date {
        return this._dateFormatter.ensureIsDate(this.form.get('scheduledDate').value);
    }


    /**
     * Writes a new value to the contained view model. This function is part of the ControlValueAccessor
     * interface and is implicitely called by directives (such as ngModel) when the data within this component
     * should be updated by a parent component.
     * @param value The value to write.
     */
    public writeValue(value: Date): void {
        this.form.get('scheduledDate').setValue(value);        
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
    public registerOnTouched(onTouched: string): void {}  // TODO - not really necessary...
}
