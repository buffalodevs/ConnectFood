import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import { RequestService } from '../../common-util/services/request.service';
import { SessionDataService } from '../../common-util/services/session-data.service';

import { UpdateAppUserRequest, UpdateAppUserResponse } from '../../../../../shared/src/app-user/message/update-app-user-message';
import '../../../../../shared/src/app-user/message/update-app-user-message'; // IMPORTANT: So that class decorator for deserialization will run (won't be victim of tree shaking).
import { AppUser } from "../../../../../shared/src/app-user/app-user";
import { FoodWebResponse } from "../../../../../shared/src/message-protocol/food-web-response";


@Injectable()
export class AppUserUpdateService {

    public constructor (
        private _requestService: RequestService,
        private _sessionDataService: SessionDataService
    ) { }


    /**
     * Sends App User Update Info to the server and listens for a response.
     * @param appUserUpdate Contains the update information. Any non-null values will be used to update App User information.
     * @param newPassword The password update.
     * @param currentPassword Only required when the password is being updated. Should contain the current password of the user.
     */
    public updateAppUser(appUserUpdate: AppUser, newPassword?: string, currentPassword?: string): Observable <FoodWebResponse> {

        let body: UpdateAppUserRequest = new UpdateAppUserRequest(appUserUpdate, newPassword, currentPassword);
        let observer: Observable <UpdateAppUserResponse> = <Observable <UpdateAppUserResponse>>this._requestService.post('/appUser/updateAppUser', body);

        return observer.map((appUserUpdateResponse: UpdateAppUserResponse): FoodWebResponse => {

            // Immediately update client session data on success!
            if (appUserUpdateResponse.success) {
                this._sessionDataService.updateAppUserSessionData(appUserUpdateResponse.appUser);
            }

            return appUserUpdateResponse;
        });
    }
}
