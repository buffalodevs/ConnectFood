'use strict';
import { logSqlConnect, logSqlQueryExec, logSqlQueryResult } from '../../logging/sql-logger';
import { query, Client, QueryResult } from '../../database-util/connection-pool';
import { fixNullQueryArgs } from "../../database-util/prepared-statement-util";

import { SessionData, AppUserInfo } from '../../common-util/session-data';
import { hashPassword } from '../common-app-user/password-util';

import { GPSCoordinate, getGPSCoordinate } from '../../../../shared/common-util/geocode';
import { Validation } from '../../../../shared/common-util/validation';
import { Address } from '../../../../shared/app-user/app-user-info';
import { AppUserErrorMsgs } from '../../../../shared/app-user/message/app-user-error-msgs';
import { TimeRange } from '../../../../shared/app-user/time-range';


/**
 * Adds or updates an app user.
 * @param appUserInfo Shared app user into used for add or update. If an add, then all fields should be populated
 *                    (except possibly organization fields if new user is a driver). If an update, only update fields shall be populated.
 * @param password The new or updated password for the app user. Can be null if this is an update.
 * @param appUserUpdateKey If provided, then it designates the app user to be updated. If not provided, then it signifies that this is a new app user to be added.
 * @return A promise that on success will resolve to the new or updated sessiond data for the app user.
 */
export function addOrUpdateAppUser(appUserInfo: AppUserInfo, password?: string, appUserUpdateKey?: number): Promise<SessionData> {

    let isUpdate: boolean = appUserUpdateKey != null;

    // First validate given App User signup info.
    let validation: Validation = new Validation();
    let validationErr: Error = validation.validateAppUserInfo(appUserInfo, password);
    if (validationErr != null)  throw validationErr;

    // Determine if we must hash a password. If it is a signup then we must have a password to hash,
    // and if it's an update we should check if we are updating password.
    let hashPasswordPromise: Promise<string> = Promise.resolve(null);
    if (!isUpdate || password != null) {
        hashPasswordPromise = hashPassword(password);
    }

    return hashPasswordPromise
        // Generate GPS coordinates if initial signup (not an update).
        .then((hashPass: string) => {
            return (!isUpdate || appUserInfo.address != null) ? genGPSCoordsAndHashPass(appUserInfo, hashPass)
                                                              : { hashPass: hashPass, gpsCoordinate: null};
        })
        // Add new user into database on signup, or update information on App User update.
        .then(({hashPass, gpsCoordinate}) => {
            return addOrUpdateAppUserInSQL(appUserInfo, hashPass, gpsCoordinate, appUserUpdateKey);
        })
        // Handle the results of the add or update (includes sending verification email).
        .then((addOrUpdateResult: QueryResult) => {
            return handleResult(addOrUpdateResult, isUpdate);
        })
        .catch((err: Error) => {
            console.log(err);
            throw new Error(err.message);  // We should have a user friendly error here!
        });
}


/**
 * Aggregates hashed password and GPS coordinate results together for next step in promise chain.
 * @param appUserAddress The app user address information.
 * @param hashPass The previously generated hashed password.
 * @return A promise that will resolve to an object containing the hashed password and GPS coordinates.
 */
function genGPSCoordsAndHashPass(appUserAddress: Address, hashPass: string): Promise<{ hashPass: string, gpsCoordinate: GPSCoordinate }> {

    return getGPSCoordinate(appUserAddress.address, appUserAddress.city, appUserAddress.state, appUserAddress.zip)
        // Simply map the result to an aggregate of all results so far!
        .then((gpsCoordinate: GPSCoordinate) => {
            return { hashPass: hashPass, gpsCoordinate: gpsCoordinate };
        })
        .catch((err: Error) => {
            throw new Error(AppUserErrorMsgs.INVALID_ADDRESS);
        });
}


/**
 * On add, inserts the new app user into the database (SQL). On update, updates the existing app user in the database.
 * @param appUserInfo The info for the app user to add or update. See addOrUpdateAppUser() function above for more details.
 * @param hashedPassword The hashed version of the app user's password (includes salt and algorithm info in the string).
 *                       May be null if an update is performed that does not include the password.
 * @param gpsCoordinate The GPS coordinate corresponding to the address given.
 *                      May be null if an updates is performed that does not include the address.
 * @param appUserUpdateKey The key of the app user to update if this is an update. Will be null if this is an add.
 * @return A promise that will resolve to the add or update query result upon success.
 */
function addOrUpdateAppUserInSQL(appUserInfo: AppUserInfo, hashedPassword?: string, gpsCoordinate?: GPSCoordinate, appUserUpdateKey?: number): Promise<QueryResult> {

    let isUpdate: boolean = (appUserUpdateKey != null);

    // Generate query string based off of either signing up or updating App User.
    let queryString: string = 'SELECT * FROM ';
    if (isUpdate)   queryString += 'updateAppUser($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)';
    else            queryString += 'addAppUser($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)';

    // Generate query args based off of either signing up or updating App User.
    let queryArgs: Array<any> = [ appUserInfo.email,
                                  hashedPassword,
                                  appUserInfo.lastName,
                                  appUserInfo.firstName, 
                                  appUserInfo.address,
                                  (gpsCoordinate != null ? gpsCoordinate.latitude : null),
                                  (gpsCoordinate != null ? gpsCoordinate.longitude : null),
                                  appUserInfo.city,
                                  appUserInfo.state,
                                  appUserInfo.zip,
                                  appUserInfo.phone,
                                  appUserInfo.appUserType,
                                  appUserInfo.availability,
                                  appUserInfo.organizationName,
                                  appUserInfo.taxId ];
    
    // If an update, then we will need additional appUserKey argument at beginning of list.
    if (isUpdate) queryArgs.unshift(appUserUpdateKey);
                                  
    queryString = fixNullQueryArgs(queryString, queryArgs);
    logSqlQueryExec(queryString, queryArgs);

    return query(queryString, queryArgs)
        .catch((err: Error) => {

            console.log(err);
            if (!isUpdate || appUserInfo.email != null) throw new Error(AppUserErrorMsgs.DUPLICATE_EMAIL);
            else                                        throw new Error('An unexpected error has occured');
        });
}


/**
 * Analyzes and handles the result of the insert into or update AppUser query. Generates the final result of the signup operation.
 * @param addOrUpdateResult The result of the add or update AppUser query.
 * @param isUpdate A flag that is set true if this is the update of signup (AppUser) information. It is false by default for original signup.
 * @return A promise containing new or updated SessionData upon success of the add or update operation.
 */
function handleResult(addOrUpdateResult: QueryResult, isUpdate: boolean): SessionData {

    logSqlQueryResult(addOrUpdateResult.rows);

    if (addOrUpdateResult.rows.length === 1) {

        console.log('Successfully ' + (isUpdate ? 'updated' : 'added') + ' user in database.');
        return <SessionData>(addOrUpdateResult.rows[0].sessiondata);
    }

    // Fail: we didn't get one row back when adding or updating a new App User.
    console.log('Incorrect result returned form addAppUser SQL function.');
    throw new Error('An unexpected error has occured.');
}
