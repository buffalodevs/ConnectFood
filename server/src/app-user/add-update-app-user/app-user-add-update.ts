'use strict';
import { logSqlQueryExec, logSqlQueryResult } from '../../logging/sql-logger';
import { query, QueryResult, connect, Client } from '../../database-util/connection-pool';
import { addArgPlaceholdersToQueryStr } from "../../database-util/prepared-statement-util";
import { logger, prettyjsonRender } from "../../logging/logger";

import { SessionData, AppUserInfo } from '../../common-util/session-data';
import { hashPassword } from '../common-app-user/password-util';
import { absToAvailabililityDateRanges } from '../../common-util/date-time-util';
import { DESERIALIZER } from '../../deserialization/deserialization';

import { GPSCoordinate, getGPSCoordinate } from '../../../../shared/src/geocode/geocode';
import { Validation } from '../../../../shared/src/common-util/validation';
import { Address } from '../../../../shared/src/app-user/app-user-info';
import { AppUserErrorMsgs } from '../../../../shared/src/app-user/message/app-user-error-msgs';
import { DateRange } from '../../../../shared/src/date-time-util/date-range';


/**
 * Adds or updates an app user.
 * @param appUserInfo Shared app user into used for add or update. If an add, then all fields should be populated
 *                    (except possibly organization fields if new user is a driver). If an update, only update fields shall be populated.
 * @param password The new or updated password for the app user. Can be null if this is an update.
 * @param appUserUpdateKey If provided, then it designates the app user to be updated. If not provided, then it signifies that this is a new app user to be added.
 * @return A promise that on success will resolve to the new or updated sessiond data for the app user.
 */
export async function addOrUpdateAppUser(appUserInfo: AppUserInfo, password?: string, appUserUpdateKey?: number): Promise <SessionData> {

    const isUpdate: boolean = ( appUserUpdateKey != null );

    // First validate given App User signup info.
    const validation: Validation = new Validation();
    const validationErr: Error = validation.validateAppUserInfo(appUserInfo, password);
    if (validationErr != null)  throw validationErr;

    // Determine if we must hash a password, generate GPS Coordinate, and/or translate timzone of weekly availability times.
    const mustHashPass: boolean = (!isUpdate || password != null);
    const mustGenGPSCoordinate: boolean = (!isUpdate || appUserInfo.address != null);
    const mustGenAppUserAvailability: boolean = (!isUpdate || appUserInfo.availability != null);


    const hashPass: string = await ( mustHashPass ? hashPassword(password)
                                                  : null );

    const gpsCoordinate: GPSCoordinate = await ( mustGenGPSCoordinate ? genGPSCoordinate(appUserInfo)
                                                                      : null );

    appUserInfo.availability = mustGenAppUserAvailability ? absToAvailabililityDateRanges(appUserInfo.availability)
                                                          : null;

    const addOrUpdateResult: QueryResult = await addOrUpdateAppUserInSQL(appUserInfo, hashPass, gpsCoordinate, appUserUpdateKey);

    return handleResult(addOrUpdateResult, isUpdate);
}


/**
 * Generates a GPS Coordinate for a given address of a user.
 * @param appUserAddress The app user address information.
 * @return A promise that will resolve to the GPS coordinates.
 */
function genGPSCoordinate(appUserAddress: Address): Promise <GPSCoordinate> {

    return getGPSCoordinate(appUserAddress.address, appUserAddress.city, appUserAddress.state, appUserAddress.zip)
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
async function addOrUpdateAppUserInSQL(appUserInfo: AppUserInfo, hashedPassword?: string, gpsCoordinate?: GPSCoordinate, appUserUpdateKey?: number): Promise <QueryResult>
{
    const isUpdate: boolean = (appUserUpdateKey != null);

    // Generate query string based off of either signing up or updating App User.
    let queryString: string = isUpdate ? 'SELECT * FROM updateAppUser()'
                                       : 'SELECT * FROM addAppUser()';

    // Generate query args based off of either signing up or updating App User.
    let queryArgs: Array<any> = [ appUserInfo.email,
                                  hashedPassword,
                                  appUserInfo.lastName,
                                  appUserInfo.firstName, 
                                  appUserInfo.address,
                                  (gpsCoordinate != null ? gpsCoordinate.latitude : null),
                                  (gpsCoordinate != null ? gpsCoordinate.longitude : null),
                                  appUserInfo.utcOffsetMins,
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
            
    // Insert query argument placeholders in query string and preprocess query arguments.
    queryString = addArgPlaceholdersToQueryStr(queryString, queryArgs);
    logSqlQueryExec(queryString, queryArgs);

    return query(queryString, queryArgs)
        .catch((err: Error) => {

            logger.error(prettyjsonRender(err));

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

        let sessionData: SessionData = addOrUpdateResult.rows[0].sessiondata;
        // Deserialize and prepare the app user info that was retrieved from database operation.
        sessionData.appUserInfo = DESERIALIZER.deserialize(sessionData.appUserInfo, AppUserInfo);

        logger.info('Successfully ' + (isUpdate ? 'updated' : 'added') + ' user in database with email: ' + sessionData.appUserInfo.email);
        return sessionData;
    }

    // Fail: we didn't get one row back when adding or updating a new App User.
    logger.error('No rows were returned from ' + (isUpdate ? 'updateAppUser()'
                                                           : 'addAppUser()') + ' SQL function');
    throw new Error('An unexpected error has occured.');
}
