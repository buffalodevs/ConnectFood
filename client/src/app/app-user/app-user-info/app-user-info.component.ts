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
import { AppUserErrorMsgs } from '../../../../../shared/app-user/message/app-user-error-msgs';
import { ObjectManipulation } from '../../../../../shared/common-util/object-manipulation';


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
    
    private isOrganization: boolean;
    private editData: Map<string, EditData>;


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
        this.editData = new Map<string, EditData>();

        this.initAppUserInfoFormElements(appUserInfo);
        this.initNonAppUserInfoFormElements();
    }


    /**
     * Initializes form elements that are part of the AppUserInfo object.
     * @param appUserInfo The AppUserInfo object from which to initialize the elements.
     */
    private initAppUserInfoFormElements(appUserInfo: AppUserInfo): void {

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
                this.editData.set(property, new EditData());
            }
        }
    }


    /**
     * Initialize form elements that are not part of the AppUserInfo object (such as password).
     */
    private initNonAppUserInfoFormElements(): void {

        const passControlNames: string[] = ['password', 'currentPassword', 'confirmPassword'];

        // Initialize password, currentPassword, and confirmPassword form elements.
        for (let i: number = 0; i < passControlNames.length; i++) {
            this.form.addControl(passControlNames[i], new FormControl('', [ Validators.required, Validators.pattern(Validation.PASSWORD_REGEX) ]));
            this.editData.set(passControlNames[i], new EditData());
        }

        this.form.setValidators(this.appUserValidationService.confirmPasswordEqual());
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
     * @param editing Default is true. The edit state to be set.
     */
    private setManyEditable(editFormControlIds: string[], editing: boolean = true): void {

        for (let i: number = 0; i < editFormControlIds.length; i++) {

            // Reset the validation state of the fields involved in the edit.
            this.control(editFormControlIds[i]).markAsUntouched();                

            // Set the form control value to the session data value for consistency.
            this.control(editFormControlIds[i]).setValue(this.sessionDataService.getAppUserSessionData()[editFormControlIds[i]]);

            this.editData.get(editFormControlIds[i]).editing = editing;
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

        let currentPassword: AbstractControl = this.control(currentPasswordName);
        let newPassword: AbstractControl = this.control(newPasswordName);
        let confirmPassword: AbstractControl = this.control(confirmPasswordName);

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

        let appUserInfoUpdate: AppUserInfo = new AppUserInfo();

        // Go through each form control checking valid state and adding value to update object (password form members packaged separately).
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
        
        for (let i: number = 0; i < saveFormControlNames.length; i++) {
            this.editData.get(saveFormControlNames[i]).showProgressSpinner = true;
        }

        observable.finally(() => {
            for (let i: number = 0; i < saveFormControlNames.length; i++)
            { this.editData.get(saveFormControlNames[i]).showProgressSpinner = false; }
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
                this.control(saveFormControlNames[i]).setErrors(null);
                this.setEditable(saveFormControlNames[i], false);
            }
        }
        else if (response.message === AppUserErrorMsgs.DUPLICATE_EMAIL) {
            this.appUserValidationService.addError(this.control(saveFormControlNames[0]), 'duplicateEmail', response.message);
        }
        else if (response.message === AppUserErrorMsgs.INVALID_ADDRESS) {
            this.appUserValidationService.addError(this.control(saveFormControlNames[0]), 'invalidAddress', response.message);
        }
        else if (response.message === AppUserErrorMsgs.INCORRECT_PASSWORD) {
            this.appUserValidationService.addError(this.control(saveFormControlNames[0]), 'incorrectPassword', response.message);
        }
    }
}
