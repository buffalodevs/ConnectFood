import { should, expect } from '../../test-server';
import { validateAppUser } from "./validate-app-user";

import { SessionData } from '../../../src/common-util/session-data';
import { query, QueryResult, connect, Client } from '../../../src/database-util/connection-pool';
import { addArgPlaceholdersToQueryStr } from '../../../src/database-util/prepared-statement-util';

import { AppUser } from '../../../../shared/src/app-user/app-user';
import { Deserializer } from '../../../../shared/src/deserialization/deserializer';


/**
 * Validates the data integrity of a given App User (within the SQL database). To pass, the given App User must exist in the database
 * and be identical to the database entry.
 * @param appUser The App User to check the database integrity of.
 * @param removeAfterTest Set to true if the user should be removed from the database after the test completes. Default is false.
 */
export async function testAppUserDataIntegrity(appUser: AppUser, removeAfterTest: boolean = false): Promise <void> {

    let appUserKey: number = await validateAppUserDatabaseIntegrity(appUser)

    if (removeAfterTest) {
        await removeTestAppUser(appUserKey);
    }
}


async function validateAppUserDatabaseIntegrity(appUser: AppUser): Promise <number> {

    let queryStr: string = 'SELECT * FROM getAppUserSessionData()';
    let queryArgs: any[] = [ null, appUser.email ];
    queryStr = addArgPlaceholdersToQueryStr(queryStr, queryArgs);

    const queryResult: QueryResult = await query(queryStr, queryArgs);
    const databaseNewSessionData: SessionData = queryResult.rows[0].sessiondata;
    let databaseNewAppUser: AppUser = databaseNewSessionData.appUser;
    databaseNewAppUser = new Deserializer().deserialize(databaseNewAppUser, AppUser);

    validateAppUser(appUser, databaseNewAppUser);
    return databaseNewSessionData.appUserKey;
}


/**
 * Removes a test App User completely from the database.
 * @param appUserKey The key ID of the App User to remove.
 */
export async function removeTestAppUser(appUserKey: number): Promise <void> {

    const dbClient: Client = await connect();

    await dbClient.query('DELETE FROM AppUserPassword WHERE appUserKey = $1;', [ appUserKey ]);
    await dbClient.query('DELETE FROM ContactInfo WHERE appUserKey = $1;', [ appUserKey ]);
    await dbClient.query('DELETE FROM Organization WHERE appUserKey = $1;', [ appUserKey ]);
    await dbClient.query('DELETE FROM AppUserAvailability WHERE appUserKey = $1;', [ appUserKey ]);
    await dbClient.query('DELETE FROM UnverifiedAppUser WHERE appUserKey = $1;', [ appUserKey ]);
    await dbClient.query('DELETE FROM AppUser WHERE appUserKey = $1;', [ appUserKey ]);

    dbClient.release();
}


export async function getAppUserVerificationData(appUser: AppUser): Promise <{ appUserKey: number, verificationToken: string }> {

    const queryStr: string = `  SELECT      AppUser.appUserKey                  AS "appUserKey",
                                            UnverifiedAppUser.verificationToken AS "verificationToken"
                                FROM        AppUser
                                INNER JOIN  UnverifiedAppUser ON AppUser.appUserKey = UnverifiedAppUser.appUserKey
                                WHERE       AppUser.email = $1;`;
    const queryResult: QueryResult = await query(queryStr, [ appUser.email ]);

    return queryResult.rows[0];
}
