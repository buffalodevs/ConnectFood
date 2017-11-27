import { Component } from '@angular/core';
import { FormGroup, Validators, AbstractControl, FormControl, ValidatorFn } from '@angular/forms';
import { Observable } from "rxjs/Observable";
import { Subscription } from "rxjs/Subscription";

import { AbstractModelDrivenComponent } from '../../common-util/components/abstract-model-driven-component';
import { AppUserValidationService } from '../common-app-user/app-user-validation.service';
import { AppUserConstantsService } from '../common-app-user/app-user-constants.service';
import { AppUserUpdateService } from "./app-user-update.service";
import { SessionDataService } from "../../common-util/services/session-data.service";
import { FoodWebBusyConfig } from "../../common-util/etc/food-web-busy-config";
 
import { AppUserInfo } from "../../../../../shared/app-user/app-user-info";
import { Validation } from "../../../../../shared/common-util/validation";
import { FoodWebResponse } from "../../../../../shared/message-protocol/food-web-response";
import { SignupErrors } from '../../../../../shared/app-user/signup-message';
import { ObjectManipulation } from '../../../../../shared/common-util/object-manipulation';


@Component({
    selector: 'app-app-user-info',
    templateUrl: './app-user-info.component.html',
    styleUrls: ['./app-user-info.component.css'],
    providers: [AppUserUpdateService]
})
export class AppUserInfoComponent extends AbstractModelDrivenComponent {
    
    private isOrganization: boolean;
    private editFlags: Map<string, boolean>;


    public constructor (
        private appUserValidationService: AppUserValidationService,
        private appUserConstantsService: AppUserConstantsService,
        private appUserUpdateService: AppUserUpdateService,
        private sessionDataService: SessionDataService
    ) {
        super(appUserValidationService);

        let appUserInfo: AppUserInfo = sessionDataService.getAppUserSessionData();

        // Set some form labels based off of whether or not user is an organization.
        this.isOrganization = (appUserInfo.organizationName != null);

        this.form = new FormGroup({});
        this.editFlags = new Map<string, boolean>();

        // Fill the form group model based off of the properties found in AppUserInfo.
        // Also, add edit flags based off of the properties.
        for (let property in appUserInfo) {
            if (appUserInfo.hasOwnProperty(property)) {

                let validators: ValidatorFn[] = [ Validators.required ];

                // Add additional needed validators for email and password fields.
                switch (property) {
                    case 'email':       validators.push(Validators.pattern(Validation.EMAIL_REGEX));    break;
                    case 'zip':         validators.push(Validators.pattern(Validation.ZIP_REGEX));      break;
                }

                let initValue: any = (appUserInfo[property] == null) ? '' : appUserInfo[property];
                this.form.addControl(property, new FormControl(initValue, validators));
                this.editFlags.set(property, false);
            }
        }

        // Initialize form with elements that are not part of AppUserInfo object.
        this.form.addControl('password', new FormControl('', [Validators.required, Validators.pattern(Validation.PASSWORD_REGEX)]));
        this.form.addControl('currentPassword', new FormControl('', [Validators.required, Validators.pattern(Validation.PASSWORD_REGEX)]));
        this.form.addControl('confirmPassword', new FormControl('', [Validators.required, Validators.pattern(Validation.PASSWORD_REGEX)]));
        this.form.setValidators(this.appUserValidationService.confirmPasswordEqual());
    }


    /**
     * Sets a field in the App User Info form to be (un)editable and focuses the form control used for editing.
     * @param editFormControlId The id of the form control that will be used for editing.
     * @param editable Default is true. The edit state to be set.
     */
    private setEditable(editFormControlId: string, editable: boolean = true): void {
        this.setManyEditable([editFormControlId], editable);
    }


    /**
     * Sets many fields in the App User Info form to be (un)editable and focuses the form control used for editing.
     * @param editFormControlIds A list of the ids of the form controls that will be used for editing.
     * @param editable Default is true. The edit state to be set.
     */
    private setManyEditable(editFormControlIds: string[], editable: boolean = true): void {

        for (let i: number = 0; i < editFormControlIds.length; i++) {

            // Reset the validation state of the fields involved in the edit.
            this.control(editFormControlIds[i]).markAsUntouched();                

            // Set the form control value to the session data value for consistency.
            this.control(editFormControlIds[i]).setValue(this.sessionDataService.getAppUserSessionData()[editFormControlIds[i]]);

            this.editFlags.set(editFormControlIds[i], editable);
        }

        // Force processing of form input element after it is shown (via *ngIf) by inserting into end of event queue (via setTimeout).
        if (editable)  setTimeout(() => {
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

        let currentPassword: AbstractControl = this.control(currentPasswordName);
        let newPassword: AbstractControl = this.control(newPasswordName);
        let confirmPassword: AbstractControl = this.control(confirmPasswordName);

        // First validate the password fields before saving the password.
        if (currentPassword.valid && newPassword.valid && confirmPassword.valid) {
            this.saveMany([ newPasswordName ], newPassword.value, currentPassword.value);
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

        let appUserInfoUpdate: AppUserInfo = new AppUserInfo();

        // Go through each form control checking valid state and adding value to update object.
        for (let i: number = 0; i < saveFormControlNames.length && newPassword === null; i++) {

            let saveFormControl: AbstractControl = this.control(saveFormControlNames[i]);

            if (!saveFormControl.valid) {
                return; // Invalid control, force out now!
            }
            
            // Handle all non-password updates by writing to appUserInfoUpdate container. Password handled separately from shared
            // object (AppUserInfo) due to possible security concerns (don't want to make it easy to accidentally send password to client).
            appUserInfoUpdate[saveFormControlNames[i]] = saveFormControl.value;
        }

        // Send save field update to server and listen for response.
        let observable: Observable<FoodWebResponse> = this.appUserUpdateService.updateAppUserInfo(appUserInfoUpdate, newPassword, currentPassword);
        
        observable.subscribe((response: FoodWebResponse) => {

            // Update all involved form controls based off of reply from server.
            for (let i: number = 0; i < saveFormControlNames.length; i++) {

                if (response.success) {
                    this.control(saveFormControlNames[i]).setErrors(null);
                    this.setEditable(saveFormControlNames[i], false);
                }
                else if (response.message === SignupErrors.DUPLICATE_EMAIL) {
                    this.appUserValidationService.addError(this.control(saveFormControlNames[i]), 'duplicateEmail', response.message);
                }
                else if (response.message === SignupErrors.INVALID_ADDRESS) {
                    this.appUserValidationService.addError(this.control(saveFormControlNames[i]), 'invalidAddress', response.message);
                }
            }
        });
    }
}
