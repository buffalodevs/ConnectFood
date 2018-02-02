import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import { RequestService } from "../../common-util/services/request.service";
import { SessionDataService } from "../../common-util/services/session-data.service";

import { AppUserInfo } from "../../../../../shared/src/app-user/app-user-info";
import { SignupRequest } from "../../../../../shared/src/app-user/message/signup-message";
import { FoodWebResponse } from "../../../../../shared/src/message-protocol/food-web-response";


@Injectable()
export class SignupService {

    public constructor (
        private requestService: RequestService,
        private sessionDataService: SessionDataService
    ) { }

    
    public signup(appUserSignupInfo: AppUserInfo, password: string): Observable<FoodWebResponse> {

        // Make sure we grab time zone offset so we can generate date-time strings correctly on the server (in user's local timezone).
        appUserSignupInfo.utcOffsetMins = (new Date()).getTimezoneOffset();

        let body: SignupRequest = new SignupRequest(appUserSignupInfo, password);
        let observer: Observable<FoodWebResponse> = this.requestService.post('/appUser/signup', body);
        
        return observer.map((signupResponse: FoodWebResponse): FoodWebResponse => {
            
            console.log(signupResponse.message);

            // On successful signup, cache the App User's data in global front end session storage.
            if (signupResponse.success) {
                this.sessionDataService.updateAppUserSessionData(appUserSignupInfo);
            }

            return signupResponse;
        });
    }
}
