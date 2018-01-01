import { Component, OnInit, Input, OnChanges, forwardRef, SimpleChange, SimpleChanges } from '@angular/core';
import { FormGroup, FormControl, ControlValueAccessor, NG_VALUE_ACCESSOR, FormBuilder, FormArray, Validators } from '@angular/forms';

import { AbstractModelDrivenComponent } from '../../common-util/components/abstract-model-driven-component';
import { AvailabilityTimeManagementService } from './scheduler-util/availability-time-management.service';
import { WeekdayForm } from './scheduler-util/weekday-form';
import { WeekdaySplitService } from './scheduler-util/weekday-split.service';
import { ValidationService } from '../../common-util/services/validation.service';

import { DateFormatter } from '../../../../../shared/common-util/date-formatter';
import { TimeRange } from '../../../../../shared/app-user/time-range';


@Component({
    selector: 'slick-weekday-scheduler',
    templateUrl: './slick-weekday-scheduler.component.html',
    styleUrls: ['./slick-weekday-scheduler.component.css'],
    providers: [
        { 
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => SlickWeekdaySchedulerComponent),
            multi: true
        },
        AvailabilityTimeManagementService
    ]
})
export class SlickWeekdaySchedulerComponent extends AbstractModelDrivenComponent implements OnInit, OnChanges, ControlValueAccessor {
    
    /**
     * When this value is set or changes to true, then the contained form will be forced to validate its controls and show any related errors.
     */
    @Input() private validate: boolean;
    @Input() private availabilityTimeRanges: TimeRange[];

    /**
     * If set by parent component via model binding (implicitly calls registerOnChange method),
     * then this callback will be invoked whenever a change occurs.
     */
    private onChange: (value: Date) => void;


    public constructor (
        private formBuilder: FormBuilder,
        protected validationService: ValidationService,
        private availabilityTimeManagement: AvailabilityTimeManagementService
    ) {
        super(validationService);

        this.form = formBuilder.group({
            'scheduledDate': [null, Validators.required]
        })
        this.onChange = (value: Date) => {
            console.log('No onChange listener binding from parent');
        };
    }


    public ngOnInit(): void {

        let self: SlickWeekdaySchedulerComponent = this;

        // Listen for any form value changes.
        this.form.valueChanges.subscribe(() => {
            self.onChange(self.readValue());
        });

        // Trigger validate after full form initialization (if validate is set).
        this.ngOnChanges({ validate: new SimpleChange(this.validate, this.validate, false) });
    }


    public ngOnChanges(changes: SimpleChanges): void {
        
        // Make sure we validate the contained form when validate is marked as true.
        if (changes.validate && changes.validate.currentValue) {
            this.validationService.markAllAsTouched(this.form);
        }
        
        // Adjust the column splits based on the value of availabilityTimeRanges (number of weekdays we have data for).
        if (changes.availabilityTimeRanges) {
            this.availabilityTimeManagement.set(changes.availabilityTimeRanges.currentValue);
        }
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
     * Gets the current value.
     * @return The current value.
     */
    public readValue(): Date {
        return DateFormatter.ensureIsDate(this.form.get('scheduledDate').value);
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
