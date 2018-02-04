import { Injectable, isDevMode } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { FoodWebResponse } from '../../../../../../shared/src/message-protocol/food-web-response';


@Injectable()
export class RequestResponseLoggerService {

    public constructor (
        private _logger: NGXLogger
    ) {}


    /**
     * Logs a request.
     * @param route The (relative) route that the request is being sent to.
     * @param requestType The type of the request (GET, POST, 'PUT', 'PATCH', 'DELETE').
     * @param request The request.
     */
    public logRequest(route: string, requestType: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE', request?: any): void {
        this._logger.trace('Sending ' + requestType + ' message to server via route: ' + route);
    }


    /**
     * Logs a response.
     * @param route The (relative) route from which the response originated.
     * @param response The response.
     */
    public logResponse(route: string, response: FoodWebResponse): void {

        const successfulStr: string = response.success ? 'succeeded'
                                                       : 'failed';

        this._logger.trace('Received message from server via route: ' + route +
                           '\nOperation on server ' + successfulStr + ' with message: ' + response.message);
    }
}
