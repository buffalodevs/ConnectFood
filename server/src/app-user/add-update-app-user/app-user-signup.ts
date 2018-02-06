'use strict';
import { SessionData, AppUser } from '../../common-util/session-data';
import { addOrUpdateAppUser } from './app-user-add-update';
import { logger, prettyjsonRender } from '../../logging/logger';
import { addArgPlaceholdersToQueryStr } from '../../database-util/prepared-statement-util';
import { logSqlQueryExec } from '../../logging/sql-logger';
import { query } from '../../database-util/connection-pool';
import { sendEmail, EmailConfig } from '../../email/email';

import { AppUserType } from '../../../../shared/src/app-user/app-user';


/**
 * Performs the signup for a new app user.
 * @param appUser App user into used for signup.
 * @param password The password for the new app user.
 * @return A promise that on success will contain the new app user's session data.
 */
export async function signup(appUser: AppUser, password: string): Promise<SessionData> {

    const sessionData: SessionData = await addOrUpdateAppUser(appUser, password);
    return sendVerificationEmail(sessionData);
}


/**
 * Verifies the signup of a user by comparing a verfication token form the client (email link) with the one held in the database.
 * @param verificationToken The verification token sent from the client which should match up against the token held in the database.
 */
export function signupVerify(appUserKey: number, verificationToken: String): Promise<void> {

    let queryArgs: Array<any> = [ appUserKey, verificationToken ];
    let queryString: string = addArgPlaceholdersToQueryStr('SELECT * FROM verifyAppUser();', queryArgs);
    logSqlQueryExec(queryString, queryArgs);

    return query(queryString, queryArgs)
        .then(() => {
            logger.info('Successfully verified new user with ID: ' + appUserKey);
        })
        .catch((err: Error) => {
            logger.warn(prettyjsonRender(err));
            throw new Error('Sorry, something went wrong. Unable to verify you.');
        });
}


function sendVerificationEmail(sessionData: SessionData) : Promise<SessionData> {

    const verificationLink = process.env.HOST_ADDRESS + '/appUser/verify?appUserKey='
                           + sessionData.appUserKey + '&verificationToken=' + sessionData.verificationToken;

    const appUser: AppUser = sessionData.appUser;
    const receiverName: string = appUser.isOrganization() ? appUser.organization.name
                                                          : ( appUser.firstName + ' ' + appUser.lastName );

    const htmlStr: string = `
        <p>
            Welcome to Food Web!
            Please click <a href ="` + verificationLink + `">here</a> to verify your account with us.
        </p>
    `
        
    let emailConfig: EmailConfig = new EmailConfig (
        'Verify Your Food Web Account',
        receiverName,
        appUser.email,
        appUser.appUserType,
        htmlStr
    );

    return sendEmail(emailConfig)
        .then(() => {
            return Promise.resolve(sessionData);
        })
        .catch((err) => {
            logger.error(prettyjsonRender(err));
            throw new Error('Sorry, unable to send signup verification email');
        });
}
