import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import { RequestService } from '../../common-util/services/request.service';
import { SessionDataService } from '../../common-util/services/session-data.service';

import { UpdateAppUserRequest, UpdateAppUserResponse } from '../../../../../shared/src/app-user/message/update-app-user-message';
import { AppUserInfo } from "../../../../../shared/src/app-user/app-user-info";
import { FoodWebResponse } from "../../../../../shared/src/message-protocol/food-web-response";


@Injectable()
export class AppUserUpdateService {

    public constructor (
        private _requestService: RequestService,
        private _sessionDataService: SessionDataService
    ) { }


    /**
     * Sends App User Update Info to the server and listens for a response.
     * @param appUserInfoUpdate Contains the update information. Any non-null values will be used to update App User information.
     * @param newPassword The password update.
     * @param currentPassword Only required when the password is being updated. Should contain the current password of the user.
     */
    public updateAppUserInfo(appUserInfoUpdate: AppUserInfo, newPassword?: string, currentPassword?: string): Observable <FoodWebResponse> {

        let body: UpdateAppUserRequest = new UpdateAppUserRequest(appUserInfoUpdate, newPassword, currentPassword);
        let observer: Observable <UpdateAppUserResponse> = <Observable <UpdateAppUserResponse>>this._requestService.post('/appUser/updateAppUser', body);

        // If we are updating the address of the user, then we must also update their timezone offset (since when moving they can move across timezones).
        if (appUserInfoUpdate.address != null) {
            appUserInfoUpdate.utcOffsetMins = (new Date()).getTimezoneOffset();
        }

        return observer.map((appUserUpdateResponse: UpdateAppUserResponse): FoodWebResponse => {

            // Immediately update client session data on success!
            if (appUserUpdateResponse.success) {
                this._sessionDataService.updateAppUserSessionData(appUserUpdateResponse.appUserInfo);
            }

            return appUserUpdateResponse;
        });
    }
}
