import { FormGroup, AbstractControl, ValidatorFn } from "@angular/forms";
import { AppUser } from "../app-user/app-user";
import { ObjectManipulation } from "../common-util/object-manipulation";


/**
 * Validation definitions that can commonly be used by front end angular forms and back end node logic.
 */
export class Validation {

    /**
     * Regular expression used for verifying email correctness.
     */
    public readonly EMAIL_REGEX: RegExp;

    /**
     * Regular expression used for verifying password correctness.
     */
    public readonly PASSWORD_REGEX: RegExp;

    /**
     * Regular expression used for verifying 10 digit phone numbers with dashes.
     */
    public readonly PHONE_REGEX: RegExp;

    /**
     * Regular expression used for verifying that the state input is in a correct format.
     */
    public readonly STATE_REGEX: RegExp;

    /**
     * Regular expression used for verifying 5 digit ZIP codes.
     */
    public readonly ZIP_REGEX: RegExp;

    /**
     * Regular expression used for verifying date string (mm/dd/yyyy) format.
     */
    public readonly DATE_REGEX: RegExp;

    /**
     * Regular expression used for verifying wall clock time string (hh:mm [AM|PM]) format.
     */
    public readonly TIME_REGEX: RegExp;

    /**
     * Regular expression used for verifying hour format.
     */
    public readonly HH_REGEX: RegExp;

    /**
     * Regular expression used for verifying minute format.
     */
    public readonly MM_REGEX: RegExp;

    /**
     * Regular expression used for verifying Am or Pm string (non-case sensitive) format.
     */
    public readonly AM_OR_PM_REGEX: RegExp;

    /**
     * Regular expression used for verifying Organization Tax ID (TIN) format.
     */
    public readonly TAX_ID_REGEX: RegExp;


    public constructor() {

        this.EMAIL_REGEX = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
        this.PASSWORD_REGEX = /^[a-zA-Z0-9!@#$%^&*]{6,20}$/;
        this.PHONE_REGEX = /^\(\d{3}\) \d{3}\-\d{4}$/;
        this.STATE_REGEX = /^[a-zA-Z]{2}$/;
        this.ZIP_REGEX = /^\d{5}$/;
        this.DATE_REGEX = /^\d{1,2}\/\d{1,2}\/\d{4}$/;
        this.TIME_REGEX = /^(0?[1-9]|1[0-2]):[0-5]\d(\s?)[AaPp][Mm]$/;
        this.HH_REGEX = /^(0?[1-9]|1[0-2]?)$/;
        this.MM_REGEX = /^([0-5][0-9])$/;
        this.AM_OR_PM_REGEX = /^([aApP][mM])$/;
        this.TAX_ID_REGEX = /^\d{2}\-\d{7}$/;
    }

    
    /**
     * Checks if an email string is in the correct format.
     * @param email The email string to check.
     * @return true if it is, false if not.
     */
    public emailValidator(email: string): boolean {
        return this.EMAIL_REGEX.test(email);
    }

     
    /**
     * Checks if a password string is in the correct format.
     * @param password The password string to check.
     * @return true if it is, false if not.
     */
    public passwordValidator(password: string): boolean {
        return this.PASSWORD_REGEX.test(password);
    }


    /**
     * Checks if a 7 digit phone number with dashes (string) is in the correct format.
     * @param phone The phone number string to check.
     * @return true if it is, false if not.
     */
    public phoneValidator(phone: string): boolean {
        return this.PHONE_REGEX.test(phone);
    }


    public stateValidator(state: string): boolean {
        return this.STATE_REGEX.test(state);
    }


    /**
     * Checks if a 5 digit ZIP code is in the correct format.
     * @param zip The ZIP code to check.
     * @return true if it is, false if not.
     */
    public zipValidator(zip: string): boolean {
        return this.ZIP_REGEX.test(zip);
    }

    
    /**
     * Checks if a date string is in the correct (mm/dd/yyyy) format.
     * @param date The date string to check.
     * @return true if it is, false if not.
     */
    public dateValidator(date: string): boolean {
        return this.DATE_REGEX.test(date);    
    }


    /**
     * Checks if a time string is in the correct (hh:mm [AM|PM]) format (non-case sensitive).
     * @param time The time string to check.
     * @return true if it is, false if not.
     */
    public timeValidator(time: string): boolean {
        return this.TIME_REGEX.test(time);
    }


    /**
     * Checks if an hour string is in the correct (hh) format.
     * @param hour The hour string to check.
     * @return true if it is, false if not.
     */
    public hourValidator(hour: string): boolean {
        return this.HH_REGEX.test(hour);
    }


    /**
     * Checks if an minute string is in the correct (mm) format.
     * @param minute The minute string to check.
     * @return true if it is, false if not.
     */
    public minuteValidator(minute: string): boolean {
        return this.MM_REGEX.test(minute);
    }


    /**
     * Checks if an Am or Pm string is in the correct format (non-case sensitive).
     * @param amOrPm The Am or Pm string to check.
     * @return true if it is, false if not.
     */
    public amOrPmValidator(amOrPm: string): boolean {
        return this.AM_OR_PM_REGEX.test(amOrPm);
    }


    /**
     * Checks if a tax ID string is in the correct format (##-#######).
     * @param taxId The tax ID string to check.
     * @return true if it is, false if not.
     */
    public taxIdValidator(taxId: string): boolean {
        return this.TAX_ID_REGEX.test(taxId);
    }


    /**
     * Validates given app user information and password.
     * @param appUser The app user to validate.
     * @param password The password to validate.
     * @return On successful validation, null. On unsuccess, then an error is returned.
     */
    public validateAppUser(appUser: AppUser, password: string): Error {

        if (appUser.email != null && !this.emailValidator(appUser.email)) {
            return new Error('Provided email not in correct format.');
        }

        if (password != null && !this.passwordValidator(password)) {
            return new Error('Incorrect password format. Password must contain a minimum of 6 characters and at least one number');
        }

        if (appUser.contactInfo != null && appUser.contactInfo.zip != null && !this.zipValidator(appUser.contactInfo.zip.toString())) {
            return new Error('Incorrect ZIP code format. The ZIP code must contain exactly 5 digits.');
        }

        return null;
    }


    /**
     * Validates that retrieval offset and amount values are within correct numeric range.
     * @param retrievalOffset The retrieval offset.
     * @param retrievalAmount The retrieval amount.
     * @return true if the offset and amount are valid, false if either is invalid.
     */
    public validateRetrievalLimts(retrievalOffset: number, retrievalAmount: number): boolean {
        return ( retrievalOffset >= 0 && retrievalAmount > 0 );
    }
}
