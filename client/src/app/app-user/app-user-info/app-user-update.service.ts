import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import { RequestService } from '../../common-util/services/request.service';
import { SessionDataService } from '../../common-util/services/session-data.service';

import { UpdateAppUserRequest, UpdateAppUserResponse } from '../../../../../shared/app-user/message/update-app-user-message';
import { AppUserInfo } from "../../../../../shared/app-user/app-user-info";
import { FoodWebResponse } from "../../../../../shared/message-protocol/food-web-response";


@Injectable()
export class AppUserUpdateService {

    public constructor (
        private requestService: RequestService,
        private sessionDataService: SessionDataService
    ) { }


    /**
     * Sends App User Update Info to the server and listens for a response.
     * @param appUserInfoUpdate Contains the update information. Any non-null values will be used to update App User information.
     * @param newPassword The password update.
     * @param currentPassword Only required when the password is being updated. Should contain the current password of the user.
     */
    public updateAppUserInfo(appUserInfoUpdate: AppUserInfo, newPassword?: string, currentPassword?: string): Observable<FoodWebResponse> {

        let body: UpdateAppUserRequest = new UpdateAppUserRequest(appUserInfoUpdate, newPassword, currentPassword);
        let observer: Observable<UpdateAppUserResponse> = this.requestService.post('/appUser/updateAppUser', body);

        return observer.map((appUserUpdateResponse: UpdateAppUserResponse): FoodWebResponse => {

            console.log(appUserUpdateResponse.message);

            // Immediately update client session data on success!
            if (appUserUpdateResponse.success) {
                this.sessionDataService.updateAppUserSessionData(appUserUpdateResponse.appUserInfo);
            }

            return appUserUpdateResponse;
        });
    }
}
