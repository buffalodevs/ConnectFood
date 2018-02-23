import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, Validators, AbstractControl, ValidatorFn, FormControl, FormBuilder } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material';
import { NGXLogger } from 'ngx-logger';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/finally';

import { AbstractModelDrivenComponent } from '../../../common-util/components/abstract-model-driven-component';
import { ValidationService } from '../../../common-util/services/validation.service';
import { SessionDataService } from '../../../common-util/services/session-data.service';

import { Validation } from '../../../../../../shared/src/validation/validation';


@Component({
    selector: 'availabiliy-donate',
    templateUrl: 'availability-donate.component.html',
    styleUrls: ['availability-donate.component.css']
})
export class AvailabilityDonateComponent extends AbstractModelDrivenComponent implements OnInit, ErrorStateMatcher {
    
    /**
     * Want to force validators to process on submit. Non-text fields will only validate on submit too!
     */
    @Input() public activateValidation: boolean = false;
    @Input() private availabilityControl: FormControl;


    public constructor (
        private _logger: NGXLogger,
        private _sessionDataService: SessionDataService,
        validationService: ValidationService,
        formBuilder: FormBuilder
    ) {
        super(validationService, formBuilder);
    }


    public ngOnInit(): void {

        this.form = new FormGroup({
            'appUserAvailability': new FormControl(this._sessionDataService.getAppUserSessionData().availability),
            'foodListingAvailability': this.availabilityControl
        });
    }


    /**
     * Custom check for error state of mat-input controls.
     * NOTE: This is necessary since stepper will put form in submitted state and by default mat-input controls show error style when form has been submitted.
     *       When resetting the form, there is no known way yet to reset the state of the stepper so the form is not marked as submitted.
     *       This work around checks a validate flag that is set when the form is submitted and reset when the form should be reset for another donation.
     * @param control The form field/control to check.
     * @return true if it is invalid, false if it is valid.
     */
    public isErrorState(control: FormControl | null): boolean {
        return control.errors != null && (control.touched || this.activateValidation);
    }


    /**
     * Checks if a given form field/control is invalid.
     * @param validField The form field/control to check.
     * @return true if it is invalid, false if it is valid.
     */
    public isInvalid(validField: AbstractControl): boolean {
        return validField != null && validField.errors != null && (validField.touched || this.activateValidation);
    }


    /**
     * Checks if a form control is empty. An empty form control is either null or has a length of 0.
     * The form control's value must support the length property (strings and arrays for example) for this to work correctly.
     * @param formControl The form control to check.
     * @return true if the form control is empty, false if it is not empty.
     */
    public isFormControlEmpty(formControl: AbstractControl): boolean {
        return (formControl.value == null || formControl.value.length === 0)
    }


    public reset(): void {

    }
}
