import * as chai from 'chai';
import * as server from '../src/server';
import { logger } from '../src/logging/logger';

chai.use(require('chai-http'));
let should: Chai.Should = chai.should();
let expect: Chai.ExpectStatic = chai.expect;
export { chai, server, should, expect };


// Turn off logging for testing.
logger.transports.console.level = 'error';


export let enableLogResponse: boolean = false;

export function logResponse(err: any, response: ChaiHttp.Response, route: string): void {

    // If response logging is not enabled, then simply jump out.
    if (!enableLogResponse) return;

    // On successful response.
    if (err == null) {
        console.log('Response of ' + route + ': ');
        console.log(response.body);
    }
    // On error response.
    else {
        console.log('Error response of ' + route + ': ');
        console.log(err);
    }
}
