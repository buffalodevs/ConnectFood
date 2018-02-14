'use strict';
const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const path = require('path');
require('reflect-metadata');


// Set global root directory variable and configure .env path.
global['rootDir'] = __dirname + '/../../../../';
require('dotenv').config({ path: global['rootDir'] + '.env' });


// Our session middleware and controllers that will handle requests after this router hands off the data to them.
import { Application } from 'express';
import { SessionData } from "./common-util/session-data";
import { deserialize } from './deserialization/deserialization';
import { logRequest, logResponse } from './logging/request-response-logger';
import { logger } from './logging/logger';
import { handleLoginRequest,
         handleLogoutRequest,
         handleReAuthenticateRequest,
         handleSignupRequest,
         handleUpdateAppUserRequest,
         handleSignupVerification,
         handlePasswordRecovery } from './app-user/app-user-controller';
import { handleAddFoodListing,
         handleRemoveFoodListing,
         handleGetFoodListings,
         handleClaimFoodListing,
         handleUnclaimFoodListing } from './receiver-donor/receiver-donor-controller';
import { handleGetDeliveries,
         handleScheduleDelivery, 
         handleCancelDelivery,
         handleUpdateDeliveryState } from './deliverer/deliverer-controller';
import { handleLogClientData } from './logging/client-data-logger';
import { bootstrapDatabase } from './database-util/database-bootstrap/database-bootstrap';


// Configure paths to client JS files and public resource files (such as images).
global['clientBuildDir'] = ( global['rootDir'] + 'client/dist/' );
global['assetsDir'] = ( global['clientBuildDir'] + 'assets/' );
global['clientEmailDir'] = ( global['rootDir'] + 'client/email/' );
global['publicDir'] = ( global['rootDir'] + 'public' );


// Initialize & Configure Express App (Establish App-Wide Middleware).
const app: Application = express();
app.use(bodyParser.json( { limit: '500KB' } )); // Need larger size to support cropped images (maybe change this in future to just use image bounds and media attachment).
app.use(express.static(global['clientBuildDir']));
app.use(express.static(global['publicDir']));
SessionData.sessionBootstrap(app);
app.use(deserialize);   // Automatically perform Custom Deserialization of all incomming data. 
app.use(logRequest);    // Log all express requests.
app.use(logResponse);   // Log all express responses.
app.set('port', (process.env.PORT || process.env.FOOD_WEB_SERVER_PORT || 5000));
module.exports = app; // Make available for mocha testing suites.


// app-user Controller Routes.
app.post('/appUser/login',                              handleLoginRequest);
app.get( '/appUser/logout',                             handleLogoutRequest);
app.get( '/appUser/reAuthenticate',                     handleReAuthenticateRequest);
app.post('/appUser/signup',                             handleSignupRequest);
app.get( '/appUser/verify',                             handleSignupVerification);
app.post('/appUser/recoverPassword',                    handlePasswordRecovery);
app.post('/appUser/updateAppUser',                      SessionData.ensureSessionActive, handleUpdateAppUserRequest);


// Receiver-Donor Controller Routes.
app.post('/receiverDonor/getFoodListings',              SessionData.ensureSessionActive, handleGetFoodListings);
app.post('/receiverDonor/donor/addFoodListing',         SessionData.ensureSessionActive, handleAddFoodListing);
app.post('/receiverDonor/donor/removeFoodListing',      SessionData.ensureSessionActive, handleRemoveFoodListing);
app.post('/receiverDonor/receiver/claimFoodListing',    SessionData.ensureSessionActive, handleClaimFoodListing);
app.post('/receiverDonor/receiver/unclaimFoodListing',  SessionData.ensureSessionActive, handleUnclaimFoodListing);


// Deliverer Controller Routes.
app.post('/deliverer/getDeliveries',                    SessionData.ensureSessionActive, handleGetDeliveries);
app.post('/deliverer/scheduleDelivery',                 SessionData.ensureSessionActive, handleScheduleDelivery);
app.post('/deliverer/cancelDelivery',                   SessionData.ensureSessionActive, handleCancelDelivery);
app.post('/deliverer/updateDeliveryState',              SessionData.ensureSessionActive, handleUpdateDeliveryState);


app.post('/logging/logClientData',                      handleLogClientData);


// Public Resource Route Handler (for local image hosting).
app.get('/public/*', function(request, response) {
    response.sendFile(path.resolve(global['rootDir'] + request.url));
});


// Food Web's Main Asset Files Such as Icon and Banner Images.
app.get('/assets/*', function(request, response) {
    const assetFile: string = request.url.split('/assets/')[1];
    response.sendFile(path.resolve(global['assetsDir'] + assetFile));
});


// All Remaining Routes Handler (for serving our main web page).
app.get('*', function (request, response) {
    response.sendFile(path.join(global['clientBuildDir'] + '/index.html'));
});


// Do any database initialization that is necessary before we start servicing requests.
bootstrapDatabase().then(() => {

    app.listen(app.get('port'), function() {
        // Log Message That Says When App is Up & Running.
        logger.info('Node app is running on port', app.get('port'));
    }); 

});
