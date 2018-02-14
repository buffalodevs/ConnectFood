import { should, expect } from '../../test-server';

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

    expect(databaseNewAppUser.email).to.equal(appUser.email);
    expect(databaseNewAppUser.firstName).to.equal(appUser.firstName);
    expect(databaseNewAppUser.lastName).to.equal(appUser.lastName);
    expect(databaseNewAppUser.appUserType).to.equal(appUser.appUserType);

    expect(databaseNewAppUser.organization.name).to.equal(appUser.organization.name);
    expect(databaseNewAppUser.organization.taxId).to.equal(appUser.organization.taxId);

    expect(databaseNewAppUser.contactInfo.address).to.equal(appUser.contactInfo.address);
    expect(databaseNewAppUser.contactInfo.city).to.equal(appUser.contactInfo.city);
    expect(databaseNewAppUser.contactInfo.state).to.equal(appUser.contactInfo.state);
    expect(databaseNewAppUser.contactInfo.zip).to.equal(appUser.contactInfo.zip);
    expect(databaseNewAppUser.contactInfo.phone).to.equal(appUser.contactInfo.phone);
    expect(databaseNewAppUser.contactInfo.utcOffsetMins).to.equal(appUser.contactInfo.utcOffsetMins);

    expect(databaseNewAppUser.availability.length).to.equal(appUser.availability.length);
    for (let i: number = 0; i < appUser.availability.length; i++) {
        expect(databaseNewAppUser.availability[i].startTime.toISOString()).to.equal(appUser.availability[i].startTime.toISOString());
        expect(databaseNewAppUser.availability[i].endTime.toISOString()).to.equal(appUser.availability[i].endTime.toISOString());
    }

    return databaseNewSessionData.appUserKey;
}


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
