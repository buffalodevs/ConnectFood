import { chai, server, should, expect, logResponse } from '../test-server';
import { LoginRequest, LoginResponse } from '../../../shared/src/app-user/message/login-message';


const ROUTE: string = '/appUser/login';


/**
 * The describe function takes as its first argument the description of a testing suite. This can be an arbitrary value.
 * The second argument is a function that contains the actual test suite.
 * Each it function call within the testing suite should contain an individual test. Each individual test consists of sending a request to the server.
 * You can add tests to this suite and add other testing suites.
 */
describe('Login Test', () => {

    it('Login should succeed when given correct email and password', (done: MochaDone) => {

        const loginRequest: LoginRequest = new LoginRequest('marknemm@buffalo.edu', 'nemmer');

        chai.request(server)
            .post(ROUTE)
            .send(loginRequest)
            .end(validateLoginSuccessResponse.bind(this, done));
    });


    it('Login should fail when given incorrect password', (done: MochaDone) => {

        const loginRequest: LoginRequest = new LoginRequest('marknemm@buffalo.edu', 'incorrect password');

        chai.request(server)
            .post(ROUTE)
            .send(loginRequest)
            .end(validateLoginFailureResponse.bind(this, done));
    });


    it('Login should fail when given incorrect email', (done: MochaDone) => {

        const loginRequest: LoginRequest = new LoginRequest('incorrectUsername@buffalo.edu', 'nemmer');

        chai.request(server)
            .post(ROUTE)
            .send(loginRequest)
            .end(validateLoginFailureResponse.bind(this, done));
    });
});


function validateLoginSuccessResponse(done: MochaDone, err: any, response: ChaiHttp.Response): void {

    logResponse(err, response, ROUTE);

    response.should.have.status(200);
    response.should.be.json;

    const loginResponse: LoginResponse = response.body;
    loginResponse.should.be.a('object');

    loginResponse.should.have.property('appUser');
    loginResponse.appUser.should.be.a('object');
    expect(loginResponse.appUser).to.not.equal(null);

    loginResponse.should.have.property('success');
    loginResponse.success.should.be.a('boolean');
    expect(loginResponse.success).to.eql(true);

    loginResponse.should.have.property('message');
    loginResponse.message.should.be.a('string');

    loginResponse.should.have.property('loginRequired');
    loginResponse.loginRequired.should.be.a('boolean');
    expect(loginResponse.loginRequired).to.equal(false);

    loginResponse.should.have.property('signupConfirmRequired');
    loginResponse.signupConfirmRequired.should.be.a('boolean');
    expect(loginResponse.signupConfirmRequired).to.equal(false);

    done();
}


function validateLoginFailureResponse(done: MochaDone, err: any, response: ChaiHttp.Response): void {

    logResponse(err, response, ROUTE);

    response.should.have.status(200);
    response.should.be.json;

    const loginResponse: LoginResponse = response.body;
    loginResponse.should.be.a('object');

    loginResponse.should.have.property('appUser');
    expect(loginResponse.appUser).to.equal(null);

    loginResponse.should.have.property('success');
    loginResponse.success.should.be.a('boolean');
    expect(loginResponse.success).to.eql(false);

    loginResponse.should.have.property('message');
    loginResponse.message.should.be.a('string');
    expect(loginResponse.message).to.not.equal(null);

    loginResponse.should.have.property('loginRequired');
    loginResponse.loginRequired.should.be.a('boolean');
    expect(loginResponse.loginRequired).to.equal(false);

    loginResponse.should.have.property('signupConfirmRequired');
    loginResponse.signupConfirmRequired.should.be.a('boolean');
    expect(loginResponse.signupConfirmRequired).to.equal(false);

    done();
}
