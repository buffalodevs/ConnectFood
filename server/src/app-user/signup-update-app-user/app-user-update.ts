import { logSqlQueryExec, logSqlQueryResult } from "../../logging/sql-logger";
import { query, QueryResult } from "../../database-util/connection-pool";
import { logger } from "../../logging/logger";

import { SessionData, AppUser } from "../../common-util/session-data";
import { login } from '../login-app-user/app-user-login';
import { signupOrUpdateAppUser } from "./app-user-signup-update";
import { AppUserErrorMsgs } from "../../../../shared/src/app-user/message/app-user-error-msgs";


/**
 * Performs the update of the App User associated with the held session data.
 * @param appUserUpdate The update information for the App User.
 * @param newPassword The new password for the App User. May be null if the password is not changing.
 * @param currentPasswordCheck The current password of the App User (to be checked if provided from the client).
 * @param appUserSessionData The session data for the App User. Contains the current email and address info of the App User.
 * @return A promise without a payload. If it resolves, then the update was successful.
 */
export async function updateAppUser(appUserUpdate: AppUser, newPassword: string,
                                    currentPasswordCheck: string, appUserSessionData: SessionData): Promise <SessionData>
{   
    // VERY IMPORTANT: Must first check if the current password is correct if user is updating to a new password.
    await ( (newPassword != null) ? checkPassword(appUserSessionData.appUser.email, currentPasswordCheck)
                                  : null );

    // Check if this is an address field(s) update, and fill any null address field(s) with session data for new GPS coordinates.
    if (isAddressInfoUpdate(appUserUpdate)) {
        fillAddressUpdateInfo(appUserUpdate, appUserSessionData.appUser);

        // Make sure that whenever an address is updated we also update the timezone information (could go out of sync if user moves to another timezone)!
        if (appUserUpdate.contactInfo.timezone == null) {
            logger.error('Attempting to update user address data without also providing an updated timezone value.')
            throw new Error('An unexpected error has occured.');
        }
    }

    // Check if this is an app user availability update, and fill in utc offset information so proper UTC times can be calculated.
    if (appUserUpdate.availability != null) {
        appUserUpdate.contactInfo.timezone = appUserSessionData.appUser.contactInfo.timezone;
    }
    
    return signupOrUpdateAppUser(appUserUpdate, newPassword, appUserSessionData.appUserKey);
}


/**
 * Checks if the current password credential supplied by the user (client) is correct.
 * @param currentEmail The current email of the App User (from session data).
 * @param currentPassword The current password of the App User (from client).
 * @return A promise that will resolve if the password is correct and reject if it is not.
 */
async function checkPassword(currentEmail: string, currentPassword: string): Promise <void> {

    try {
        await login(currentEmail, currentPassword);
    }
    catch (err) {
        throw new Error(AppUserErrorMsgs.INCORRECT_CURRENT_PASSWORD);
    }
}


/**
 * Checks if we have address update fields.
 * @param appUserUpdateInfo The update info that may contain address update fields.
 * @return true if we have address update fields, false if not.
 */
function isAddressInfoUpdate(appUserUpdate: AppUser): boolean {

    return (appUserUpdate.contactInfo.address != null
        ||  appUserUpdate.contactInfo.city != null
        ||  appUserUpdate.contactInfo.state != null
        ||  appUserUpdate.contactInfo.zip != null);
}


/**
 * Fills the missing address update info if part(s) of an address are provided for App User update.
 * @param appUserUpdateInfo The update info from the client.
 * @param request The request from the client (incldues session data to fill missing address parts with).
 */
function fillAddressUpdateInfo(appUserUpdate: AppUser, appUserFromSession: AppUser): void {

    if (appUserUpdate.contactInfo.address == null)  appUserUpdate.contactInfo.address = appUserFromSession.contactInfo.address;
    if (appUserUpdate.contactInfo.city == null)     appUserUpdate.contactInfo.city = appUserFromSession.contactInfo.city;
    if (appUserUpdate.contactInfo.state == null)    appUserUpdate.contactInfo.state = appUserFromSession.contactInfo.state;
    if (appUserUpdate.contactInfo.zip == null)      appUserUpdate.contactInfo.zip = appUserFromSession.contactInfo.zip;
}
