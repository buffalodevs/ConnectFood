import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import { RequestService } from "../../common-util/services/request.service";
import { SessionDataService } from "../../common-util/services/session-data.service";

import { AppUser } from "../../../../../shared/src/app-user/app-user";
import { SignupRequest } from "../../../../../shared/src/app-user/message/signup-message";
import { FoodWebResponse } from "../../../../../shared/src/message-protocol/food-web-response";


@Injectable()
export class SignupService {

    public constructor (
        private requestService: RequestService,
        private sessionDataService: SessionDataService
    ) { }

    
    public signup(appUserSignup: AppUser, password: string): Observable<FoodWebResponse> {

        let body: SignupRequest = new SignupRequest(appUserSignup, password);
        let observer: Observable<FoodWebResponse> = this.requestService.post('/appUser/signup', body);
        
        return observer.map((signupResponse: FoodWebResponse): FoodWebResponse => {
            
            // On successful signup, cache the App User's data in global front end session storage.
            if (signupResponse.success) {
                this.sessionDataService.updateAppUserSessionData(appUserSignup);
            }

            return signupResponse;
        });
    }
}
