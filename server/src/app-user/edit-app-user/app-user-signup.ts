'use strict';
import { SessionData, AppUserInfo } from '../../common-util/session-data';
import { addOrUpdateAppUser } from './app-user-add-update';
import { addArgPlaceholdersToQueryStr } from '../../database-util/prepared-statement-util';
import { logSqlQueryExec } from '../../logging/sql-logger';
import { query } from '../../database-util/connection-pool';
import { sendEmail, MailConfig } from '../../common-util/email';

import { AppUserType } from '../../../../shared/app-user/app-user-info';


/**
 * Performs the signup for a new app user.
 * @param appUserInfo App user into used for signup.
 * @param password The password for the new app user.
 * @return A promise that on success will contain the new app user's session data.
 */
export function signup(appUserInfo: AppUserInfo, password: string): Promise<SessionData> {

    return addOrUpdateAppUser(appUserInfo, password)
        .then((sessionData: SessionData) => {
            return sendVerificationEmail(sessionData);
        })
        .catch((err: Error) => {
            console.log(err);
            throw new Error(err.message);  // We should have a user friendly error here!
        });
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
            console.log('Successfully verified new user.');
        })
        .catch((err: Error) => {
            console.log(err);
            throw new Error('Sorry, something went wrong. Unable to verify you.');
        });
}


/*function sendOrganizationEmail(sessionData: SessionData) : Promise<SessionData> {

    let verificationLink = 'http://connect-food.herokuapp.com/appUser/verify?appUserKey='
                         + sessionData.appUserKey + '&verificationToken=' + sessionData.verificationToken;

    let sendEmail = nodemailer.config({
        email: process.env.NOREPLY_EMAIL,
        password: process.env.NOREPLY_PASSWORD,
        server: process.env.NOREPLY_SERVER
    });
    
    let mailOptions = {
        subject: 'A New Organization Has Signed Up With Food Web: Please Verify',            
        senderName: "Food Web",
        receiver: process.env.NOREPLY_EMAIL,
        html: `Dear User,<br><br>
               A new organization: ` + sessionData.appUserInfo.organizationName + ` has signed up With Food Web!<br><br>
               Their phone number is ` + sessionData.appUserInfo.phone + ` and their email is ` + sessionData.appUserInfo.email + `.<br><br>
               Please click <a href ="` + verificationLink + `">here</a> to officially verify their account once their identity is validated.<br><br>
               Thank you,<br><br>The Food Web Team`
    }
        
    return sendEmail(mailOptions)
        .then((info) => {
            return Promise.resolve(sessionData);
        })
        .catch((err) => {
            console.log(err);
            throw new Error('Sorry, unable to send signup verification email');
        });
}*/


function sendVerificationEmail(sessionData: SessionData) : Promise<SessionData> {

    const verificationLink = process.env.HOST_ADDRESS + '/appUser/verify?appUserKey='
                           + sessionData.appUserKey + '&verificationToken=' + sessionData.verificationToken;

    const appUserInfo: AppUserInfo = sessionData.appUserInfo;
    const receiverName: string = (appUserInfo.appUserType === AppUserType.Deliverer) ? ( appUserInfo.firstName + ' ' + appUserInfo.lastName )
                                                                                     : appUserInfo.organizationName;

    const htmlStr: string = `
        <p>
            Welcome to Food Web!
            Please click <a href ="` + verificationLink + `">here</a> to verify your account with us.
        </p>
    `
        
    let mailConfig: MailConfig = new MailConfig (
        'Verify Your Food Web Account',
        receiverName,
        appUserInfo.email,
        appUserInfo.appUserType,
        htmlStr
    );

    return sendEmail(mailConfig)
        .then(() => {
            return Promise.resolve(sessionData);
        })
        .catch((err) => {
            console.log(err);
            throw new Error('Sorry, unable to send signup verification email');
        });
}
