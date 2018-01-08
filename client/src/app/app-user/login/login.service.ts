import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import { SessionDataService } from '../../common-util/services/session-data.service';

import { LoginRequest, LoginResponse } from '../../../../../shared/app-user/message/login-message';
import { FoodWebResponse } from '../../../../../shared/message-protocol/food-web-response';


@Injectable()
export class LoginService {

    public constructor (
        private http: HttpClient,
        private sessionDataService: SessionDataService
    ) {}


    /**
     * Performs the login operation by contacting the server.
     * NOTE: Also, sets all associated session data on successful login.
     * @param email The email of the user that is logging in.
     * @param password The password of the user that is logging in.
     * @return An observable that will resolve to a Food Web Response object that pertains success or failure data pertaining to the login operation.
     */
    public login(email: string, password: string): Observable<FoodWebResponse> {

        const requestOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };

        // NOTE: Should user raw http request here instead of RequestService wrapper since RequestService depends on this LoginService (prevent circular dependency)!
        const observer: Observable<LoginResponse> = this.http.post<LoginResponse>('/appUser/login', new LoginRequest(email, password), requestOptions);

        return observer.map((loginResponse: LoginResponse): any /* AppUserInfo */ => {

            console.log(loginResponse.message);

            if (loginResponse.success) {
                this.sessionDataService.updateAppUserSessionData(loginResponse.appUserInfo);
            }

            return (loginResponse as FoodWebResponse);
        });
    }
}
