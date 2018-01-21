import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidatorFn, FormControl } from '@angular/forms';
import { ImageCropperComponent, CropperSettings } from 'ng2-img-cropper';
import { MatHorizontalStepper, ErrorStateMatcher } from '@angular/material';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/finally';

import { AbstractModelDrivenComponent } from '../../common-util/components/abstract-model-driven-component';
import { ValidationService } from '../../common-util/services/validation.service';
import { AddFoodListingService } from "../food-listings/food-listing-services/add-food-listing.service";
import { DateFormatterPipe } from "../../common-util/pipes/date-formatter.pipe"

import { FoodListingUpload } from "../../../../../shared/receiver-donor/food-listing-upload";
import { Validation } from '../../../../../shared/common-util/validation';


@Component({
    selector: 'donate',
    templateUrl: 'donate.component.html',
    styleUrls: ['donate.component.css'],
    providers: [AddFoodListingService]
})
export class DonateComponent extends AbstractModelDrivenComponent implements OnInit, ErrorStateMatcher {
    
    private validate: boolean;
    private dispUrl: string;

    private image: string;
    private cropperSettings: CropperSettings;

    private titleMaxLength: number;
    private showProgressSpinner: boolean;


    public constructor (
        private formBuilder: FormBuilder,
        private addFoodListingService: AddFoodListingService,
        private dateFormatter: DateFormatterPipe,
        validationService: ValidationService,
    ) {
        super(validationService);

        // Want to force validators to process on submit. Non-text fields will only validate on submit too!
        this.validate = false;

        // If the window size goes below this threshold, then the cropper must be initialized below the optimal size of 300px.
        const thresholdCropperWidth: number = 367;
        this.cropperSettings = new CropperSettings();
        this.cropperSettings.width = (window.innerWidth < thresholdCropperWidth ? 300 - (thresholdCropperWidth - window.innerWidth)
                                                                                : 300);
        this.cropperSettings.height = this.cropperSettings.width;
        this.cropperSettings.croppedWidth = 300;
        this.cropperSettings.croppedHeight = 300;
        this.cropperSettings.canvasWidth = (this.cropperSettings.width + 20);
        this.cropperSettings.canvasHeight = this.cropperSettings.height;
        this.cropperSettings.noFileInput = true;
        this.cropperSettings.fileType = 'image/jpeg';

        this.titleMaxLength = 30;
        this.showProgressSpinner = false;
        this.form = new FormGroup({});
    }


    public ngOnInit(): void {
        this.refreshFormControls();
    }


    /**
     * Completely refreshes all form controls by clearing all controls out and (re)adding them.
     */
    private refreshFormControls(): void {

        this.form = new FormGroup({});

        let foodListingUpload: FoodListingUpload = new FoodListingUpload();

        // Fill the form group view model based off of the properties found in FoodListingUpload.
        // This way, our view-model will always be in-sync with the shared object.
        for (let property in foodListingUpload) {

            if (foodListingUpload.hasOwnProperty(property)) {

                // All of these members are not included in the form view-model!
                if (    property === 'foodListingKey'
                    ||  property === 'imageUploads')
                { continue; }

                let validators: ValidatorFn[] = [ Validators.required ];

                // Add additional needed validators for email and password fields.
                switch (property) {
                    case 'foodTitle':       validators.push(Validators.maxLength(this.titleMaxLength)); break;
                    case 'foodDescription': validators = null;                                          break;
                }

                this.form.addControl(property, new FormControl(null, validators));
            }

        }
    }


    /**
     * Triggered whenever a file (image) is changed.
     * @param event The file change event.
     */
    private fileChangeListener(event: any, cropper: ImageCropperComponent): void {

        let image: HTMLImageElement = new Image();
        let file: File = event.target.files[0];
        let myReader: FileReader = new FileReader();

        myReader.onloadend = (loadEvent: any) => {
            image.src = loadEvent.target.result;
            cropper.setImage(image);
        };
     
        myReader.readAsDataURL(file);
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
        return control.errors != null && (control.touched || this.validate);;
    }


    /**
     * Checks if a given form field/control is invalid.
     * @param validField The form field/control to check.
     * @return true if it is invalid, false if it is valid.
     */
    private isInvalid(validField: AbstractControl): boolean {
        return validField != null && validField.errors != null && (validField.touched || this.validate);
    }


    /**
     * Checks if a form control is empty. An empty form control is either null or has a length of 0.
     * The form control's value must support the length property (strings and arrays for example) for this to work correctly.
     * @param formControl The form control to check.
     * @return true if the form control is empty, false if it is not empty.
     */
    private isFormControlEmpty(formControl: AbstractControl): boolean {
        return (formControl.value == null || formControl.value.length === 0)
    }


    /**
     * If the form is valid, then it will proceed to the confirmation display.
     * @param stepper The horizontal stepper that will be invoked to proceed to confirmation display if form is valid.
     */
    private ifValidProceedToReview(value: FoodListingUpload, valid: boolean, stepper: MatHorizontalStepper): void {

        this.validate = true;
        if (valid)  stepper.next();
    }


    /**
     * Invoked whenever the donation is submitted (after final confirmation). Sends the new donation to the server.
     * @param value The raw value of the donation form.
     * @param valid The valid state of the donation form.
     * @param stepper The stepper for this Donor Form.
     */
    private submitDonation(value: FoodListingUpload, valid: boolean, stepper: MatHorizontalStepper): void {
        
        let observer: Observable<number> = this.addFoodListingService.addFoodListing(value, this.image);
        this.showProgressSpinner = true;
        
        observer.finally(() => { this.showProgressSpinner = false; })
                .subscribe (
                    (foodListingKey: number) => {
                        stepper.next();
                    },
                    (err: Error) => {
                        console.log(err);
                        alert(err.message);
                    }
                );
    }


    /**
     * Refreshes the Donation Form, allowing the user to donate another item.
     * @param stepper The contained stepper.
     * @param cropper The contained image cropper.
     */
    private donateAgain(stepper: MatHorizontalStepper, cropper: ImageCropperComponent): void {

        // Return stepper to first tab.
        stepper.selectedIndex = 0;

        // Reset form and validation.
        this.validate = false;
        this.form.reset();

        // Reset image cropper.
        cropper.reset();
        this.image = null;
    }


    /**
     * Allows the user to return to edit a Donation just after submitting it.
     */
    private editDonation(stepper: MatHorizontalStepper): void {
        this.validate = false;
        stepper.previous();
    }
}
