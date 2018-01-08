import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import { RecoverPasswordRequest } from '../../../../../shared/app-user/message/password-recovery-message';
import { FoodWebResponse } from '../../../../../shared/message-protocol/food-web-response';


@Injectable()
export class PasswordRecoveryService {

    public constructor (
        private http: HttpClient
    ) {}


    /**
     * Recovers a user's password. The recovery process involves the user setting a new password.
     * @param email The email of the user that wishes to recover their password.
     * @return An observable object that contains data pertaining to the success or failure of the password recovery server operation.
     */
    public recoverPassword(email: string): Observable<FoodWebResponse> {

        const requestOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        
        let observer: Observable<FoodWebResponse> = this.http.post<FoodWebResponse>('/appUser/recoverPassword', new RecoverPasswordRequest(email), requestOptions);

        return observer.map((recoverPasswordResponse: FoodWebResponse): any => {
            
            console.log(recoverPasswordResponse.message);
            return recoverPasswordResponse;
        });
    }
}
