import * as chai from 'chai';
import * as server from '../src/server';
import { logger } from '../src/logging/logger';
import { LoginRequest } from '../../shared/src/app-user/message/login-message';

chai.use(require('chai-http'));
let should: Chai.Should = chai.should();
let expect: Chai.ExpectStatic = chai.expect;
export { chai, server, should, expect };


export const TEST_USER_LOGIN_ROUTE: string = '/appUser/login';
export const TEST_USER_EMAIL: string = 'marknemm@buffalo.edu';
export const TEST_USER_PASSWORD: string = 'nemmer';


// Turn off logging for testing.
logger.transports.console.level = 'error';


/**
 * Logs in the standard test user for server operations that require login.
 */
export function loginTestUser(): ChaiHttp.Request {

    const loginRequest: LoginRequest = new LoginRequest(TEST_USER_EMAIL, TEST_USER_PASSWORD);

    return chai.request.agent(server)
        .post(TEST_USER_LOGIN_ROUTE)
        .send(loginRequest);
}


export function logResponse(err: any, response: ChaiHttp.Response, route: string): void {

    // On successful response.
    if (err == null) {
        logger.debug('Response of ' + route + ': ');
        logger.debug(response.body);
    }
    // On error response.
    else {
        logger.error('Error response of ' + route + ': ');
        logger.error(err);
    }
}
