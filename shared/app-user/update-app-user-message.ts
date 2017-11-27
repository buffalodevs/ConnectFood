import { AppUserInfo } from './app-user-info';
import { FoodWebResponse } from '../message-protocol/food-web-response';


/**
 * Contains data that should be sent during an update app user request.
 */
export class UpdateAppUserRequest {
    
    public constructor (
        public appUserUpdateInfo?: AppUserInfo,
        public newPassword?: string,
        public currentPassword?: string
    ) { }
}


export class UpdateAppUserResponse extends FoodWebResponse {

    public constructor (
        /**
         * The updated App User info to be set as the Session data on client.
         */
        public appUserInfo?: AppUserInfo,
        /**
         * Indicates whether or not the operation on the back end was successful.
         */
        success?: boolean,
        /**
         * A message containing information pertaining to what happened during processing on the back end. If successful, then it should
         * contain a simple success message. If unsuccessful, then it should contain the error message (without leaking sensitive data).
         */
        message?: string,
        /**
         * Indicates if there is a need for the user to login to perform the related operation on the server.
         */
        loginRequired: boolean = false,
        /**
         * Indicates if there is a need for the user to have their signup confirmed before performing certain functionality.
         */
        signupConfirmRequired: boolean = false
    ) {
        super(success, message, loginRequired, signupConfirmRequired);
    }
}
