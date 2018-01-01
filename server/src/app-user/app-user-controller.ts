'use strict';
import { Request, Response } from "express";

import { login } from "./login-app-user/app-user-login";
import { signup, signupVerify } from './edit-app-user/app-user-signup';
import { updateAppUser } from './edit-app-user/app-user-update';
import { SessionData, AppUserInfo } from "../common-util/session-data";

import { FoodWebResponse } from "../../../shared/message-protocol/food-web-response";
import { LoginRequest, LoginResponse } from '../../../shared/app-user/message/login-message';
import { SignupRequest } from '../../../shared/app-user/message/signup-message';
import { UpdateAppUserRequest, UpdateAppUserResponse } from '../../../shared/app-user/message/update-app-user-message';


/**
 * Handles the re-authenticate request (checks if the user is logged in).
 * @param request The request from the client. Should contain session info if user is logged in.
 * @param response The response to send back to the client.
 */
export function handleReAuthenticateRequest(request: Request, response: Response): void {
    response.setHeader('Content-Type', 'application/json');

    if (SessionData.doesSessionExist(request)) {
        response.send(new LoginResponse(SessionData.loadSessionData(request).appUserInfo, true, 'Logged in'));
    }
    else {
        response.send(new LoginResponse(null, false, 'Not logged in'));
    }
}


/**
 * Handles login request for a given user.
 * @param request The request from the client. Should contain login credentials.
 * @param response The response to send back to the client. 
 */
export function handleLoginRequest(request: Request, response: Response): void {

    response.setHeader('Content-Type', 'application/json');
    let loginRequest: LoginRequest = request.body;

    login(loginRequest.email, loginRequest.password)
        .then((sessionData: SessionData) => {
            SessionData.saveSessionData(request, sessionData);
            response.send(new LoginResponse(sessionData.appUserInfo, true, 'Login successful'));
        })
        .catch((err: Error) => {
            response.send(new LoginResponse(null, false, err.message));
        });
}


/**
 * Handles logout request for a given user
 * @param request The request from the client.
 * @param result The response to send back to the client.
 */
export function handleLogoutRequest(request: Request, response: Response): void {

    response.setHeader('Content-Type', 'application/json');
    SessionData.deleteSessionData(request);
    response.send(new FoodWebResponse(true, 'Logout successful'));
}


/**
 * Handels signup request for a give user
 * @param request The request from the client. Should contain data necessary for signup.
 * @param response The response to send back to the client.
 */
export function handleSignupRequest(request: Request, response: Response): void {

    response.setHeader('Content-Type', 'application/json');
    let signupRequest: SignupRequest = request.body;

    signup(signupRequest.appUserInfo, signupRequest.password)
        .then((sessionData: SessionData) => {
            SessionData.saveSessionData(request, sessionData);
            response.send(new FoodWebResponse(true, 'Signup successful'));
        })
        .catch((err: Error) => {
            response.send(new FoodWebResponse(false, err.message));
        });
}


/**
 * Handles the update of user information.
 * @param request The request from the client. Should contain user update data.
 * @param response The response to send back to the client.
 */
export function handleUpdateAppUserRequest(request: Request, response: Response): void {
    response.setHeader('Content-Type', 'application/json');
    
    let updateAppUserRequest: UpdateAppUserRequest = request.body;
    let appUserUpdateInfo: AppUserInfo = updateAppUserRequest.appUserUpdateInfo;
    let sessionData: SessionData = SessionData.loadSessionData(request);
    let newPassword: string = updateAppUserRequest.newPassword;
    let currentPassword: string = updateAppUserRequest.currentPassword;

    updateAppUser(appUserUpdateInfo, newPassword, currentPassword, sessionData)
        .then((sessionData: SessionData) => {
            SessionData.saveSessionData(request, sessionData);
            response.send(new UpdateAppUserResponse(sessionData.appUserInfo, true, 'App User Update Successful'));
        })
        .catch((err: Error) => {
            response.send(new UpdateAppUserResponse(null, false, err.message));
        });
}


/**
 * Handles the signup verification for a given user.
 * @param request The request from the client. Should contain verification token.
 * @param response The response to send back to the client.
 */
export function handleSignupVerification(request: Request, response: Response): void {

    response.setHeader('Content-Type', 'application/json');
    let appUserKey: number = parseInt(request.query.appUserKey);
    let verificationToken: string = request.query.verificationToken;

    signupVerify(appUserKey, verificationToken)
        .then(() => {
            response.send(new FoodWebResponse(true, 'Signup verification complete'));
        })
        .catch((err: Error) => {
            response.send(new FoodWebResponse(false, err.message));
        });
}


/**
 * Handles password recovery by sending a password resent email with a generated password reset token for a given user.
 * @param request The request from the client. Should contain the email of the user that wants to recover their password.
 * @param response The response to send back to the client.
 */
export function handlePasswordRecovery(request: Request, response: Response): void {
    response.setHeader('Content-Type', 'application/json');
    // TODO: Handle password recovery by sending password reset email.
    response.send(new FoodWebResponse(true, 'Password recovery not implemented yet'));
}
