import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { RequestService, Response } from "../../common-util/services/request.service";
import { SessionDataService } from "../../common-util/services/session-data.service";

import { AppUserInfo } from "../../../../../shared/app-user/app-user-info";
import { SignupRequest } from "../../../../../shared/app-user/signup-message";
import { FoodWebResponse } from "../../../../../shared/message-protocol/food-web-response";


@Injectable()
export class SignupService {

    public constructor (
        private requestService: RequestService,
        private sessionDataService: SessionDataService
    ) { }

    
    public signup(appUserSignupInfo: AppUserInfo, password: string): Observable<FoodWebResponse> {

        let body: SignupRequest = new SignupRequest(appUserSignupInfo, password);
        let observer: Observable<Response> = this.requestService.post('/appUser/signup', body);
        
        return observer.map((response: Response): FoodWebResponse => {
            
            let signupResponse: FoodWebResponse = response.json();
            console.log(signupResponse.message);

            // On successful signup, cache the App User's data in global front end session storage.
            if (signupResponse.success) {
                this.sessionDataService.updateAppUserSessionData(appUserSignupInfo);
            }

            return signupResponse;
        });
    }
}
