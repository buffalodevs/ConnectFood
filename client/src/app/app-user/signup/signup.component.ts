import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/finally';

import { AppUserTypesService } from '../../domain/app-user-types/app-user-types.service';
import { SignupService } from './signup.service'
import { AppUserConstantsService } from '../common-app-user/app-user-constants.service';
import { AppUserValidationService, Validation } from '../common-app-user/app-user-validation.service';
import { SlickTypeaheadService } from '../../slick/slick-type-ahead/slick-type-ahead.service';
import { AbstractModelDrivenComponent } from '../../common-util/components/abstract-model-driven-component';

import { AppUserInfo, AppUserType } from "../../../../../shared/src/app-user/app-user-info";
import { FoodWebResponse } from "../../../../../shared/src/message-protocol/food-web-response";
import { ObjectManipulation } from '../../../../../shared/src/common-util/object-manipulation';
import { AppUserErrorMsgs } from '../../../../../shared/src/app-user/message/app-user-error-msgs';


@Component({
    selector: 'app-signup',
    templateUrl: './signup.component.html',
    styleUrls: ['./signup.component.css'],
    providers: [SignupService]
})
export class SignupComponent extends AbstractModelDrivenComponent implements OnInit {

    private _appUserTypes: string[];
    get appUserTypes(): string[] {
        return this._appUserTypes
    }

    private _signupError: string;
    get signupError(): string {
        return this._signupError;
    }

    private _signupComplete: boolean;
    get signupComplete(): boolean {
        return this._signupComplete;
    }

    /**
     * This gets set to 'Admin' when the user signing up is an organization. If not, then it will be an empty string.
     */
    private _adminPreStr: string;
    get adminPreStr(): string {
        return this._adminPreStr;
    }

    /**
     * Used to keep track of submission of signup so we can show progress spinner.
     */
    private _showProgressSpinner: boolean;
    get showProgressSpinner(): boolean {
        return this._showProgressSpinner;
    }

    /**
     * Marks whether or not valiation should fire for a specific field in the form.
     */
    private _fieldValidateFlags: Map <string, boolean>;


    public constructor (
        appUserTypesService: AppUserTypesService,
        public validationService: AppUserValidationService,
        public appUserConstants: AppUserConstantsService,
        public typeaheadService: SlickTypeaheadService,
        private _formBuilder: FormBuilder,
        private _signupService: SignupService
    ) {
        super(validationService);

        this._signupError = null;
        this._signupComplete = false;
        this._adminPreStr = '';
        this._fieldValidateFlags = new Map <string, boolean>();
        this._showProgressSpinner = false;

        appUserTypesService.getAppUserTypes().subscribe((appUserTypes: string[]) => { this._appUserTypes = appUserTypes });
    }


    /**
     * Setup the form value.
     */
    public ngOnInit(): void {

        // Initialize signup form.
        this.form = this._formBuilder.group({

            'primary': this._formBuilder.group({
                'appUserType':      [null, Validators.required],
                'email':            [null, [Validators.required, Validators.pattern(this.validationService.EMAIL_REGEX)]],
                'organizationName': [null, Validators.required],
                'taxId':            [null, [Validators.required, Validators.pattern(this.validationService.TAX_ID_REGEX)]],
                'firstName':        [null, Validators.required],
                'lastName':         [null, Validators.required],
                'password':         [null, [Validators.required, Validators.pattern(this.validationService.PASSWORD_REGEX)]],
                'confirmPassword':  [null, [Validators.required, Validators.pattern(this.validationService.PASSWORD_REGEX)]]
            }, { validator: this.validationService.confirmPasswordEqual() }),

            'addressPhone': this._formBuilder.group({
                'address':          [null, Validators.required],
                'city':             [null, Validators.required],
                'state':            [null, [Validators.required, Validators.minLength(2), Validators.maxLength(2)]],
                'zip':              [null, [Validators.required, Validators.pattern(this.validationService.ZIP_REGEX)]],
                'phone':            [null, [Validators.required, Validators.pattern(this.validationService.PHONE_REGEX)]]
            }),

            'availability': [null, Validators.required]
        });

        // Generate validate mappings for each poriton of the signup form. Initialize all of them to false.
        ObjectManipulation.applyToProperties (
            this.form.controls,
            (formFieldName: string) => {
                this._fieldValidateFlags.set(formFieldName, false);
            }
        );

        // Listen for changes to the appUserType member of the AppUserInfo Form, so we can change form fields appropriately.
        this.form.get('primary.appUserType').valueChanges.subscribe(this.listenAppUserTypeChange.bind(this));
    }


    /**
     * Checks if a given field should be validated.
     * @param fieldName The name of the field to check.
     * @return true if it should, false if not.
     */
    public shouldValidateField(fieldName: string): boolean {
        return this._fieldValidateFlags.get(fieldName);
    }


    /**
     * Marks a given field for validation based on given validation flag.
     * @param fieldName The name of the field to validate.
     * @param flag Whether or not to validate the field.
     */
    public validateField(fieldName: string, flag: boolean = true): void {
        this._fieldValidateFlags.set(fieldName, flag);
    }


    /**
     * Updates form validation requirements based off of the appUserType value.
     */
    private listenAppUserTypeChange(): void {

        let organizationNameControl: FormControl = <FormControl>this.form.get('primary.organizationName');
        let taxIdControl: FormControl = <FormControl>this.form.get('primary.taxId');

        if (this.isOrganization()) {
            this._adminPreStr = 'Admin';
            this.validationService.setValidatorsAndRefresh(organizationNameControl, [Validators.required]);
            this.validationService.setValidatorsAndRefresh(taxIdControl, [Validators.required]);
        }
        else {
            this._adminPreStr = '';
            this.validationService.setValidatorsAndRefresh(organizationNameControl, null);
            this.validationService.setValidatorsAndRefresh(taxIdControl, null);
        }
    }


    /**
     * Determines whether or not the user signing up is an organization.
     * @return true if the AppUser is an organization (Donor/Receiver), false if not (Driver).
     */
    private isOrganization(): boolean {
        return ( this.form.get('primary.appUserType').value !== AppUserType.Deliverer );
    }


    /**
     * Invoked on final form submission. Sends signup data to the server if the form is valid.
     * @param value The value of the form.
     * @param valid The valid state of the form.
     */
    private signupUser(value: any, valid: boolean): void {

        // Force validation in availability form portion and check validity of entire form before submission.
        this._fieldValidateFlags.set('availability', true);
        if (!valid)  return;

        let appUserInfo: AppUserInfo = new AppUserInfo();
        let password: string = value.primary.password;

        // Copy form values to AppUserInfo object.
        ObjectManipulation.shallowCopy(value.primary, appUserInfo);
        ObjectManipulation.shallowCopy(value.addressPhone, appUserInfo);
        appUserInfo.availability = value.availability;

        let observer: Observable<FoodWebResponse> = this._signupService.signup(appUserInfo, password);
        this._showProgressSpinner = true;

        observer.finally(() => { this._showProgressSpinner = false; })
                .subscribe (
                    this.handleSignupUserResponse.bind(this),
                    // When we have errors connecting to server.
                    (err: Error) => {
                        this._signupError = 'Error: could not communication with server';
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
            this._signupError = null;
            this._signupComplete = true;
            scroll(0, 0);
        }
        else {
            this._signupError = signupResponse.message;

            if (this.signupError === AppUserErrorMsgs.DUPLICATE_EMAIL) {
                // TODO: Goto primary info tab.
            }
            else if (this.signupError === AppUserErrorMsgs.INVALID_ADDRESS) {
                // TODO: Goto address & phone tab.
            }
        }
    }
}
