import { Component } from '@angular/core';
import { FormGroup, Validators, FormControl, FormBuilder, AbstractControl } from '@angular/forms';
import { MatHorizontalStepper } from '@angular/material';
import { NGXLogger } from 'ngx-logger';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/finally';

import { AbstractModelDrivenComponent } from '../../common-util/components/abstract-model-driven-component';
import { ValidationService } from '../../common-util/services/validation.service';
import { AddFoodListingService } from './donate-services/add-food-listing.service';
import { DEFAULT_IMG_URL } from '../../common-util/directives/default-img.directive';
import { SlickImg } from '../../slick/slick-img-manager/slick-img';

import { FoodListing } from '../../../../../shared/src/common-receiver-donor-deliverer/food-listing';
import { ImgCropConstants } from '../../../../../shared/src/img/img-crop-constants';


@Component({
    selector: 'donate',
    templateUrl: 'donate.component.html',
    styleUrls: ['donate.component.css']
})
export class DonateComponent extends AbstractModelDrivenComponent {
    
    public readonly IMG_CROP_CONSTANTS: ImgCropConstants = new ImgCropConstants();
    public readonly DEFAULT_IMG_URL: string = DEFAULT_IMG_URL;

    /**
     * Want to force validators to process on submit. Non-text fields will only validate on submit too!
     */
    public activatePrimaryValidation: boolean = false;
    public activateAvailabilityValidation: boolean = false;
    public showProgressSpinner: boolean = false;


    public constructor (
        private _addFoodListingService: AddFoodListingService,
        private _logger: NGXLogger,
        validationService: ValidationService,
        formBuilder: FormBuilder
    ) {
        super(validationService, formBuilder);

        this.form = new FormGroup({
            'slickImgs': new FormControl([]),
            'primary': new FormGroup({}),
            'foodListingAvailability': new FormControl([])
        });
    }


    /**
     * Invoked whenever the donation is submitted (after final confirmation). Sends the new donation to the server.
     * @param valid The valid state of the donation form.
     * @param stepper The stepper for this Donor Form.
     */
    public submitDonation(valid: boolean, stepper: MatHorizontalStepper): void {

        // Grab Food Listing and its associated availability.
        const foodListing: FoodListing = this.form.get('primary').value;
        foodListing.foodListingAvailability = this.form.get('foodListingAvailability').value;
        const slickImgs: SlickImg[] = this.form.get('slickImgs').value;
        
        const observer: Observable<number> = this._addFoodListingService.addFoodListing(foodListing, slickImgs);
        this.showProgressSpinner = true;
        
        observer.finally(() => { this.showProgressSpinner = false; })
                .subscribe (
                    (foodListingKey: number) => {
                        stepper.next();
                    },
                    (err: Error) => {
                        this._logger.error(err);
                        alert(err.message);
                    }
                );
    }


    /**
     * Refreshes the Donation Form, allowing the user to donate another item.
     * @param stepper The contained stepper.
     */
    public donateAgain(stepper: MatHorizontalStepper): void {

        // Return stepper to first tab.
        stepper.selectedIndex = 0;

        // Reset form and validation.
        this.activatePrimaryValidation = false;
        this.activateAvailabilityValidation = false;
        
        this.form.reset();
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


    /**
     * Activates the validation of all members of the primary donate sub-form.
     */
    public setPrimaryValidationActive(): void {
        this.activatePrimaryValidation = true;
    }


    /**
     * Activates the validation of all members of the availability donate sub-form.
     */
    public setAvailabilityValidationActive(): void {
        this.activateAvailabilityValidation = true;
    }


    /**
     * Gets the height for the image manager (the contained image gallery requires a specific height, so we must calculate optimal height for small screen).
     */
    public getImgManagerMaxHeight(): number {

        let deltaHeight = 40;

        if (window.innerWidth < 367) {
            deltaHeight -= (367 - window.innerWidth);
        }

        return this.IMG_CROP_CONSTANTS.getDefCropImgGalleryHeight() + deltaHeight;
    }
}
