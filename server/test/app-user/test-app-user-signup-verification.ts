import { chai, server } from '../test-server';
import { getAppUserVerificationData, removeTestAppUser } from './util/test-app-user-database-util';
import { VALID_APP_USER, AppUser } from "./util/signup-test-data";

import { validateGenericFoodWebResponse } from '../util/test-util';
import { simulateSignupAppUser } from './test-app-user-signup';


const ROUTE: string = '/appUser/verify';


/**
 * The describe function takes as its first argument the description of a testing suite. This can be an arbitrary value.
 * The second argument is a function that contains the actual test suite.
 * Each it function call within the testing suite should contain an individual test. Each individual test consists of sending a request to the server.
 * You can add tests to this suite and add other testing suites.
 */
describe('Signup Verification Test', () => {

    it('Signup verification should succeed when given correct verification token', testAppUserSignupVerification.bind(this, true));
    
});


/**
 * Tests App User Signup Verification functionality.
 * @param shouldSucceed Flag that determines if the signup operation is expected to succeed (true) or fail (false).
 * @param done Mocha done cb function that will be invoked when the test completes.
 */
function testAppUserSignupVerification(shouldSucceed: boolean, done: MochaDone): void {

    simulateSignupAppUser(VALID_APP_USER, 'nemmer', async () => {

        const verificationRouteParameters: { appUserKey: number, verificationToken: string } = await getAppUserVerificationData(VALID_APP_USER);
        const parameterizedVerificationRoute: string = ( ROUTE + '?appUserKey=' + verificationRouteParameters.appUserKey
                                                               + '&verificationToken=' + verificationRouteParameters.verificationToken );
        
        chai.request(server)
            .get(parameterizedVerificationRoute)
            .end(async (err: any, response: ChaiHttp.Response) => {

                validateGenericFoodWebResponse(parameterizedVerificationRoute, shouldSucceed, null, null, err, response);
                await removeTestAppUser(verificationRouteParameters.appUserKey);
                done();
            });
    });
}
