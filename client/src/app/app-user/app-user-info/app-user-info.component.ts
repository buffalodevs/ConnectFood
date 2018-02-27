import { Component } from '@angular/core';
import { FormGroup, Validators, AbstractControl, FormControl, ValidatorFn, FormBuilder } from '@angular/forms';
import { Observable } from "rxjs/Observable";
import 'rxjs/add/operator/finally';
import * as _ from 'lodash';

import { AbstractModelDrivenComponent } from '../../common-util/components/abstract-model-driven-component';
import { AppUserValidationService } from '../common-app-user/app-user-validation.service';
import { AppUserConstantsService } from '../common-app-user/app-user-constants.service';
import { SlickTypeaheadService } from '../../slick/slick-type-ahead/slick-type-ahead.service';
import { AppUserUpdateService } from "./app-user-update.service";
import { SessionDataService } from "../../common-util/services/session-data.service";
 
import { AppUser, AppUserType } from "../../../../../shared/src/app-user/app-user";
import { Validation } from "../../../../../shared/src/validation/validation";
import { FoodWebResponse } from "../../../../../shared/src/message-protocol/food-web-response";
import { AppUserErrorMsgs } from '../../../../../shared/src/app-user/message/app-user-error-msgs';
import { ObjectManipulation } from '../../../../../shared/src/common-util/object-manipulation';
import { ContactInfo } from '../../../../../shared/src/app-user/contact-info';
import { Organization } from '../../../../../shared/src/app-user/organization';


/**
 * Wrapper for information pertaining to editing each field (or group of fields).
 */
class EditData {

    public constructor (
        public editing: boolean = false,
        public showProgressSpinner: boolean = false
    ) {}
}


@Component({
    selector: 'app-app-user-info',
    templateUrl: './app-user-info.component.html',
    styleUrls: ['./app-user-info.component.css'],
    providers: [AppUserUpdateService]
})
export class AppUserInfoComponent extends AbstractModelDrivenComponent {
    
    public readonly IS_ORGANIZATION: boolean;
    private _editData: Map <string, EditData>;


    public constructor (
        public validationService: AppUserValidationService,
        public appUserConstants: AppUserConstantsService,
        public typeaheadService: SlickTypeaheadService,
        private _appUserUpdateService: AppUserUpdateService,
        private _sessionDataService: SessionDataService,
        formBuilder: FormBuilder,
    ) {
        super(validationService, formBuilder);

        let appUser: AppUser = _sessionDataService.getAppUserSessionData();

        // Set some form labels based off of whether or not user is an organization.
        this.IS_ORGANIZATION = ( appUser.appUserType !== AppUserType.Deliverer );

        this.form = new FormGroup({});
        this._editData = new Map <string, EditData>();

        this.initAppUserFormElements(appUser);
        this.initPasswordFormElements();
    }


    public getEditDataFor(fieldName: string): EditData {

        if (!this._editData.has(fieldName)) {
            throw new Error('Edit data does not exist for form control with name: ' + fieldName);
        }

        return this._editData.get(fieldName);
    }


    /**
     * Initializes form elements that are part of the AppUser object.
     * @param appUser The AppUser object from which to initialize the elements.
     */
    private initAppUserFormElements(appUser: AppUser): void {

        const specificValidators: { [key: string]: ValidatorFn[] } = {
            'email':            [ Validators.pattern(this.validationService.EMAIL_REGEX) ],
            'contactInfo.zip':  [ Validators.pattern(this.validationService.ZIP_REGEX) ]
        } 
    
        this.form = this.genFormGroupFromObject(appUser, [ Validators.required ], specificValidators);
        // Don't want availability control to be form array, but rather, a form control element whose value is an array.
        (<FormGroup>this.form).setControl('availability', new FormControl(appUser.availability));

        this.applyFormControls(this, (controlPath: string, control: AbstractControl) => {
            this._editData.set(controlPath, new EditData());
        }, true);
    }


    /**
     * Initialize form elements that are not part of the AppUser object (such as password).
     */
    private initPasswordFormElements(): void {

        const passControlNames: string[] = ['password', 'currentPassword', 'confirmPassword'];

        // Initialize password, currentPassword, and confirmPassword form elements.
        for (let i: number = 0; i < passControlNames.length; i++) {
            this.form.addControl(passControlNames[i], new FormControl('', [ Validators.required, Validators.pattern(this.validationService.PASSWORD_REGEX) ]));
            this._editData.set(passControlNames[i], new EditData());
        }

        this.form.setValidators(this.validationService.confirmPasswordEqual());
    }


    /**
     * Sets a field in the App User Info form to be (un)editable and focuses the form control used for editing.
     * @param editFormControlId The id of the form control that will be used for editing.
     * @param editing Default is true. The edit state to be set.
     */
    private setEditable(editFormControlId: string, editing: boolean = true): void {
        this.setManyEditable([editFormControlId], editing);
    }


    /**
     * Sets many fields in the App User Info form to be (un)editable and focuses the form control used for editing.
     * @param editFormControlIds A list of the ids of the form controls that will be used for editing.
     * @param editing Default is true. The edit state to be set.`
     */
    private setManyEditable(editFormControlIds: string[], editing: boolean = true): void {

        for (let i: number = 0; i < editFormControlIds.length; i++) {

            // Reset the validation state of the fields involved in the edit.
            this.form.get(editFormControlIds[i]).markAsUntouched();                

            // Set the form control value to the session data value for consistency.
            this.form.get(editFormControlIds[i]).setValue(_.get(this._sessionDataService.getAppUserSessionData(), editFormControlIds[i]));

            this._editData.get(editFormControlIds[i]).editing = editing;
        }

        // Force processing of form input element after it is shown (via *ngIf) by inserting into end of event queue (via setTimeout).
        if (editing)  setTimeout(() => {
            let input: HTMLElement = document.getElementById(editFormControlIds[0]);
            if (input != null)  input.focus();
        }, 0);
    }


    /**
     * Saves the new password value.
     * @param currentPasswordName The form control name for the current password.
     * @param newPasswordName The form control name for the new password.
     * @param confirmPasswordName The form control name for the confirm password.
     */
    private savePassword(currentPasswordName: string, newPasswordName: string, confirmPasswordName: string): void {

        let currentPassword: AbstractControl = this.form.get(currentPasswordName);
        let newPassword: AbstractControl = this.form.get(newPasswordName);
        let confirmPassword: AbstractControl = this.form.get(confirmPasswordName);

        // First validate the password fields before saving the password.
        if (currentPassword.valid && newPassword.valid && confirmPassword.valid) {
            this.saveMany([ currentPasswordName ], newPassword.value, currentPassword.value);
        }
    }


    /**
     * Saves the value of a field and disables edit mode for the given field if the value of the field is valid.
     * @param saveFormControlName The name of the form control.
     */
    private save(saveFormControlName: string): void {
        this.saveMany([ saveFormControlName ]);
    }


    /**
     * Saves the value of many fields and disables edit mode for the given fields if the values of the fields are valid.
     * @param saveFormControlNames The names of the form controls (excluding special case of password).
     * @param newPassword The new password value if this is an update of the password.
     * @param currentPassword The current password value if this is an update of the password.
     */
    private saveMany(saveFormControlNames: string[], newPassword: string = null, currentPassword: string = null): void {

        let appUserUpdate: AppUser = new AppUser();

        // Go through each form control checking valid state and adding value to update object (password form members packaged separately).
        if (newPassword === null) {
            for (let i: number = 0; i < saveFormControlNames.length; i++) {

                let saveFormControl: AbstractControl = this.form.get(saveFormControlNames[i]);

                if (!saveFormControl.valid) {
                    return; // Invalid control, force out now!
                }
                
                // Handle all non-password updates by writing to appUserUpdate container. Password handled separately from shared
                // object (AppUser) due to possible security concerns (don't want to make it easy to accidentally send password to client).
                _.set(appUserUpdate, saveFormControlNames[i], saveFormControl.value);
            }
        }

        // Send save field update to server and listen for response.
        let observable: Observable<FoodWebResponse> = this._appUserUpdateService.updateAppUser(appUserUpdate, newPassword, currentPassword);
        
        for (let i: number = 0; i < saveFormControlNames.length; i++) {
            this._editData.get(saveFormControlNames[i]).showProgressSpinner = true;
        }

        observable.finally(() => {
            for (let i: number = 0; i < saveFormControlNames.length; i++)
            { this._editData.get(saveFormControlNames[i]).showProgressSpinner = false; }
        })
        .subscribe(this.handleSaveManyResponse.bind(this, saveFormControlNames));
    }


    /**
     * Handles the response from the server or the save operation.
     * @param saveFormControlNames The form control names involved in the save operation.
     * @param response The response from the server.
     */
    private handleSaveManyResponse(saveFormControlNames: string[], response: FoodWebResponse): void {

        if (response.success) {
            // Update all involved form controls based off of reply from server.
            for (let i: number = 0; i < saveFormControlNames.length; i++) {
                this.form.get(saveFormControlNames[i]).setErrors(null);
                this.setEditable(saveFormControlNames[i], false);
            }
        }
        else if (response.message === AppUserErrorMsgs.DUPLICATE_EMAIL) {
            this.validationService.addError(this.form.get(saveFormControlNames[0]), 'duplicateEmail', response.message);
        }
        else if (response.message === AppUserErrorMsgs.INVALID_ADDRESS) {
            this.validationService.addError(this.form.get(saveFormControlNames[0]), 'invalidAddress', response.message);
        }
        else if (response.message === AppUserErrorMsgs.INCORRECT_CURRENT_PASSWORD) {
            this.validationService.addError(this.form.get(saveFormControlNames[0]), 'incorrectPassword', response.message);
        }
    }
}
