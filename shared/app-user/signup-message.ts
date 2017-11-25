import { AppUserInfo } from './app-user-info';


/**
 * Contains data that should be sent during a signup request.
 */
export class SignupRequest {

    public constructor (
        public appUserInfo: AppUserInfo,
        public password: string
    ) { }
}


export class SignupErrors {
    
    public static readonly DUPLICATE_EMAIL: string = 'Account already exists with the provided email address';
    public static readonly INVALID_ADDRESS: string = 'Provided address could not be found';
}

// No signup response necessary since all the necessary information was submitted from the front end (nothing needs to be sent back).
