import { AppUser } from './../app-user';
import { deserializable, deepDeserializable } from '../../deserialization/deserializer';


/**
 * Contains data that should be sent during a signup request.
 */
@deserializable('SignupRequest')
export class SignupRequest {

    @deepDeserializable(AppUser)
    public appUser: AppUser;


    public constructor (
        appUser: AppUser = null,
        public password: string = null
    ) {
        this.appUser = appUser;
    }
}

// No signup response necessary since all the necessary information was submitted from the front end (nothing needs to be sent back).
