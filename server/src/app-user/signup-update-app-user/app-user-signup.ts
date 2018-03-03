'use strict';
import { SessionData, AppUser } from '../../common-util/session-data';
import { signupOrUpdateAppUser } from './app-user-signup-update';

import { AppUserType } from '../../../../shared/src/app-user/app-user';
import { sendVerificationEmailAndSMS } from './app-user-signup-verification';


/**
 * Performs the signup for a new app user.
 * @param appUser App user into used for signup.
 * @param password The password for the new app user.
 * @return A promise that on success will contain the new app user's session data.
 */
export async function signup(appUser: AppUser, password: string): Promise<SessionData> {

    const sessionData: SessionData = await signupOrUpdateAppUser(appUser, password);
    await sendVerificationEmailAndSMS(sessionData);
    return sessionData;
}
