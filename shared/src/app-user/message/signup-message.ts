import { AppUserInfo } from './../app-user-info';
import { deserializable, deepDeserializable } from '../../deserialization/deserializer';
import {  } from '../../deserialization/deserializable-registration/deserializable-annotations';


/**
 * Contains data that should be sent during a signup request.
 */
@deserializable('SignupRequest')
export class SignupRequest {

    @deepDeserializable(AppUserInfo)
    public appUserInfo: AppUserInfo;


    public constructor (
        appUserInfo: AppUserInfo = null,
        public password: string = null
    ) {
        this.appUserInfo = appUserInfo;
    }
}

// No signup response necessary since all the necessary information was submitted from the front end (nothing needs to be sent back).
