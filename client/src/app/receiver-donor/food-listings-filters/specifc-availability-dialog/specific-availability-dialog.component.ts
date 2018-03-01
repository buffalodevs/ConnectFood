import { Component, Input, Inject } from '@angular/core';
import { FormGroup, AbstractControl, FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

import { DateRange } from '../../../../../../shared/src/date-time-util/date-range';


@Component({
    selector: 'specific-availability-dialog',
    templateUrl: './specific-availability-dialog.component.html',
    styleUrls: ['./specific-availability-dialog.component.css']
})
export class SpecificAvailabilityDialogComponent {

    public specificAvailabilityTimesControl: FormControl;
    public activateValidation: boolean = false;


    public constructor(
        public dialogRef: MatDialogRef <SpecificAvailabilityDialogComponent>,
        @Inject(MAT_DIALOG_DATA)
        public specificAvailabilityTimes: DateRange[]
    ) {
        this.specificAvailabilityTimesControl = new FormControl(specificAvailabilityTimes);
    }


    /**
     * Submits the new specific availability times (officially updating the main Food Listing Filters).
     * NOTE: If there is an error, then the submission/close operation is blocked.
     */
    public submit(): void {

        this.activateValidation = true;
        
        if (this.specificAvailabilityTimesControl.valid) {
            this.dialogRef.close(this.specificAvailabilityTimesControl.value != null ? this.specificAvailabilityTimesControl.value
                                                                                     : []);
        }
    }
}
