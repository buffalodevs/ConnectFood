import { Request, Response, NextFunction, Application } from "express";
import * as _ from "lodash";
import { logger, prettyjsonRender, colors } from "./logger";
import { FoodWebResponse } from "../message-protocol/food-web-response";


const DEVELOPER_MODE: boolean = ( process.env.FOOD_WEB_DEVELOPER_MODE.toLowerCase() === 'true' );


/**
 * Middleware function that logs all incomming requests.
 * @param request The incoming request message.
 * @param response The response to send back to the client.
 * @param next Callback function that transfers control to the next route handler.
 */
export function logRequest(request: Request, response: Response, next: NextFunction): void {

    const lowerCaseRoute: string = request.url.toLowerCase();

    // VERY IMPORTANT: WE DO ** NOT ** WANT TO LOG ANY REQUESTS WITH PASSWORD OR TIN DATA IN PRODUCTION MODE!!!!
    if (!DEVELOPER_MODE && (lowerCaseRoute.indexOf('user') >= 0 || lowerCaseRoute.indexOf('login') >= 0 || lowerCaseRoute.indexOf('signup') >= 0)) {
        return next();
    }

    logRequestViaWinston(request.url, <'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'>request.method, request.body);
    next(); // Call the next route handler.
}


/**
 * Registers a logger for all express responses.
 * @param request The request object (that we are generating associated response for).
 * @param response The response object that we are to log.
 * @param next Callback function to invoke next middleware function.
 */
export function logResponse(request: Request, response: Response, next: NextFunction): void {

    const lowerCaseRoute: string = request.url.toLowerCase();

    // VERY IMPORTANT: WE DO ** NOT ** WANT TO LOG ANY REQUESTS WITH TIN DATA IN PRODUCTION MODE!!!!
    if (!DEVELOPER_MODE && (lowerCaseRoute.indexOf('user') >= 0 || lowerCaseRoute.indexOf('login') >= 0 || lowerCaseRoute.indexOf('signup') >= 0)) {
        return next();
    }

    const send = response.send;

    response.send = function(body: any): Response {

        // NOTE: send will be called twice by Express (once with original object, second time with serialized/stringified object).
        if (!_.isString(body) && !_.isEmpty(body)) {
            logResponseViaWinston(request.url, body);
        }
        return send.apply(response, arguments);
    };

    next();
}


/**
 * Logs a request.
 * @param route The (relative) route that the request is being sent to.
 * @param requestType The type of the request (GET, POST, PUT, PATCH, DELETE).
 * @param request The request.
 */
function logRequestViaWinston(route: string, requestType: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE', request: any = null): void {

    const styledRouteStr: string = genStyledRouteStr(route);
    const requestTypeClrStr: string = genRequestTypeClrStr(requestType);

    logger.info('\nReceived ' + requestTypeClrStr + ' request via route: ' + styledRouteStr);

    if (!_.isEmpty(request)) {
        logger.verbose('\n' + prettyjsonRender(request) + '\n');
    }
}


/**
 * Generates a styled route string.
 * @param route The route string.
 * @return The generated styled route string.
 */
function genStyledRouteStr(route: string): string {
    return colors.underline(colors.cyan(route));
}


/**
 * Gets the color coded version of a given request type string.
 * @param requestType The request type (Should be an uppercase RESTful API string).
 * @return The color coded request type string.
 */
function genRequestTypeClrStr(requestType: string): string {

    let requestTypeClrFn: (text: string) => string;

    switch (requestType) {
        case 'POST':    requestTypeClrFn = colors.green;    break;
        case 'GET':     requestTypeClrFn = colors.magenta;  break;
        case 'PUT':     requestTypeClrFn = colors.blue;     break;
        case 'PATCH':   requestTypeClrFn = colors.cyan;     break;
        case 'DELETE':  requestTypeClrFn = colors.red;      break;
        default:        requestTypeClrFn = colors.white;    break;
    }

    return requestTypeClrFn.call(colors, requestType);
}


/**
 * Logs a response.
 * @param route The (relative) route from which the response originated.
 * @param response The response.
 * @param onClient Whether we are logging request on client or not (server).
 */
function logResponseViaWinston(route: string, response: FoodWebResponse): void {

    const styledRouteStr: string = genStyledRouteStr(route);
    const succeededFailedClrStr: string = genSucceededFailedClrStr(response.success);
    const messageClrStr: string = genMessageClrStr(response.success, response.message);

    logger.info('\nSending response via route ' + styledRouteStr + '\nAssociated server operation ' +
                succeededFailedClrStr + ' with message: ' + messageClrStr);
    logger.verbose('\n' + prettyjsonRender(response) + '\n');
}


/**
 * Generates a colored 'succeeded' or 'failed' string based on given success flag.
 * @param success The success falg of a response message.
 * @return the colored success string.
 */
function genSucceededFailedClrStr(success: boolean): string {

    const successFailClrFn: (text: string) => string = success ? colors.green
                                                               : colors.red;

    return successFailClrFn.call(colors, success ? 'succeeded'
                                                 : 'failed');
}


/**
 * Generates a colored response message string based on given success flag.
 * @param success The success falg of a response message.
 * @param message The message to color.
 * @return the colored message.
 */
function genMessageClrStr(success: boolean, message: string): string {

    const successFailClrFn: (text: string) => string = success ? colors.green
                                                               : colors.red;

    return successFailClrFn.call(colors, message);
}
