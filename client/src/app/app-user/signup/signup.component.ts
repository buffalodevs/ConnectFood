import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Observable } from 'rxjs/Observable';

import { SignupService } from './signup.service'
import { AppUserConstantsService } from '../app-user-constants.service';
import { Validation } from '../../common-util/services/validation.service';
import { AppUserValidationService } from '../common-app-user/app-user-validation.service';

import { AppUserInfo, AppUserType } from "../../../../../shared/app-user/app-user-info";
import { FoodWebResponse } from "../../../../../shared/message-protocol/food-web-response";
import { ObjectManipulation } from '../../../../../shared/common-util/object-manipulation';
import { AbstractControl } from '@angular/forms/src/model';
import { SignupErrors } from '../../../../../shared/app-user/signup-message';


@Component({
    selector: 'app-signup',
    templateUrl: './signup.component.html',
    styleUrls: ['./signup.component.css'],
    providers: [
        SignupService,
        AppUserValidationService
    ]
})
export class SignupComponent implements OnInit {

    private signupForm: FormGroup;
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


    public constructor (
        private router: Router,
        private formBuilder: FormBuilder,
        private signupValidationService: AppUserValidationService,
        private signupService: SignupService,
        private appUserConstants: AppUserConstantsService
    ) {
        this.signupError = null;
        this.signupComplete = false;
        this.adminPreStr = '';
        this.validate = new Map<string, boolean>();
    }


    /**
     * Setup the form value.
     */
    public ngOnInit(): void {

        // Initialize signup form.
        this.signupForm = this.formBuilder.group({

            'primary': this.formBuilder.group({
                'appUserType':      [null, Validators.required],
                'email':            [null, [Validators.required, Validators.pattern(Validation.EMAIL_REGEX)]],
                'organizationName': [null, Validators.required],
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
        ObjectManipulation.applyToProperties(this.signupForm.controls,
            (formPortion: string) => {
                this.validate.set(formPortion, false);
            });

        // Listen for changes to the appUserType member of the AppUserInfo Form, so we can change form fields appropriately.
        this.signupForm.get('primary.appUserType').valueChanges.subscribe(this.listenAppUserTypeChange.bind(this));
    }


    /**
     * Updates form requirements based off of the appUserType value.
     */
    private listenAppUserTypeChange(): void {

        let organizationNameControl: FormControl = <FormControl>this.signupForm.get('primary.organizationName');

        if (this.isOrganization()) {
            this.adminPreStr = 'Admin';
            this.signupValidationService.setValidatorsAndRefresh(organizationNameControl, [Validators.required]);
        }
        else {
            this.adminPreStr = '';
            this.signupValidationService.setValidatorsAndRefresh(organizationNameControl, null);
        }
    }


    /**
     * Determines whether or not the user signing up is an organization.
     * @return true if the AppUser is an organization (Donor/Receiver), false if not (Driver).
     */
    private isOrganization(): boolean {
        return ( this.signupForm.get('primary.appUserType').value !== AppUserType.Driver );
    }


    /**
     * Determines if a given control has any error(s).
     * @param controlPath The path of the control relative to the base signupForm.
     * true if an error(s) exist, false if not.
     */
    private hasError(controlPath: string): boolean {
        return ( this.signupForm.get(controlPath).errors != null );
    }


    /**
     * Generates an error message for a given control (assuming the control has an error).
     * @param controlPath The path of the control relative to the base signupForm.
     * @return The error message for the given control.
     */
    private errorMsgFor(controlPath: string): string {
        return this.signupValidationService.errorMsgFor(this.signupForm.get(controlPath), controlPath);
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

        observer.subscribe (
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

            if (this.signupError === SignupErrors.DUPLICATE_EMAIL) {
                // TODO: Goto primary info tab.
            }
            else if (this.signupError === SignupErrors.INVALID_ADDRESS) {
                // TODO: Goto address & phone tab.
            }
        }
    }
}
