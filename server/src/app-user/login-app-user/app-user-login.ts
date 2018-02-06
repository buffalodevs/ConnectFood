'use strict';
import { logSqlQueryExec, logSqlQueryResult } from '../../logging/sql-logger';
import { connect, query, Client, QueryResult } from '../../database-util/connection-pool';
import { logger, prettyjsonRender } from '../../logging/logger';
import { checkPassword } from '../common-app-user/password-util';
import { SessionData, AppUser } from "../../common-util/session-data";
import { DESERIALIZER } from '../../deserialization/deserialization';

import { AppUserErrorMsgs } from '../../../../shared/src/app-user/message/app-user-error-msgs';
import { DateRange } from '../../../../shared/src/date-time-util/date-range';
import { AvailabilityType } from '../../../../shared/src/app-user/app-user-availability';


/**
 * Performs the login for a given user.
 * @param email The email (username) of the user.
 * @param password The (plain text) password of the user.
 * @return A promise where on success it will provide the primary AppUser information of the logged in user.
 */
export async function login(email: string, password: string): Promise <SessionData> {

    try {
        // Get user info from database, extract and deserialize session data, and validate password.
        const getAppUserSessionResult: QueryResult = await getAppUserSession(email);
        const sessionData: SessionData = extractAndDeserializeSessionData(email, getAppUserSessionResult);
        await validatePassword(email, password, getAppUserSessionResult);
        return sessionData;
    }
    catch (err) {
        logger.info(prettyjsonRender(err)); // Not a true error, but want to capture it.
        throw new Error(AppUserErrorMsgs.INCORRECT_LOGIN);
    }
}


/**
 * Gets the primary info for a given App User.
 * @param email: The email (username) of the user to get the salt for.
 * @return A promise with the query result. The query result should simply contain one row information pertaining to the App User.
 */
function getAppUserSession(email: string): Promise <QueryResult> {

    let queryString: string = `SELECT * FROM getAppUserSessionData(NULL, $1, TRUE);`;
    let queryArgs: Array <string> = [ email ];

    logSqlQueryExec(queryString, queryArgs);
    return query(queryString, queryArgs);
}


function extractAndDeserializeSessionData(email: string, getAppUserSessionResult: QueryResult): SessionData {

    logSqlQueryResult(getAppUserSessionResult.rows);

    // We should only be getting one row back with the app user data!
    if (getAppUserSessionResult.rowCount === 1) {

        let sessionData: SessionData = getAppUserSessionResult.rows[0].sessiondata;
        sessionData.appUser = DESERIALIZER.deserialize(sessionData.appUser, AppUser);
        sessionData.appUser.availability.availabilityType = AvailabilityType.regularWeekly;
        return sessionData;
    }

    // Otherwise, we could not find an AppUser with username or email in database.
    throw new Error('AppUser could not be found with email: ' + email);
}


/**
 * Anyalyzes the result of getting the App User's primary info. If the App User does exist, then we will check the password and bring back all organizations
 * associated with the given App User if the password is correct.
 * @param email The email of the user that we are validating the password for.
 * @param password The plain text password that is to be hashed.
 * @param getAppUserSessionResult The query result that on success should contain a single row with the App User info.
 * @return A promise that resolves with no payload on success.
 */
async function validatePassword(email: string, password: string, getAppUserSessionResult: QueryResult): Promise <void> {

    let firstRowResult: any = getAppUserSessionResult.rows[0];
    let hashPassword: string = firstRowResult.password;
    
    const isMatch: boolean = await checkPassword(password, hashPassword);
    if (!isMatch) {
        throw new Error('Password is incorrect for user with email: ' + email);
    }
}
