import { chai, server, should, expect, logResponse } from '../test-server';
import { validateGenericFoodWebResponse } from "./../util/test-util";

import { AppUser } from '../../../shared/src/app-user/app-user';
import { AppUserErrorMsgs } from '../../../shared/src/app-user/message/app-user-error-msgs';
import { LoginRequest, LoginResponse } from '../../../shared/src/app-user/message/login-message';


const ROUTE: string = '/appUser/login';


/**
 * The describe function takes as its first argument the description of a testing suite. This can be an arbitrary value.
 * The second argument is a function that contains the actual test suite.
 * Each it function call within the testing suite should contain an individual test. Each individual test consists of sending a request to the server.
 * You can add tests to this suite and add other testing suites.
 */
describe('Login Test', () => {

    it('Login should succeed when given correct email and password', testLogin.bind(this, 'marknemm@buffalo.edu', 'nemmer', true));
    it('Login should fail when given incorrect password', testLogin.bind(this, 'marknemm@buffalo.edu', 'incorrect password', false));
    it('Login should fail when given incorrect email', testLogin.bind(this, 'incorrectUsername@buffalo.edu', 'nemmer', false));
});


/**
 * Tests the login server operation.
 * @param email The email of the user that is to login.
 * @param password The password of the user that is to login.
 * @param shouldSucceed Set to true if the login operation is expected to succeed with the given email and password. Otherwise, set to false.
 * @param done Mocha done callback function that will be invoked after the test.
 */
function testLogin(email: string, password: string, shouldSucceed: boolean, done: MochaDone): void {

    const loginRequest: LoginRequest = new LoginRequest(email, password);

    chai.request(server)
        .post(ROUTE)
        .send(loginRequest)
        .end(validateLoginResponse.bind(this, done, shouldSucceed));
}


function validateLoginResponse(done: MochaDone, shouldSucceed: boolean, err: any, response: ChaiHttp.Response): void {

    const loginResponse: LoginResponse = response.body;
    const expectedErrMsg: string = shouldSucceed ? null
                                                 : AppUserErrorMsgs.INCORRECT_LOGIN;

    validateGenericFoodWebResponse(ROUTE, shouldSucceed, expectedErrMsg, null, err, response);

    loginResponse.should.have.property('appUser');
    if (shouldSucceed) {
        expect(loginResponse.appUser).to.not.equal(null);
    }
    else {
        loginResponse.should.have.property('appUser');
        expect(loginResponse.appUser).to.equal(null);
    }

    done();
}
