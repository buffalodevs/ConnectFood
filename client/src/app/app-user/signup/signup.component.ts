import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Observable } from 'rxjs/Observable';

import { AppUserTypesService } from '../../domain/app-user-types/app-user-types.service';
import { SignupService } from './signup.service'
import { AppUserConstantsService } from '../common-app-user/app-user-constants.service';
import { AppUserValidationService, Validation } from '../common-app-user/app-user-validation.service';
import { AbstractModelDrivenComponent } from '../../common-util/components/abstract-model-driven-component';

import { AppUserInfo } from "../../../../../shared/app-user/app-user-info";
import { FoodWebResponse } from "../../../../../shared/message-protocol/food-web-response";
import { ObjectManipulation } from '../../../../../shared/common-util/object-manipulation';
import { AppUserErrorMsgs } from '../../../../../shared/app-user/message/app-user-error-msgs';


@Component({
    selector: 'app-signup',
    templateUrl: './signup.component.html',
    styleUrls: ['./signup.component.css'],
    providers: [SignupService]
})
export class SignupComponent extends AbstractModelDrivenComponent implements OnInit {

    private appUserTypes: string[];
    private signupError: string;
    private signupComplete: boolean;
    /**
     * This gets set to 'Admin' when the user signing up is an organization. If not, then it will be an empty string.
     */
    private adminPreStr: string;
    /**
     * Marks whether or not valiation should fire for a specific part of the form.
     */
    private validate: Map<string, boolean>;
    /**
     * Used to keep track of submission of signup so we can show progress spinner.
     */
    private showProgressSpinner: boolean;


    public constructor (
        private formBuilder: FormBuilder,
        private appUserTypesService: AppUserTypesService,
        private signupValidationService: AppUserValidationService,
        private signupService: SignupService,
        private appUserConstants: AppUserConstantsService
    ) {
        super(signupValidationService);

        this.signupError = null;
        this.signupComplete = false;
        this.adminPreStr = '';
        this.appUserTypesService.getAppUserTypes().subscribe((appUserTypes: string[]) => { this.appUserTypes = appUserTypes });
        this.validate = new Map<string, boolean>();
        this.showProgressSpinner = false;
    }


    /**
     * Setup the form value.
     */
    public ngOnInit(): void {

        // Initialize signup form.
        this.form = this.formBuilder.group({

            'primary': this.formBuilder.group({
                'appUserType':      [null, Validators.required],
                'email':            [null, [Validators.required, Validators.pattern(Validation.EMAIL_REGEX)]],
                'organizationName': [null, Validators.required],
                'taxId':            [null, [Validators.required, Validators.pattern(Validation.TAX_ID_REGEX)]],
                'firstName':        [null, Validators.required],
                'lastName':         [null, Validators.required],
                'password':         [null, [Validators.required, Validators.pattern(Validation.PASSWORD_REGEX)]],
                'confirmPassword':  [null, [Validators.required, Validators.pattern(Validation.PASSWORD_REGEX)]]
            }, { validator: this.signupValidationService.confirmPasswordEqual() }),

            'addressPhone': this.formBuilder.group({
                'address':          [null, Validators.required],
                'city':             [null, Validators.required],
                'state':            [null, [Validators.required, Validators.minLength(2), Validators.maxLength(2)]],
                'zip':              [null, [Validators.required, Validators.pattern(Validation.ZIP_REGEX)]],
                'phone':            [null, [Validators.required, Validators.pattern(Validation.PHONE_REGEX)]]
            }),

            'availability': [null, Validators.required]
        });

        // Generate validate mappings for each poriton of the signup form. Initialize all of them to false.
        ObjectManipulation.applyToProperties(this.form.controls,
            (formPortion: string) => {
                this.validate.set(formPortion, false);
            });

        // Listen for changes to the appUserType member of the AppUserInfo Form, so we can change form fields appropriately.
        this.form.get('primary.appUserType').valueChanges.subscribe(this.listenAppUserTypeChange.bind(this));
    }


    /**
     * Updates form validation requirements based off of the appUserType value.
     */
    private listenAppUserTypeChange(): void {

        let organizationNameControl: FormControl = <FormControl>this.form.get('primary.organizationName');
        let taxIdControl: FormControl = <FormControl>this.form.get('primary.taxId');

        if (this.isOrganization()) {
            this.adminPreStr = 'Admin';
            this.signupValidationService.setValidatorsAndRefresh(organizationNameControl, [Validators.required]);
            this.signupValidationService.setValidatorsAndRefresh(taxIdControl, [Validators.required]);
        }
        else {
            this.adminPreStr = '';
            this.signupValidationService.setValidatorsAndRefresh(organizationNameControl, null);
            this.signupValidationService.setValidatorsAndRefresh(taxIdControl, null);
        }
    }


    /**
     * Determines whether or not the user signing up is an organization.
     * @return true if the AppUser is an organization (Donor/Receiver), false if not (Driver).
     */
    private isOrganization(): boolean {
        return ( this.form.get('primary.appUserType').value !== 'Driver' );
    }


    /**
     * Invoked on final form submission. Sends signup data to the server if the form is valid.
     * @param value The value of the form.
     * @param valid The valid state of the form.
     */
    private signupUser(value: any, valid: boolean): void {

        // Force validation in availability form portion and check validity of entire form before submission.
        this.validate.set('availability', true);
        if (!valid)  return;

        let appUserInfo: AppUserInfo = new AppUserInfo();
        let password: string = value.primary.password;

        // Copy form values to AppUserInfo object.
        ObjectManipulation.shallowCopy(value.primary, appUserInfo);
        ObjectManipulation.shallowCopy(value.addressPhone, appUserInfo);
        appUserInfo.availability = value.availability;

        let observer: Observable<FoodWebResponse> = this.signupService.signup(appUserInfo, password);
        this.showProgressSpinner = true;

        observer.finally(() => { this.showProgressSpinner = false; })
                .subscribe (
                    this.handleSignupUserResponse.bind(this),
                    // When we have errors connecting to server.
                    (err: Error) => {
                        this.signupError = 'Error: could not communication with server';
                        console.log(err);
                    }
                );
    }


    /**
     * Handles the signup response from the server.
     * @param signupResponse The signup response from the server.
     */
    private handleSignupUserResponse(signupResponse: FoodWebResponse): void {

        if (signupResponse.success) {
            this.signupError = null;
            this.signupComplete = true;
            scroll(0, 0);
        }
        else {
            this.signupError = signupResponse.message;

            if (this.signupError === AppUserErrorMsgs.DUPLICATE_EMAIL) {
                // TODO: Goto primary info tab.
            }
            else if (this.signupError === AppUserErrorMsgs.INVALID_ADDRESS) {
                // TODO: Goto address & phone tab.
            }
        }
    }
}
