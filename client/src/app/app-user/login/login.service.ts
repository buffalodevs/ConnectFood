import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import { SessionDataService } from '../../common-util/services/session-data.service';
import { DeserializerService } from '../../common-util/services/deserializer.service';
import { RequestResponseLoggerService } from '../../common-util/services/logging/request-response-logger.service';

import '../../../../../shared/src/app-user/message/login-message'; // IMPORTANT: So that class decorator for deserialization will run (won't be victim of tree shaking).
import { LoginRequest, LoginResponse } from '../../../../../shared/src/app-user/message/login-message';
import { FoodWebResponse } from '../../../../../shared/src/message-protocol/food-web-response';


@Injectable()
export class LoginService {

    private readonly _LOGIN_ROUTE: string;


    public constructor (
        private _http: HttpClient,
        private _sessionDataService: SessionDataService,
        private _deserializer: DeserializerService,
        private _requestResponseLogger: RequestResponseLoggerService
    ) {
        this._LOGIN_ROUTE = '/appUser/login';
    }


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

        const loginRequest: LoginRequest = new LoginRequest(email, password);
        this._requestResponseLogger.logRequest(this._LOGIN_ROUTE, 'POST', loginRequest);
        // NOTE: Should user raw http request here instead of RequestService wrapper since RequestService depends on this LoginService (prevent circular dependency)!
        const observer: Observable<LoginResponse> = this._http.post<LoginResponse>(this._LOGIN_ROUTE, loginRequest, requestOptions);

        return observer.map((loginResponse: LoginResponse): any => {

            if (loginResponse.success) {
                
                loginResponse = this._deserializer.deserialize(loginResponse);
                this._sessionDataService.updateAppUserSessionData(loginResponse.appUser);
            }

            this._requestResponseLogger.logResponse(this._LOGIN_ROUTE, loginResponse);

            return (loginResponse as FoodWebResponse);
        });
    }
}
