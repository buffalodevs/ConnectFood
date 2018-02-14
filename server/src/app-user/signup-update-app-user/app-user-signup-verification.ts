import { QueryResult, query } from "../../database-util/connection-pool";
import { addArgPlaceholdersToQueryStr } from "../../database-util/prepared-statement-util";
import { logSqlQueryExec } from "../../logging/sql-logger";
import { logger, prettyjsonRender } from "../../logging/logger";
import { EmailConfig, sendEmail } from "../../email/email";
import { SessionData, AppUser } from "../../common-util/session-data";



/**
 * Sends a singup verification email to the new user that has signed up.
 * @param sessionData The session data of the new user that we are sending the verification email to.
 */
export async function sendVerificationEmail(sessionData: SessionData) : Promise<void> {

    const verificationLink = process.env.FOOD_WEB_SERVER_HOST_ADDRESS + '/appUser/verify?appUserKey='
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
        
    const emailConfig: EmailConfig = new EmailConfig (
        'Verify Your Food Web Account',
        receiverName,
        appUser.email,
        appUser.appUserType,
        htmlStr
    );

    try {
        await sendEmail(emailConfig);
    }
    catch (err) {
        logger.error(prettyjsonRender(err));
        throw new Error('Sorry, unable to send signup verification email');
    }
}


/**
 * Verifies the signup of a user by comparing a verfication token form the client (email link) with the one held in the database.
 * @param verificationToken The verification token sent from the client which should match up against the token held in the database.
 */
export async function signupVerify(appUserKey: number, verificationToken: String): Promise<void> {

    let queryArgs: Array<any> = [ appUserKey, verificationToken ];
    let queryString: string = addArgPlaceholdersToQueryStr('SELECT * FROM verifyAppUser();', queryArgs);
    logSqlQueryExec(queryString, queryArgs);

    try {
        const queryResult: QueryResult = await query(queryString, queryArgs);
        logger.info('Successfully verified new user with ID: ' + appUserKey);
    }
    catch (err) {
        logger.warn(prettyjsonRender(err));
        throw new Error('Sorry, something went wrong. Unable to verify you.');
    }
}
