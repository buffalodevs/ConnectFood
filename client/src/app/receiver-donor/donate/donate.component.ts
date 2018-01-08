import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidatorFn, FormControl } from '@angular/forms';
import { ImageCropperComponent, CropperSettings } from 'ng2-img-cropper';
import { Observable } from 'rxjs/Observable';
import { MatHorizontalStepper } from '@angular/material';
import 'rxjs/add/operator/finally';

import { AddFoodListingService } from "../food-listings/food-listing-services/add-food-listing.service";
import { DateFormatterPipe } from "../../common-util/pipes/date-formatter.pipe"

import { FoodTypesComponent } from "../../domain/food-types/food-types.component";

import { FoodListingUpload } from "../../../../../shared/receiver-donor/food-listing-upload";
import { Validation } from '../../../../../shared/common-util/validation';
import { AbstractModelDrivenComponent } from '../../common-util/components/abstract-model-driven-component';
import { ValidationService } from '../../common-util/services/validation.service';


@Component({
    selector: 'donate',
    templateUrl: 'donate.component.html',
    styleUrls: ['donate.component.css'],
    providers: [AddFoodListingService]
})
export class DonateComponent extends AbstractModelDrivenComponent implements OnInit {
    
    private validate: boolean;
    private dispUrl: string;

    private image: string;
    private cropperSettings: CropperSettings;

    private foodTitleMaxLength: number;
    private showProgressSpinner: boolean;

    @ViewChild('cropper', undefined) private cropper: ImageCropperComponent;


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

        this.foodTitleMaxLength = 100;
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

                // All of these members are not included in the form view-model at first!
                if (    property === 'foodListingKey'
                    ||  property === 'imageUpload'
                    ||  property === 'availableUnitsCount'
                    ||  property === 'unitsLabel')
                { continue; }

                let validators: ValidatorFn[] = [ Validators.required ];

                // Add additional needed validators for email and password fields.
                switch(property) {
                    case 'foodTitle':       validators.push(Validators.maxLength(this.foodTitleMaxLength));     break;
                    case 'foodDescription': validators = null;                                                  break;
                }

                this.form.addControl(property, new FormControl(null, validators));
            }

        }
    }


    /**
     * Triggered whenever a file (image) is changed.
     * @param event The file change event.
     */
    private fileChangeListener(event): void {

        let image: HTMLImageElement = new Image();
        let file: File = event.target.files[0];
        let myReader: FileReader = new FileReader();
        let self = this;

        myReader.onloadend = (loadEvent: any) => {
            image.src = loadEvent.target.result;
            self.cropper.setImage(image);
        };
     
        myReader.readAsDataURL(file);
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
     * Toggles the display of form controls for splitting the Donation into multiple units.
     */
    private toggleSplitIntoUnits(): void {

        if (this.isSplitIntoUnits()) {
            this.form.removeControl('availableUnitsCount');
            this.form.removeControl('unitsLabel');
        }
        else {
            this.form.addControl('availableUnitsCount', new FormControl(null, [ Validators.required, Validators.min(1) ]));
            this.form.addControl('unitsLabel', new FormControl(null, [ Validators.required ]));
        }
    }


    /**
     * Determines if the donation is split into multiple units.
     * @return true if it has been split, false if not.
     */
    private isSplitIntoUnits(): boolean {
        return ( this.form.contains('availableUnitsCount') && this.form.contains('unitsLabel') );
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
     */
    private donateAgain(stepper: MatHorizontalStepper): void {

        // Must go back 2 tabs to get to start.
        stepper.previous();
        stepper.previous();

        this.validate = false;
        this.form.reset();
        this.cropper.reset();
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
