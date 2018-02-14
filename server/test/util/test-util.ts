import { logResponse, should, expect } from "../test-server";
import { FoodWebResponse } from '../../../shared/src/message-protocol/food-web-response';


/**
 * Validates a generic Food Web Response.
 * @param route The (relative server) route that the response is from.
 * @param expectedSuccessFlag The expected success flag.
 * @param expectedErrMsg The expected error message. Set to null if any message is expected.
 * @param done Mocha done callback function that will be invoked when finished. Set to null if it shouldn't be invoked.
 * @param err Any (network related) error associated with the request/response.
 * @param response The response (whose body should be castable to Food Web Response).
 */
export function validateGenericFoodWebResponse (
    route: string,
    shouldSucceed: boolean,
    expectedErrMsg: string,
    done: MochaDone,
    err: any,
    response: ChaiHttp.Response): void
{
    logResponse(err, response, route);

    response.should.have.status(200);
    response.should.be.json;

    const signupResponse: FoodWebResponse = response.body;
    signupResponse.should.be.a('object');

    signupResponse.should.have.property('success');
    signupResponse.success.should.be.a('boolean');
    expect(signupResponse.success).to.eql(shouldSucceed);

    signupResponse.should.have.property('message');
    signupResponse.message.should.be.a('string');
    if (expectedErrMsg != null) {
        expect(signupResponse.message).to.equal(expectedErrMsg);
    }

    signupResponse.should.have.property('loginRequired');
    signupResponse.loginRequired.should.be.a('boolean');
    expect(signupResponse.loginRequired).to.equal(false);

    signupResponse.should.have.property('signupConfirmRequired');
    signupResponse.signupConfirmRequired.should.be.a('boolean');
    expect(signupResponse.signupConfirmRequired).to.equal(false);

    if (done != null) {
        done();
    }
}
