import { chai, server } from '../test-server';
import { testAppUserDataIntegrity } from './util/test-app-user-database-util';
import { VALID_APP_USER, INVALID_EMAIL_APP_USER, AppUser } from "./util/signup-test-data";

import { AppUserErrorMsgs } from '../../../shared/src/app-user/message/app-user-error-msgs';
import { SignupRequest } from '../../../shared/src/app-user/message/signup-message';
import { validateGenericFoodWebResponse } from '../util/test-util';


const ROUTE: string = '/appUser/signup';


/**
 * The describe function takes as its first argument the description of a testing suite. This can be an arbitrary value.
 * The second argument is a function that contains the actual test suite.
 * Each it function call within the testing suite should contain an individual test. Each individual test consists of sending a request to the server.
 * You can add tests to this suite and add other testing suites.
 */
describe('Signup Test', () => {

    it('Signup should succeed when given valid data',                   testAppUserSignup.bind(this, VALID_APP_USER, 'food web', true, null));
    it('Signup with duplicate email should fail',                       testAppUserSignup.bind(this, VALID_APP_USER, 'food web', false, AppUserErrorMsgs.DUPLICATE_EMAIL));
    it('Signup data integrity should be intact (within SQL database)',  testAppUserDataIntegrity.bind(this, VALID_APP_USER, true)); // Removes signup user after checking.
    it('Signup should fail when given incorrectly formatted email',     testAppUserSignup.bind(this, INVALID_EMAIL_APP_USER, 'food web', false, AppUserErrorMsgs.INVALID_EMAIL));
    it('Signup should fail when given password that is too short',      testAppUserSignup.bind(this, VALID_APP_USER, 'short', false, AppUserErrorMsgs.INVALID_PASSWORD));
});


/**
 * Tests App User Signup functionality.
 * @param newAppUser The new App User used for signup.
 * @param password The password for the new App User.
 * @param shouldSucceed Flag that determines if the signup operation is expected to succeed (true) or fail (false).
 * @param expectedErrMsg The expected error message that should be in the response from the server (set to null if no/any error message expected).
 * @param done Mocha done callback function that will be invoked when the test is finished.
 */
function testAppUserSignup(newAppUser: AppUser, password: string, shouldSucceed: boolean, expectedErrMsg: string, done: MochaDone): void {

    simulateSignupAppUser(newAppUser, password, validateGenericFoodWebResponse.bind(this, ROUTE, shouldSucceed, expectedErrMsg, done));
}


/**
 * Performs the signup of a given new user.
 * @param newAppUser The data of the user to signup.
 * @param password The password of the user to signup.
 * @param endCbFn The callback function that is invoked when a response returns from the server.
 */
export function simulateSignupAppUser(newAppUser: AppUser, password: string, endCbFn: (err: any, res: ChaiHttp.Response) => void): void {

    const signupRequest: SignupRequest = new SignupRequest(newAppUser, password);

    chai.request(server)
        .post(ROUTE)
        .send(signupRequest)
        .end(endCbFn);
}
