import { AppUser } from '../app-user';
import { FoodWebResponse } from '../../message-protocol/food-web-response';
import { deserializable, deepDeserializable } from '../../deserialization/deserializer';


/**
 * Contains data that should be sent during an update app user request.
 */
@deserializable('UpdateAppUserRequest')
export class UpdateAppUserRequest {

    @deepDeserializable(AppUser)
    public appUserUpdate: AppUser;

    
    public constructor (
        appUserUpdate: AppUser = null,
        public newPassword: string = null,
        public currentPassword: string = null
    ) {
        this.appUserUpdate = appUserUpdate;
    }
}


@deserializable('UpdateAppUserResponse')
export class UpdateAppUserResponse extends FoodWebResponse {

    @deepDeserializable(AppUser)
    public appUser: AppUser;


    public constructor (
        /**
         * The updated App User info to be set as the Session data on client.
         */
        appUser: AppUser = null,
        /**
         * Indicates whether or not the operation on the back end was successful.
         */
        public success: boolean = null,
        /**
         * A message containing information pertaining to what happened during processing on the back end. If successful, then it should
         * contain a simple success message. If unsuccessful, then it should contain the error message (without leaking sensitive data).
         */
        public message: string = null,
        /**
         * Indicates if there is a need for the user to login to perform the related operation on the server.
         */
        public loginRequired: boolean = false,
        /**
         * Indicates if there is a need for the user to have their signup confirmed before performing certain functionality.
         */
        public signupConfirmRequired: boolean = false
    ) {
        super(success, message, loginRequired, signupConfirmRequired);
        this.appUser = appUser;
    }
}
