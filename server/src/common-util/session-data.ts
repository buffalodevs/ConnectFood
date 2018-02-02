import { Application, Request, Response, NextFunction } from 'express';
require('dotenv');
let session = require('express-session');
import { SessionOptions } from 'express-session';
let RedisStore = require('connect-redis')(session);
import { RedisStoreOptions } from 'connect-redis';

import { GPSCoordinate } from '../../../shared/src/geocode/gps-coordinate';

import { FoodWebResponse } from "./../../../shared/src/message-protocol/food-web-response";
import { AppUserInfo } from './../../../shared/src/app-user/app-user-info';

export { AppUserInfo };


/**
 * Server side session data container and associated middleware/functionality.
 */
export class SessionData {

    private static readonly SESSION_DATA_KEY = 'sessionData';


    public constructor (
        public appUserInfo: AppUserInfo = new AppUserInfo(),
        public appUserKey?: number,
        public verificationToken?: string
    ) { }


    get signupVerified(): boolean {
        return ( this.verificationToken != null );
    }


    /**
     * Bootstrap routine for the session storage (based off of value of environmental variable DEVELOPER_MODE).
     * @param app The express application.
     */
    public static sessionBootstrap(app: Application): void {

        let sessionOpts: SessionOptions = null;
        let ttlMs: number = parseInt(process.env.SESSION_TTL_MS);

        // Developer mode (MemoryStore).
        if (process.env.DEVELOPER_MODE === 'true') {
            sessionOpts = {
                secret:             process.env.SESSION_SECRET,
                cookie:             {
                                        expires: new Date(Date.now() + ttlMs), // NOTE: Must use expires date for IE compatibility!
                                        maxAge: ttlMs, // The maximum age of the cookie (works in all browsers but IE...)
                                        httpOnly: true, // Will not be accessible by Javascript (protects against XSS attacks).
                                        secure: false // https connection not required to send cookie (fine for testing).
                                    },
                saveUninitialized:  false,
                resave:             false,
                rolling:            true // Should refresh the expires 
            };
        }
        // Production mode (Redis).
        else {
            let redisOpts: RedisStoreOptions = {
                url:        process.env.REDIS_URL,
                ttl:        (ttlMs / 1000), // NOTE: Time-to-live here is in seconds!
                pass:       process.env.REDIS_PASSWORD,
                logErrors:  (process.env.LOG_CONSOLE_REDIS_ERRS === 'true')
            };

            sessionOpts = {
                secret:             process.env.SESSION_SECRET,
                store:              new RedisStore(redisOpts),
                saveUninitialized:  false,
                resave:             false,
                rolling:            true
            }
        }

        app.use(session(sessionOpts));
    }


    /**
     * Middleware that ensures that there is an active session for the client issuing the request.
     * If an active session exists (meaning that the user is logged in), then the next route handler is called.
     * If an active session does not exist, then an appropriate response is returned and the next handler is not called.
     * @param request The request from the client (holds any active session data).
     * @param response The response to the client.
     * @param next A callback that when called will execute the next route handler.
     */
    public static ensureSessionActive(request: Request, response: Response, next: NextFunction): void {
        if (SessionData.doesSessionExist(request)) {
            next();  // Call the next route handler.
        }
        else {
            // Since session is inactive, then we will send login required response and not call next route handler!
            response.send(new FoodWebResponse(false, 'Login required.', true));
        }
    }


    /**
     * Checks if a session exists for the client that is issuing the current request.
     * @param request The request from the client.
     * @return true if the session exists (logged in), false if not.
     */
    public static doesSessionExist(request: Request): boolean {
        return (request.session[SessionData.SESSION_DATA_KEY] != null);
    }


    /**
     * Loads session data. Will throw an error if the session does not exist.
     * If an error is not thrown, the returned session data will never be null.
     * @param request The request from the client (holds any active session data).
     * @return The session data (never null).
     */
    public static loadSessionData(request: Request): SessionData {
        // Throw an exception if the session data does not exist (inactive session).
        if (!SessionData.doesSessionExist(request)) {
            throw new Error('Session is not established. Cannot get session data');
        }

        return request.session[SessionData.SESSION_DATA_KEY];
    }


    /**
     * Saves session data (will persist until the session expires or is forcefully deleted).
     * @param request The request from the client (will be used to store session data).
     * @param sessionData The session data to save.
     */
    public static saveSessionData(request: Request, sessionData: SessionData): void {
        request.session[SessionData.SESSION_DATA_KEY] = sessionData;
    }


    /**
     * Deletes any saved session data (Ends or deactivates the session).
     * @param request The request from the client (holds session data that will be deleted).
     */
    public static deleteSessionData(request: Request): void {
        request.session.destroy((err: Error) => {
            console.log(err);
        });
    }
}
