import * as _ from 'lodash';
import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, Validators, AbstractControl, ValidatorFn, FormControl, FormBuilder, ControlValueAccessor } from '@angular/forms';
import { ImageCropperComponent, CropperSettings } from 'ng2-img-cropper';
import { MatHorizontalStepper, ErrorStateMatcher } from '@angular/material';
import { NGXLogger } from 'ngx-logger';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/finally';

import { AbstractModelDrivenComponent } from '../../../common-util/components/abstract-model-driven-component';
import { ValidationService } from '../../../common-util/services/validation.service';
import { DateFormatterPipe } from "../../../common-util/pipes/date-formatter.pipe"
import { SessionDataService } from '../../../common-util/services/session-data.service';

import { Validation } from '../../../../../../shared/src/validation/validation';
import { FoodListing } from '../../../../../../shared/src/common-receiver-donor-deliverer/food-listing';
import { VEHICLE_TYPE_VALUES } from '../../../../../../shared/src/common-receiver-donor-deliverer/food-listing-domain/vehicle-type';


@Component({
    selector: 'primary-donate',
    templateUrl: 'primary-donate.component.html',
    styleUrls: ['primary-donate.component.css']
})
export class PrimaryDonateComponent extends AbstractModelDrivenComponent implements OnInit, ErrorStateMatcher {
    
    public readonly TITLE_MAX_LENGTH: number = 30;

    /**
     * Want to force validators to process on submit. Non-text fields will only validate on submit too!
     */
    @Input() public activateValidation: boolean = false;
    @Input() public formGroup: FormGroup;

    public vehicleTypes: string[] = VEHICLE_TYPE_VALUES;


    public constructor (
        private _logger: NGXLogger,
        validationService: ValidationService,
        formBuilder: FormBuilder
    ) {
        super(validationService, formBuilder);
    }


    public ngOnInit(): void {
        
        this.form = this.formGroup;

        let foodListingUpload: FoodListing = new FoodListing();

        // Fill the form group view model based off of the properties found in FoodListingUpload.
        // This way, our view-model will always be in-sync with the shared object.
        for (let property in foodListingUpload) {

            if (    !foodListingUpload.hasOwnProperty(property)
                // All of these members are not included in the form view-model!
                ||  property === 'foodListingKey'
                ||  property === 'donorInfo'
                ||  property === 'claimInfo'
                ||  property === 'foodListingAvailability'
                ||  property === 'imgData')
            { continue; }

            let validators: ValidatorFn[] = [ Validators.required ];

            // Add additional needed validators for email and password fields.
            switch (property) {
                case 'foodTitle':       validators.push(Validators.maxLength(this.TITLE_MAX_LENGTH));   break;
                case 'foodDescription': validators = null;                                              break;
            }

            this.form.addControl(property, new FormControl(null, validators));
        }
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
}
