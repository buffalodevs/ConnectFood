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
     * Regular expression used for verifying wall clock time string (hh:mm [AM|PM]) format.
     */
    public static readonly TIME_REGEX: RegExp = /^(0?[1-9]|1[0-2]):[0-5]\d(\s?)[AaPp][Mm]$/;

    /**
     * Regular expression used for verifying hour format.
     */
    public static readonly HH_REGEX: RegExp = /^(0?[1-9]|1[0-2]?)$/;

    /**
     * Regular expression used for verifying minute format.
     */
    public static readonly MM_REGEX: RegExp = /^([0-5][0-9])$/;

    /**
     * Regular expression used for verifying Am or Pm string (non-case sensitive) format.
     */
    public static readonly AM_OR_PM_REGEX: RegExp = /^([aApP][mM])$/;

    /**
     * Regular expression used for verifying Organization Tax ID (TIN) format.
     */
    public static readonly TAX_ID_REGEX: RegExp = /^\d{2}\-\d{7}$/;

    
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
     * Checks if a time string is in the correct (hh:mm [AM|PM]) format (non-case sensitive).
     * @param time The time string to check.
     * @return true if it is, false if not.
     */
    public static timeValidator(time: string): boolean {
        return Validation.TIME_REGEX.test(time);
    }


    /**
     * Checks if an hour string is in the correct (hh) format.
     * @param hour The hour string to check.
     * @return true if it is, false if not.
     */
    public static hourValidator(hour: string): boolean {
        return Validation.HH_REGEX.test(hour);
    }


    /**
     * Checks if an minute string is in the correct (mm) format.
     * @param minute The minute string to check.
     * @return true if it is, false if not.
     */
    public static minuteValidator(minute: string): boolean {
        return Validation.MM_REGEX.test(minute);
    }


    /**
     * Checks if an Am or Pm string is in the correct format (non-case sensitive).
     * @param amOrPm The Am or Pm string to check.
     * @return true if it is, false if not.
     */
    public static amOrPmValidator(amOrPm: string): boolean {
        return Validation.AM_OR_PM_REGEX.test(amOrPm);
    }


    /**
     * Checks if a tax ID string is in the correct format (##-#######).
     * @param taxId The tax ID string to check.
     * @return true if it is, false if not.
     */
    public static taxIdValidator(taxId: string): boolean {
        return Validation.TAX_ID_REGEX.test(taxId);
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
            return new Error('Incorrect ZIP code format. The ZIP code must contain exactly 5 digits.');
        }

        return null;
    }
}
