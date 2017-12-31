'use strict';
let express = require('express');
let http = require('http');
let bodyParser = require('body-parser');
const path = require('path');


// Set global root directory variable and configure .env path.
global['rootDir'] = __dirname + '/../../../../';
require('dotenv').config({ path: global['rootDir'] + '.env' });


// Our session middleware and controllers that will handle requests after this router hands off the data to them.
import { Application } from 'express';
import { SessionData } from "./common-util/session-data";
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
         handleUpdateDeliveryState, 
         handleGetPossibleDeliveryTimes } from './deliverer/deliverer-controller';
import { handleGetDomainValues } from './domain/domain-controller';


// Configure paths to client JS files and public resource files (such as images).
global['clientBuildDir'] = ( global['rootDir'] + 'client/dist/' );
global['assetsDir'] = ( global['clientBuildDir'] + 'assets/' );
global['clientEmailDir'] = ( global['rootDir'] + 'client/email/' );
global['publicDir'] = ( global['rootDir'] + 'public' );


// Initialize & Configure Express App (Establish App-Wide Middleware).
let app: Application = express();
app.use(bodyParser.json( { limit: '500KB' } ));
app.use(express.static(global['clientBuildDir']));
app.use(express.static(global['publicDir']));
SessionData.sessionBootstrap(app);
app.set('port', (process.env.PORT || 5000));
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
app.post('/deliverer/getPossibleDeliveryTimes',         SessionData.ensureSessionActive, handleGetPossibleDeliveryTimes)


// Domain Controller.
app.post('/domain/getDomainValues',                     handleGetDomainValues);


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


// Log Message That Says When App is Up & Running.
app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});
