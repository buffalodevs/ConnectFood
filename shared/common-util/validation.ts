import { FormGroup, AbstractControl, ValidatorFn } from "@angular/forms";
import { AppUserInfo } from "../app-user/app-user-info";
import { ObjectManipulation } from "./object-manipulation";


/**
 * Validation definitions that can commonly be used by front end angular forms and back end node logic.
 */
export class Validation {

    /**
     * Regular expression used for verifying email correctness.
     */
    public static readonly EMAIL_REGEX: RegExp = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;

    /**
     * Regular expression used for verifying password correctness.
     */
    public static readonly PASSWORD_REGEX: RegExp = /^[a-zA-Z0-9!@#$%^&*]{6,20}$/;

    /**
     * Regular expression used for verifying 10 digit phone numbers with dashes.
     */
    public static readonly PHONE_REGEX: RegExp = /^\d{3}\-\d{3}\-\d{4}$/;

    /**
     * Regular expression used for verifying that the state input is in a correct format.
     */
    public static readonly STATE_REGEX: RegExp = /^[a-zA-Z]{2}$/;

    /**
     * Regular expression used for verifying 5 digit ZIP codes.
     */
    public static readonly ZIP_REGEX: RegExp = /^\d{5}$/;

    /**
     * Regular expression used for verifying date string (mm/dd/yyyy) format.
     */
    public static readonly DATE_REGEX: RegExp = /^\d{1,2}\/\d{1,2}\/\d{4}$/;

    
    /**
     * Checks if an email string is in the correct format.
     * @param email The email string to check.
     * @return true if it is, false if not.
     */
    public static emailValidator(email: string): boolean {
        return Validation.EMAIL_REGEX.test(email);
    }

     
    /**
     * Checks if a password string is in the correct format.
     * @param password The password string to check.
     * @return true if it is, false if not.
     */
    public static passwordValidator(password: string): boolean {
        return Validation.PASSWORD_REGEX.test(password);
    }


    /**
     * Checks if a 7 digit phone number with dashes (string) is in the correct format.
     * @param phone The phone number string to check.
     * @return true if it is, false if not.
     */
    public static phoneValidator(phone: string): boolean {
        return Validation.PHONE_REGEX.test(phone);
    }


    public static stateValidator(state: string): boolean {
        return Validation.STATE_REGEX.test(state);
    }


    /**
     * Checks if a 5 digit ZIP code is in the correct format.
     * @param zip The ZIP code to check.
     * @return true if it is, false if not.
     */
    public static zipValidator(zip: string): boolean {
        return Validation.ZIP_REGEX.test(zip);
    }

    
    /**
     * Checks if a date string is in the correct (mm/dd/yyyy) format.
     * @param date The date string to check.
     * @return true if it is, false if not.
     */
    public static dateValidator(date: string): boolean {
        return Validation.DATE_REGEX.test(date);    
    }


    /**
     * Validates given app user information and password.
     * @param appUserInfo The app user info to validate.
     * @param password The password to validate.
     * @return On successful validation, null. On unsuccess, then an error is returned.
     */
    public static validateAppUserInfo(appUserInfo: AppUserInfo, password: string): Error {
        if (appUserInfo.email != null && !Validation.emailValidator(appUserInfo.email)) {
            return new Error('Provided email not in correct format.');
        }

        if (password != null && !Validation.passwordValidator(password)) {
            return new Error('Incorrect password format. Password must contain a minimum of 6 characters and at least one number');
        }

        if (appUserInfo.zip != null && !Validation.zipValidator(appUserInfo.zip.toString())) {
            return new Error('Incorrect ZIP code format. The ZIP code must contain exactly 5 numbers.');
        }

        return null;
    }
}
